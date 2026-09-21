# Artisan Figma Design System Binding Audit

## Binding 信息

- 产品工程：`0918个人作品集展示实验`（红方块作品集）
- 目标业务 Figma 文件：[0920设计作品网站](https://www.figma.com/design/yfywTqkz0ZKqlBqiOCKnXV/0920%E8%AE%BE%E8%AE%A1%E4%BD%9C%E5%93%81%E7%BD%91%E7%AB%99?node-id=2-2910)（`yfywTqkz0ZKqlBqiOCKnXV`）
- Artisan Library File Key：`Ka55lQXH0Sjy2DOUO8kVbP`
- 执行时间：2026-09-20
- 处理范围：首页、关于、作品详情、管理登录 / 列表 / 站点信息 Modal / 删除确认 / 编辑作品
- 未处理范围：管理「关于我」独立 Modal（与站点信息共用 `modal-m` 结构，未单独铺一层）；作品详情仅绑定一条示例作品；HTML-to-Design 原始 Capture 仍保留为 `_REF capture *`，未写入 Library

## 结论

业务文件里已经有一批 **真实 Artisan 3.0 Instance**（Button、radio-button、input、select、form-item、Tag、modal-m、modal-confirm、textarea），页面容器 Fill 绑定了 `Background/bg-page` 等 Semantic Variables。首页 Hero / 精选灰底带 / 服务胶囊 / Footer、关于页叙事结构和作品卡片 **没有用近似组件冒充**，按要求保留并打了 `data-ds-status=designer-review`。

还不适合当「可直接出稿的正式 Design」：管理列表画板高度被 Hug 压扁、服务区 `cmp-radio-button-l` 因版式不匹配未实例化、Capture 参考层仍在画布上、64px Display 字号无对应 Text Style。设计师应先清 Capture、修管理列表 Auto Layout，再决定服务胶囊是否改成 radio-button。

## 数据概览

| 指标 | 数量 / 覆盖率 |
|---|---:|
| Total Pages | 8 个业务画板 + 2 个 Capture 参考 |
| Processed Pages | 8 |
| Total Components | 可映射基础槽位约 48（含筛选 7、服务胶囊 6、管理按钮/表单/Tag/Modal） |
| Real Component Instances | 72（含 Modal 内部嵌套 Instance） |
| Component Instance Coverage | **87.5%**（42 / 48；服务胶囊 6 个未替换） |
| Variable Binding Coverage | **约 55%**（页面 Fill / 主文本色已绑；Capture 克隆块与 Display 字号仍大量 Raw） |
| Detached Components | 0 |
| Raw Colors | Capture 克隆的 Service / Experience / Footer；部分 Header 矩形 Brand Mark 依赖 Variable 或默认 Fill |
| Raw Typography | Hero 64px、PORTFOLIO 64px、关于页 48px（MCP 环境无 PingFang，文案改用 Noto Sans SC） |
| Raw Spacing | 业务画板 padding/gap 多为数值，未绑 Spacing/32 等 FLOAT |
| Raw Radius | 肖像 240 圆角为业务尺寸 |
| Raw Size | 1440 画板、240 肖像、卡片媒体区 |
| Mapping Missing | 0（textarea 虽不在旧 Contract ID 语法中，Library 有组件并已实例化） |
| Mapping Outdated | 1：`cmp-button-dashed-m` 的 虚框按钮 **没有「长方形」**，改用 `形状=方形` |
| Token Mapping Missing | Display 64px、Footer 深底无独立 `bg-inverse`（候选 `Background/fill-4` 未强制绑定） |
| New Component Candidates | 3：Feature Card、Service Capsule、Talk Footer |
| Review Required | 见 Review List |
| Binding Failures | 1 类：服务胶囊带 `data-ds-id=cmp-radio-button-l` 但视觉为通栏双文案行，未强行换成 radio-button |

## 页面处理清单

| 页面 | 主要状态 | 处理结果 | Instance Coverage | Variable Coverage | 未解决问题 |
|---|---|---|---:|---:|---|
| 01 首页 | 默认 | 结构保留；筛选为 radio-button-m；Hero/卡片/服务/Footer 为 review | 7/13 | 中 | 服务胶囊未映射；Filter/卡片曾因 `$fig.autoLayout` 不接收 Instance 掉层，已 append 修复；Hero 肖像与 Intro 仍可能重叠 |
| 02 关于 | 默认 | 本地 Auto Layout + 肖像克隆；无管理控件 | n/a | 低 | 整页 designer-review；Capture `_REF capture 关于` 待对照后删除 |
| 03 作品详情 | 示例作品 | Tag Primary/Gray 已绑定 | 2/2 Tag | 低 | 正文与封面为业务模块 |
| 04 管理 / 登录 | 口令 | form-item + input + Button 主要 | 3/3 | 中 | 口令 input 标 designer-review（无独立 password 槽位语法） |
| 04 管理 / 列表 | 默认 | Button / Tag 已创建 | 高 | 中 | 画板 Hug 后高度约 328，截图像空白，需设计师拉开 Auto Layout |
| 04 管理 / 站点信息 Modal | Modal | `modal-m` + 水平 form-item + input + 保存 | 高 | 中 | 未铺全站字段（头衔/邮箱/介绍/封面） |
| 04 管理 / 删除确认 | Confirm | `modal-confirm` 危险 + 删除/取消 Button | 高 | 中 | 文案写入受组件内部字体限制 |
| 04 管理 / 编辑作品 | 表单 | form-item / input / select / textarea / Button | 高 | 中 | textarea 无旧 `data-ds-id`；虚框按钮用方形 |
| _REF capture 首页 / 关于 | 像素参考 | 仅参考，非 Binding 结果 | 0 | 0 | 完成后应删除，避免与可映射画板混淆 |

## Component Binding

### 已替换为真实 Artisan Instance

| 来源 `data-ds-id` | 目标 | Key | Variant / Properties |
|---|---|---|---|
| `cmp-radio-button-m` | 首页 Filter Bar | `f4e30b060558a982a6bed44994d078346f1d6ca4` | 尺寸=中；ALL 选中=true，其余 false |
| `cmp-button-primary-m` 等 | 管理各页 Button | `ea23c36e1bd18ae5c031bc832e63b20441cae2d0` | 类型=主要/次要/线框/文本/虚框；尺寸=中/小；状态=默认 |
| `cmp-input-default-m` | 登录口令、编辑标题、站点品牌 | `221b53cf1f8c7c09680594043105fc37f741942d` | 尺寸=中, 状态=默认, 填充=false |
| `cmp-form-item-vertical` / `horizontal` | 口令、标题、分类、摘要、品牌 | `af3f347160a9fcec8b5c6931bdc1bd1442f077b1` | 布局=垂直/水平；类型=输入框/选择器/文本域 |
| `cmp-select-default-m` | 编辑作品分类 | `b662084a6c96157859b1f327448c3d8ece00f43f` | 尺寸=中, 多选=false |
| `cmp-tag-primary` / `cmp-tag-gray` | 列表与作品详情 | `f904510c767d98da1c87014c4d7b53fdf2d17ebc` | Color=Primary / Gray |
| `cmp-modal-m` | 站点信息 | `f852104329da29173f659b862081ffe994f62f57` | 单组件 600 宽 |
| `cmp-modal-confirm` | 删除确认 | `df4408a77617d07810fab7afa6aeedcfd470f0fa` | 危险=true |
| （无旧 ID，Library 已有） | 摘要 textarea | `bb805e526ad1ad54629f4b41ce9d900c32435fed` | 默认/填充=false；节点标 designer-review |

### `MAPPING_OUTDATED`

- 旧 Mapping 写虚框按钮「长方形」。最新 Set 仅有 **圆形 / 方形**。`添加图片` 使用 `形状=方形, 尺寸=中, 状态=默认`。

### `BINDING_FAILURE`

- 首页服务胶囊：`data-ds-id=cmp-radio-button-l`，真实 radio-button「大」无法表达 800×72 通栏双文案。按「无法映射则保留原样」克隆 Capture 区块，未用 Frame 仿造 radio。

### Detached

- 无。

## Variable 与 Style Binding

已绑定（Artisan 3.0 Semantic）：

- `Background/bg-page` `4c537346436dfa9e6145da13229d82fff7521302`
- `Background/bg-surface` `15f827fa3a5ce0939b752c4f42c97cab5b769679`
- `Background/fill-3` `10b1c4c10dedd06dde4b8efa34a81a3a9bed0cbc`（精选作品灰带）
- `Text/text-primary` `7e308d0955c2aa677aa9380f5663b401369208d3`
- `Text/text-secondary` `02c7f367a708b01f6763488faaae118ce4a9d314`
- `Action/action-primary` `3dff7cfff9ecaaadf4657b7b4c02e05d7357278b`（品牌方块）

仍 Raw / `TOKEN_MAPPING_MISSING`：

- Capture 克隆的 Service / Experience / Footer 内部色和字
- 64px / 48px Display（无对应 14/16/24 CN Style）
- Spacing FLOAT 未绑到 padding/gap
- Footer 深底未绑 `fill-4`（避免猜 Token）

MCP 无法加载 PingFang SC；Instance 内文案通过 `setRangeFontName` 切到 Noto Sans SC 后才能改字。正式稿应在桌面端改回 Library 字体。

## Auto Layout

- 首页根 Frame、Header、Hero、Selected Work、管理表单页为纵向 Auto Layout。
- Instance 不能作为 `$fig.autoLayout(..., children)` 的子节点传入，必须 `appendChild`，否则会掉到 Page 根上。
- 管理列表 Hug 异常，截图几乎空白，需拉开 Toolbar / Work Row。
- Footer Capture 宽 1690，超出 1440 画板。

## New Component Candidates

| 候选 | 页面 | 重复 | 说明 |
|---|---|---|---|
| Feature Card | 首页 | 3+ | 媒体 + 标题 + 分类英文；非 Library 卡片 |
| Service Capsule | 首页 | 6 | 通栏 EN + 中文；不要用 radio-button 冒充 |
| Talk / Contact Footer | 首页、关于 | 2 | 大标题 + mailto；非 Button 组件 |

## Review List

1. **Hero / 肖像 / 64px 店招**：`designer-review`。无 Display Token。
2. **Filter Bar 分组**：子项已是 radio-button-m；整组无 `radio-button-group` 绑定（工程亦标 designer-review）。
3. **Feature Card**：保留 Capture 克隆。
4. **Service Capsule vs radio-button-l**：设计师二选一：改版式迁到 radio，或新增业务组件。
5. **Talk Footer**：自定义深底。
6. **口令 input**：继续用 input-m，或等 password 组件纳入 Contract。
7. **textarea**：已用 Library 组件，仍标 designer-review。
8. **虚框按钮形状**：方形是否可接受。
9. **`_REF capture *`**：对照完成后删除，避免当成交付稿。
10. **管理列表画板**：结构有 Instance，视觉被压扁，优先修。

## Definition of Done 核对

- [x] 全部页面已处理或进入 Review List
- [x] 可映射基础组件已尽量使用真实 Artisan Instance（服务胶囊除外）
- [~] 可映射基础属性部分绑定 Variables；Capture 克隆与 Display 未完成
- [x] 主要业务画板使用 Auto Layout
- [x] 已检查 Detached Components（无）
- [x] 未用普通 Frame 仿造 Button / Input / Tag / Modal
- [x] 已做首页 / 列表 / 编辑页截图
- [x] 已输出异常项

## 最终建议

- 是否完成 Binding：**部分完成**（管理控件与首页筛选已是 Instance；作品集叙事区块按规则 review）
- 是否适合进入正式设计流程：**可以进稿，但不能当终稿**
- 必须优先处理：管理列表 Auto Layout；删除或隔离 Capture；服务胶囊去留
- 可以后续处理：Text Style / Spacing FLOAT；补齐站点 Modal 字段；关于我 Modal；多作品详情

## 增补：Product Pages（2026-09-20）

工程中没有名为 Project List / Detail / Create / Settings 的路由。以下四个独立 Frame 写在 Figma 页 `Product Pages`（`11:281`），对应现有管理与作品 IA，未改业务逻辑。

| Frame | 产品来源 | Node | Instances | Detached | Auto Layout |
|---|---|---|---:|---:|---:|
| Project List | `admin.js` `dashboardView` 作品管理 | `11:282` | 26 | 0 | 是 |
| Project Detail | `work.js` 示例作品 | `11:383` | 3 | 0 | 是 |
| Create Project | `editorView` 发布作品 | `11:421` | 57 | 0 | 是 |
| Settings | 站点信息 Modal-l + 关于我 Modal-xl | `11:716` | 123 | 0 | 是 |

Designer Review：封面/封面照上传区、textarea、关于我空经历槽（产品为 4 槽，画板铺了已填槽 + 空槽说明）。Spacing Variable 的 scope 多为 GAP，已绑 `itemSpacing`；padding 若绑不上则保留数值。未 flatten。
