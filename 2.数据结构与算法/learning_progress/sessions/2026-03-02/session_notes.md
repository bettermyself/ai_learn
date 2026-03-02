# Day 34 会话笔记 - 链表综合

**日期**: 2026-03-02
**主题**: 链表综合题 - 三技巧组合
**题目**: LeetCode 143 重排链表

---

## 核心知识点讲解

### 重排链表的三步走策略

这道题是**里程碑式**的综合题，将之前学过的三个链表技巧组合起来：

| 步骤 | 技巧 | 学习来源 |
|:---:|:---|:---|
| 1 | 快慢指针找中点 | Day 32 (LeetCode 876) |
| 2 | 反转链表 | Day 29/30 (LeetCode 206) |
| 3 | 交替合并 | Day 31 (LeetCode 21 变体) |

### 整体思路

```
原链表: 1 → 2 → 3 → 4 → 5
         ↓
第一步: 找中点，分成两半
         ↓
前半: 1 → 2 → 3    后半: 4 → 5
         ↓
第二步: 后半部分反转
         ↓
前半: 1 → 2 → 3    后半: 5 → 4
         ↓
第三步: 交替合并
         ↓
结果: 1 → 5 → 2 → 4 → 3
```

### 步骤详解

**步骤1：快慢指针找中点**
- 使用标准快慢指针
- slow 停在中间（奇数）或中间偏右（偶数）
- 例如 5 个节点停在节点3，4 个节点也停在节点3

**步骤2：断开并反转后半部分**
```python
prev, curr = None, slow.next
slow.next = None  # 断开前半部分

while curr:
    temp = curr.next
    curr.next = prev
    prev = curr
    curr = temp
# 反转后 prev 指向新头部
```

**步骤3：交替合并**
```python
while prev and head:
    temp_A = head.next
    temp_B = prev.next
    head.next = prev
    prev.next = temp_A
    head = temp_A
    prev = temp_B
```

---

## 知识点问答验证

### 问题1：重排链表的构成规律？
**回答**: 先找到链表中点，前半部分保持不变，后半部分逆序，然后互相交替拼接。

### 问题2：快慢指针找中点的位置？
**回答**:
- 奇数（5个节点）：slow 停在节点3
- 偶数（4个节点）：slow 停在节点3（中间偏右）
- 对于这道题不需要调整

### 问题3：反转链表的三个指针？
**回答**: `prev`（前驱）、`curr`（当前）、`temp`（保存下一个）
- 移动顺序：temp=curr.next → curr.next=prev → prev=curr → curr=temp

### 问题4：交替合并的逻辑？
**回答**: 各取出一个节点拼接，保存下一个节点，连接后移动指针。当 B 遍历完后循环结束，A 的剩余节点已经链接好了。

---

## 题目练习

### LeetCode 143: 重排链表

```python
class Solution:
    def reorderList(self, head: Optional[ListNode]) -> None:
        """
        Do not return anything, modify head in-place instead.
        """
        # 步骤1：快慢指针找中点
        slow, fast = head, head
        while fast and fast.next:
            slow = slow.next
            fast = fast.next.next

        # 步骤2：断开并反转后半部分
        prev, curr = None, slow.next
        slow.next = None

        while curr:
            temp = curr.next
            curr.next = prev
            prev = curr
            curr = temp

        # 步骤3：交替合并
        while prev and head:
            temp_A = head.next
            temp_B = prev.next
            head.next = prev
            prev.next = temp_A
            head = temp_A
            prev = temp_B
```

- **时间复杂度**: O(n) — 三次遍历
- **空间复杂度**: O(1) — 只用指针变量

---

## Code Review 总结

| 方面 | 评价 |
|:---|:---|
| **正确性** | ✅ 完全正确 |
| **边界处理** | ✅ 1个/2个节点都能正确处理 |
| **代码风格** | ✅ 三步分离，逻辑清晰 |
| **复杂度** | ✅ O(n) 时间, O(1) 空间 |

---

## 复习内容（Day 33 复习）

### 双指针保持间距 + LeetCode 19（4个问答全部正确）

1. **链表删除倒数第3个节点**：fast 先走3步后在节点3，同步前进后 slow 在节点2
2. **终止条件**：`while fast.next` 而非 `while fast`，否则 slow 多走一步
3. **虚拟头节点作用**：让删除头节点的操作统一化
4. **复杂度**：时间 O(n)，空间 O(1)

---

## 总结

今日掌握：
- ✅ 链表综合题的三步走策略
- ✅ 快慢指针 + 反转链表 + 交替合并的组合应用
- ✅ LeetCode 143 重排链表

**第5周链表攻坚完成！**

---

## 里程碑

- 2026-03-02: 完成 Day 34 学习，掌握链表综合题，成功将三个技巧组合应用
- 2026-03-02: **第5周链表攻坚完成**，共解决 6 道链表题目（206/21/876/141/19/143）
