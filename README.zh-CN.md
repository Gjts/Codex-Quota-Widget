<div align="center">

# Codex Quota Widget · 灵狐小管家 🦊

**修仙风 Codex 额度桌面悬浮小组件** — 把 Codex 的 5 小时额度与每周额度，变成你桌面上的「灵力」与「道蕴」。

[English](README.md) · **简体中文**

[![Tauri](https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&logoColor=white)](https://v2.tauri.app/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-555)
![Status](https://img.shields.io/badge/status-MVP%20v0.1-success)

<img src="docs/preview.png" width="480" alt="灵狐小管家 · 默认主题（概念图）" />

</div>

---

## 这是什么

普通额度展示只有冷冰冰的数字和重置时间。Codex Quota Widget 把它翻译成修仙世界观：**灵力**（5 小时额度）、**道蕴**（每周额度）、**灵脉复苏**（重置）、**灵脉枯竭**（耗尽）…… 再配一只随状态变表情的灵狐，常驻桌面陪你写代码。

> 核心价值：**开大任务前，先瞄一眼「灵力够不够」**，别让 Codex 在重构到一半时突然断粮。

## ✨ 功能（MVP v0.1）

- 🪟 透明 / 无边框 / 置顶 / 可拖动 的桌面悬浮窗（280×180）
- ⚡ 双额度：**灵力**（5h，圆环）+ **道蕴**（每周，进度条），每秒刷新复苏 / 轮回倒计时
- 🦊 灵狐随状态切换表情：灵气充盈 → 灵力稳定 → 真元偏弱 → 道基不稳 → 灵脉枯竭（纯 SVG，可关动画）
- ✍️ 手动录入额度 + 设置面板（阈值 / 显示模式 / 透明度 / 文案开关）
- 💾 本地持久化，重启不丢
- 🔄 自动读取本机 Codex 额度（`codex app-server`）：设置里可开关 + 调刷新间隔，读取失败自动回退手动
- 🔔 低额度桌面通知（防骚扰：只在恶化跨阈值时提醒一次）
- 🧭 系统托盘：显示/隐藏 · 刷新 · 编辑额度 · 设置 · 退出；关闭即隐藏到托盘
- 📐 迷你 / 标准 / 完整 三种显示模式

## 🎴 概念映射

| Codex | 组件显示 | 修仙表达 |
|---|---|---|
| 5 小时额度 | 灵力 | 小周天灵力 |
| 每周额度 | 道蕴 | 大周天道蕴 |
| 重置时间 | 复苏 / 轮回 | 灵脉复苏 |
| 低额度 | 警告 / 危险 | 真元偏弱 / 道基不稳 |
| 额度耗尽 | 0% | 灵脉枯竭 |

## 📦 安装

从 [Releases](https://github.com/Gjts/Codex-Quota-Widget/releases) 下载对应平台安装包：

- **Windows**：`Codex Quota Widget_x.y.z_x64-setup.exe`（NSIS）或 `..._x64_en-US.msi`
- **macOS**：`Codex Quota Widget_x.y.z_universal.dmg`

> 还没有发布版本？按下方「快速开始」本地构建即可。

## 🚀 快速开始（开发）

```powershell
git clone https://github.com/Gjts/Codex-Quota-Widget.git
cd Codex-Quota-Widget/app
pnpm install
scripts\dev.cmd      # 开发运行（本机自动注入 MSVC 环境）
scripts\build.cmd    # 打包 Windows 安装包（msi + exe）
pnpm test            # 36 个单元测试
```

环境要求、构建细节与已知问题见 **[app/README.md](app/README.md)**。

## 🗂️ 仓库骨架

```text
Codex Quota Widget/
├── docs/        需求文档与开发计划（设计来源）
├── assets/      修仙皮肤概念图（10 套主题）
├── app/         ★ 应用工程（Tauri v2 + React + TS + Vite + Tailwind）
│   ├── src/         前端（widget / settings / theme / store / features）
│   ├── src-tauri/   Rust 后端 + 系统托盘
│   └── scripts/     MSVC 环境注入 + dev/build 脚本
└── .github/     CI（在 app/ 子目录构建跨平台安装包）
```

## 🛠️ 技术栈

**Tauri v2** · React 18 · TypeScript · Vite 6 · Tailwind v4 · Zustand · Vitest
后端插件：`tauri-plugin-store`（持久化）· `tauri-plugin-notification`（通知）· `tray-icon`（托盘）

## 📚 文档

- [需求文档](docs/Codex_Quota_Widget_Requirements.md) — 产品定位、概念设计、功能需求、验收清单
- [开发计划](docs/Codex_Quota_Widget_Tauri_Development_Plan.md) — 技术选型、阶段拆解、里程碑
- [工程说明](app/README.md) — 开发 / 测试 / 打包 / 已知问题
- 皮肤概念图在 `assets/`：灵狐小管家（默认）· 青龙 · 玄武 · 朱雀 · 白虎 · 绝世剑修 · 丹炉炼丹师 · 命灯器灵 · 宗门守护灵 · 修士雷劫渡劫云

## 🧭 路线图（V1.0）

粘贴解析额度 · 开机自启 · 全局快捷键 · 多皮肤切换 · 鼠标穿透 · 窗口位置记忆 · 历史记录与趋势 · 自动更新 · macOS 签名 / 公证。

---

<div align="center">

MVP v0.1 · 灵狐小管家 — 别再让 Codex 突然断粮。🦊

</div>
