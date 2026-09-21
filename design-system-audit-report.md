# Artisan Design System Audit Report

## 审计信息

- 项目：红方块个人作品集（Vite MPA + Express）
- 审计时间：2026-09-20
- Artisan Figma File Key：`Ka55lQXH0Sjy2DOUO8kVbP`
- Figma 读取状态：成功（只读）。已读取全部页面列表、`01_Primitive` / `02_Semantic` / `04_Layout` Variables、Button / textarea / radio-button 的 Component Property，以及 Button、input、Tag / Color、modal-s/m/l/xl/xxl/confirm 的 published Component Key。未改写正式 Library。
- 扫描范围：`index.html`、`about.html`、`work.html`、`admin.html`、`src/*.js`、`src/styles/*.css`
- 排除目录：`node_modules`、`dist`、`uploads`、`.cursor`

## 结论

基础控件（Button、Input、Select、Tag、Form Item、尺寸 Modal）的 Stable DS ID 与最新 Figma Component Key **一致**，语义色 Token 与 `02_Semantic` Light 模式 **基本对齐**。

本次已自动修好：删除确认框误用 `modal-s`、筛选条非法 `cmp-radio-group`、fill-3 / border-default 与 Figma 差 1 位的色值、Modal 宽度与 48px 控件高度改为 Token。

**暂缓进入正式 Figma Binding。** 原因不是标签覆盖率数字，而是：

1. 作品集首页大量展示模块（作品灰底通栏、服务手风琴、圆形肖像、大标题）不是 Artisan 基础控件，需要设计师确认是「业务新组件」还是「用 Avatar / Radio-button / Card 拼」。
2. 正式文件中 Textarea、Password、radio-button-group 已存在，旧 Contract 未收录；口令框和多行输入目前只能标 `review-required`。
3. Figma 中 Card / Empty / Table / Tabs 标明未建设，Select / Modal 页面标明建设中。Binding 前需设计师确认以已发布 Component 为准。

## 数据概览

| 指标 | 数量 |
|---|---:|
| Total Pages | 4 |
| Total UI Components | 86 |
| Valid Tagged Components | 72 |
| Missing Tags | 3 |
| Auto Repaired | 12 |
| Invalid DS IDs | 0（修复后） |
| Invalid Variants | 0（修复后） |
| Invalid Sizes | 0 |
| Invalid States | 0 |
| Contract Outdated | 9 |
| Token Violations | 0（页面层无裸 HEX；HEX 仅在 `tokens.css` 作为 Token 值） |
| Token Mapping Missing | 11 |
| New Component Candidates | 8 |
| Review Required | 11 |
| Unknown Components | 2 |
| Tag Coverage | 83.7% |

口径：首页按 7 个筛选 Radio + 6 个服务 Radio；管理页按 3 条作品、仪表盘表单槽位统计。`Tag Coverage = 72 ÷ 86`。未满 95%，不建议为刷覆盖率给业务模块硬套 ID。

## 已自动修复

| 文件 | 修改前 | 修改后 | 证据 | 置信度 |
|---|---|---|---|---|
| `src/styles/tokens.css` | `--background-fill-3: #e6eaef` | `#e6eaee` | Figma `Background/fill-3` → `Color/gray/3` 解析为 `#e6eaee` | 99% |
| `src/styles/tokens.css` | `--border-default: #e6eaef` | `#e6eaee` | Figma `Border/border-default` 解析为 `#e6eaee` | 99% |
| `src/styles/tokens.css` | 无 `--control-height-input-extra` | `48px` | 旧 Contract `controlHeight.inputExtra`；与 Figma 48 控件高度一致 | 95% |
| `src/styles/tokens.css` | 无 modal size vars | `--size-modal-s/m/l/xl/xxl` | Figma modal 组件描述与 Mapping 宽度 400/600/800/1000/1200 | 99% |
| `src/styles/app.css` | Modal 写死 400/600/800/1000 | 使用 `--size-modal-*` | 同上 | 99% |
| `src/styles/app.css` | `.talk-mail height: 48px` | `--control-height-input-extra` | 唯一对应 48 控件高度 | 92% |
| `src/styles/app.css` | `min-height: 64px`（页头） | `--space-64` | Spacing 64 唯一对应 | 95% |
| `src/styles/app.css` | `calc(100vh - 64px)` | `calc(100vh - var(--space-64))` | 同上 | 95% |
| `src/admin.js` | 删除确认 `data-ds-id=cmp-modal-s` `variant=default` | `cmp-modal-confirm` `variant=confirm` | 已发布 `modal-confirm` key `df4408a77617d07810fab7afa6aeedcfd470f0fa` | 98% |
| `index.html` | `data-ds-id=cmp-radio-group` | 去掉非法 ID，加 `review-required` | Mapping 无此 ID；Figma 对应物是 `radio-button-group` | 95% |
| `src/admin.js` | 未标记 textarea | `data-ds-component=Textarea` + `review-required` | Figma 有 textarea set key `bb805e526ad1ad54629f4b41ce9d900c32435fed`，无 Size，禁止猜 ID | 90% |
| `src/admin.js` | 口令 Input 无 status | `review-required` | Figma 另有 password 组件 key `3e2f1a4460e76e45738dce1f4a777e837d440b16` | 88%（标审查，未改 ID） |

## Contract Outdated

除非明确要求，未改写 `token-contract.json` / `component-contract.json` / `component-mapping.json`。

| 冲突 | 旧 Contract | 最新 Figma | 影响 | 建议 |
|---|---|---|---|---|
| fill-3 / border-default | `#E6EAEF` | `#e6eaee` | `tokens.css` 已按 Figma 修复 | 下次更新 Contract 色值 |
| Border CSS 名 | `--border-light` | `--border-border-light` | 工程仍用短名 | Binding 时用 Code Syntax 对齐 |
| Overlay | `Overlay/mask-bg` 在语义表 | Semantic 集合中未检出；Primitive `Color/base/overlay-mask` | 蒙层色仍可用 | 确认语义 Token 是否下线 |
| Textarea | 未作为可打标签基础组件 | 已发布 Component Set | 管理页多行输入 | 增补 ID 语法后再打 `data-ds-id` |
| Password | 用 Input | 独立 password 组件 | 登录口令 | 确认是否改绑 password |
| Radio group | `cmp-radio-group` | `radio-button-group` key `e505831a…` | 首页筛选条容器 | 更新 Mapping 后再打 ID |
| Radio 选中态 | `checked` / `unchecked` | 属性「选中」= `true` / `false` | 首页 Radio | Binding 时做值映射 |
| Select / Modal 页面状态 | Mapping 当作完成件 | 页面名含「建设中」 | 管理页 Select、Modal | 以已发布 Component 为准，向设计师确认 |
| 容器宽度 | `size.container` 1800–2200 | 另有 `Container/design-width=1440`、`min-supported-width=1280` | 作品集 `max-width: 1120px` | 作品集是展示站，不要强行改成后台 1800 |

Component Key 抽查（与 Mapping 一致，无 OUTDATED_MAPPING）：

- Button `ea23c36e1bd18ae5c031bc832e63b20441cae2d0`（节点 `10657:99018`）
- input `221b53cf1f8c7c09680594043105fc37f741942d`
- Tag / Color `f904510c767d98da1c87014c4d7b53fdf2d17ebc`
- modal-m `f852104329da29173f659b862081ffe994f62f57`
- radio-button `f4e30b060558a982a6bed44994d078346f1d6ca4`

Button 最新属性：类型 / 种类 / 形状 / 尺寸（含超大）/ 状态。与 Mapping 一致。

## 标签问题

### Invalid DS ID / Variant / Size / State

修复后：**无**。原先 `cmp-radio-group`、`cmp-modal-s` 误用于确认框，已处理。

### Missing Tag（未给基础控件打标签）

- 隐藏 `input[type=file]` ×2（`admin.js`）：不是 Input 组件，见 Unknown。
- 筛选条容器：已标 Radio group + review-required，缺合法 ID。

### Review Required

1. 登录口令：Figma 有 password，工程仍用 Input。
2. 所有 `textarea`：有组件无 Contract ID 语法；属性为「状态」「填充」，无尺寸。
3. 首页 `#filter-bar`：应为 `radio-button-group` 还是仅子级 radio-button。
4. `.service-capsule`：交互是分类 Radio，视觉是手风琴行，是否仍绑 `components/radio-button` 尺寸「大」。
5. `.talk-mail`：mailto/tel 链接，视觉像全圆角 Button，不要改成 `<button>`。
6. `.portrait`：Figma 有 Avatar 页，圆形肖像是否用 Avatar。
7. 删除确认：已绑 `modal-confirm`，是否还要「危险」信息属性。
8. Button「形状」工程未表达（页头/页脚胶囊 vs 长方形按钮）。
9. 管理页 `.panel` 是否对应未建设的 Card。
10. 作品详情 `.tag-row` 的 gray Tag 色是否要用 Tag / Color = Gray。
11. Select 页面「建设中」，管理分类下拉是否仍绑当前 select set。

### Unknown

- `#file-input`（封面/图片上传，hidden file）：Figma Upload「建设中」，无法绑定。

## Token 问题

### 已自动替换

见「已自动修复」。页面 CSS 无新增裸 HEX。

### Token Violations

无。颜色只出现在 `tokens.css` 的 Token 定义中。

### TOKEN_MAPPING_MISSING

这些值没有唯一基础 Token，**未改**，避免假装成 DS Token：

| 位置 | Raw | 原因 |
|---|---|---|
| `.display` / `.hero-name` | font-size 64 / 32 | 字阶最高正式样式为 24/CN-Medium |
| `.work-ghost` | 96 / 48 字号、letter-spacing 8 | 装饰水印，非文本样式 |
| `.portrait` | 240×240 | 非 Spacing/Size Token |
| `.feature-media` | 220 高 | 业务封面高度 |
| `.folio` | max-width 1120 | 非 1440/1280/1800 容器 Token |
| `@media (max-width: 800px)` | 800 | 断点 Token 从 1280 起 |
| `.ds-modal` | max-height 90vh | 无对应 Token |
| `.service-capsule` | min-height 72 | 无 72 控件高度 |
| letter-spacing 4 / 3 / 2 / -1 | 字距 | 不是 Spacing Token |
| `.talk-mail` min-width 120 | 120 | 无对应 Size |
| 作品封面 200 / 280 / 180 | 媒体框 | 业务插画尺寸 |

## New Component Candidates

| 候选 | 位置 | 用途 | 重复 | 建议 | 可复用基础件 |
|---|---|---|---|---|---|
| Folio Hero | 首页 / 关于 | 大姓名 + 头衔 + 圆肖像 | 2 页 | 作品集头图，不要拆成后台 Header | Avatar（待确认） |
| Work Band | 首页 `#works` | 灰底精选作品区 | 1 | 展示布局 | 无 Card 组件（未建设） |
| Feature Card | `.feature-card` | 作品封面+标题 | 作品数 | 作品卡 | Image 未建设 |
| Service Accordion | `.service-capsule` | 服务行 | 6 | 若不算 Radio，需新组件 | radio-button |
| Experience Row | `.experience-row` / `.timeline` | 经历列表 | 多条 | 时间线 | List 未建设 |
| Talk Footer | `.talk` | 深色 CTA | 3 页 | 页脚招揽 | Button + 语义色 |
| Admin Work Row | `.work-admin-item` | 作品管理行 | 每条作品 | 后台列表行 | Table 未建设 |
| Brand Mark | `.brand-mark` | 红方块标识 | 4 页 | 品牌，不是 DS | — |

## Designer Review List

- [ ] 作品集 1120 栅格是否保持，还是改成 Layout `design-width` 1440
- [ ] 64px 展示标题是否要新字阶，还是降到 24/CN
- [ ] 服务区绑 Radio-button 还是新 Accordion
- [ ] 筛选条容器绑 `radio-button-group`
- [ ] 口令框改 password 组件
- [ ] Textarea 的 Stable ID 语法（无 Size）
- [ ] 圆肖像是否用 Avatar
- [ ] 联系方式胶囊链接是否出 Button 全圆角实例
- [ ] Select / Modal「建设中」是否仍作为 Binding 源
- [ ] 是否更新三份 Contract 文件（本次未改）

## 页面 → Design System Component Mapping

### 首页 `/`

| 界面模块 | DS 组件 | Stable ID / 状态 |
|---|---|---|
| 分类筛选胶囊 | Radio / radio-button 尺寸中 | `cmp-radio-button-m` |
| 筛选条容器 | radio-button-group（待确认） | review-required |
| 服务行 | Radio / radio-button 尺寸大（待确认） | `cmp-radio-button-l` |
| 页脚邮箱胶囊 | 非 Button（链接） | 业务 |
| Hero / 作品灰区 / 卡片 | — | New component candidates |

### 关于 `/about.html`

无基础表单控件。联系方式为链接。经历为业务时间线。

### 作品详情 `/work.html`

| 界面模块 | DS 组件 | Stable ID |
|---|---|---|
| 标签 | Tag / Color = Gray | `cmp-tag-gray` |

### 管理 `/admin.html`

| 界面模块 | DS 组件 | Stable ID / 状态 |
|---|---|---|
| 主操作按钮 | Button 类型/尺寸 | `cmp-button-{variant}-{size}` |
| 文本输入 | input 尺寸中 | `cmp-input-default-m` |
| 口令 | Input（或 password） | review-required |
| 分类 | select | `cmp-select-default-m` |
| 表单项 | form-item 水平/垂直 | `cmp-form-item-{layout}` |
| 多行输入 | textarea | review-required，无 ID |
| 作品标签 | Tag | `cmp-tag-primary` / `cmp-tag-gray` |
| 站点信息 / 关于我 / 分享 | modal-l / modal-xl / modal-m | `cmp-modal-{l\|xl\|m}` |
| 删除确认 | modal-confirm | `cmp-modal-confirm` |
| 上传 file | Upload 建设中 | unknown |

## 进入 Figma Binding 前的建议

- 当前 Tag Coverage：83.7%
- 是否达到建议的 95%：否
- 必须先处理：筛选 group 与 textarea/password 的正式 ID；服务行是否 Radio；确认 Contract 色值与 Figma `#e6eaee` 对齐
- 可以后续处理：作品集展示布局、1120 栅格、展示字号、Avatar
- 最终建议：**暂缓进入正式 Figma Binding**

管理后台的 Button / Input / Select / Tag / Form / Modal 已可按实例绑定。公开作品集首页应作为独立展示页设计，不要为了 Coverage 把 Hero 和作品卡标成后台 Card。
