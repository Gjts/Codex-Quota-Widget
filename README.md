<div align="center">

# Codex Quota Widget · 灵狐小管家 🦊

**A xianxia-themed desktop widget for your Codex quota** — turns your 5-hour and weekly Codex limits into "Spirit Power" (灵力) and "Dao Essence" (道蕴), right on your desktop.

**English** · [简体中文](README.zh-CN.md)

[![Tauri](https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&logoColor=white)](https://v2.tauri.app/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-555)
![Status](https://img.shields.io/badge/status-MVP%20v0.1-success)

<img src="docs/preview.png" width="480" alt="SpiritFox theme (concept art)" />

</div>

---

## What is this

A plain quota readout is just cold numbers and reset times. Codex Quota Widget reframes it as a cultivation world: **Spirit Power (灵力)** is your 5-hour quota, **Dao Essence (道蕴)** is your weekly quota, **vein recovery (灵脉复苏)** is the reset, **vein depletion (灵脉枯竭)** is running out — all fronted by a spirit fox whose expression tracks your status while it sits on your desktop.

> The point: **glance at "do I have enough 灵力" before starting a big task**, so Codex never runs dry mid-refactor.

## ✨ Features (MVP v0.1)

- 🪟 Transparent / frameless / always-on-top / draggable floating window (280×180)
- ⚡ Two quotas: **灵力** (5h, ring) + **道蕴** (weekly, bar), with per-second recovery / cycle countdowns
- 🦊 SpiritFox changes expression with status: abundant → stable → weak → unstable → depleted (pure SVG, animation toggle)
- ✍️ Manual quota entry + settings panel (thresholds / display mode / opacity / flavor-text toggle)
- 💾 Local persistence — survives restarts
- 🔄 Auto-reads your local Codex quota (`codex app-server`) on an interval — toggle + interval in settings, with graceful fallback to manual entry
- 🔔 Low-quota desktop notifications (anti-spam: fires once per worsening threshold crossing)
- 🧭 System tray: show/hide · refresh · edit quota · settings · quit; the close button hides to tray
- 📐 Mini / standard / full display modes

## 🎴 Concept mapping

| Codex | Widget | Xianxia |
|---|---|---|
| 5-hour quota | 灵力 Spirit Power | 小周天灵力 |
| Weekly quota | 道蕴 Dao Essence | 大周天道蕴 |
| Reset time | recovery / cycle | 灵脉复苏 |
| Low quota | warning / danger | 真元偏弱 / 道基不稳 |
| Exhausted | 0% | 灵脉枯竭 |

## 📦 Install

Download for your platform from [Releases](https://github.com/Gjts/Codex-Quota-Widget/releases):

- **Windows**: `Codex Quota Widget_x.y.z_x64-setup.exe` (NSIS) or `..._x64_en-US.msi`
- **macOS**: `Codex Quota Widget_x.y.z_universal.dmg`

> No release yet? Build it locally (see Quick start).

## 🚀 Quick start (development)

```powershell
git clone https://github.com/Gjts/Codex-Quota-Widget.git
cd Codex-Quota-Widget/app
pnpm install
scripts\dev.cmd      # run dev (auto-injects this machine's MSVC env)
scripts\build.cmd    # build Windows installers (msi + exe)
pnpm test            # 33 unit tests
```

Requirements, build details and known issues: **[app/README.md](app/README.md)**.

## 🗂️ Repo layout

```text
Codex Quota Widget/
├── docs/        requirements + development plan (design source, Chinese)
├── assets/      xianxia skin concept art (10 themes)
├── app/         ★ the application (Tauri v2 + React + TS + Vite + Tailwind)
│   ├── src/         frontend (widget / settings / theme / store / features)
│   ├── src-tauri/   Rust backend + system tray
│   └── scripts/     MSVC env injection + dev/build scripts
└── .github/     CI (builds the app/ subfolder)
```

## 🛠️ Stack

**Tauri v2** · React 18 · TypeScript · Vite 6 · Tailwind v4 · Zustand · Vitest
Backend plugins: `tauri-plugin-store` (persistence) · `tauri-plugin-notification` · `tray-icon`

## 📚 Docs

- [Requirements](docs/Codex_Quota_Widget_Requirements.md) (Chinese) — positioning, concept design, features, acceptance
- [Development plan](docs/Codex_Quota_Widget_Tauri_Development_Plan.md) (Chinese) — stack, phases, milestones
- [App guide](app/README.md) — dev / test / build / known issues
- Skin concept art in `assets/`: SpiritFox (default) · Azure Dragon · Black Tortoise · Vermilion Bird · White Tiger · Sword Cultivator · Alchemist · Soul Lamp · Sect Guardian · Tribulation Cloud

## 🧭 Roadmap (V1.0)

Paste-to-parse quota · launch at login · global hotkeys · multiple skins · click-through · window position memory · history & trends · auto-update · macOS signing/notarization.

---

<div align="center">

MVP v0.1 · 灵狐小管家 — never let Codex run dry again. 🦊

</div>
