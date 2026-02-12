# Day 32 会话笔记 - 快慢指针应用

**日期**: 2026-02-11
**主题**: 快慢指针（Floyd's Cycle-Finding Algorithm）
**题目**: LeetCode 876 链表的中间结点 + LeetCode 141 环形链表

---

## 核心知识点讲解

### 快慢指针定义
- **慢指针（slow）**：每次移动 1 步
- **快指针（fast）**：每次移动 2 步
- **速度比**: 2:1

### 快慢指针应用场景
1. **找中点**：当 fast 到达末尾时，slow 刚好在中间
2. **检测环**：如果有环，fast 最终会追上 slow
3. **找环入口**：相遇后，一个从头、一个从相遇点同速走，再次相遇即入口

---

## 知识点问答验证

### 问题1：为什么快指针每次走 2 步？
**回答**: 只有速度比为 2:1 才能保证找中点时 slow 刚好在中间；通过数学推导，2倍速度能保证找环时一定相遇。

### 问题2：7个节点无环链表，fast 到末尾时 slow 在哪？
**回答**: 第 4 个节点（正中间）

### 问题3：有环时为什么一定相遇？
**回答**: 跑道追及问题，快指针速度是慢指针 2 倍，时间足够长一定追上

### 问题4：终止条件怎么写？奇偶长度有何区别？
**回答**: `while fast and fast.next`
- 奇数长度：fast 到最后一个节点，`fast.next is None`
- 偶数长度：fast 超出末尾变成 `None`

### 问题5：如何找偏左的中点？
**回答**: fast 先走 1 步，slow 再开始

---

## 题目练习

### LeetCode 876: 链表的中间结点
```python
class Solution:
    def middleNode(self, head: Optional[ListNode]) -> Optional[ListNode]:
        fast, slow = head, head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
        return slow
```
- **时间复杂度**: O(n)
- **空间复杂度**: O(1)
- **注意**: 偶数个节点时返回偏右的中点

### LeetCode 141: 环形链表
```python
class Solution:
    def hasCycle(self, head: Optional[ListNode]) -> bool:
        slow, fast = head, head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next
            if slow == fast:
                return True
        return False
```
- **时间复杂度**: O(n)
- **空间复杂度**: O(1)
- **关键**: 相遇即有环，fast 到 None 则无环

---

## 复习内容（Day 31 复习）

### 虚拟头节点问题
1. **为什么需要虚拟头节点**？简化头部处理逻辑，避免对 head 单独判断
2. **如何使用**？创建 dummy = ListNode(0, head)，最后返回 dummy.next
3. **剩余链表如何挂接**？循环结束后直接把剩余部分挂到当前节点后面

---

## 总结

快慢指针模板：
```python
slow, fast = head, head
while fast and fast.next:
    slow = slow.next
    fast = fast.next.next
    # 判断逻辑...
```

今日掌握：
- ✅ 快慢找中点（LeetCode 876）
- ✅ 快慢判环（LeetCode 141）
- ✅ 理解速度比 2:1 的原因
- ✅ 理解终止条件的两种情况
- ✅ 掌握找偏左中点的技巧

---

## 复习记录（2026-02-12）

### 复习问答验证（6个问题全部正确）

**问题1**：快慢指针的三个核心应用场景？
- ✅ 找中点（fast 到末尾时 slow 在中间）
- ✅ 检测环（相遇即有环）
- ✅ 找环入口（相遇后同速走再次相遇）

**问题2**：速度比为什么是 2:1？
- ✅ 快指针走的距离是慢指针的 2 倍，所以 slow 刚好在中间

**问题3**：7个/6个节点时 slow 的位置？
- ✅ 7个节点：第 4 个（正中间）
- ✅ 6个节点：第 4 个（偏右）

**问题4**：终止条件为什么是 `fast and fast.next`？
- ✅ 奇数长度：fast 停在最后节点，`fast.next` 为 None
- ✅ 偶数长度：fast 跳出链表变成 None

**问题5**：有环为什么一定相遇？
- ✅ 跑道追及原理，快指针相对慢指针以每步 1 节点的速度追近

**问题6**：如何返回偏左的中点？
- ✅ 让 fast 先走一步，再开始快慢指针移动

### 复习结论
知识点完全巩固，6/6 问题回答正确。
