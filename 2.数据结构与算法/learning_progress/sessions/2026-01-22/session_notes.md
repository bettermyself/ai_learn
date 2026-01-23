# Day 15 学习笔记 - 2026年1月22日

## 📚 今日主题：对撞指针 (Two Pointers - Collision)

### 知识点讲解

#### 什么是双指针？
通过同时使用两个索引变量来处理数据的技巧，主要分为两类：
1. **对撞指针**：两个指针从序列两端向中间移动
2. **快慢指针**：一个快一个慢，同向移动

#### 对撞指针核心要点
- **起始位置**：left = 0, right = len(s) - 1
- **移动方向**：left 向右 (++), right 向左 (--)
- **终止条件**：left >= right
- **典型场景**：有序数组查找、回文串验证、反转数组/字符串

#### 核心优势
- **时间复杂度**：O(n)，只需遍历一次
- **空间复杂度**：O(1)，无需额外空间
- **利用对称性**：可以根据比较结果智能排除可能性

---

## 🎯 今日题目：LeetCode 125. 验证回文串

### 题目描述
给定一个字符串 `s`，验证它是否是回文串。只考虑字母和数字字符，可以忽略字母的大小写。

**示例**：
- 输入：`"A man, a plan, a canal: Panama"` → 输出：`true`
- 输入：`"race a car"` → 输出：`false`

### 学生的思考过程

#### 初始理解
1. 识别出这道题与纯粹回文串验证的区别：
   - 包含特殊字符（空格、逗号、冒号等）
   - 需要忽略大小写

2. 提出处理方案：
   - 非字母数字字符：使用 `.isalnum()` 判断并跳过
   - 忽略大小写：统一转小写 `.lower()` 后比较

#### 算法设计（伪代码迭代）

**第一版**（有逻辑问题）：
```python
left = 0
right = len(s)-1
while left < right:
    if !s[left].isalnum():
        left +=1
    if !s[right].isalnum():
        right +=1    # ❌ 方向错误
    if s[left] == s[right]:
       continue      # ❌ 应该移动指针
    else:
       return False
return True
```

**第二版**（修正后）：
```python
left = 0
right = len(s)-1
while left < right:
    if not s[left].isalnum():
        left +=1
        continue     # ✓ 跳过非字母数字后继续
    if not s[right].isalnum():
        right -=1    # ✓ 方向修正
        continue
    if s[left].lower() == s[right].lower():  # ✓ 转小写比较
       left +=1
       right -= 1    # ✓ 相等后移动双指针
    else:
       return False
return True
```

### 最终代码实现

```python
class Solution:
    def isPalindrome(self, s: str) -> bool:
        s = s.lower()                          # 统一转小写
        left, right = 0, len(s)-1
        while left < right:
            if not s[left].isalnum():          # 跳过非字母数字
                left += 1
                continue
            if not s[right].isalnum():         # 跳过非字母数字
                right -= 1
                continue
            if s[left] == s[right]:            # 比较
                left += 1
                right -= 1
            else:
                return False
        return True
```

### 复杂度分析
| 指标 | 复杂度 | 说明 |
|:-----|:-------|:-----|
| 时间 | O(n) | 每个字符最多访问一次 |
| 空间 | O(1) | 只用了常数量的额外变量 |

---

## 💡 今日学习亮点

### 掌握的知识点
1. ✓ 理解对撞指针的概念和使用场景
2. ✓ 掌握回文串的定义（正读反读相同）
3. ✓ 学会使用 `.isalnum()` 判断字母数字
4. ✓ 理解对撞指针的终止条件 `left >= right`

### 思维成长
- 通过伪代码迭代，自己发现并修正了逻辑错误
- 理解了为什么对撞指针适合回文验证（利用对称性）
- 能够将算法思路清晰地转化为代码

---

## 📝 下一步计划
- **Day 16**：LeetCode 167. 两数之和 II - 输入有序数组（对撞指针在有序数组中的应用）

---

## 复习记录
| 日期 | 复习内容 | 状态 |
|:-----|:---------|:-----|
| 2026-01-23 | Day 15: 对撞指针 + LeetCode 125 | ✓ 知识点完全巩固 |

---

## Day 16 复习内容

**复习问题**：
1. 对撞指针的初始化位置是什么？
   - 答：`left = 0`, `right = len(s) - 1`

2. 循环终止条件是什么？
   - 答：`left >= right`（即 `left < right` 时继续）

3. 如何跳过非字母数字字符？
   - 答：使用 `.isalnum()` 判断，配合 `continue` 跳过

4. 如何忽略大小写？
   - 答：统一转小写 `.lower()` 后比较

**手写代码验证**：
```python
class Solution:
    def isPalindrome(self, s: str) -> bool:
        s = s.lower()
        left, right = 0, len(s) - 1
        while left < right:
            if not s[left].isalnum():
                left += 1
                continue
            if not s[right].isalnum():
                right -= 1
                continue
            if s[left] == s[right]:
                left += 1
                right -= 1
            else:
                return False
        return True
```

✅ **复习总结**：知识点完全巩固，能够独立写出正确代码
