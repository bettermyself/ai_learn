# 每日会话笔记 (2026-02-12)

## 摘要
Day 5 是 **Phase 0 (视觉基础周)** 的收官之战。用户从零开始，综合运用 Flexbox、Positioning 和 Box Model，像素级还原了 ChatGPT 的静态界面。
重点掌握了 **CSS 变量 (`:root`)** 的使用，理解了其类似 Python 全局常量的工程化价值。
在布局攻坚中，用户成功实现了 **Sticky Footer** (输入框固定底部) 模式，并学会了使用 **多类名组合** (`.message.user-message`) 来管理组件样式。

## 知识点
- **CSS 变量**: `:root { --bg-color: #000; }` 与 `var(--bg-color)`。
- **Flexbox 综合**:
    - `.app-container` (Row) vs `.sidebar` (Column)。
    - `flex: 1` 用于自动填充剩余空间（历史记录区、聊天记录区）。
- **组件化思维**: 提取公共类 `.message` 和修饰类 `.ai-message`。
- **伪类交互**: `:hover` 实现按钮和列表项的悬停效果。
- **DOM 结构对布局的影响**: 兄弟元素 vs 父子元素在 Flex 容器中的行为差异。

## 问答表现
- **整体评分**: 9/10
- **表现良好**:
    - 快速领悟 CSS 变量的“配置化”思维。
    - Flexbox 方向控制 (`flex-direction`) 准确无误。
    - 能独立完成复杂的 HTML 结构搭建。
- **认知冲突点**:
    - **DOM 嵌套**: 误将固定底部的输入框放入了可滚动的聊天记录容器内部，导致输入框随消息滚动。
    - **HTML 属性**: 混淆了 `<input>` 的 `type` (text) 和 `placeholder` (提示语)。

## 实战产出
- **最终作品**: `phase0_visuals/day05_chatgpt.html` (高度还原的静态页面)。

## 复习内容 (2026-02-13 Day 6 开始前复习)

### 唤醒问答
1.  **DOM 结构判断**: 如果我有两个 div，A 是“页面主体”，B 是“回到顶部按钮”。B 应该在 A 里面，还是和 A 并排？（假设 A 会滚动）
2.  **CSS 变量**: 在 `:root` 里定义了 `--main-color: blue;`，在 `.box` 里怎么引用它作为背景色？
3.  **HTML 纠错**: `<input type="请输入密码">` 哪里错了？

### 肌肉记忆重写验证
**任务**: 仅仅重写 ChatGPT 布局中 **右侧主区域** 的核心 HTML 结构。
**要求**:
1.  包含 `.main` (Flex Column)。
2.  包含 `.chat-area` (Flex 1, 兄弟元素 1)。
3.  包含 `.input-area` (固定高度, 兄弟元素 2)。
4.  **重点**: 确保兄弟关系正确，不要嵌套错误。
