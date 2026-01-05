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

---

## 补充复习 (Session 2)

### LeetCode 1920: O(1) 空间复杂度解法

**挑战**: 如何在不使用额外空间的情况下，构建 `ans[i] = nums[nums[i]]`？
**核心难点**: 更新 `nums[i]` 会覆盖后续计算需要的原始值。

**解决方案**: 数学编码 (Mathematical Encoding)
- 利用 `nums[i] < n` 的特性。
- 公式: `nums[i] = old_val + (new_val % n) * n`
- 还原旧值: `nums[i] % n`
- 获取新值: `nums[i] // n`

**深入讨论**:
- **优点**: 实现了 O(1) 空间复杂度（不计输出数组）。
- **缺点**:
  1. 增加了常数时间开销（两次遍历）。
  2. **溢出风险**: 在 C++/Java 中，`val * n` 可能导致整型溢出。Python 自动处理大整数所以无此问题。

**用户表现**:
- 能够理解编码/解码的数学原理。
- 敏锐指出了时间开销增加和潜在的越界/溢出风险。

---

## 高阶视角补充：从优秀到卓越

### 1. CPU 缓存亲和性 (Cache Locality)
**概念**：CPU 访问内存时，会预取相邻数据到高速缓存 (L1/L2 Cache)。
- **C/C++ 数组**：数据物理连续，缓存命中率高，数值计算极快。
- **Python List**：仅引用连续，对象分散在堆内存。访问元素时可能频繁发生 **Cache Miss**。
- **启示**：这就是为什么 Python 做科学计算（如矩阵）需要 NumPy（底层是 C 数组）的原因。

### 2. 均摊复杂度 (Amortized Complexity)
**概念**：虽然动态数组扩容是 O(N)，但由于其按倍数增长（指数级），扩容发生的频率极低。
- 将一次昂贵的 O(N) 操作成本平摊到多次便宜的 O(1) `append` 操作上，平均下来每次操作仍可视作 **O(1)**。
