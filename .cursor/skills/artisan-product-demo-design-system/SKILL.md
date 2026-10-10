---
name: artisan-product-demo-design-system
description: 使用 Artisan Design System 3.0 的基础 Token 与稳定的 data-ds-* 标签创建或修改产品业务 Demo，并在完成后自动执行设计系统检查。适用于 React、HTML、CSS、Vue、Svelte 等界面开发；不用于修改正式 Figma Library。
---

# Artisan 产品 Demo 轻量设计系统

## 用途

这套 Skill 用于产品通过 Codex、Cursor 等 AI 工具制作业务 Demo：

1. 基础视觉遵守正式设计系统 Token。
2. AI 生成的基础组件带有统一、稳定、机器可识别的标签。
3. 后续可以依据标签，将 Demo 自动映射回正式 Figma Component 和 Variables。

正式 Figma 文件 `Artisan Design System 3.0`（Key：`Ka55lQXH0Sjy2DOUO8kVbP`）始终是唯一 Source of Truth。本目录只是产品 Demo 阶段的轻量 Contract，不能取代正式设计系统。

## 开始工作前

必须读取：

- [token-contract.json](token-contract.json)：基础视觉 Token。
- [component-contract.json](component-contract.json)：Stable DS ID 规则以及合法的 Variant、Size、State。
- [component-mapping.json](component-mapping.json)：Stable DS ID 与真实 Figma Component、Component Set、Properties 的映射。

## 基础 Token 规则

- 基础颜色、字体、字号、间距、圆角、边框、阴影、控件高度和通用尺寸，优先使用 `token-contract.json` 中的值和 CSS Variable。
- Contract 已经覆盖的视觉值，不允许创建含义相同的新 Token。
- 不要为了美化页面而随机添加基础色、字号、间距、圆角或阴影。
- 业务内容、业务布局和特殊业务模块可以自由设计，但不得把业务专用值伪装成正式 Token。
- Contract 中没有正式定义的值，不得声称它来自 Artisan Design System。

## 组件标签规则

凡是 `component-contract.json` 已覆盖的基础组件，其稳定渲染根节点必须带有：

```text
data-ds-id
data-ds-component
data-ds-variant
```

组件存在尺寸或状态时，还必须增加：

```text
data-ds-size
data-ds-state
```

示例：

```html
<button
  data-ds-id="cmp-button-primary-m"
  data-ds-component="Button"
  data-ds-variant="primary"
  data-ds-size="m"
  data-ds-state="default"
>
  发布
</button>
```

必须遵守：

- `data-ds-id` 只能按照 Contract 的 ID 语法和合法值生成。
- 不允许遗漏已知基础组件的 `data-ds-id`。
- 不允许随意改写 Stable DS ID。
- 不允许使用随机 class 名代替 Stable DS ID。
- hover、focus、active、disabled 等运行状态写入 `data-ds-state`，不改变 Stable DS ID。
- 标签值使用 `component-contract.json` 中的标准英文值。
- Figma 对应关系以 `component-mapping.json` 中的真实 Property 名称和值为准。
- React 组件如果不透传自定义属性，应把标签放到稳定的 DOM 根节点，或让组件正确透传 `data-ds-*`，不得改变原有行为和无障碍属性。

## 标签范围

当前版本只给 Contract 已收录的基础 UI 组件打标签：

- Button
- Input
- SearchBar
- Select
- Checkbox
- Radio
- Switch
- Tag
- Form
- Modal

Card、Table、Empty、Drawer、Tabs、Pagination，以及页面中的业务卡片、业务列表、业务看板、详情区块等复合业务组件，当前版本不要求添加任何 `data-ds-*` 标签，也不标记为 New Component。

只有当元素明显属于上述基础组件范围，但无法确认 Variant、Size 或 Mapping 时，才添加：

```text
data-ds-status="review-required"
```

不得猜测 Stable DS ID。

## 每次生成后自动检查

每次创建或修改 Demo 后，必须自动执行一次 Design System Audit。

检查本次涉及的 HTML、JSX、TSX、Vue、Svelte 和样式文件，并识别原生元素、带 `role` 的控件、导入的组件，以及通过 `div` 和 CSS 自行实现的基础组件。

必须检查：

1. 基础视觉值是否来自 `token-contract.json`。
2. 已知基础组件是否完整包含必需标签。
3. `data-ds-id` 是否符合 Contract，并能在 Mapping 中找到规则。
4. Variant、Size、State 是否合法。
5. 是否存在未标记的 Button、Input、SearchBar、Select、Checkbox、Radio、Switch、Tag、Form、Modal。
6. 是否随机新增了基础颜色、字号、间距、圆角、边框、阴影或控件高度。
7. 是否存在需要人工确认的 `review-required`。

## 自动修复

- 能明确识别组件及其 Variant、Size、State 时，自动补充或修正标签。
- 自动修复不得改变业务逻辑、交互和无障碍属性。
- 无法明确识别时，添加 `data-ds-status="review-required"`，并说明不确定项。
- 业务组件和当前范围外组件保持原样，不添加标签，不猜测 ID。
- 修复后再次检查，确认没有产生新的非法标签。

## 完成时输出

简要报告：

- 检查的文件；
- 自动补充或修复的标签；
- 非法 DS ID；
- 未声明的基础 Token；
- 需要人工确认的元素；
- 被排除在标签范围外的组件（如有必要说明）。

没有问题时明确报告 Audit 通过。
