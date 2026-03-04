# 每日会话笔记 (2026-02-09)

## 摘要
今天 (Day 2) 深入攻克了 CSS 布局的核心——盒子模型 (Box Model)，并额外完成了块级/行内元素 (Block/Inline) 的进阶学习以及一个**加时赛实战 (Pricing Card)**。用户展现了极强的理解力，迅速掌握了 `border-box` 的概念，并能够独立从零构建布局。

## 知识点
- **盒子模型**：Content -> Padding (内边距) -> Border (边框) -> Margin (外边距)。
- **怪异盒模型**：`box-sizing: border-box` 让 `width` 包含 padding 和 border，解决了布局计算的痛点。
- **元素显示类型**：
    - `block` (独占一行，可设宽高)
    - `inline` (随内容流动，宽高/垂直 margin 无效)
    - `inline-block` (混血儿，既在一行又能设宽高)
- **文字对齐**：`text-align: center` 用于居中行内内容（文字、inline-block 元素）。
- **垂直对齐**：`vertical-align: top` 修复 inline-block 元素默认基线对齐导致的参差不齐。
- **列表样式**：`list-style: none` 去除圆点，`padding: 0` 去除默认缩进。

## 认知冲突点 / 纠错
- **标准盒模型计算**：用户通过手动计算 `100 + 20*2 + 5*2 = 150px` 深刻理解了默认盒模型的反直觉之处。
- **Margin Collapse**：通过观察发现垂直方向 margin 取最大值而非相加的现象。
- **Inline 元素宽高**：亲手实验证实了给 `span` 设宽高无效，必须转为 `inline-block`。
- **文本居中盲区**：在加时赛中遇到了 `<h2>` 居中的需求，通过实战补充了 `text-align` 知识点。

## 实战产出
- **实验代码**：`phase0_visuals/day02_box_model.html` (已进行破坏性重构验证), `phase0_visuals/day02_display.html`
- **项目更新**：`phase0_visuals/day02_resume.html` (应用了全局 Reset, 居中布局, 卡片样式)
- **加时赛**：`phase0_visuals/day02_pricing.html` (独立完成 90% 的产品定价卡布局，包含 inline-block 排列和样式美化)

## 教学反思
- **代码量控制**：为了保证 80% 实战时间，引入了“加时赛”和“破坏性重构”环节。这被证明是非常有效的巩固手段。

## 下一步
- **Day 3 (Phase 0)**: Flexbox 布局 (一维布局之王)。