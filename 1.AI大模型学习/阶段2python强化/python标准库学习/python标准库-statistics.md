Python标准库 `statistics` 是一个非常实用且轻量级的模块，专门用于处理数学统计数据。它非常适合那些不需要引入 NumPy 或 Pandas 等重型第三方库的场景。

### 1. 数据的中心趋势 (Central Tendency)

这组函数主要用于寻找数据的“中心点”或典型值。

#### 算术平均数 (mean)

最常用的平均值。

```python
import statistics

data = [1, 2, 3, 4, 4]
avg = statistics.mean(data)
print(f"平均数 (Mean): {avg}") 
# 输出: 2.8
```

#### 中位数 (median, median_low, median_high)

将数据排序后位于中间的数值。中位数比平均数更抗干扰（对异常值不敏感）。
- **median**: 如果数据个数是偶数，取中间两个数的平均值。
- **median_low**: 如果数据个数是偶数，取中间两个数中较小的那个。
- **median_high**: 如果数据个数是偶数，取中间两个数中较大的那个。

```python
data_odd = [1, 3, 5]
data_even = [1, 3, 5, 7]

print(f"中位数 (奇数个): {statistics.median(data_odd)}")       # 输出: 3
print(f"中位数 (偶数个): {statistics.median(data_even)}")      # 输出: 4.0 ((3+5)/2)
print(f"低中位数: {statistics.median_low(data_even)}")       # 输出: 3
print(f"高中位数: {statistics.median_high(data_even)}")      # 输出: 5
```

#### 众数 (mode, multimode)

数据中出现频率最高的数值。
- **mode**: 返回出现最多的一个值（如果有多个众数，旧版本Python会报错，新版本返回其中一个）。
- **multimode**: 返回一个列表，包含所有出现频率最高的值。

```python
data = [1, 1, 2, 3, 3, 3, 4]
print(f"众数: {statistics.mode(data)}") # 输出: 3

data_multi = [1, 1, 2, 2, 3]
print(f"多众数: {statistics.multimode(data_multi)}") # 输出: [1, 2]
```

#### 几何平均数与调和平均数
- **geometric_mean**: 用于计算增长率或复利。
- **harmonic_mean**: 通常用于计算平均速率（如平均速度）。

```python
# 几何平均数：例如 1.1 表示增长 10%
growth_rates = [1.1, 1.2, 1.15] 
print(f"几何平均数: {statistics.geometric_mean(growth_rates):.4f}")

# 调和平均数：去程 60km/h，回程 40km/h，平均速度不是 50
speeds = [60, 40]
print(f"调和平均数 (平均速度): {statistics.harmonic_mean(speeds)}") # 输出: 48.0
```

### 2. 数据的离散程度 (Spread/Dispersion)

这组函数用于描述数据分布的疏密程度。

#### 方差与标准差 (Variance & Standard Deviation)

这是统计学中最关键的概念。注意区分“样本”与“总体”：
- **样本 (Sample)**: 也就是 stdev 和 variance。分母是 $n-1$。当你只有一部分数据（抽样）用来推测整体时使用。
- **总体 (Population)**: 也就是 pstdev 和 pvariance。分母是 $n$。当你拥有所有相关数据时使用。

```python
data = [1.5, 2.5, 2.5, 2.75, 3.25, 4.75]

# 样本标准差 (Sample Standard Deviation)
print(f"样本标准差: {statistics.stdev(data):.4f}") 
print(f"样本方差: {statistics.variance(data):.4f}")

# 总体标准差 (Population Standard Deviation)
print(f"总体标准差: {statistics.pstdev(data):.4f}")
print(f"总体方差: {statistics.pvariance(data):.4f}")
```

#### 分位数 (quantiles)

将数据分割成相等的区间。常见的是四分位数（Quartiles，$n=4$）。

```python
data = range(1, 101) # 1 到 100
# 将数据分为 4 份，需要 3 个切割点 (25%, 50%, 75%)
q = statistics.quantiles(data, n=4) 
print(f"四分位数切割点: {q}") 
# 输出: [25.75, 50.5, 75.25]
```

### 3. 变量关系 (Python 3.10+ 新增)

如果你的 Python 版本较新（3.10及以上），可以使用这组强大的功能来分析两个变量之间的关系。

#### 相关性与回归
- **correlation**: 皮尔逊相关系数，范围 $-1$ 到 $1$。衡量线性关系的强弱。
- **linear_regression**: 计算线性方程 $y = mx + b$ 的斜率 ($m$) 和截距 ($b$)。

```python
# 学习时间 (x) vs 考试分数 (y)
x_hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
y_score = [50, 55, 65, 70, 72, 80, 85, 88, 95, 98]

if hasattr(statistics, 'correlation'): # 检查版本兼容性
    # 1. 相关系数
    r = statistics.correlation(x_hours, y_score)
    print(f"相关系数: {r:.4f}") # 接近 1 表示强正相关

    # 2. 线性回归
    slope, intercept = statistics.linear_regression(x_hours, y_score)
    print(f"回归方程: Score = {slope:.2f} * Hours + {intercept:.2f}")
    
    # 预测学习 12 小时的分数
    prediction = slope * 12 + intercept
    print(f"预测学习 12 小时的分数: {prediction:.2f}")
```

### 4. 实战小项目：班级成绩分析器

这个小项目演示如何结合上述 API 来生成一份简单的统计报告，并剔除异常值。

#### 场景

你是一名老师，手头有一份班级成绩单。你需要计算平均分、找出波动情况（标准差），并尝试剔除离群值（Outliers）来观察更真实的平均水平。

#### 项目代码

```python
import statistics
import random

class GradeAnalyzer:
    def __init__(self, scores):
        self.scores = scores

    def summarize(self):
        """打印基础统计摘要"""
        if not self.scores:
            return "无数据"
            
        print(f"--- 成绩统计报告 (人数: {len(self.scores)}) ---")
        print(f"最高分: {max(self.scores)}")
        print(f"最低分: {min(self.scores)}")
        print(f"平均分 (Mean): {statistics.mean(self.scores):.2f}")
        print(f"中位分 (Median): {statistics.median(self.scores):.2f}")
        
        # 使用 multimode 防止有多个众数
        modes = statistics.multimode(self.scores)
        print(f"众数 (Mode): {modes}")
        
        # 总体标准差 (假设这是全班数据，不是抽样)
        stdev = statistics.pstdev(self.scores)
        print(f"标准差 (波动程度): {stdev:.2f}")
        return stdev

    def detect_outliers(self, threshold=2):
        """
        使用 Z-Score 方法检测异常值。
        如果在 (平均值 ± threshold * 标准差) 范围之外，视为异常。
        """
        avg = statistics.mean(self.scores)
        stdev = statistics.pstdev(self.scores)
        
        lower_bound = avg - (threshold * stdev)
        upper_bound = avg + (threshold * stdev)
        
        outliers = [x for x in self.scores if x < lower_bound or x > upper_bound]
        
        print(f"\n[异常值检测] 阈值范围: {lower_bound:.2f} ~ {upper_bound:.2f}")
        if outliers:
            print(f"发现异常分值: {outliers}")
            # 计算剔除异常值后的新平均分
            clean_scores = [x for x in self.scores if x not in outliers]
            new_mean = statistics.mean(clean_scores)
            print(f"剔除异常值后的调整平均分: {new_mean:.2f}")
        else:
            print("未发现明显异常值。")

# --- 模拟数据运行 ---
if __name__ == "__main__":
    # 模拟一个班级的成绩：大部分在 70-90 之间，有几个特别差或特别好的
    # 固定种子以便复现
    random.seed(42) 
    class_scores = [random.randint(65, 95) for _ in range(20)]
    
    # 手动添加两个离群值 (Outliers)
    class_scores.extend([10, 100]) 
    
    analyzer = GradeAnalyzer(class_scores)
    
    # 1. 基础分析
    analyzer.summarize()
    
    # 2. 异常值分析 (寻找严重偏离平均水平的分数)
    analyzer.detect_outliers(threshold=2.0)
```

#### 代码运行结果预期
- **基础统计**: 你会看到由于 10 分的存在，平均分会被拉低，但中位数受影响较小（体现了中位数的鲁棒性）。
- **异常检测**: 程序会根据标准差计算出一个正常范围，10 分很可能会被识别为异常值并被剔除，从而计算出一个更能代表大多数学生的“调整平均分”。

### 总结
- **简单场景**: 如果只是求平均、求中值，直接用 statistics，不要去装 pandas。
- **版本注意**: 复杂的线性回归功能需要 Python 3.10+。
- **核心区别**: 永远记得区分 stdev (样本) 和 pstdev (总体)。
