# Day 30 学习笔记 - 递归反转链表

**日期**: 2026-02-09
**阶段**: 第二阶段 - 基础数据结构流利度
**主题**: 递归与栈帧
**题目**: LeetCode 206 反转链表（递归法）

---

## 知识点：递归与调用栈

### 递归的本质
- 把大问题分解为相同结构的小问题
- 每次递归调用创建一个**栈帧（Stack Frame）**
- 栈是**后进先出（LIFO）**

### 栈帧（Stack Frame）
每个栈帧保存：
- 当前函数的参数
- 局部变量
- 返回地址

```
调用栈可视化：
┌─────────────────┐
│ reverseList(4)  │ ← 栈顶，最先返回
├─────────────────┤
│ reverseList(3)  │
├─────────────────┤
│ reverseList(2)  │
├─────────────────┤
│ reverseList(1)  │ ← 栈底，最先入栈
└─────────────────┘
```

### 为什么传 `curr.next` 而不是 `curr`？
- `curr.next`：让递归前进到下一个节点
- `curr`：会无限递归，永远停留在同一个节点

---

## LeetCode 206：反转链表（递归法）

### 代码

```python
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        # base case：空链表或只有一个节点
        if not head or not head.next:
            return head

        # 递归反转后面的链表，获取新头节点
        new_head = self.reverseList(head.next)

        # 反转指针
        head.next.next = head  # 后一个节点指回当前节点
        head.next = None       # 断开当前节点向后的链接

        # 返回新头节点（一直是原来的最后一个节点）
        return new_head
```

### 执行流程示例

```
输入: 1 -> 2 -> 3 -> None

递归过程：
reverseList(1)
  └─ reverseList(2)
       └─ reverseList(3)
            └─ base case: return 3

返回过程：
reverseList(3) 返回 3
reverseList(2): 3.next=2, 2.next=None → None <- 2 <- 3
reverseList(1): 2.next=1, 1.next=None → None <- 1 <- 2 <- 3

返回 3（新头）
```

### 复杂度
- 时间：O(n)
- 空间：O(n) - 递归调用栈

---

## 迭代法 vs 递归法对比

| 特性 | 迭代法 | 递归法 |
|:-----|:-------|:-------|
| 时间复杂度 | O(n) | O(n) |
| 空间复杂度 | O(1) | O(n) |
| 栈溢出风险 | 无 | 长链表可能 |
| 代码行数 | ~6 行 | ~5 行 |
| 可读性 | 直观 | 简洁但需理解递归 |
| 推荐场景 | 生产环境 | 算法练习/展示 |

### Python 递归深度限制
- 默认约 1000：`sys.getrecursionlimit()`
- 超过会报：`RecursionError`

---

## 用户学习表现

**问答正确率**: 100%

正确理解的关键概念：
- ✓ base case 的作用（终止条件）
- ✓ 单节点链表的递归过程
- ✓ `curr.next` vs `curr` 的区别
- ✓ `curr.next.next = curr` 形成环，需要 `curr.next = None` 断开
- ✓ 栈帧的空间消耗
- ✓ 递归深度限制问题

**代码实现**: 一次通过，逻辑清晰

---

## 下次复习内容

- 递归反转链表手动推演
- 递归 vs 迭代的场景选择

---

## 下一步

Day 31: 虚拟头节点 - LeetCode 21 合并两个有序链表

---

## 复习记录 (2026-02-10)

**复习内容**: Day 30 递归反转链表

**问答验证结果**:
1. ✓ 递归的核心思想（自引用 + 终止条件）- 正确
2. ✓ 为什么传 `head.next` 而不是 `head` - 正确
3. ✓ 栈帧与空间复杂度 - 正确
4. ✓ `head.next.next = head` 的反转逻辑 - 正确
5. ✓ `head.next = None` 断开链接避免成环 - 正确

**额外知识点**:
- 生产环境推荐迭代法（O(1) 空间，无栈溢出风险）
- Python 递归深度限制约 1000，10000 节点会触发 RecursionError

**复习状态**: 知识点完全巩固 ✓

---
