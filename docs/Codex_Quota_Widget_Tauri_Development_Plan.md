# Codex Quota Widget Tauri 开发计划

> 版本：v0.1  
> 技术栈：Tauri v2 + React + TypeScript + Vite + Tailwind CSS  
> 目标平台：Windows / macOS  
> 开发目标：先完成可运行 MVP，再迭代 V1.0  
> 项目主题：修仙风 Codex 桌面额度小组件

---

> 📌 **实现状态**：本计划的 **MVP 范围（阶段 0–12 的 MVP 部分）已完成并打包**（Windows `.msi` + `.exe`）。
> 实际落地的少量调整：动画用 CSS / SVG（未引入 Framer Motion / Lottie）；本机改用 **VS2019 BuildTools** 构建（见 [app/README](../app/README.md)）；`window-state` 位置记忆暂移除（推迟 V1.0）。
> 当前工程结构与命令见 [app/README](../app/README.md)。本文保留为原始开发计划。

---

## 1. 技术栈定案

### 1.1 总体技术栈

```text
Desktop Shell：Tauri v2
Frontend：React + TypeScript + Vite
UI：Tailwind CSS
State：Zustand
Animation：CSS Animation / Framer Motion / Lottie 可选
Local Store：@tauri-apps/plugin-store
Notification：@tauri-apps/plugin-notification
Autostart：@tauri-apps/plugin-autostart
File Access：@tauri-apps/plugin-fs
Shell Access：@tauri-apps/plugin-shell
Logging：tauri-plugin-log
Build：Tauri Bundler
CI/CD：GitHub Actions
```

### 1.2 为什么选择 Tauri

选择 Tauri 的原因：

1. 比 Electron 更轻量。
2. 适合常驻桌面小工具。
3. 支持 Windows 和 macOS。
4. 可以复用 Web 前端技术栈。
5. Rust 后端适合处理本地能力。
6. 插件权限可控，安全边界更清晰。
7. 对这种「桌面悬浮挂件」来说，Tauri 的体积和性能更合理。

注意：Tauri 虽然轻，但也意味着某些桌面能力需要更认真地处理平台差异。人类总喜欢在“轻量”和“省事”之间两头都要，最后被系统 API 教做人。

---

## 2. 开发阶段规划

## 阶段 0：项目初始化

### 目标

搭建项目基础结构，确保 Windows 和 macOS 能跑起来。

### 任务清单

- 初始化 Tauri v2 项目。
- 选择 React + TypeScript + Vite 模板。
- 安装 Tailwind CSS。
- 安装 Zustand。
- 配置 ESLint / Prettier。
- 配置基础目录结构。
- 配置 Tauri app id、名称、图标。
- 验证 dev 模式启动。
- 验证 Windows 构建。
- 验证 macOS 构建。

### 推荐命令

```bash
pnpm create tauri-app codex-quota-widget
cd codex-quota-widget
pnpm install
pnpm tauri dev
```

### 目录结构

```text
codex-quota-widget
├── src
│   ├── app
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── components
│   │   ├── widget
│   │   ├── settings
│   │   ├── quota
│   │   └── theme
│   ├── features
│   │   ├── quota
│   │   ├── settings
│   │   ├── notification
│   │   └── theme
│   ├── store
│   ├── types
│   ├── utils
│   └── styles
├── src-tauri
│   ├── src
│   │   ├── main.rs
│   │   ├── commands
│   │   ├── quota
│   │   ├── tray
│   │   └── window
│   ├── capabilities
│   ├── icons
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── README.md
```

### 交付物

- 应用能启动。
- 空白窗口能显示 React 页面。
- 基础样式可用。
- 项目目录清晰。

### 验收标准

- `pnpm tauri dev` 正常运行。
- Windows 本地可以启动。
- macOS 本地可以启动。
- 没有明显控制台错误。

---

## 阶段 1：悬浮窗基础能力

### 目标

实现桌面 Widget 的核心窗口行为。

### 任务清单

#### Tauri 窗口配置

- 无边框。
- 透明背景。
- 默认置顶。
- 不显示系统任务栏，视平台表现决定。
- 固定初始尺寸。
- 支持拖动。
- 支持关闭时隐藏到托盘，后续实现。
- 记录窗口位置，后续实现。

### tauri.conf.json 示例

```json
{
  "app": {
    "windows": [
      {
        "label": "main",
        "title": "Codex Quota Widget",
        "width": 280,
        "height": 180,
        "decorations": false,
        "transparent": true,
        "alwaysOnTop": true,
        "resizable": false,
        "visible": true
      }
    ]
  }
}
```

### 前端拖动区域

在 React 中给顶部或整体 Widget 增加拖动区域：

```tsx
<div data-tauri-drag-region className="widget-root">
  ...
</div>
```

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 1.1 | 配置透明无边框窗口 | Tauri | P0 |
| 1.2 | 配置 alwaysOnTop | Tauri | P0 |
| 1.3 | 实现窗口拖动 | Frontend | P0 |
| 1.4 | 实现窗口基础尺寸 | Tauri | P0 |
| 1.5 | 处理 macOS 透明表现 | Tauri | P1 |
| 1.6 | 处理 Windows 阴影和圆角 | UI | P1 |

### 交付物

- 一个透明悬浮窗口。
- 可拖动。
- 默认置顶。
- 显示基础 Widget UI。

### 验收标准

- Window 不显示系统标题栏。
- 背景透明。
- 不影响主工作区。
- 可以拖到屏幕任意位置。
- Windows / macOS 都能正常显示。

---

## 阶段 2：额度数据模型与状态计算

### 目标

建立前端核心数据模型，完成额度展示逻辑。

### 类型定义

```ts
export type QuotaStatus =
  | "excellent"
  | "normal"
  | "warning"
  | "danger"
  | "exhausted"
  | "unknown";

export interface QuotaCycle {
  remainingPercent: number;
  usedPercent: number;
  resetAt: string | null;
  resetCountdownText: string;
  status: QuotaStatus;
}

export interface QuotaState {
  fiveHour: QuotaCycle;
  weekly: QuotaCycle;
  source: "manual" | "parser" | "auto" | "mock";
  lastUpdatedAt: string;
}
```

### 状态计算规则

```ts
export function getQuotaStatus(
  remainingPercent: number,
  warningThreshold = 30,
  dangerThreshold = 15
): QuotaStatus {
  if (remainingPercent <= 0) return "exhausted";
  if (remainingPercent <= dangerThreshold) return "danger";
  if (remainingPercent <= warningThreshold) return "warning";
  if (remainingPercent >= 80) return "excellent";
  return "normal";
}
```

### 倒计时计算

```ts
export function formatCountdown(resetAt: string | null): string {
  if (!resetAt) return "--";
  const diff = new Date(resetAt).getTime() - Date.now();
  if (diff <= 0) return "已复苏";

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) return `${days}天${hours}时`;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
```

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 2.1 | 定义 QuotaState 类型 | Frontend | P0 |
| 2.2 | 实现状态计算函数 | Frontend | P0 |
| 2.3 | 实现倒计时格式化 | Frontend | P0 |
| 2.4 | 实现每秒倒计时刷新 | Frontend | P0 |
| 2.5 | 实现 mock 数据 | Frontend | P0 |
| 2.6 | 编写单元测试 | Test | P1 |

### 交付物

- 额度模型。
- 状态计算函数。
- 倒计时展示逻辑。
- Mock 数据驱动的 UI。

### 验收标准

- 额度状态变化准确。
- 倒计时每秒更新。
- resetAt 到期后显示“已复苏”。
- 不同阈值下状态正确。

---

## 阶段 3：悬浮 Widget UI

### 目标

完成主界面 UI，包括灵狐主题、双额度显示、状态提示。

### 组件结构

```text
components/widget
├── FloatingWidget.tsx
├── QuotaSummary.tsx
├── QuotaLine.tsx
├── StatusText.tsx
├── WidgetActions.tsx
└── DisplayModeSwitcher.tsx

components/theme
├── SpiritFox.tsx
├── SpiritFoxStatus.ts
└── ThemeProvider.tsx
```

### FloatingWidget 示例结构

```tsx
export function FloatingWidget() {
  return (
    <div data-tauri-drag-region className="widget-root">
      <SpiritFox status={overallStatus} />
      <QuotaLine label="灵力" value={fiveHour.remainingPercent} countdown={fiveHour.resetCountdownText} />
      <QuotaLine label="道蕴" value={weekly.remainingPercent} countdown={weekly.resetCountdownText} />
      <StatusText status={overallStatus} />
    </div>
  );
}
```

### UI 状态

#### Excellent

- 背景淡金色。
- 灵狐发光。
- 文案：灵气充盈。

#### Normal

- 背景正常。
- 灵狐待机。
- 文案：灵力稳定。

#### Warning

- 背景偏暗。
- 灵狐耳朵下垂。
- 文案：真元偏弱。

#### Danger

- 边框红色。
- 灵狐抱灵石。
- 文案：道基不稳。

#### Exhausted

- 整体灰色。
- 灵狐睡觉。
- 文案：灵脉枯竭。

### 推荐 Tailwind 风格

```tsx
const statusClassMap = {
  excellent: "bg-amber-100/80 border-amber-300",
  normal: "bg-slate-900/70 border-slate-700",
  warning: "bg-orange-950/80 border-orange-500",
  danger: "bg-red-950/80 border-red-500 animate-pulse",
  exhausted: "bg-zinc-900/80 border-zinc-700 grayscale"
};
```

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 3.1 | 设计 Widget 布局 | UI | P0 |
| 3.2 | 实现 QuotaLine | Frontend | P0 |
| 3.3 | 实现状态文案 | Frontend | P0 |
| 3.4 | 实现灵狐组件基础版 | UI | P0 |
| 3.5 | 实现迷你 / 标准 / 完整模式 | Frontend | P1 |
| 3.6 | 实现状态动画 | UI | P1 |
| 3.7 | 支持关闭动画 | Frontend | P2 |

### 交付物

- 可用悬浮 Widget。
- 支持 mock 额度展示。
- 视觉状态随额度变化。
- 灵狐主题基础版。

### 验收标准

- 用户一眼能看到 5小时额度和周额度。
- 低额度状态明显。
- UI 不遮挡太多屏幕。
- 动效不卡顿。

---

## 阶段 4：本地设置与持久化

### 目标

保存用户额度、设置、窗口位置等数据。

### 推荐存储

使用 Tauri Store Plugin 保存：

- quota-state.json
- app-settings.json
- window-state.json
- quota-history.json，V1.0

### 数据结构

```json
{
  "quota": {
    "fiveHour": {
      "remainingPercent": 68,
      "resetAt": "2026-06-06T01:30:00+08:00"
    },
    "weekly": {
      "remainingPercent": 41,
      "resetAt": "2026-06-09T00:00:00+08:00"
    },
    "source": "manual",
    "lastUpdatedAt": "2026-06-05T21:30:00+08:00"
  },
  "settings": {
    "theme": "spiritFox",
    "displayMode": "standard",
    "alwaysOnTop": true,
    "opacity": 0.95,
    "warningThreshold": 30,
    "dangerThreshold": 15,
    "notificationsEnabled": true
  }
}
```

### 前端 Store 封装

```ts
export interface SettingsRepository {
  loadSettings(): Promise<AppSettings>;
  saveSettings(settings: AppSettings): Promise<void>;
  loadQuota(): Promise<QuotaState>;
  saveQuota(quota: QuotaState): Promise<void>;
}
```

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 4.1 | 安装 Store Plugin | Tauri | P0 |
| 4.2 | 配置 capabilities 权限 | Tauri | P0 |
| 4.3 | 封装 settingsRepository | Frontend | P0 |
| 4.4 | 保存额度数据 | Frontend | P0 |
| 4.5 | 保存窗口设置 | Tauri + Frontend | P1 |
| 4.6 | 保存主题设置 | Frontend | P1 |
| 4.7 | 增加一键重置数据 | Frontend | P2 |

### 交付物

- 本地数据保存。
- 重启应用后恢复上次状态。
- 设置可持久化。

### 验收标准

- 手动输入额度后重启不丢。
- 设置阈值后重启不丢。
- 主题选择后重启不丢。
- 存储文件损坏时应用能回退默认值。

---

## 阶段 5：手动额度编辑与设置面板

### 目标

完成用户配置入口。

### 设置页组件

```text
components/settings
├── SettingsPanel.tsx
├── QuotaManualForm.tsx
├── WindowSettingsForm.tsx
├── NotificationSettingsForm.tsx
├── ThemeSettingsForm.tsx
└── AboutPanel.tsx
```

### 手动额度表单

字段：

- 5小时剩余百分比。
- 5小时重置时间。
- 每周剩余百分比。
- 每周重置时间。

### 表单校验规则

- 百分比范围：0 到 100。
- resetAt 支持 datetime-local 输入。
- resetAt 为空时显示 `--`。
- Danger 阈值必须小于 Warning 阈值。
- 保存后立即刷新主 Widget。

### 设置页打开方式

- 点击 Widget。
- 托盘菜单打开。
- 快捷键打开，后续实现。

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 5.1 | 实现设置页容器 | Frontend | P0 |
| 5.2 | 实现手动额度表单 | Frontend | P0 |
| 5.3 | 实现表单校验 | Frontend | P0 |
| 5.4 | 实现窗口设置表单 | Frontend | P1 |
| 5.5 | 实现提醒设置表单 | Frontend | P1 |
| 5.6 | 实现主题设置表单 | Frontend | P1 |
| 5.7 | 实现设置页打开 / 关闭 | Tauri + Frontend | P0 |

### 交付物

- 用户可手动编辑额度。
- 用户可配置阈值。
- 用户可切换显示模式。
- 用户可选择主题。

### 验收标准

- 设置页不影响悬浮窗倒计时。
- 保存后立即生效。
- 错误输入有提示。
- 关闭设置页不退出应用。

---

## 阶段 6：系统托盘

### 目标

实现后台常驻和托盘快捷操作。

### Rust 侧模块

```text
src-tauri/src/tray
├── mod.rs
└── menu.rs
```

### 托盘菜单设计

```text
Codex Quota Widget
灵力：68%
道蕴：41%
---
显示 / 隐藏
刷新额度
编辑额度
设置
---
退出
```

### 行为规则

- 点击关闭按钮：隐藏窗口。
- 托盘点击：显示 / 隐藏。
- 托盘菜单「退出」：退出应用。
- 菜单中展示当前额度，V1.0 可实时更新。
- 低额度图标变化，V1.0 实现。

### Rust 伪代码

```rust
pub fn setup_tray(app: &mut tauri::App) -> tauri::Result<()> {
    // 创建菜单
    // 创建托盘图标
    // 注册菜单事件
    // 绑定 show / hide / quit
    Ok(())
}
```

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 6.1 | 创建托盘图标 | Tauri | P0 |
| 6.2 | 创建托盘菜单 | Tauri | P0 |
| 6.3 | 实现显示 / 隐藏窗口 | Tauri | P0 |
| 6.4 | 实现退出应用 | Tauri | P0 |
| 6.5 | 关闭窗口时隐藏到托盘 | Tauri | P0 |
| 6.6 | 托盘显示当前额度 | Tauri + Frontend | P1 |
| 6.7 | 低额度切换图标 | Tauri | P2 |

### 交付物

- 系统托盘功能。
- 应用可后台常驻。
- 菜单可以控制窗口。

### 验收标准

- Windows 托盘可见。
- macOS 菜单栏可见。
- 关闭窗口不退出。
- 点击退出才真正退出。
- 托盘菜单操作正常。

---

## 阶段 7：通知提醒

### 目标

实现低额度系统通知。

### 使用插件

```bash
pnpm add @tauri-apps/plugin-notification
```

Rust 侧注册插件，前端请求权限后发送通知。

### 通知触发条件

- 5小时额度低于 Warning。
- 5小时额度低于 Danger。
- 5小时额度等于 0。
- 每周额度低于 Warning。
- 每周额度低于 Danger。
- 每周额度等于 0。
- 额度恢复，V1.0。

### 防骚扰策略

```ts
interface NotificationGuard {
  lastFiveHourWarningAt?: string;
  lastFiveHourDangerAt?: string;
  lastFiveHourExhaustedAt?: string;
  lastWeeklyWarningAt?: string;
  lastWeeklyDangerAt?: string;
  lastWeeklyExhaustedAt?: string;
}
```

规则：

- 同一状态一个周期只通知一次。
- 用户手动关闭通知后不发送。
- 应用启动时不立刻刷屏，只在状态变化时提醒。
- 额度恢复后重置通知状态。

### 通知文案

```ts
const notificationTexts = {
  fiveHourWarning: {
    title: "Codex 灵力偏低",
    body: "灵力不足 30%，建议谨慎开阵。"
  },
  fiveHourDanger: {
    title: "Codex 道基不稳",
    body: "灵力不足 15%，再召唤几次可能进入闭关恢复。"
  },
  fiveHourExhausted: {
    title: "Codex 灵脉枯竭",
    body: "当前 5小时额度已耗尽，请等待复苏。"
  },
  weeklyDanger: {
    title: "本周道蕴告急",
    body: "本周额度不足 15%，建议留给关键任务。"
  }
};
```

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 7.1 | 安装 Notification Plugin | Tauri | P0 |
| 7.2 | 配置通知权限 | Tauri | P0 |
| 7.3 | 封装通知服务 | Frontend | P0 |
| 7.4 | 实现阈值触发 | Frontend | P0 |
| 7.5 | 实现防骚扰策略 | Frontend | P0 |
| 7.6 | 实现通知开关 | Frontend | P1 |
| 7.7 | 实现恢复通知 | Frontend | P2 |

### 交付物

- 低额度通知。
- 通知开关。
- 防重复提醒。

### 验收标准

- Windows 通知正常。
- macOS 通知正常。
- 重复状态不会反复通知。
- 用户关闭通知后不再弹出。

---

## 阶段 8：粘贴解析额度

### 目标

用户可以粘贴 Codex quota 文本，应用自动解析额度。

### 输入入口

设置页新增「粘贴解析」Tab。

### 解析流程

1. 用户粘贴原始文本。
2. 前端 parser 尝试提取字段。
3. 展示解析结果。
4. 用户确认。
5. 写入 QuotaState。

### Parser 设计

```ts
export interface ParsedQuotaResult {
  fiveHourRemainingPercent?: number;
  weeklyRemainingPercent?: number;
  fiveHourResetAt?: string;
  weeklyResetAt?: string;
  confidence: number;
  warnings: string[];
}
```

### 支持格式

```text
5h remaining: 68%
weekly remaining: 41%
reset in: 2h 14m
weekly reset: 3d 12h
```

```text
5 hour left 68%, week left 41%, reset after 2 hours
```

```text
五小时额度剩余 68%，每周额度剩余 41%，2小时14分钟后恢复
```

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 8.1 | 实现 parser 基础正则 | Frontend | P1 |
| 8.2 | 支持英文百分比解析 | Frontend | P1 |
| 8.3 | 支持中文百分比解析 | Frontend | P1 |
| 8.4 | 支持 reset in 时间解析 | Frontend | P1 |
| 8.5 | 实现解析结果确认页 | Frontend | P1 |
| 8.6 | 增加 parser 单元测试 | Test | P1 |

### 交付物

- 粘贴解析功能。
- 解析确认界面。
- Parser 测试。

### 验收标准

- 常见格式可以解析。
- 解析失败时给出提示。
- 用户不确认不会覆盖当前额度。
- Parser 有基础测试覆盖。

---

## 阶段 9：开机自启与快捷操作

### 目标

提升常驻工具体验。

### 开机自启

使用：

```bash
pnpm add @tauri-apps/plugin-autostart
```

设置项：

```ts
autoStart: boolean;
```

行为：

- 用户开启后，下次系统启动自动运行。
- 应用启动后默认显示悬浮窗或隐藏到托盘，由用户设置决定。
- 用户关闭后取消系统自启。

### 快捷键

V1.0 可增加：

- 显示 / 隐藏 Widget。
- 打开设置。
- 快速刷新额度。

推荐：

```text
Ctrl + Alt + Q：显示 / 隐藏
Ctrl + Alt + S：设置
```

### 鼠标穿透

V1.0 实现。注意平台差异较大，需要单独测试 Windows 和 macOS。

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 9.1 | 安装 Autostart Plugin | Tauri | P1 |
| 9.2 | 设置页增加开机自启开关 | Frontend | P1 |
| 9.3 | 实现自启启用 / 禁用 | Tauri + Frontend | P1 |
| 9.4 | 实现显示 / 隐藏快捷键 | Tauri | P2 |
| 9.5 | 实现鼠标穿透 | Tauri | P2 |
| 9.6 | 平台兼容测试 | QA | P2 |

### 交付物

- 开机自启功能。
- 快捷键方案。
- 鼠标穿透实验版本。

### 验收标准

- 开机自启开关有效。
- 自启状态能正确读取。
- 快捷键不和系统明显冲突。
- 鼠标穿透可关闭。

---

## 阶段 10：自动读取 Codex 额度

### 目标

尝试自动获取本机 Codex 额度。

### 重要原则

自动读取作为增强功能，不作为 MVP 依赖。必须保留手动输入。因为 Codex 的本地信息、命令输出和版本行为可能变化，不要让整个产品绑死在一个脆弱入口上。软件工程里这种“它应该一直这样”的想法，通常三周后就会被现实扇醒。

### 读取策略

#### 策略 A：本地文件读取

- 扫描已知配置目录。
- 尝试读取状态文件。
- 解析 quota 字段。
- 记录来源。

#### 策略 B：安全命令读取

通过 Shell Plugin 执行白名单命令：

```text
codex --version
codex quota
codex status
```

实际命令需要根据用户环境验证。

#### 策略 C：用户自定义命令，后续考虑

不建议 MVP 开放任意命令。若未来支持，需要严格白名单和安全提示。

### Rust 命令设计

```rust
#[tauri::command]
async fn detect_codex_quota() -> Result<QuotaPayload, String> {
    // 1. 检查常见路径
    // 2. 尝试命令读取
    // 3. 返回结构化结果
}
```

### 返回结构

```ts
export interface AutoDetectedQuota {
  success: boolean;
  source: "file" | "shell" | "unknown";
  rawText?: string;
  quota?: Partial<QuotaState>;
  error?: string;
}
```

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 10.1 | 调研 Codex 本地状态来源 | Research | P1 |
| 10.2 | 设计读取接口 | Tauri | P1 |
| 10.3 | 实现文件扫描 | Rust | P1 |
| 10.4 | 实现白名单 shell 命令 | Rust | P1 |
| 10.5 | 对接前端解析器 | Frontend | P1 |
| 10.6 | 失败回退手动模式 | Frontend | P0 |
| 10.7 | 增加读取日志 | Tauri | P1 |

### 交付物

- 自动检测按钮。
- 自动读取结果页。
- 失败原因展示。
- 手动模式回退。

### 验收标准

- 自动读取失败不崩溃。
- 没装 Codex 时提示清晰。
- 用户可以关闭自动读取。
- 所有命令执行都在白名单内。

---

## 阶段 11：历史记录与趋势

### 目标

记录额度变化，形成基础趋势判断。

### 数据记录时机

- 用户手动更新额度。
- 粘贴解析确认。
- 自动读取成功。
- 周期恢复后首次刷新。

### 历史数据结构

```ts
export interface QuotaHistoryItem {
  id: string;
  recordedAt: string;
  fiveHourRemainingPercent?: number;
  weeklyRemainingPercent?: number;
  source: "manual" | "parser" | "auto";
}
```

### 趋势功能

- 今日消耗变化。
- 本周消耗变化。
- 预计本周是否提前耗尽。
- 最近更新时间线。

### 简单预测逻辑

```ts
estimatedWeeklyRunout =
  currentWeeklyRemaining / averageDailyConsumption
```

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 11.1 | 设计历史数据结构 | Frontend | P2 |
| 11.2 | 保存历史记录 | Frontend | P2 |
| 11.3 | 设置最大保留 30 天 | Frontend | P2 |
| 11.4 | 趋势计算 | Frontend | P2 |
| 11.5 | 详情页展示趋势 | UI | P2 |
| 11.6 | 清空历史记录 | Frontend | P2 |

### 交付物

- 历史记录。
- 简单趋势。
- 一键清空。

### 验收标准

- 历史记录不会无限增长。
- 清空数据有效。
- 趋势只是建议，不误导用户。

---

## 阶段 12：打包、签名与发布

### 目标

生成 Windows / macOS 安装包，准备分发。

### 打包产物

#### Windows

- `.msi`
- `.exe`

#### macOS

- `.dmg`
- `.app`

### 发布准备

- 应用图标。
- 版本号。
- Release notes。
- GitHub Releases。
- 安装说明。
- 常见问题。
- 代码签名，正式分发需要。
- macOS notarization，正式分发需要。

### GitHub Actions 思路

```yaml
name: release

on:
  push:
    tags:
      - "v*"

jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, windows-latest]
    runs-on: ${{ matrix.platform }}
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: pnpm install
      - run: pnpm tauri build
```

### 任务拆分

| 编号 | 任务 | 类型 | 优先级 |
|---|---|---|---|
| 12.1 | 配置应用图标 | Build | P0 |
| 12.2 | 配置 bundle 信息 | Build | P0 |
| 12.3 | Windows 打包测试 | Build | P0 |
| 12.4 | macOS 打包测试 | Build | P0 |
| 12.5 | GitHub Actions 构建 | DevOps | P1 |
| 12.6 | 代码签名方案 | DevOps | P1 |
| 12.7 | 自动更新插件 | Tauri | P2 |

### 交付物

- Windows 安装包。
- macOS 安装包。
- Release 页面。
- 安装说明。

### 验收标准

- Windows 安装后可启动。
- macOS 安装后可启动。
- 卸载后不残留明显异常数据。
- 版本号显示正确。

---

## 3. 里程碑计划

## 3.1 7 天 MVP 计划

### Day 1：项目初始化 + 窗口

- 初始化 Tauri 项目。
- 配置 React + Tailwind。
- 配置透明窗口。
- 配置无边框和置顶。
- 实现基础拖动。

交付：桌面上出现一个可拖动透明窗口。

### Day 2：额度模型 + 倒计时

- 定义 QuotaState。
- 实现 mock 数据。
- 实现状态计算。
- 实现倒计时。
- 实现 Zustand store。

交付：窗口能显示模拟 5小时额度和周额度。

### Day 3：Widget UI + 灵狐皮肤

- 实现 FloatingWidget。
- 实现 QuotaLine。
- 实现 SpiritFox 基础状态。
- 实现 warning / danger / exhausted UI。

交付：看起来像一个真正的修仙风额度小组件。

### Day 4：设置页 + 手动额度

- 实现设置面板。
- 实现手动额度表单。
- 表单校验。
- 保存后刷新 UI。

交付：用户可以手动输入额度。

### Day 5：本地存储 + 托盘

- 接入 Store Plugin。
- 保存设置。
- 保存额度。
- 实现托盘图标。
- 实现显示 / 隐藏 / 退出。

交付：关闭窗口后应用可托盘常驻。

### Day 6：通知提醒 + 体验优化

- 接入 Notification Plugin。
- 实现低额度通知。
- 实现防重复提醒。
- 调整 UI 细节。
- 测试 Windows / macOS。

交付：低额度时能提醒用户。

### Day 7：打包 + README + 内测

- 配置应用图标。
- Windows 打包。
- macOS 打包。
- 写 README。
- 写安装说明。
- 列出已知问题。

交付：MVP 安装包。

---

## 3.2 14 天 V0.2 计划

### Week 1

完成 MVP。

### Week 2

- 粘贴解析额度。
- 开机自启。
- 显示模式：迷你 / 标准 / 完整。
- 主题设置。
- 命灯器灵皮肤。
- 宗门玉牌皮肤。
- 设置页完善。
- 打包流程完善。

交付：可以对外发给 10-20 个用户试用的版本。

---

## 3.3 30 天 V1.0 计划

### 第 1 周：MVP

完成基础可用版本。

### 第 2 周：体验完善

- 多皮肤。
- 开机自启。
- 粘贴解析。
- 快捷键。
- 窗口位置记忆。

### 第 3 周：自动读取探索

- 调研 Codex 数据来源。
- 实现自动检测入口。
- 实现 shell 白名单。
- 实现失败回退。
- 记录读取日志。

### 第 4 周：发布准备

- 历史记录。
- 趋势预测。
- 官网 landing page。
- GitHub Releases。
- Windows/macOS 安装包。
- 收集反馈。
- 制作演示视频。

---

## 4. 详细任务看板

## P0：必须完成

| 模块 | 任务 | 说明 |
|---|---|---|
| 项目 | 初始化 Tauri + React | 基础工程 |
| 窗口 | 透明无边框悬浮窗 | Widget 核心 |
| 窗口 | alwaysOnTop | 桌面常驻 |
| UI | 灵狐小组件 | 主视觉 |
| 数据 | QuotaState | 核心模型 |
| 数据 | 状态计算 | warning/danger/exhausted |
| 数据 | 倒计时 | resetAt 展示 |
| 设置 | 手动额度输入 | MVP 数据来源 |
| 存储 | 本地保存设置 | 重启不丢 |
| 托盘 | 显示/隐藏/退出 | 后台常驻 |
| 通知 | 低额度提醒 | 核心价值 |
| 打包 | Windows/macOS build | 可交付 |

## P1：建议完成

| 模块 | 任务 | 说明 |
|---|---|---|
| 设置 | 阈值配置 | 个性化 |
| 设置 | 透明度/缩放 | 桌面适配 |
| 窗口 | 位置记忆 | 体验 |
| 皮肤 | 命灯器灵 | 氛围感 |
| 皮肤 | 宗门玉牌 | 专业模式 |
| 数据 | 粘贴解析 | 降低输入成本 |
| 系统 | 开机自启 | 常驻工具 |
| 快捷键 | 显示/隐藏 | 效率操作 |
| 日志 | 本地日志 | 排错 |

## P2：后续增强

| 模块 | 任务 | 说明 |
|---|---|---|
| 数据 | 自动读取 Codex | 高级功能 |
| 数据 | 历史记录 | 趋势分析 |
| 数据 | 周额度预测 | 规划使用 |
| 发布 | 自动更新 | 长期维护 |
| 国际化 | 中英切换 | 海外用户 |
| 官网 | Landing Page | 分发增长 |
| 反馈 | 问题上报 | 内测反馈 |

---

## 5. 推荐开发顺序

严格按这个顺序开发：

```text
1. Tauri 空项目
2. 透明悬浮窗
3. React Widget UI
4. Mock 额度数据
5. 状态计算 + 倒计时
6. 灵狐皮肤
7. 手动额度输入
8. 本地存储
9. 托盘常驻
10. 通知提醒
11. 打包安装
12. 粘贴解析
13. 开机自启
14. 多皮肤
15. 自动读取探索
```

不要一开始写自动读取。先把视觉和基本流程跑通，否则很容易陷入「我在研究 Codex 数据在哪里」这种工程黑洞。工程黑洞看起来很专业，实际就是延期的豪华包装。

---

## 6. AI Coding Agent 开发提示词

### 6.1 项目初始化 Prompt

```text
你是一个资深 Tauri v2 + React + TypeScript 桌面应用工程师。
请创建一个名为 Codex Quota Widget 的 Tauri v2 项目，前端使用 React + Vite + TypeScript + Tailwind CSS。

项目目标：
1. Windows/macOS 桌面悬浮小组件。
2. 无边框、透明背景、始终置顶。
3. 显示 Codex 5小时额度和每周额度。
4. 使用修仙风主题，默认灵狐小管家。
5. 后续支持托盘、通知、本地设置。

请先完成项目结构、基础窗口配置、React 首页，并确保 pnpm tauri dev 可以运行。
```

### 6.2 Widget UI Prompt

```text
请实现 Codex Quota Widget 的主悬浮组件 FloatingWidget。

要求：
1. 使用 React + TypeScript。
2. 使用 Tailwind CSS。
3. 展示两行额度：
   - 灵力：5小时额度百分比 + 重置倒计时
   - 道蕴：每周额度百分比 + 周重置倒计时
4. 根据状态 excellent / normal / warning / danger / exhausted 切换样式。
5. 实现 SpiritFox 组件，根据状态显示不同表情。
6. 整个 Widget 支持 data-tauri-drag-region 拖动。
7. UI 尺寸控制在 280x180 内。
```

### 6.3 数据模型 Prompt

```text
请为 Codex Quota Widget 实现额度数据模型和状态计算逻辑。

要求：
1. 定义 QuotaStatus、QuotaCycle、QuotaState 类型。
2. 实现 getQuotaStatus 函数。
3. 实现 formatCountdown 函数。
4. 实现 Zustand store：
   - quota
   - settings
   - updateQuota
   - updateSettings
5. 倒计时每秒刷新。
6. resetAt 到期后显示“已复苏”。
7. 给出基础单元测试。
```

### 6.4 设置页 Prompt

```text
请实现 Codex Quota Widget 的设置页。

要求：
1. 支持手动输入 5小时额度剩余百分比。
2. 支持手动输入 5小时重置时间。
3. 支持手动输入每周额度剩余百分比。
4. 支持手动输入每周重置时间。
5. 支持设置 warningThreshold 和 dangerThreshold。
6. 百分比范围必须是 0-100。
7. dangerThreshold 必须小于 warningThreshold。
8. 保存后更新 Zustand store。
9. 设置页 UI 使用 Tailwind CSS。
```

### 6.5 Tauri 托盘 Prompt

```text
请在 Tauri v2 后端实现系统托盘。

要求：
1. 创建托盘图标。
2. 创建菜单：
   - 显示 / 隐藏
   - 刷新额度
   - 设置
   - 退出
3. 点击显示 / 隐藏时切换 main window 可见性。
4. 点击退出时真正退出应用。
5. 用户点击窗口关闭按钮时隐藏窗口，不退出应用。
6. 兼容 Windows 和 macOS。
```

### 6.6 通知 Prompt

```text
请为 Codex Quota Widget 接入 Tauri notification plugin。

要求：
1. 当 5小时额度低于 warningThreshold 时发送提醒。
2. 当 5小时额度低于 dangerThreshold 时发送提醒。
3. 当 5小时额度等于 0 时发送耗尽提醒。
4. 每周额度同样支持 warning / danger / exhausted。
5. 同一状态在同一周期内只提醒一次。
6. 用户可以在设置中关闭通知。
7. 通知文案使用修仙风。
```

---

## 7. 测试计划

### 7.1 单元测试

测试内容：

- getQuotaStatus。
- formatCountdown。
- parser。
- settings validation。
- notification guard。

### 7.2 集成测试

测试内容：

- 手动输入后 UI 更新。
- 设置保存后重启恢复。
- 低额度触发通知。
- 托盘显示 / 隐藏。
- 关闭窗口隐藏到托盘。

### 7.3 平台测试

#### Windows

- Windows 10。
- Windows 11。
- 多显示器。
- 高 DPI。
- 托盘右键菜单。
- 通知权限。
- 开机自启。

#### macOS

- macOS 13+。
- 菜单栏图标。
- 通知权限。
- 透明窗口。
- Gatekeeper 提示。
- DMG 安装。

---

## 8. 发布计划

### 内测版本 v0.1

范围：

- 手动额度。
- 灵狐皮肤。
- 托盘。
- 通知。
- Windows/macOS 安装包。

目标用户：

- 自己。
- 5-10 个 AI 编程重度用户。
- 独立开发者朋友。

收集反馈：

- 是否愿意常驻桌面？
- 额度输入是否麻烦？
- 皮肤是否打扰？
- 通知是否频繁？
- 是否愿意要自动读取？

### 公测版本 v0.2

新增：

- 粘贴解析。
- 开机自启。
- 多皮肤。
- 迷你模式。
- 设置优化。

### 正式版本 v1.0

新增：

- 自动读取探索版。
- 历史记录。
- 使用趋势。
- 自动更新。
- 官网下载页。

---

## 9. 风险与应对

| 风险 | 影响 | 应对 |
|---|---|---|
| Codex 额度无法稳定自动读取 | 自动化体验下降 | MVP 保留手动模式 |
| Tauri 透明窗跨平台表现不同 | UI 体验差异 | 尽早双平台测试 |
| macOS 通知权限复杂 | 通知失效 | 设置页展示权限状态 |
| 托盘 API 差异 | 后台常驻异常 | 分平台测试 |
| 动效性能消耗 | 常驻体验差 | 支持关闭动画 |
| 打包签名成本 | 分发阻碍 | 内测先 unsigned，正式再签名 |
| 用户觉得手动输入麻烦 | 留存下降 | 尽快做粘贴解析 |

---

## 10. 第一版完成定义

当以下条件全部满足时，v0.1 MVP 算完成：

- 应用可以在 Windows 和 macOS 启动。
- 启动后出现透明悬浮小组件。
- 用户可以拖动小组件。
- 小组件显示 5小时额度和每周额度。
- 小组件显示重置倒计时。
- 用户可以手动编辑额度。
- 用户设置重启后不丢失。
- 额度低于阈值后 UI 变化。
- 额度低于阈值后系统通知。
- 应用有托盘菜单。
- 关闭窗口时隐藏到托盘。
- 托盘可以退出应用。
- 能生成 Windows 和 macOS 安装包。

---

## 11. 后续商业化可能

### 免费版

- 手动额度。
- 1 套皮肤。
- 基础提醒。
- 本地保存。

### Pro 版

- 多皮肤。
- 自动读取。
- 历史趋势。
- 多 AI 工具支持。
- 自定义文案。
- 自动更新。
- 高级桌面模式。

### 传播点

- “把 Codex 额度变成修仙灵力”
- “当额度耗尽时，你的灵狐会原地闭关”
- “AI 编程人的桌面灵宠”
- “别再让 Codex 突然断粮”

这东西适合做截图传播，尤其是小红书、X、Product Hunt。额度管理本身很枯燥，但修仙皮肤能让它变得有梗。工具好用是一回事，能不能让用户愿意晒出来，是另一回事。
