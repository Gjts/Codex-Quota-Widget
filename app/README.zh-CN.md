# Codex Quota Widget — 工程说明 🦊

[English](README.md) · **简体中文**

> 这是应用工程（Tauri v2 + React + TS + Vite + Tailwind）。产品介绍、功能与概念映射见仓库根 **[README](../README.zh-CN.md)**。

## 环境要求

- [Node.js](https://nodejs.org/) 20+ 与 [pnpm](https://pnpm.io/) 10+
- [Rust](https://rustup.rs/) stable（MSVC 工具链）
- Windows：WebView2 运行时（Win11 自带）+「使用 C++ 的桌面开发」工作负载（含 Windows SDK）
- macOS：Xcode Command Line Tools

> ⚠️ **本机特别说明**：这台机器上较新的 VS（2022 / 18 Insiders）安装不完整（缺 MSVC 头文件与桌面 CRT 库，`vcvarsall.bat` 也损坏），Rust 默认会挑中它 → 报 `LNK1104 msvcrt.lib`。因此构建脚本统一指向**完整的 VS2019 BuildTools**。
> 请用 `scripts\*.cmd`，或先在 PowerShell 执行 `. .\scripts\vsenv.ps1`。GitHub Actions 等标准环境无需这些脚本。

## 开发

```powershell
pnpm install

scripts\dev.cmd                       # 推荐：注入 MSVC 环境后 pnpm tauri dev
# 或手动：
. .\scripts\vsenv.ps1; pnpm tauri dev
```

只预览前端 UI（浏览器，不依赖 Rust/Tauri）：`pnpm dev` → <http://localhost:1420>

## 测试

```powershell
pnpm test        # Vitest：33 个单元测试 / 8 个文件
pnpm typecheck   # tsc --noEmit
pnpm build       # 前端生产构建（Vite）
```

覆盖：状态计算、倒计时格式化、Zustand store、表单校验、通知防骚扰守卫、持久化转换、组件渲染。

## 打包

```powershell
scripts\build.cmd          # = 注入环境 + pnpm tauri build
```

产物在 `src-tauri/target/release/bundle/`：

- **Windows**：`msi/*.msi` + `nsis/*-setup.exe`（本机已验证，约 1.3–1.9 MB）
- **macOS**：`dmg/*.dmg` + `macos/*.app`（需在 macOS 上或经 GitHub Actions 构建）

> 首次打包时 Tauri 会从 GitHub 下载 WiX / NSIS；网络慢可能超时，重试或预置到 `%LOCALAPPDATA%\tauri\` 即可。

## 目录结构

```text
src/
├── app/App.tsx                 入口：视图路由 + 水合 / 持久化 / 通知 / 托盘事件接线
├── components/
│   ├── widget/                 FloatingWidget · RingGauge · QuotaBar · StatusText · WidgetActions
│   ├── settings/SettingsPanel  设置面板（手动额度 + 阈值 + 窗口 + 主题）
│   └── theme/SpiritFox         灵狐 SVG（6 种状态表情）
├── features/
│   ├── quota/                  getQuotaStatus · formatCountdown · 文案 · mock · 倒计时 hook
│   ├── settings/validation     表单校验
│   ├── persistence/repository  tauri-plugin-store 读写（NaN↔null 归一化）
│   └── notification/           shouldNotify 守卫 · 文案 · notify · hook
├── store/useAppStore           Zustand（quota / settings / tick / hydrate）
├── types/                      quota / settings 类型
└── lib/                        isTauri / 窗口封装
src-tauri/
├── src/{main,lib,tray}.rs      Tauri 后端 + 系统托盘 + 关闭到托盘
├── capabilities/default.json   权限（window / store / notification）
└── tauri.conf.json             窗口（透明 / 无边框 / 置顶 / 280×180）+ bundle
scripts/                        vsenv（VS2019 环境）· dev.cmd · build.cmd
```

## 已知问题 / 限制

- **窗口位置记忆**：MVP 未实现。`window-state` 插件在本机会把窗口还原成最小化的隐形窗，已移除 → V1.0。
- **macOS 透明窗**：需在 `tauri.conf.json` 开 `app.macOSPrivateApi: true` 并为 `tauri` 启用 `macos-private-api` feature（未在 Windows 构建启用，以免影响）。
- **dev 下通知来源**显示为「Windows PowerShell」：`tauri dev` 寄宿在该进程；打包安装后显示应用名。
- 自动读取 / 粘贴解析 / 开机自启 / 历史趋势 → V1.0（见根 [README](../README.zh-CN.md) 路线图）。
