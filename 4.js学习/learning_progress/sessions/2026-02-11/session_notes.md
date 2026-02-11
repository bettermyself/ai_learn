# 每日会话笔记 (2026-02-11)

## 摘要
Day 4 深入攻克了 **CSS Positioning (定位)**，这是继 Flexbox 之后的第二大布局支柱。用户通过“被困住的幽灵”实验深刻理解了 **"子绝父相"** (Absolute 寻找最近非 static 祖先) 的原理，并掌握了利用 `transform: translate` 实现完美居中的技巧。
在进阶实战中，用户成功区分了 `fixed` (相对于视口) 与 `absolute` 的差异，并初步接触了 `z-index` 层级管理。
最终的大挑战中，用户**自主**选择并实现了一种更现代、更健壮的 **Flexbox Sticky Footer** 方案 (利用 `flex-direction: column` + `flex: 1` 挤压底部)，而非传统的 `position: fixed` 方案，这显示出用户对 Flexbox 的理解已达到灵活应用的程度。

## 知识点
- **定位体系**：
    - `static`: 默认，文档流。
    - `relative`: 占位不变，作为绝对定位的参考点（父相）。
    - `absolute`: 脱离文档流，寻找最近定位祖先（子绝）。
    - `fixed`: 脱离文档流，相对于视口 (Viewport)。
- **居中技巧**：`top: 50%; left: 50%; transform: translate(-50%, -50%)`。
- **层级控制**：`z-index` 仅对非 static 元素有效；DOM 顺序也会影响默认层级。
- **Flexbox 进阶**：垂直 Flex 容器中，`flex: 1` 占据垂直剩余空间，可用于“顶”住底部元素。

## 问答表现
- **整体评分**: 9/10
- **表现良好**:
    - 迅速理解 `relative` (占位) 与 `absolute` (脱离) 的本质区别。
    - 对 Flexbox 的 `flex-direction: column` 和 `flex: 1` 的组合应用非常熟练，能举一反三。
- **认知冲突点**:
    - **居中偏差**: 最初认为 `top: 50%; left: 50%` 即居中，通过实验发现是左上角对齐中心，随后掌握了 `transform` 修正法。
    - **遮罩层级**: 发现后写的元素默认覆盖前面的，通过显式设置 `z-index` 解决了问题。

## 实战产出
- **实验代码**: `day04_position.html` (子绝父相、Fixed 回到顶部、Overlay)。
- **综合案例**: `day04_layout_challenge.html` (仿 ChatGPT 布局，成功运用 Flex Column 实现 Sticky Footer)。

## 复习内容 (2026-02-12 Day 5 开始前复习)

### 唤醒问答
1.  **场景判断**：我想做一个“新消息”的红色小红点，悬浮在用户头像的右上角。你会给头像容器和红点分别设置什么 `position` 属性？
2.  **代码纠错**：
    ```css
    .modal-mask { position: fixed; z-index: 1000; }
    .modal-content { position: static; z-index: 2000; }
    ```
    **问题**：为什么 `.modal-content` 的 `z-index: 2000` 没有生效？
3.  **Flex 回顾**：在 ChatGPT 布局中，如果把父容器 `.main` 的 `height: 100vh` 删掉，`.chat-area` 的 `flex: 1` 还有效吗？

### 肌肉记忆重写验证
**任务**: 创建一个全屏遮罩层 (`overlay`)，中间有一个 **绝对居中** 的 300x200 白色弹窗 (`modal`)。
**要求**:
1. 遮罩层 `fixed` 铺满全屏，半透明黑。
2. 弹窗使用 `absolute` + `transform` 居中。
