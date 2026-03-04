# Day 36 会话笔记 - 栈的基本应用

**日期**: 2026-03-03
**主题**: 栈（Stack）基础与括号匹配
**题目**: LeetCode 20 有效的括号

---

## 核心知识点讲解

### 栈的核心概念

**栈**是一种**后进先出**（LIFO: Last In, First Out）的线性数据结构。

**生活中的例子**：
- 一叠盘子：最后放上去的盘子，最先被拿走
- 浏览器后退按钮：最后访问的页面，最先被退回
- 撤销操作（Ctrl+Z）：最后的操作，最先被撤销

### 栈的两个核心操作

| 操作 | 描述 | Python 实现 |
|:---:|:---|:---|
| **push** | 将元素压入栈顶 | `stack.append(item)` |
| **pop** | 弹出栈顶元素 | `stack.pop()` |

### 栈的本质

栈就是对数组/链表加了"操作限制"，只允许在末尾（栈顶）操作。

### Python 中栈的实现

```python
stack = []

# 入栈
stack.append(1)    # [1]
stack.append(2)    # [1, 2]

# 出栈
top = stack.pop()  # 返回 2

# 查看栈顶（不弹出）
peek = stack[-1]   # 返回 1

# 判空
is_empty = len(stack) == 0
```

---

## 知识点问答验证

### 问题1：栈的"LIFO"是什么意思？
**回答**: last in first out，后进先出，例子有叠盘子、浏览器后退等。
✅ 正确

### 问题2：栈的两个核心操作是什么？
**回答**: push、pop，Python 中用 append、pop 实现。
✅ 正确

### 问题3：为什么说"栈是对数组加了操作限制"？
**回答**: 栈只能操作栈顶元素，数组可以操作所有元素。
✅ 正确

### 问题4：函数递归调用和栈有什么关系？
**回答**: 递归调用在内层建立栈帧，也是后进先出。
✅ 正确

---

## 题目练习

### LeetCode 20: 有效的括号

**题目描述**：判断括号字符串是否有效（成对且顺序正确）

### 算法思路

| 情况 | 处理 |
|:---|:---|
| 遇到左括号 | 入栈 |
| 遇到右括号 + 栈为空 | ❌ 无效 |
| 遇到右括号 + 栈顶不匹配 | ❌ 无效 |
| 遇到右括号 + 栈顶匹配 | ✅ 出栈 |
| 遍历结束 + 栈不为空 | ❌ 无效 |
| 遍历结束 + 栈为空 | ✅ 有效 |

### 题目问答验证

**问题1**：`([)]` 为什么无效？
**回答**: 不满足正确顺序，`([` 后面应该先接 `]` 而不是 `)`。
✅ 正确

**问题2**：遇到左括号和右括号分别做什么？
**回答**: 左括号 push 入栈，右括号 pop 对应的左括号。
✅ 正确

**问题3**：遇到右括号时检查什么？
**回答**: 检查栈顶是否为对应的左括号。
✅ 正确

**问题4**：字符串 `"])"` 怎么处理？
**回答**: 栈为空时遇到右括号，直接无效。
✅ 正确

**问题5**：字符串 `"((("` 遍历结束后？
**回答**: 栈不为空，字符串无效。有效前提是所有左括号均已出栈。
✅ 正确

### 学生代码

```python
class Solution:
    def isValid(self, s: str) -> bool:
        s_list = []
        for ch in s:
            if ch in "({[":
                s_list.append(ch)
                continue
            if ch in ")}]" and len(s_list):
                if ch == ")" and s_list[-1] == "(":
                    s_list.pop()
                elif ch == "}" and s_list[-1] == "{":
                    s_list.pop()
                elif ch == "]" and s_list[-1] == "[":
                    s_list.pop()
                else:
                    return False
            elif ch in ")}]" and len(s_list)==0:
                return False

        if len(s_list):
            return False
        else:
            return True
```

### 优化版本

```python
class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {')': '(', ']': '[', '}': '{'}

        for ch in s:
            if ch in mapping.values():  # 左括号
                stack.append(ch)
            elif ch in mapping:  # 右括号
                if not stack or stack[-1] != mapping[ch]:
                    return False
                stack.pop()

        return not stack
```

**优化点**：
1. 字典 `mapping` 统一处理匹配逻辑
2. `if not stack` 同时处理栈空情况
3. `return not stack` 简洁判断最终状态

**为什么字典 key 是右括号？**
- 遇到右括号时需要查询"应该匹配哪个左括号"
- 所以右括号作为 key，左括号作为 value

### 复杂度分析

- **时间复杂度**: O(n) — 遍历一次字符串
- **空间复杂度**: O(n) — 最坏情况全是左括号

---

## Code Review 总结

| 方面 | 评价 |
|:---|:---|
| **正确性** | ✅ 完全正确 |
| **边界处理** | ✅ 栈空/栈不为空都处理了 |
| **代码风格** | ✅ 逻辑清晰，可用字典优化 |
| **复杂度** | ✅ O(n) 时间, O(n) 空间 |

---

## 总结

今日掌握：
- ✅ 栈的核心概念（LIFO）
- ✅ 栈的两个操作（push/pop）
- ✅ Python 用列表模拟栈
- ✅ 栈与递归调用栈的关系
- ✅ LeetCode 20 有效的括号

**第6周栈与队列学习开始！**

---

## 里程碑

- 2026-03-03: 完成 Day 36 学习，掌握栈基础与括号匹配算法

---

## 复习记录

### 2026-03-04 复习

**复习内容**: 栈基础 + LeetCode 20 有效的括号

**问答验证**（8/8 正确）：
1. ✅ LIFO 概念 + 生活例子
2. ✅ 栈 vs 数组操作限制
3. ✅ Python append/pop 实现
4. ✅ 递归栈帧与 Python 限制
5. ✅ `([)]` 手动模拟
6. ✅ 右括号检查条件
7. ✅ 字典 key 为右括号的原因
8. ✅ `return not stack` 最终判断

**结论**: 知识点完全巩固
