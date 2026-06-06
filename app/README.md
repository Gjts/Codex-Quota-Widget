# Codex Quota Widget — App guide 🦊

**English** · [简体中文](README.zh-CN.md)

> This is the application (Tauri v2 + React + TS + Vite + Tailwind). For the product overview, features and concept mapping, see the root [README](../README.md).

## Requirements

- [Node.js](https://nodejs.org/) 20+ and [pnpm](https://pnpm.io/) 10+
- [Rust](https://rustup.rs/) stable (MSVC toolchain)
- Windows: WebView2 runtime (bundled on Win11) + the "Desktop development with C++" workload (includes the Windows SDK)
- macOS: Xcode Command Line Tools

> ⚠️ **Note for this machine**: the newer VS installs here (2022 / 18 Insiders) are incomplete (missing MSVC headers + desktop CRT libs, broken `vcvarsall.bat`), and Rust auto-picks them → `LNK1104 msvcrt.lib`. So the build scripts point at the complete **VS2019 BuildTools**.
> Use `scripts\*.cmd`, or run `. .\scripts\vsenv.ps1` first in PowerShell. Not needed in standard environments like GitHub Actions.

## Develop

```powershell
pnpm install

scripts\dev.cmd                       # recommended: injects MSVC env, then pnpm tauri dev
# or manually:
. .\scripts\vsenv.ps1; pnpm tauri dev
```

Preview just the frontend UI in a browser (no Rust/Tauri): `pnpm dev` → <http://localhost:1420>

## Test

```powershell
pnpm test        # Vitest: 33 unit tests / 8 files
pnpm typecheck   # tsc --noEmit
pnpm build       # frontend production build (Vite)
```

Coverage: status calc, countdown formatting, Zustand store, form validation, notification anti-spam guard, persistence transforms, component rendering.

## Package

```powershell
scripts\build.cmd          # = inject env + pnpm tauri build
```

Output in `src-tauri/target/release/bundle/`:

- **Windows**: `msi/*.msi` + `nsis/*-setup.exe` (verified on this machine, ~1.3–1.9 MB)
- **macOS**: `dmg/*.dmg` + `macos/*.app` (build on macOS or via GitHub Actions)

> On the first package, Tauri downloads WiX / NSIS from GitHub; on a slow network this can time out — retry, or pre-seed `%LOCALAPPDATA%\tauri\`.

## Project structure

```text
src/
├── app/App.tsx                 entry: view routing + hydrate / persist / notify / tray wiring
├── components/
│   ├── widget/                 FloatingWidget · RingGauge · QuotaBar · StatusText · WidgetActions
│   ├── settings/SettingsPanel  settings panel (manual quota + thresholds + window + theme)
│   └── theme/SpiritFox         SpiritFox SVG (6 status expressions)
├── features/
│   ├── quota/                  getQuotaStatus · formatCountdown · copy · mock · countdown hook
│   ├── settings/validation     form validation
│   ├── persistence/repository  tauri-plugin-store read/write (NaN↔null normalization)
│   └── notification/           shouldNotify guard · copy · notify · hook
├── store/useAppStore           Zustand (quota / settings / tick / hydrate)
├── types/                      quota / settings types
└── lib/                        isTauri / window wrappers
src-tauri/
├── src/{main,lib,tray}.rs      Tauri backend + system tray + close-to-tray
├── capabilities/default.json   permissions (window / store / notification)
└── tauri.conf.json             window (transparent / frameless / on-top / 280×180) + bundle
scripts/                        vsenv (VS2019 env) · dev.cmd · build.cmd
```

## Known issues / limits

- **Window position memory**: not in the MVP. The `window-state` plugin restored a minimized (invisible) window on this machine, so it was removed → V1.0.
- **macOS transparent window**: requires `app.macOSPrivateApi: true` in `tauri.conf.json` plus the `macos-private-api` feature on `tauri` (not enabled in the Windows build, to avoid impact).
- **Notification source in dev** shows as "Windows PowerShell": `tauri dev` is hosted by that process; the packaged app shows the real app name.
- Auto-read / paste-parse / launch-at-login / history & trends → V1.0 (see the root [README](../README.md) roadmap).
