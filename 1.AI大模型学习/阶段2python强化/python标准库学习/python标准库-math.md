Python 的 math 模块是标准库中最基础也最重要的模块之一，提供了对 C 标准定义的数学函数的访问。它主要处理浮点数 (float) 运算（若需要处理复数，请使用 cmath）。
以下我们将 math 库的常用 API 分为 5 大类进行讲解，并附带完整的代码示例。最后，我们将结合这些知识构建一个实用的小项目。

# 一、 常用 API 详解

## 1. 数学常数 (Constants)
这些是预定义的常量，用于科学计算。
 * `math.pi`: 圆周率 $\pi$
 * `math.e`: 自然常数 e
 * `math.inf`: 正无穷大 (Infinity)
 * `math.nan`: 非数字 (Not a Number)

```python
import math

print(f"圆周率: {math.pi}")
print(f"自然常数: {math.e}")
print(f"无穷大检查: {math.inf > 10**100}")  # True
```

## 2. 数值表示与取整 (Number-theoretic & Representation)
处理数字的精度、舍入和符号。
 * `math.ceil(x)`: 向上取整（天花板）。
 * `math.floor(x)`: 向下取整（地板）。
 * `math.trunc(x)`: 截断小数部分，只保留整数。
 * `math.fabs(x)`: 返回浮点绝对值。
 * `math.isclose(a, b)`: 非常重要。判断两个浮点数是否“足够接近”（解决浮点数精度问题）。

```python
import math

x = 3.7
y = -3.7

# 1. 取整比较
print(f"Ceil(3.7): {math.ceil(x)}")    # 4
print(f"Floor(3.7): {math.floor(x)}")  # 3
print(f"Trunc(3.7): {math.trunc(x)}")  # 3
print(f"Trunc(-3.7): {math.trunc(y)}") # -3 (注意与 floor 的区别，floor会变成-4)

# 2. 浮点数比较 (永远不要用 == 比较 float)
a = 0.1 + 0.2
b = 0.3
print(f"a == b: {a == b}")             # False (因为精度丢失，a 其实是 0.30000000000000004)
print(f"isclose: {math.isclose(a, b)}") # True (推荐做法)
```

## 3. 幂与对数函数 (Power & Logarithmic)
用于指数增长、衰减计算。
 * `math.pow(x, y)`: 返回 $x^y$ (浮点数)。
 * `math.sqrt(x)`: 返回 $\sqrt{x}$。
 * `math.exp(x)`: 返回 $e^x$。
 * `math.log(x, [base])`: 默认返回 $\ln(x)$ (以 e 为底)，可指定 base。
 * `math.log10(x)`: 以 10 为底的对数。

```python
import math

# 1. 幂运算
print(f"2的10次方: {math.pow(2, 10)}")  # 1024.0
print(f"16的平方根: {math.sqrt(16)}")    # 4.0

# 2. 对数运算
print(f"ln(e): {math.log(math.e)}")      # 1.0
print(f"log2(8): {math.log(8, 2)}")      # 3.0
print(f"log10(100): {math.log10(100)}")  # 2.0
```

## 4. 三角函数 (Trigonometric)
注意：所有三角函数的输入参数必须是 弧度 (radians)，而不是角度。
 * `math.sin(x)`, `math.cos(x)`, `math.tan(x)`: 正弦、余弦、正切。
 * `math.degrees(x)`: 弧度转角度。
 * `math.radians(x)`: 角度转弧度。
 * `math.hypot(x, y)`: 欧几里得范数 $\sqrt{x^2 + y^2}$ (常用于计算二维向量长度或直角三角形斜边)。

```python
import math

# 1. 角度与弧度转换
angle = 90
rad = math.radians(angle)
print(f"90度对应的弧度: {rad}")           # 1.5707... (即 pi/2)
print(f"pi弧度对应的角度: {math.degrees(math.pi)}") # 180.0

# 2. 计算 Sin(90度) -> Sin(pi/2)
print(f"Sin(90度): {math.sin(rad)}")      # 1.0

# 3. 计算斜边 (勾股定理: 3^2 + 4^2 = 5^2)
print(f"直角边3和4的斜边: {math.hypot(3, 4)}") # 5.0
```

## 5. 组合与数论 (Combinatorics & Number Theory)
用于统计学和算法。
 * `math.factorial(x)`: 阶乘 $x!$。
 * `math.comb(n, k)`: 组合数 $C_n^k$ (从 n 个中选 k 个的方法数，无序)。
 * `math.perm(n, k)`: 排列数 $A_n^k$ (有序)。
 * `math.gcd(a, b)`: 最大公约数。
 * `math.lcm(a, b)`: 最小公倍数 (Python 3.9+)。

```python
import math

# 1. 阶乘 5! = 120
print(f"5!: {math.factorial(5)}")

# 2. 组合: 从5张牌选3张有多少种组合？
print(f"C(5,3): {math.comb(5, 3)}") # 10

# 3. 最大公约数
print(f"12和18的最大公约数: {math.gcd(12, 18)}") # 6
```

# 二、 实战小项目：弹道轨迹模拟器 (Projectile Motion Simulator)
这个项目将模拟一个物体（如炮弹）以一定初速度和角度发射后的运动轨迹。
项目用到的知识点：

 * 三角函数 (sin, cos)：将初速度分解为水平速度 (v_x) 和垂直速度 (v_y)。
 * 角度转换 (radians)：用户输入角度，计算需用弧度。
 * 幂运算 (pow)：计算位移公式中的平方项。
 * 常数：使用重力加速度 g $\approx$ 9.8。

## 项目代码

```python
import math

def simulate_projectile(velocity, angle_degrees):
    """
    计算抛射体的飞行数据
    :param velocity: 初速度 (m/s)
    :param angle_degrees: 发射角度 (0-90度)
    """
    g = 9.81  # 重力加速度 m/s^2
    
    # 1. 将角度转换为弧度 (math 库要求)
    angle_rad = math.radians(angle_degrees)
    
    # 2. 分解速度向量
    # vx = v * cos(theta)
    # vy = v * sin(theta)
    v_x = velocity * math.cos(angle_rad)
    v_y = velocity * math.sin(angle_rad)
    
    # 3. 计算物理量
    # 飞行时间 (Total Time) = 2 * vy / g
    t_flight = 2 * v_y / g
    
    # 最大高度 (Max Height) = vy^2 / (2g)
    h_max = math.pow(v_y, 2) / (2 * g)
    
    # 水平射程 (Range) = vx * t_flight
    max_range = v_x * t_flight
    
    # 4. 格式化输出结果
    print(f"--- 弹道模拟报告 ---")
    print(f"初速度: {velocity} m/s")
    print(f"发射角: {angle_degrees}°")
    print(f"--------------------")
    print(f"水平分速度: {v_x:.2f} m/s")
    print(f"垂直分速度: {v_y:.2f} m/s")
    print(f"飞行总时间: {t_flight:.2f} s")
    print(f"最大高度  : {h_max:.2f} m")
    print(f"最大射程  : {max_range:.2f} m")

# --- 运行测试 ---
if __name__ == "__main__":
    # 场景：以 50 m/s 的速度，45度角发射
    # 理论上 45度角应该获得最大射程
    simulate_projectile(velocity=50, angle_degrees=45)
    
    print("\n")
    
    # 场景：以相同速度，但角度更陡峭 (75度)
    simulate_projectile(velocity=50, angle_degrees=75)
```

## 代码运行结果示例：
```
--- 弹道模拟报告 ---
初速度: 50 m/s
发射角: 45°
--------------------
水平分速度: 35.36 m/s
垂直分速度: 35.36 m/s
飞行总时间: 7.21 s
最大高度  : 63.71 m
最大射程  : 254.84 m
```

# 总结
Python 的 math 库虽然不依赖外部包，但功能非常强大且计算效率高。对于科学计算、游戏开发（计算距离、角度）或金融分析（复利计算），它都是首选工具。