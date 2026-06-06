use serde::Serialize;
use serde_json::{json, Value};
use std::{
    env,
    io::{BufRead, BufReader, Read, Write},
    path::{Path, PathBuf},
    process::{Child, ChildStdin, Command, Stdio},
    sync::{mpsc, Arc, Mutex},
    thread,
    time::{Duration, Instant},
};

const REQUEST_TIMEOUT: Duration = Duration::from_secs(12);

#[derive(Debug, Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct CodexQuotaSnapshot {
    five_hour_remaining_percent: Option<f64>,
    five_hour_reset_at_unix_seconds: Option<i64>,
    weekly_remaining_percent: Option<f64>,
    weekly_reset_at_unix_seconds: Option<i64>,
    fetched_at_unix_seconds: i64,
}

#[derive(Debug, Clone, PartialEq)]
struct QuotaWindow {
    remaining_percent: f64,
    reset_at_unix_seconds: Option<i64>,
    window_duration_mins: Option<i64>,
}

#[tauri::command]
pub async fn read_codex_quota() -> Result<CodexQuotaSnapshot, String> {
    tauri::async_runtime::spawn_blocking(read_codex_quota_sync)
        .await
        .map_err(|_| "Codex quota reader task failed.".to_string())?
}

fn read_codex_quota_sync() -> Result<CodexQuotaSnapshot, String> {
    let response = request_rate_limits()?;
    normalize_response(&response)
}

fn request_rate_limits() -> Result<Value, String> {
    let mut child = spawn_codex_app_server()?;
    let mut stdin = child
        .stdin
        .take()
        .ok_or_else(|| "Codex app-server stdin was not available.".to_string())?;
    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| "Codex app-server stdout was not available.".to_string())?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| "Codex app-server stderr was not available.".to_string())?;

    let stderr_buf = Arc::new(Mutex::new(String::new()));
    spawn_stderr_reader(stderr, Arc::clone(&stderr_buf));

    let (tx, rx) = mpsc::channel();
    spawn_stdout_reader(stdout, tx);

    let result = (|| {
        send_request(
            &mut stdin,
            1,
            "initialize",
            Some(json!({
                "clientInfo": {
                    "name": "codex-quota-widget",
                    "title": "Codex Quota Widget",
                    "version": env!("CARGO_PKG_VERSION")
                },
                "capabilities": null
            })),
        )?;
        wait_for_response(1, &rx, REQUEST_TIMEOUT)?;

        send_request(&mut stdin, 2, "account/rateLimits/read", None)?;
        wait_for_response(2, &rx, REQUEST_TIMEOUT)
    })();

    cleanup_child(&mut child);

    result.map_err(|err| {
        let stderr = stderr_buf
            .lock()
            .map(|s| s.trim().to_string())
            .unwrap_or_default();
        if stderr.is_empty() {
            err
        } else {
            format!("{err} ({})", concise_error(&stderr))
        }
    })
}

fn spawn_codex_app_server() -> Result<Child, String> {
    let codex_path = resolve_codex_path();
    let mut command = Command::new(&codex_path);
    command
        .args(["app-server", "--listen", "stdio://"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x0800_0000;
        command.creation_flags(CREATE_NO_WINDOW);
    }

    command.spawn().map_err(|err| {
        format!(
            "Could not start Codex CLI at '{}': {err}",
            codex_path.display()
        )
    })
}

fn resolve_codex_path() -> PathBuf {
    candidate_path("CODEX_CLI_PATH")
        .filter(|path| path.exists())
        .or_else(default_codex_path)
        .unwrap_or_else(|| Path::new("codex").to_path_buf())
}

/// Best-effort default install location for the Codex CLI on Windows.
#[cfg(windows)]
fn default_codex_path() -> Option<PathBuf> {
    env::var_os("LOCALAPPDATA")
        .map(PathBuf::from)
        .map(|base| base.join("OpenAI").join("Codex").join("bin").join("codex.exe"))
        .filter(|path| path.exists())
}

/// Best-effort default install locations for the Codex CLI on macOS / Linux
/// (per-user Codex dir, npm `--prefix`, and Homebrew). Falls back to PATH.
#[cfg(not(windows))]
fn default_codex_path() -> Option<PathBuf> {
    let mut candidates: Vec<PathBuf> = Vec::new();
    if let Some(home) = env::var_os("HOME").map(PathBuf::from) {
        candidates.push(home.join(".codex").join("bin").join("codex"));
        candidates.push(home.join(".local").join("bin").join("codex"));
    }
    candidates.push(PathBuf::from("/opt/homebrew/bin/codex"));
    candidates.push(PathBuf::from("/usr/local/bin/codex"));
    candidates.into_iter().find(|path| path.exists())
}

fn candidate_path(name: &str) -> Option<PathBuf> {
    env::var_os(name)
        .map(PathBuf::from)
        .filter(|path| !path.as_os_str().is_empty())
}

fn send_request(
    stdin: &mut ChildStdin,
    id: u64,
    method: &str,
    params: Option<Value>,
) -> Result<(), String> {
    let payload = if let Some(params) = params {
        json!({ "id": id, "method": method, "params": params })
    } else {
        json!({ "id": id, "method": method })
    };
    writeln!(stdin, "{payload}").map_err(|err| format!("Could not send Codex request: {err}"))?;
    stdin
        .flush()
        .map_err(|err| format!("Could not flush Codex request: {err}"))
}

fn wait_for_response(
    id: u64,
    rx: &mpsc::Receiver<String>,
    timeout: Duration,
) -> Result<Value, String> {
    let deadline = Instant::now() + timeout;
    loop {
        let remaining = deadline.saturating_duration_since(Instant::now());
        if remaining.is_zero() {
            return Err("Codex quota request timed out.".to_string());
        }

        let line = rx
            .recv_timeout(remaining)
            .map_err(|_| "Codex app-server closed before returning quota data.".to_string())?;
        let message: Value = match serde_json::from_str(&line) {
            Ok(value) => value,
            Err(_) => continue,
        };
        if message.get("id").and_then(Value::as_u64) != Some(id) {
            continue;
        }
        if let Some(error) = message.get("error") {
            let message = error
                .get("message")
                .and_then(Value::as_str)
                .unwrap_or("Codex app-server returned an error.");
            return Err(concise_error(message));
        }
        return message
            .get("result")
            .cloned()
            .ok_or_else(|| "Codex app-server response did not include a result.".to_string());
    }
}

fn spawn_stdout_reader<R: Read + Send + 'static>(stdout: R, tx: mpsc::Sender<String>) {
    thread::spawn(move || {
        for line in BufReader::new(stdout).lines().map_while(Result::ok) {
            if tx.send(line).is_err() {
                break;
            }
        }
    });
}

fn spawn_stderr_reader<R: Read + Send + 'static>(stderr: R, sink: Arc<Mutex<String>>) {
    thread::spawn(move || {
        let mut reader = BufReader::new(stderr);
        let mut text = String::new();
        if reader.read_to_string(&mut text).is_ok() {
            if let Ok(mut buf) = sink.lock() {
                *buf = text;
            }
        }
    });
}

fn cleanup_child(child: &mut Child) {
    if let Ok(None) = child.try_wait() {
        let _ = child.kill();
    }
    let _ = child.wait();
}

fn normalize_response(response: &Value) -> Result<CodexQuotaSnapshot, String> {
    let snapshot = find_snapshot(response)
        .ok_or_else(|| "Codex did not return a rate-limit snapshot.".to_string())?;

    let primary = normalize_window(snapshot.get("primary"));
    let secondary = normalize_window(snapshot.get("secondary"));
    let (five_hour, weekly) = assign_windows(primary, secondary);

    if five_hour.is_none() && weekly.is_none() {
        return Err("Codex rate-limit snapshot did not contain quota windows.".to_string());
    }

    Ok(CodexQuotaSnapshot {
        five_hour_remaining_percent: five_hour.as_ref().map(|w| w.remaining_percent),
        five_hour_reset_at_unix_seconds: five_hour.and_then(|w| w.reset_at_unix_seconds),
        weekly_remaining_percent: weekly.as_ref().map(|w| w.remaining_percent),
        weekly_reset_at_unix_seconds: weekly.and_then(|w| w.reset_at_unix_seconds),
        fetched_at_unix_seconds: unix_now(),
    })
}

fn find_snapshot(response: &Value) -> Option<&Value> {
    response
        .pointer("/rateLimitsByLimitId/codex")
        .or_else(|| response.get("rateLimits"))
        .or_else(|| {
            response
                .get("rateLimitsByLimitId")
                .and_then(Value::as_object)
                .and_then(|map| map.values().next())
        })
}

fn normalize_window(window: Option<&Value>) -> Option<QuotaWindow> {
    let window = window?;
    let remaining = field_f64(window, "remainingPercent")
        .or_else(|| field_f64(window, "usedPercent").map(|used| 100.0 - used))?;

    Some(QuotaWindow {
        remaining_percent: clamp_percent(remaining),
        reset_at_unix_seconds: field_i64(window, "resetsAt")
            .or_else(|| field_i64(window, "resetAt")),
        window_duration_mins: field_i64(window, "windowDurationMins"),
    })
}

fn assign_windows(
    primary: Option<QuotaWindow>,
    secondary: Option<QuotaWindow>,
) -> (Option<QuotaWindow>, Option<QuotaWindow>) {
    let mut five_hour = None;
    let mut weekly = None;
    let mut unknown = Vec::new();

    for window in [primary, secondary].into_iter().flatten() {
        match window.window_duration_mins {
            Some(240..=360) if five_hour.is_none() => five_hour = Some(window),
            Some(9_000..=11_000) if weekly.is_none() => weekly = Some(window),
            _ => unknown.push(window),
        }
    }

    if five_hour.is_none() {
        five_hour = take_first(&mut unknown);
    }
    if weekly.is_none() {
        weekly = take_first(&mut unknown);
    }

    (five_hour, weekly)
}

fn take_first(windows: &mut Vec<QuotaWindow>) -> Option<QuotaWindow> {
    if windows.is_empty() {
        None
    } else {
        Some(windows.remove(0))
    }
}

fn field_f64(value: &Value, field: &str) -> Option<f64> {
    match value.get(field)? {
        Value::Number(n) => n.as_f64(),
        Value::String(s) => s.parse().ok(),
        _ => None,
    }
}

fn field_i64(value: &Value, field: &str) -> Option<i64> {
    match value.get(field)? {
        Value::Number(n) => n.as_i64().or_else(|| n.as_f64().map(|f| f as i64)),
        Value::String(s) => s.parse().ok(),
        _ => None,
    }
}

fn clamp_percent(value: f64) -> f64 {
    if !value.is_finite() {
        return 0.0;
    }
    value.clamp(0.0, 100.0).round()
}

fn concise_error(text: &str) -> String {
    let one_line = text.split_whitespace().collect::<Vec<_>>().join(" ");
    one_line.chars().take(240).collect()
}

fn unix_now() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizes_codex_rate_limit_windows() {
        let response = json!({
            "rateLimitsByLimitId": {
                "codex": {
                    "primary": {
                        "usedPercent": 31.7,
                        "windowDurationMins": 300,
                        "resetsAt": 1780123456
                    },
                    "secondary": {
                        "usedPercent": 60,
                        "windowDurationMins": 10080,
                        "resetsAt": 1780999999
                    }
                }
            }
        });

        let snapshot = normalize_response(&response).expect("snapshot");

        assert_eq!(snapshot.five_hour_remaining_percent, Some(68.0));
        assert_eq!(snapshot.five_hour_reset_at_unix_seconds, Some(1780123456));
        assert_eq!(snapshot.weekly_remaining_percent, Some(40.0));
        assert_eq!(snapshot.weekly_reset_at_unix_seconds, Some(1780999999));
    }

    #[test]
    fn falls_back_to_primary_secondary_order_without_duration() {
        let response = json!({
            "rateLimits": {
                "primary": { "remainingPercent": 20 },
                "secondary": { "remainingPercent": 90 }
            }
        });

        let snapshot = normalize_response(&response).expect("snapshot");

        assert_eq!(snapshot.five_hour_remaining_percent, Some(20.0));
        assert_eq!(snapshot.weekly_remaining_percent, Some(90.0));
    }

    #[test]
    fn assigns_windows_by_duration_regardless_of_order() {
        let (five, weekly) =
            assign_windows(Some(window(40.0, Some(10080))), Some(window(68.0, Some(300))));
        assert_eq!(five.unwrap().remaining_percent, 68.0);
        assert_eq!(weekly.unwrap().remaining_percent, 40.0);
    }

    #[test]
    fn assigns_windows_falls_back_to_order_without_duration() {
        let (five, weekly) =
            assign_windows(Some(window(20.0, None)), Some(window(90.0, None)));
        assert_eq!(five.unwrap().remaining_percent, 20.0);
        assert_eq!(weekly.unwrap().remaining_percent, 90.0);
    }

    #[test]
    fn assigns_single_window_to_five_hour() {
        let (five, weekly) = assign_windows(Some(window(55.0, None)), None);
        assert_eq!(five.unwrap().remaining_percent, 55.0);
        assert!(weekly.is_none());
    }

    #[test]
    fn normalize_window_prefers_remaining_then_used() {
        assert_eq!(
            normalize_window(Some(&json!({ "remainingPercent": 42 })))
                .unwrap()
                .remaining_percent,
            42.0
        );
        assert_eq!(
            normalize_window(Some(&json!({ "usedPercent": 73 })))
                .unwrap()
                .remaining_percent,
            27.0
        );
        assert!(normalize_window(Some(&json!({ "foo": 1 }))).is_none());
        assert!(normalize_window(None).is_none());
    }

    #[test]
    fn normalize_window_reads_either_reset_field() {
        let resets_at =
            normalize_window(Some(&json!({ "remainingPercent": 10, "resetsAt": 111 }))).unwrap();
        assert_eq!(resets_at.reset_at_unix_seconds, Some(111));

        let reset_at =
            normalize_window(Some(&json!({ "remainingPercent": 10, "resetAt": 222 }))).unwrap();
        assert_eq!(reset_at.reset_at_unix_seconds, Some(222));
    }

    #[test]
    fn clamp_percent_bounds_and_rounds() {
        assert_eq!(clamp_percent(150.0), 100.0);
        assert_eq!(clamp_percent(-5.0), 0.0);
        assert_eq!(clamp_percent(31.7), 32.0);
        assert_eq!(clamp_percent(f64::NAN), 0.0);
        assert_eq!(clamp_percent(f64::INFINITY), 0.0);
    }

    #[test]
    fn field_f64_parses_numbers_and_strings() {
        assert_eq!(field_f64(&json!({ "a": 12.5 }), "a"), Some(12.5));
        assert_eq!(field_f64(&json!({ "a": "30" }), "a"), Some(30.0));
        assert_eq!(field_f64(&json!({ "a": "x" }), "a"), None);
        assert_eq!(field_f64(&json!({ "a": true }), "a"), None);
        assert_eq!(field_f64(&json!({}), "a"), None);
    }

    #[test]
    fn field_i64_parses_numbers_floats_and_strings() {
        assert_eq!(field_i64(&json!({ "a": 100 }), "a"), Some(100));
        assert_eq!(field_i64(&json!({ "a": 100.9 }), "a"), Some(100));
        assert_eq!(field_i64(&json!({ "a": "123" }), "a"), Some(123));
        assert_eq!(field_i64(&json!({ "a": "nope" }), "a"), None);
    }

    #[test]
    fn concise_error_collapses_whitespace_and_truncates() {
        assert_eq!(concise_error("  multi\n  line\t text  "), "multi line text");
        assert_eq!(concise_error(&"x".repeat(500)).chars().count(), 240);
    }

    #[test]
    fn find_snapshot_prefers_codex_then_rate_limits() {
        let by_id = json!({ "rateLimitsByLimitId": { "codex": { "k": 1 } } });
        assert_eq!(find_snapshot(&by_id), by_id.pointer("/rateLimitsByLimitId/codex"));

        let rate_limits = json!({ "rateLimits": { "k": 2 } });
        assert_eq!(find_snapshot(&rate_limits), rate_limits.get("rateLimits"));

        assert!(find_snapshot(&json!({})).is_none());
    }

    #[test]
    fn normalize_response_errors_without_windows() {
        assert!(normalize_response(&json!({})).is_err());
        assert!(normalize_response(&json!({ "rateLimits": {} })).is_err());
    }

    fn window(remaining_percent: f64, window_duration_mins: Option<i64>) -> QuotaWindow {
        QuotaWindow {
            remaining_percent,
            reset_at_unix_seconds: None,
            window_duration_mins,
        }
    }
}
