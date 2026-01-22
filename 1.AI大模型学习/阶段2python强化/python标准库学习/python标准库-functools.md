functools 是 Python 标准库中非常强大且实用的模块，专门用于高阶函数（Higher-order functions），即作用于或返回其他函数的函数。掌握它能让你的代码更简洁、高效且具有“函数式编程”的味道。

以下是 functools 常用 API 的详解与代码示例，最后附带一个综合实战小项目。

## 第一部分：核心 API 详解

### 1. @lru_cache (缓存/记忆化)

这是最常用的装饰器之一。它实现了 LRU (Least Recently Used) 缓存策略。对于耗时的计算（如递归或I/O操作），如果输入参数相同，它可以直接返回缓存结果，无需重新计算。

```python
from functools import lru_cache
import time

# maxsize=None 表示无限缓存，typed=True 表示区分 3 和 3.0
@lru_cache(maxsize=32)
def heavy_computation(x):
    print(f"正在计算 {x} ...")
    time.sleep(1)  # 模拟耗时操作
    return x * x

start = time.time()
print(heavy_computation(2)) # 第一次：执行计算，耗时约1秒
print(heavy_computation(2)) # 第二次：命中缓存，瞬间返回
print(f"总耗时: {time.time() - start:.2f}s")

# 查看缓存统计
print(heavy_computation.cache_info())
```

> 注： Python 3.9+ 新增了 @cache，相当于 @lru_cache(maxsize=None)，更简洁。

### 2. partial (偏函数)

用于“冻结”函数的某些参数，生成一个新的函数。当你需要复用一个函数但其中某些参数是固定的时候非常有用。

```python
from functools import partial

def power(base, exponent):
    return base ** exponent

# 创建一个专门计算平方的函数，冻结 exponent=2
square = partial(power, exponent=2)

# 创建一个专门计算立方的函数，冻结 exponent=3
cube = partial(power, exponent=3)

print(square(5))  # 输出: 25
print(cube(5))    # 输出: 125

# 经典用法：改造 int 函数，使其默认按二进制转换
bin_int = partial(int, base=2)
print(bin_int('1010')) # 输出: 10
```

### 3. @wraps (装饰器修复)

写自定义装饰器时的必选项。如果不使用它，被装饰函数的元数据（如 __name__, __doc__）会丢失，变成装饰器内部函数的信息。

```python
from functools import wraps

def my_logger(func):
    @wraps(func)  # 关键：保留原函数的元数据
    def wrapper(*args, **kwargs):
        print(f"执行函数: {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@my_logger
def add(a, b):
    """这是一个加法函数"""
    return a + b

print(add(1, 2))
print(f"函数名: {add.__name__}") # 输出: add (如果没有 @wraps，这里会变成 wrapper)
print(f"文档: {add.__doc__}")   # 输出: 这是一个加法函数
```

### 4. reduce (归约)

对序列进行累积计算。它将一个二元函数（接收两个参数）作用于序列元素，从而将序列归约为单个值。

```python
from functools import reduce

numbers = [1, 2, 3, 4, 5]

# 计算阶乘：1 * 2 * 3 * 4 * 5
product = reduce(lambda x, y: x * y, numbers)
print(product) # 输出: 120

# 找出最大值
max_val = reduce(lambda x, y: x if x > y else y, numbers)
print(max_val) # 输出: 5
```

### 5. @singledispatch (单分派/泛型函数)

Python 不支持像 Java/C++ 那样的基于参数类型的函数重载，但 singledispatch 可以实现这一点。它允许你根据第一个参数的类型来定义不同的处理逻辑。

```python
from functools import singledispatch

@singledispatch
def process_data(data):
    """默认处理逻辑"""
    print(f"通用处理: {data}")

@process_data.register(list)
def _(data):
    print(f"正在处理列表，长度为: {len(data)}")

@process_data.register(int)
def _(data):
    print(f"正在处理整数，双倍值为: {data * 2}")

process_data("Hello")  # 走默认逻辑
process_data([1, 2, 3]) # 走 list 逻辑
process_data(10)       # 走 int 逻辑
```

### 6. @total_ordering (类比较补全)

只要你定义了 __eq__ 和 (__lt__, __le__, __gt__, __ge__) 中的任意一个，这个装饰器就会自动补全剩下的比较方法。

```python
from functools import total_ordering

@total_ordering
class Student:
    def __init__(self, score):
        self.score = score

    def __eq__(self, other):
        return self.score == other.score

    # 只需要定义小于，total_ordering 会自动生成 > (gt), <= (le), >= (ge)
    def __lt__(self, other):
        return self.score < other.score

s1 = Student(80)
s2 = Student(90)

print(s1 < s2)  # True (原原本本)
print(s1 >= s2) # False (自动生成)
```

### 7. cached_property (缓存属性)

(Python 3.8+) 类似于 @property，但它只在第一次访问时计算值，之后就作为普通属性存储在实例的 __dict__ 中。非常适合不可变对象的高开销属性。

```python
from functools import cached_property

class DataSet:
    def __init__(self, data):
        self.data = data

    @cached_property
    def variance(self):
        print("正在计算方差 (耗时)...")
        avg = sum(self.data) / len(self.data)
        return sum((x - avg) ** 2 for x in self.data) / len(self.data)

ds = DataSet([1, 2, 3, 4, 5])
print(ds.variance) # 第一次：执行计算
print(ds.variance) # 第二次：直接取值，不打印"正在计算..."
```



## 第二部分：实战小项目——电商订单智能处理系统

这个小项目将结合 lru_cache、singledispatch、wraps 和 partial，模拟一个简单的电商后台处理逻辑。

### 项目功能：
- 多态处理：根据不同的订单对象（普通订单、VIP订单）计算不同的折扣。
- 缓存：模拟查询汇率等耗时操作。
- 日志：记录处理流程。

### 项目代码 (order_system.py)

```python
import time
from functools import lru_cache, singledispatch, wraps, partial

# --- 1. 工具：带计时的日志装饰器 (@wraps) ---
def log_execution(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        end = time.time()
        print(f"[{func.__name__}] 执行完成，耗时: {end - start:.4f}s")
        return result
    return wrapper

# --- 2. 模拟数据库/API：获取汇率 (@lru_cache) ---
@lru_cache(maxsize=10)
def get_exchange_rate(currency_code):
    """模拟从外部API获取汇率，这是一个耗时操作"""
    print(f"-> 正在查询 {currency_code} 汇率...")
    time.sleep(0.5) # 模拟网络延迟
    rates = {"USD": 1.0, "CNY": 7.1, "EUR": 0.92}
    return rates.get(currency_code, 1.0)

# --- 3. 领域模型 ---
class Order:
    def __init__(self, price, currency="USD"):
        self.price = price
        self.currency = currency

class VIPOrder(Order):
    pass

class HolidayOrder(Order):
    pass

# --- 4. 核心逻辑：基于类型的折扣计算 (@singledispatch) ---
@singledispatch
def calculate_final_price(order):
    """默认逻辑：普通订单无折扣"""
    rate = get_exchange_rate(order.currency)
    final = order.price * rate
    print(f"普通订单处理: 原价 {order.price} {order.currency} -> {final:.2f} (本币)")
    return final

@calculate_final_price.register(VIPOrder)
def _(order):
    """VIP逻辑：9折"""
    rate = get_exchange_rate(order.currency)
    final = order.price * rate * 0.9
    print(f"VIP 订单处理: 原价 {order.price} {order.currency} -> {final:.2f} (本币)")
    return final

@calculate_final_price.register(HolidayOrder)
def _(order):
    """节日逻辑：满100减20"""
    rate = get_exchange_rate(order.currency)
    converted_price = order.price * rate
    discount = 20 if converted_price >= 100 else 0
    final = converted_price - discount
    print(f"节日订单处理: 原价 {order.price} {order.currency} -> {final:.2f} (本币)")
    return final

# --- 5. 业务流程控制器 ---
@log_execution
def process_batch_orders(orders):
    print("--- 开始批处理订单 ---")
    total_revenue = 0
    for order in orders:
        total_revenue += calculate_final_price(order)
    return total_revenue

# --- 6. 使用 partial 创建特定场景的处理器 ---
# 假设我们要创建一个专门处理 CNY 结算的快速入口（虽然这里逻辑简单，但演示了 partial 的用法）
# 注意：partial 更多用于固定函数参数，这里我们用来演示概念
def create_order_factory(cls, currency):
    return partial(cls, currency=currency)

# --- 主程序运行 ---
if __name__ == "__main__":
    # 使用 partial 快速创建 CNY 订单生成器
    create_cny_order = create_order_factory(Order, "CNY")
    
    # 准备数据
    order_list = [
        create_cny_order(price=100),       # 普通订单 (CNY) - 第一次查汇率
        VIPOrder(price=200, currency="CNY"), # VIP订单 (CNY) - 命中缓存！
        HolidayOrder(price=50, currency="USD"), # 节日订单 (USD) - 第一次查汇率
        VIPOrder(price=100, currency="USD")     # VIP订单 (USD) - 命中缓存！
    ]

    print(f"汇率查询缓存信息 (前): {get_exchange_rate.cache_info()}")
    
    # 执行批处理
    revenue = process_batch_orders(order_list)
    
    print("--- 处理结束 ---")
    print(f"总营收: {revenue:.2f}")
    print(f"汇率查询缓存信息 (后): {get_exchange_rate.cache_info()}")
```

### 代码亮点解析：
- **@lru_cache**: 在处理第2个及以后的相同货币订单时，`get_exchange_rate` 不会再次休眠 0.5秒，极大加速了处理过程。
- **@singledispatch**: 代码中没有一大堆 `if isinstance(order, VIPOrder): ... elif ...`，逻辑完全解耦。新增订单类型只需注册新函数，无需修改原有逻辑（符合开闭原则）。
- **@wraps**: `process_batch_orders` 保留了原有的名称，方便调试。
- **partial**: 演示了如何创建一个默认产生人民币订单的工厂函数。
