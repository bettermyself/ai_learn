# Day 33 会话笔记 - 删除节点技巧

**日期**: 2026-02-12
**主题**: 双指针保持间距 + 虚拟头节点
**题目**: LeetCode 19 删除链表的倒数第 N 个结点

---

## 核心知识点讲解

### 双指针保持间距

**核心思路**：用一次遍历找到倒数第 N 个节点

1. **fast 先走 N 步**：让 fast 与 slow 拉开 N 的距离
2. **同步前进**：当 fast 到达最后一个节点时，slow 刚好在倒数第 N+1 的位置
3. **删除操作**：`slow.next = slow.next.next`

### 图示演示

链表：`1 → 2 → 3 → 4 → 5`，N = 2，删除节点 4

**Step 1：初始状态**
```
              dummy    1      2      3      4      5     None
                ↓      ↓      ↓      ↓      ↓      ↓
                ○ ──→ ○ ──→ ○ ──→ ○ ──→ ○ ──→ ○ ──→ ×
                ↑
            slow, fast
```

**Step 2：fast 先走 N = 2 步**
```
              dummy    1      2      3      4      5     None
                ↓      ↓      ↓      ↓      ↓      ↓
                ○ ──→ ○ ──→ ○ ──→ ○ ──→ ○ ──→ ○ ──→ ×
                ↑                    ↑
              slow                 fast
```

**Step 3：同步前进，直到 fast.next 为 None**
```
              dummy    1      2      3      4      5     None
                ↓      ↓      ↓      ↓      ↓      ↓
                ○ ──→ ○ ──→ ○ ──→ ○ ──→ ○ ──→ ○ ──→ ×
                               ↑                    ↑
                             slow                 fast
```

此时 slow 在节点 3，`slow.next` 就是节点 4（待删除节点）

### 为什么需要虚拟头节点？

当删除的是头节点时，没有前驱节点无法删除。

```
链表: 1 → 2 → 3，删除倒数第 3 个节点（即头节点 1）

没有 dummy：slow 直接指向 1，无法删除自己
有 dummy：slow 指向 dummy，执行 slow.next = slow.next.next，完美删除
```

### 终止条件

使用 `while fast.next` 而不是 `while fast`：
- fast 到达最后一个节点时停止
- 此时 slow 刚好在倒数第 N+1 的位置

---

## 知识点问答验证

### 问题1：为什么要让 fast 先走 N 步？
**回答**: fast 先走 N 步，这样当 fast 到最后一个节点时，slow 刚好在倒数 N+1 个节点，通过 `slow.next = slow.next.next` 便可实现删除目标。

### 问题2：fast 先走 N 步后，距离是多少？slow 最终位置？
**回答**: 距离是 N，slow 最终在倒数第 N+1 个节点。

### 问题3：为什么需要虚拟头节点？
**回答**: 处理边界情况，当需要删除的节点是 head 节点时，需要 dummy 节点，最终返回 dummy.next。

### 问题4：终止条件为什么是 `while fast.next`？
**回答**: 因为只要 fast 走到最后一个节点，slow 刚好在倒数 N+1，最后一个节点的判断是 `fast.next` 为 None。

---

## 题目练习

### LeetCode 19: 删除链表的倒数第 N 个结点

```python
class Solution:
    def removeNthFromEnd(self, head: Optional[ListNode], n: int) -> Optional[ListNode]:
        dummy = ListNode()
        dummy.next = head
        fast, slow = dummy, dummy

        # fast 先走 n 步
        for _ in range(n):
            fast = fast.next

        # 同步前进，直到 fast 到最后一个节点
        while fast.next:
            slow = slow.next
            fast = fast.next

        # 删除倒数第 n 个节点
        slow.next = slow.next.next

        return dummy.next
```

- **时间复杂度**: O(n) — 一次遍历
- **空间复杂度**: O(1) — 只用两个指针

---

## 复习内容（Day 32 复习）

### 快慢指针问题（6个问答全部正确）

1. **三个核心应用场景**：找中点、检测环、找环入口
2. **速度比 2:1**：fast 走的距离是 slow 的 2 倍
3. **7个/6个节点时 slow 位置**：第 4 个（奇数正中间，偶数偏右）
4. **终止条件**：`while fast and fast.next`
5. **有环一定相遇**：跑道追及原理
6. **偏左中点**：让 fast 先走一步

---

## 总结

今日掌握：
- ✅ 双指针保持间距技巧
- ✅ 一次性遍历找到倒数第 N 个节点
- ✅ 虚拟头节点处理删除头节点边界
- ✅ 终止条件 `while fast.next` 的理解

**核心模板**：
```python
dummy = ListNode()
dummy.next = head
fast, slow = dummy, dummy

# fast 先走 n 步
for _ in range(n):
    fast = fast.next

# 同步前进
while fast.next:
    slow = slow.next
    fast = fast.next

# 删除
slow.next = slow.next.next
return dummy.next
```

---

## 复习记录（2026-02-13）

### Day 33 复习：双指针保持间距 + LeetCode 19

**复习问答（4个问答全部正确）**：

**问题1**：链表 `1 → 2 → 3 → 4 → 5`，删除倒数第 2 个节点，fast 先走 2 步后位置？同步前进终止时 slow 位置？
- **回答**：fast 在节点 2，slow 在 dummy；同步前进终止时 slow 在节点 3
- **验证**：✅ 正确，slow 最终在节点 3，`slow.next` 就是待删除的节点 4

**问题2**：为什么用 `while fast.next` 而不是 `while fast`？
- **回答**：fast 到最后节点时就应停止，判断最后节点就是 `fast.next = None`
- **验证**：✅ 正确，用 `while fast` 会导致 slow 多走一步

**问题3**：只有 1 个节点 `[1]`，删除倒数第 1 个节点（头节点），没有虚拟头节点会怎样？
- **回答**：无法删除真正的头节点
- **验证**：✅ 正确，头节点没有前驱节点，无法通过 `prev.next = prev.next.next` 删除

**问题4**：时间复杂度和空间复杂度？
- **回答**：时间 O(n)，因为 fast 从头到结束一次遍历；空间 O(1)
- **验证**：✅ 正确

**复习结论**：Day 33 知识点完全巩固，开始 Day 34 学习
