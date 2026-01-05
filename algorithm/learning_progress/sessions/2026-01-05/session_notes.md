# Day02 学习会话笔记

**日期**: 2026年1月5日
**主题**: 数组内存模型理论
**题目**: LeetCode 1929、1920

---

## 今日题目

### LeetCode 1929: 数组串联 (Concatenation of Array)

**题目描述**：
给定长度为 n 的数组 `nums`，返回长度为 2n 的数组，前 n 个是 `nums`，后 n 个也是 `nums`。

**用户初始思路**：
- 使用 `extend()` 方法合并
- 遍历 + `append()` 添加

**最终解法**：
```python
class Solution:
    def getConcatenation(self, nums: List[int]) -> List[int]:
        return nums * 2  # 或 nums + nums
```

**复杂度分析**：
- 时间复杂度: O(n)
- 空间复杂度: O(n)

---

### LeetCode 1920: 基于排列构建数组 (Build Array from Permutation)

**题目描述**：
给定零索引排列 `nums`，构建 `ans`，其中 `ans[i] = nums[nums[i]]`。

**用户初始思路**：
```python
ans = []
for num in nums:
    ans.append(nums[num])
return ans
```

**优化解法**：
```python
class Solution:
    def buildArray(self, nums: List[int]) -> List[int]:
        return [nums[num] for num in nums]
```

**核心概念**：
- 列表推导式（List Comprehension）
- 零索引排列保证 `nums[nums[i]]` 永远不会越界

---

## 核心理论学习

### Python List 内存模型

**用户理解**：
- Python list 底层开辟连续内存存储数据
- 达到阈值时扩容，申请新地址

**补充知识点**：

1. **存储结构**：
   - Python List 存储**对象引用**（指针），不是值本身
   - 引用连续存储（8字节固定大小）
   - 对象本身可能分散在堆内存

2. **扩容策略**：
   ```
   新容量 ≈ 旧容量 × 1.125
   公式: newsize + (newsize >> 3) + 常数
   ```

3. **与 C/C++ 区别**：

   | 特性 | C/C++ 数组 | Python List |
   |:---|:---|:---|
   | 存储内容 | 值本身 | 对象引用（指针） |
   | 连续性 | 值物理连续 | 引用连续，对象分散 |
   | 元素大小 | 固定（如 int 4字节） | 引用固定（8字节） |
   | 类型要求 | 必须同类型 | 可容纳任意类型 |

4. **为什么 Python List 能存不同类型**：
   - 因为存储的是统一大小的引用（指针）
   - 指针指向的对象可以任意类型

---

## 用户掌握情况

| 知识点 | 掌握程度 | 备注 |
|:---|:---|:---|
| 数组基本操作 | ✅ 扎实 | 掌握 `*`、`+`、列表推导式 |
| 列表推导式 | ✅ 掌握 | 能正确使用 |
| Python List 内存模型 | ✅ 深入理解 | 能清晰解释引用 vs 值的区别 |
| 与 C/C++ 区别 | ✅ 理解核心 | 理解"为什么能存不同类型" |

---

## 下一步计划

**Day03**: 字符串基本操作（反转、拼接）
- 题目: 344. 反转字符串
