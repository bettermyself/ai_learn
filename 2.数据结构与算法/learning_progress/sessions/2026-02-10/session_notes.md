# Day 31 学习笔记 - 虚拟头节点

**日期**: 2026-02-10
**阶段**: 第二阶段 - 基础数据结构流利度
**主题**: 虚拟头节点（Dummy Node）
**题目**: LeetCode 21 合并两个有序链表

---

## 知识点：虚拟头节点（Dummy Node）

### 什么是虚拟头节点？

虚拟头节点是一个人为创建的"假"节点，它的 `next` 指针指向真正的链表头节点。

```
没有虚拟头节点：           有虚拟头节点：
head -> 1 -> 2 -> 3        dummy -> 1 -> 2 -> 3
                              ↑
                           从这里开始操作
```

### 为什么需要虚拟头节点？

**核心问题**：链表操作中，**头节点经常需要特殊处理**。

虚拟头节点的优势：
| 优势 | 说明 |
|:-----|:-----|
| 统一代码逻辑 | 不需要单独处理头节点为空或头节点改变的情况 |
| 减少边界判断 | 避免大量 `if head is None` 检查 |
| 代码更简洁 | 省去头节点特殊分支 |
| 减少bug | 头节点处理是链表题的常见bug来源 |

### head 是指针，不是节点

```
head  是一个指针/引用
   ↓
节点1 (val=1, next→节点2)
```

- `head` 是一个**指针变量**，存储节点1的地址
- 节点1 是实际的**对象**，包含 `val` 和 `next`

---

## LeetCode 21：合并两个有序链表

### 题目描述

将两个**升序**链表合并为一个新的**升序**链表并返回。

```
示例：
输入：list1 = [1,2,4], list2 = [1,3,4]
输出：[1,1,2,3,4,4]
```

### 代码实现

```python
class Solution:
    def mergeTwoLists(self, list1: Optional[ListNode], list2: Optional[ListNode]) -> Optional[ListNode]:
        dummy = ListNode()      # 虚拟头节点
        curr = dummy

        while list1 and list2:
            if list1.val <= list2.val:
                curr.next = list1
                list1 = list1.next
            else:
                curr.next = list2
                list2 = list2.next
            curr = curr.next

        curr.next = list1 if list1 else list2  # 挂接剩余部分
        return dummy.next
```

### 复杂度

| 复杂度 | 值 | 说明 |
|:-------|:---|:-----|
| 时间 | O(m + n) | m、n 分别是两链表长度 |
| 空间 | O(1) | 只用了 dummy 和 curr 两个指针 |

---

## 知识点确认问题

| 问题 | 答案 |
|:-----|:-----|
| 1. 虚拟头节点的 `val` 值重要吗？ | 不重要，因为返回的是 `dummy.next` |
| 2. 为什么 `return dummy.next`？ | dummy 是虚拟节点，dummy.next 才是真正的头节点 |
| 3. 无虚拟头节点时特殊判断什么？ | 空链表情况 + 谁的值更小作为头节点 |
| 4. `curr = dummy` 的好处？ | 可以直接开始循环挂接节点，统一处理 |

---

## 用户学习表现

**问答正确率**: 100%

正确理解的关键概念：
- ✓ 虚拟头节点 `val` 值不重要
- ✓ `return dummy.next` 返回真正头节点
- ✓ 无虚拟头节点需要检查空链表和确定头节点
- ✓ `curr = dummy` 可直接开始循环挂接

**代码实现**: 一次通过，逻辑清晰

---

## 下一步

Day 32: 快慢指针 - LeetCode 876 链表的中间结点 + 141 环形链表

---

## 复习记录 (待下次)

- 虚拟头节点 vs 无虚拟头节点的代码对比
- 剩余部分挂接技巧 `curr.next = list1 if list1 else list2`

---
