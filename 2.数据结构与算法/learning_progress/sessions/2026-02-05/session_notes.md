# Day 26 学习笔记 (2026-02-05)

## 学习主题
滑动窗口（字符串窗口）- LeetCode 3. 无重复字符的最长子串

## 知识点讲解

### 核心思想
字符串窗口题目的关键：用数据结构记录窗口内的状态，判断窗口是否需要收缩。

对于"无重复字符"问题：
- **窗口扩张**：右边界向右移动，加入新字符
- **窗口收缩条件**：当新字符已在窗口内出现过时
- **记录状态**：用哈希表记录每个字符**最近一次出现的索引**

### 算法流程
1. 初始化：left=0, max_len=0, char_dict={}
2. 遍历 right 从 0 到 n-1：
   - 检查 s[right] 是否在 char_dict 中且索引 >= left（在窗口内）
   - 如果是，left = char_dict[s[right]] + 1
   - 更新 char_dict[s[right]] = right
   - 更新 max_len = max(max_len, right - left + 1)

### 关键点：为什么是 索引 >= left？
因为 char_index 存的是字符**最后一次出现的位置**，但这个位置可能在窗口左边（已经被移出窗口了）。只有当 `索引 >= left` 时，才说明重复发生在**当前窗口内**。

### 知识点问答
1. **字符串窗口和数字求和窗口，核心区别是什么？**
   - 答：字符串窗口求的是最大窗口，数字求和窗口求的是最小窗口

2. **为什么 char_index 存储的是"索引"而不是"布尔值"或"计数"？**
   - 答：需要知道每个元素最近一次出现的索引，才能计算出 max_len 和确定 left 移动位置

3. **当发现重复字符时，left 为什么要移动到 `char_index[s[right]] + 1`？**
   - 答：需要将 left 放到上次出现 s[right] 位置的后面，才能保证窗口内的元素无重复

4. **这道题的窗口什么时候扩张？什么时候收缩？**
   - 答：窗口默认扩张，当 s[right] 的元素之前出现过，而且索引 >= left 的时候收缩

### 数据结构选择
- **字典**：通用，支持任意字符
- **数组**：O(1) 访问更快，但只适合字符集有限的情况（如 ASCII 128/256）

## 题目：LeetCode 3. 无重复字符的最长子串

### 题目描述
给定一个字符串 s，找出其中不含有重复字符的最长子串的长度。

### 手动模拟 "abcabcbb"
```
初始: left=0, max_len=0, 字典={}

第一步：right=0, s[0]='a', left=0, max_len=1, 字典={'a':0}
第二步：right=1, s[1]='b', left=0, max_len=2, 字典={'a':0,'b':1}
第三步：right=2, s[2]='c', left=0, max_len=3, 字典={'a':0,'b':1,'c':2}
第四步：right=3, s[3]='a'（重复！a在窗口内）
       → left=1, max_len=3, 字典={'a':3,'b':1,'c':2}
第五步：right=4, s[4]='b'（重复！b在窗口内）
       → left=2, max_len=3, 字典={'a':3,'b':4,'c':2}
...最终 max_len=3
```

### 代码实现
```python
class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        left, max_len, char_dict = 0, 0, {}
        for right in range(len(s)):
            if s[right] in char_dict and char_dict[s[right]] >= left:
                left = char_dict[s[right]] + 1

            char_dict[s[right]] = right
            max_len = max(max_len, right - left + 1)

        return max_len
```

### 复杂度分析
- **时间复杂度**：O(n) — 每个元素最多被访问 2 次
- **空间复杂度**：O(min(n, |Σ|)) — |Σ| 是字符集大小

### Code Review 结果
- ✓ 逻辑正确
- ✓ 顺序正确（先移动 left → 更新字典 → 计算 max_len）
- ✓ 命名清晰
- ✓ 边界处理正确

## 复习内容
待复习（明天）：
- Day 26: 滑动窗口（字符串窗口）+ LeetCode 3
- 手动模拟执行过程
- 理解 `索引 >= left` 的关键判断
