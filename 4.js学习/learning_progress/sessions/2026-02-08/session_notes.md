# 每日会话笔记 (2026-02-08)

## 摘要
启动了 **Phase 0: 视觉基础周**，重点攻克 HTML 骨架与标签语义化。建立了 Python 与 HTML 的认知映射（字典/树结构）。

## 知识点
- **HTML 结构**：理解 DOM 树（Parent, Child, Sibling）。
- **语义化标签**：`header`, `main`, `section`, `footer` vs `div`。
- **表单交互**：`form`, `input`, `button`, `label` 的配合使用。
- **行内 vs 块级**：观察到了 `input` 不换行而 `div` 换行的现象。
- **环境配置**：VS Code + Live Server 插件的使用。

## 认知冲突点 / 纠错
- **Python 习惯迁移错误**：用户在写 HTML 属性时使用了逗号分隔 (`<input type="email", ...>`)，这是 Python 函数传参的习惯。
- **修正**：HTML 属性之间使用空格分隔。

## 实战产出
- **文件**：`4.js学习/phase0_visuals/day01_skeleton.html`
- **内容**：用户完全独立重写了 HTML 代码，结构包含 Header, Section*5, Footer。
- **评价**：成功克服了逗号分隔属性的习惯，标签嵌套准确，学会了 Label 绑定。

## 下一步
- **Day 2 (Phase 0)**: CSS 盒子模型 (Margin/Padding/Border)。
