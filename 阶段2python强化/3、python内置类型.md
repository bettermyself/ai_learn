### python内置类型

#### 1. **逻辑值检测**--- bool

- 任何对象都可以进行逻辑值检测（如 `if` 或 `while` 条件）。
- 默认情况下，对象为真值，除非定义了 `__bool__()`（返回 `False`）或 `__len__()`（返回 `0`）方法。
- **假值示例**：
  - `None` 和 `False`。
  - 数值零：`0`, `0.0`, `0j`, `Decimal(0)`, `Fraction(0, 1)`。
  - 空序列或多项集：`''`, `[]`, `{}`, `set()`, `range(0)`。



#### 2. **布尔运算**--- and, or, not

- `or`：短路运算符，若 `x` 为真则返回 `x`，否则返回 `y`。

  > 只有在第一个参数为假值时才会对第二个参数求值。

- `and`：短路运算符，若 `x` 为假则返回 `x`，否则返回 `y`。

  > 只有在第一个参数为真值时才会对第二个参数求值。

- `not`：返回 `True` 或 `False`，优先级低于非布尔运算符。

>
> not 的优先级比非布尔运算符低，因此 not a == b 会被解读为 not (a == b) 而 a == not b 会引发语法错误。



#### 3. **比较运算**

- 支持八种比较运算符：`<`, `<=`, `>`, `>=`, `==`, `!=`, `is`, `is not`。
- 可以链式比较（如 `x < y <= z`），`y` 只求值一次。
- `is` 和 `is not` 检查对象标识，不可自定义。

> 在 Python 中，is 和 is not 是用于**身份（identity）运算**的关键字，而不是用于数值或内容的比较。
>
> **1. is 关键字**
>
> - 用于判断两个变量是否引用自同一个对象（即内存地址是否相同）。
> - 返回 True 表示两个变量是同一个对象。
>
> **示例：**
>
> ```python
> a = [1, 2, 3]
> b = a
> c = [1, 2, 3]
> 
> print(a is b)    # True，因为b和a指向同一个列表对象
> print(a is c)    # False，因为c虽然内容一样，但是不同的对象
> ```
>
> **2. is not 关键字**
>
> - 判断两个变量是否**不是**引用同一个对象。
> - 返回 True 表示两个变量不是同一个对象。
>
> **示例：**
>
> ```python
> a = [1, 2, 3]
> c = [1, 2, 3]
> 
> print(a is not c)  # True，因为a和c不是同一个对象
> ```
>
> **注意事项**
>
> - is/is not 常用于和 None 比较：如 if x is None:。
> - 不要用 is 来比较数值、字符串等内容相等（请用 == 比较内容）。
>
> **示例（错误用法）：**
>
> ```python
> a = 1000
> b = 1000
> print(a is b)  # 可能是 False（大整数可能不会做对象缓存）
> print(a == b)  # True（内容相等）
> ```
>
> **总结：**
>
> - is/is not 判断对象身份（内存地址是否相同）。
> - ==/!= 判断对象内容是否相等。



#### 4. **数字类型**

- **整数 (`int`)**：无限精度。
- **浮点数 (`float`)**：通常用 C 的 `double` 实现。
- **复数 (`complex`)**：含实部和虚部（如 `z.real`, `z.imag`）。
- **混合运算**：较窄类型自动拓宽（`int` → `float` → `complex`）。
- **运算**：`+`, `-`, `*`, `/`, `//`, `%`, `**`, `abs()`, `pow()`,`-`,`+`,`int()`,`float()`,`divmod()`。
- **按位运算**：`|`, `^`, `&`, `<<`, `>>`, `~`（仅限整数）。

> **混合运算转换**
>
> 规则：参与混合运算时，类型会自动向更“宽”的类型转换：
>
> - `int` → `float` → `complex`
> - 例如：`3 + 2.0` 结果为 `5.0`（float）
> - 例如：`1 + 2j + 2` 结果为 `(3+2j)`（complex）
>
> ---
>
> **常用运算符**
>
> - **四则运算**：`+`, `-`, `*`, `/`（除法，结果总是 float）
>
> - **地板除**：`//`（整除，取商的整数部分）
>
> - **取余**：`%`
>
> - **幂运算**：`**`
>
> - **绝对值**：`abs()`
>
> - **幂函数**：`pow()` 返回x的y次幂，等价于`x ** y`（支持三参数幂余运算：`pow(x, y, z)` 等价于 `(x**y) % z`）
>
> - `int(x)` ：将x转换为整数类型。
>
> - `float(x)` ：将x转换为浮点数类型。
>
> - `divmod(x, y)` ：同时返回x整除y的商和余数，结果是一个元组 (商, 余数)。
>
> - `-x` ：取反，返回x的相反数。`+x` ：正号，不改变数值本身。
>
> - 示例：
>
>   ```python
>   print(7 / 2)    # 3.5
>   print(7 // 2)   # 3
>   print(7 % 2)    # 1
>   print(2 ** 10)  # 1024
>   print(abs(-5))  # 5
>   print(pow(2, 3))  # 8
>   print(pow(2, 3, 3))  # 2
>   print(int(3.6))  #  3
>   print(float(3))  #  3.0
>   print(divmod(8, 3))  #  (2, 2)
>   ```
>
> ---
>
> **按位运算符**（仅限整数）
>
> **1. 按位或 `|`**
>
> - 对应位有一个为 1，则结果为 1。
> - 例：`5 | 3`
>   5 的二进制：`0101`
>   3 的二进制：`0011`
>   结果：`0111`（即 7）
>
> **2. 按位与 `&`**
>
> - 对应位都为 1，则结果为 1，否则为 0。
> - 例：`5 & 3`
>   0101 & 0011 = 0001（即 1）
>
> **3. 按位异或 `^`**
>
> - 对应位不同则为 1，相同则为 0。
> - 例：`5 ^ 3`
>   0101 ^ 0011 = 0110（即 6）
>
> **4. 按位取反 `~`**
>
> - 所有位取反（0 变 1，1 变 0），结果等价于 `-(x+1)`。
> - 例：`~5`
>   5 的二进制：`0000 0101`
>   取反：`1111 1010`（补码表示 -6）
>
> **5. 左移 `<<`**
>
> - 各二进制位整体左移指定位数，右侧补 0。
> - 例：`5 << 1`
>   5 的二进制：`0101` → `1010`（即 10），左移 *n* 位等价于乘以 pow(2, n) 。
>
> **6. 右移 `>>`**
>
> - 各二进制位整体右移指定位数，左侧补符号位（正数补 0，负数补 1）。
> - 例：`5 >> 1`
>   5 的二进制：`0101` → `0010`（即 2），右移 *n* 位等价于除以 pow(2, n) ，作向下取整除法。



#### 5. **整数附加方法**

- `int.bit_length()`：返回该整数的二进制表示所需的位数（不包括符号位）。
- `int.bit_count()`：返回整数二进制表示中 `1` 的个数（Python 3.10+）。
- `int.to_bytes(length=1, byteorder=’big’, *, signed=False)`：将整数转换为指定长度的字节数组。
- **classmethod** `int.from_bytes(bytes, byteorder=’big’, *, signed=False)`：从字节数组构造整数。
- `int.as_integer_ratio()`：返回该整数的最简分数表示（即分子和分母）

> ```python
> x = 37     # 二进制 100101
> print(x.bit_length())  # 输出 6
> 
> x = 37     # 二进制 100101
> print(x.bit_count())   # 输出 3
> ```
>
> ---
>
> **`to_bytes(length, byteorder, *, signed=False)`**
>
> **作用**：将整数转换为指定长度的字节数组。
>
> - `length`：字节数（数字转化为`0x 字节数*2`）
> - `byteorder`：字节序，`'big'` 或 `'little'`
> - `signed`：整数是否有符号（默认无符号）
>
> **示例**：
>
> ```python
> n = 1024
> b = n.to_bytes(2, 'big')      # b'\x04\x00'
> print(b)
> b2 = n.to_bytes(2, 'little')  # b'\x00\x04'
> print(b2)
> ```
>
> **说明**：
> `1024` 的十六进制是 `0x0400`，2 字节大端序为 `b'\x04\x00'`（高位字节存储在低地址，低位字节存储在高地址。），小端序为 `b'\x00\x04'`（低位字节存储在低地址，高位字节存储在高地址。）。
>
> ---
>
> **`from_bytes(bytes, byteorder, *, signed=False)`**
>
> **作用**：从字节数组还原整数。
>
> - `bytes`：字节对象
> - `byteorder`：字节序
> - `signed`：是否有符号
>
> **示例**：
>
> ```python
> b = b'\x04\x00'
> n = int.from_bytes(b, 'big')    # 1024
> print(n)
> n2 = int.from_bytes(b, 'little') # 4 * 256 = 1024, 0 * 256 + 4 = 4
> print(n2)  # 4
> ```
>
> **说明**：
> 用和 `to_bytes()` 相同的参数还原整数。
>
> `to_bytes` 和 `from_bytes` 是 Python 中用于整数（`int`）和字节（`bytes`）之间相互转换的方法。它们常用于二进制数据处理、网络通信、文件读写等场景。
>
> ---
>
> `int.as_integer_ratio()` 是 Python 整数类型的方法，用于返回该整数的最简分数表示（即分子和分母），结果为一个二元组 `(numerator, denominator)`。
>
> 对于任意整数 n，`n.as_integer_ratio()` 总是返回 `(n, 1)`，因为每个整数都可以写作 n/1。
>
> **示例**
>
> ```python
> x = 5
> print(x.as_integer_ratio())  # 输出 (5, 1)
> 
> y = -12
> print(y.as_integer_ratio())  # 输出 (-12, 1)
> 
> z = 0
> print(z.as_integer_ratio())  # 输出 (0, 1)
> ```
>
> **说明**
>
> - 该方法用于与 float 的 `as_integer_ratio()` 保持一致性（如 `0.75.as_integer_ratio()` 返回 `(3, 4)`）。



#### 6. **浮点数附加方法**

- `float.as_integer_ratio()`：返回最简分数对。
- `float.is_integer()`：检查是否为整数。
- `float.hex()` ：将浮点数转换为十六进制字符串。
- **classmethod** `float.fromhex(s)`：将十六进制字符串 `s` 转换回浮点数。



#### **7. 数字类型的哈希运算**

> **背景：为什么要有数字哈希运算？**
>
> **保证同值不同类型数字哈希一致**
>
> **举例**：在Python中，`1`（int）、`1.0`（float）、`Fraction(2, 2)`（分数）、`Decimal('1.00')`（高精度小数）这几个值虽然类型不同，但它们表示的“数学意义”一样，都是1。
>
> **设计目的**：
> 哈希值就是用来区分“内容”的。如果这几个值的哈希值不同，那么你用它们做字典的key或者set的元素时，Python会把它们当作完全不同的东西。这样会导致重复、不一致，甚至查找失败。
>
> **解决方案**：
> 规定：只要 `x == y`，就要 `hash(x) == hash(y)`。这样，不管你用哪种数值类型，只要值一样，表现就一样。
>
> 
>
> **方便各种数值类型混用**
>
> **现实场景**：你可能有一个字典，key可能是int、float、Fraction、Decimal里的任何一种。如果哈希规则不统一，你查找和存储就会出问题。
>
> **设计目的**：
> 统一的哈希算法让各种数值类型可以“无缝混用”。比如你可以放心地用 `x in my_set` 检查，不需要关心x的具体类型，只要它的“值”对得上就行。
>
> 
>
> **保证查找效率和正确性**
>
> **字典和集合的本质**：
> 字典和集合依赖哈希值来做快速定位。哈希值越“稳”，查找和插入就越快、越准确。
>
> **设计目的**：
> 用统一、数学合理的方式计算哈希，可以让所有数字类型都能高效、准确地参与到哈希集合运算中。
>
> 
>
> **易于扩展和维护**
>
> **新数值类型的兼容性**：
> Python社区可能会引入新的数值类型，比如Fraction、Decimal等。如果哈希算法是基于统一的数学原则设计的，新类型只要“遵守规则”就能直接用。
>
> **设计目的**：
> 让哈希机制对所有（包括以后新增的）数值类型都友好，减少出错几率，也方便Python核心维护。
>
> 
>
> **防止哈希冲突和漏洞**
>
> **哈希冲突的危害**：
> 如果哈希分布不均匀，容易被恶意攻击（哈希碰撞攻击），让字典性能严重下降。
>
> **设计目的**：
> 用高位质数和模逆等数学方法设计哈希，可以让哈希值分布更加均匀，有效避免安全隐患。
>
> ---
>
> **1. 哈希一致性原则**
>
> **要求**：对于不同类型但数值相等的数字 x 和 y，必须有 `hash(x) == hash(y)`。例如：`1 == 1.0 == Decimal('1') == Fraction(1,1)`，它们的哈希值都相同。
>
> **2. 基本实现方法**
>
> - Python 为所有有理数（包括 int、Fraction、有限 float、Decimal）定义了**统一的哈希函数**。
>
> - 哈希运算本质上是将分子分母的关系通过质数 P 模运算（降模）得到的。
>
> - 质数 P 可通过
>
>   ```
>   sys.hash_info.modulus
>   ```
>
>   获取：
>
>   - 32位：P = 2**31 - 1
>   - 64位：P = 2**61 - 1
>
> **3. 哈希规则简述**
>
> - **有理数 x = m/n（n不整除P）**
>   - 哈希值：`hash(x) = m * invmod(n, P) % P`
>   - 其中 `invmod(n, P)` 是 n 在模 P 下的逆元（可用 `pow(n, P-2, P)` 计算）。
> - **有理数 x = m/n（n能被P整除，但m不能）**
>   - 哈希值为常数：`sys.hash_info.inf`
> - **负有理数**
>   - 哈希值为正数哈希的相反数：`hash(x) = -hash(-x)`
>   - 特例：如果结果为 `-1`，则替换为 `-2`（避免与 Python 内部特殊哈希冲突）。
> - **正负无穷**
>   - 哈希值分别为：`sys.hash_info.inf` 和 `-sys.hash_info.inf`
> - **复数 z = x + yj**
>   - 哈希值：`hash(z) = hash(x) + sys.hash_info.imag * hash(y)`
>   - 最后模 2^width，确保哈希值在合法区间。
>   - **举例说明**：假设 width=4，则 M=8，范围[-8,7]。如果 hash_value=11（二进制1011）：
>     - 1011 & 0111 = 0011 = 3
>     - 1011 & 1000 = 1000 = 8
>     - 3 - 8 = -5 所以 11 实际代表 -5。
>   - 如果结果为 `-1`，同样替换为 `-2`。
>
> **5. Python 代码实现示例**
>
> ```python
> import sys, math
> 
> def hash_fraction(m, n):
>     """计算有理数 m/n 的哈希值。n 必须为正整数。"""
>     P = sys.hash_info.modulus
>     # 移除 P 的公因数。 （如果 m 和 n 互质则不需要。）
>     while m % P == n % P == 0:
>         m, n = m // P, n // P
>     if n % P == 0:
>         hash_value = sys.hash_info.inf
>     else:
>         hash_value = (abs(m) % P) * pow(n, P - 2, P) % P
>     if m < 0:
>         hash_value = -hash_value
>     if hash_value == -1:
>         hash_value = -2
>     return hash_value
> 
> def hash_float(x):
>     """计算浮点数 x 的哈希值。"""
>     # 如果是“不是数字”（NaN），哈希值是对象本身的哈希值。
>     if math.isnan(x):
>         return object.__hash__(x)
>     elif math.isinf(x):
>         return sys.hash_info.inf if x > 0 else -sys.hash_info.inf
>     else:
>         return hash_fraction(*x.as_integer_ratio())
> 
> def hash_complex(z):
>     """计算复数 z 的哈希值。"""
>     hash_value = hash_float(z.real) + sys.hash_info.imag * hash_float(z.imag)
>     # 把它规范到合法的有符号整数范围，保证不会溢出或出界，符合Python哈希值的规范要求
>     M = 2**(sys.hash_info.width - 1)
>     # 相当于分为大数和小数（11分为8+3）
>     hash_value = (hash_value & (M - 1)) - (hash_value & M)
>     if hash_value == -1:
>         hash_value = -2
>     return hash_value
> ```
>
> **5. 小结**
>
> - Python 的数字类型哈希设计保证了不同数值类型的等价性和高效性。
> - 实现细节依赖于高位质数和模逆原理，能兼容各种数值类型。
> - 复数的哈希是实部和虚部哈希的线性组合，并做范围修正。



#### 8. **布尔类型 (`bool`)**

- 仅有两个实例：`True` 和 `False`。
- 是 `int` 的子类，`True` 为 `1`，`False` 为 `0`，但不建议混用。



#### 9. 迭代器类型（Iterator Types）

**1. 可迭代对象（Iterable）**

- 定义方法：任何想要支持迭代的对象（容器），都必须实现`__iter__()`方法。

  ```python
  class MyContainer:
      def __iter__(self):
          # 返回一个迭代器对象
          ...
  ```

- **作用：**该方法返回一个迭代器对象。

**2. 迭代器协议（Iterator Protocol）**

- 必须实现的方法：

  - `__iter__()`: 返回自身（iterator 本身也是 iterable）。
  - `__next__()`: 返回下一个元素。如果没有元素，抛出 `StopIteration`。

  ```python
  class MyIterator:
      def __iter__(self):  # 必须返回 self
          return self
      def __next__(self):  # 返回下一个元素，或 StopIteration
          ...
  ```

- **行为要求：**一旦 `__next__()` 抛出 `StopIteration`，后续调用也必须持续抛出该异常。

**3. for 循环与 in 语法**

- for 循环、in 运算等，均依赖上述协议自动工作。

**4. 生成器类型（Generator Types）**

- 定义方式：用`yield`语句的函数自动生成一个实现了上述协议的迭代器（即生成器对象）。

  ```python
  def my_gen():
      yield 1
      yield 2
  ```

- **自动实现：**生成器对象自动拥有 `__iter__()` 和 `__next__()`，可直接用于 for、in 等迭代环境中。

**示例代码**

```python
# 手动实现一个迭代器
class CountDown:
    def __init__(self, start):
        self.n = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1

for i in CountDown(3):
    print(i)  # 输出: 3 2 1

# 用生成器实现
def count_down(start):
    while start > 0:
        yield start
        start -= 1

for i in count_down(3):
    print(i)  # 输出: 3 2 1
```

**重点总结**

- **Iterable**: 实现了 `__iter__()`。
- **Iterator**: 实现了 `__iter__()` 和 `__next__()`，且 `__iter__()` 返回 self。
- 生成器（generator）自动实现迭代器协议（即上面两个方法）。
- 一旦 `__next__()` 抛出 `StopIteration`，后续调用依然要抛出该异常。



#### 10. **序列类型**

- **通用操作**：`in`, `+`, `*`, `s[i]`, `s[i:j]`, `len()`, `min()`, `max()` 等。
- **不可变序列**：如 `tuple`，支持哈希（若元素可哈希）。
- **可变序列**：如 `list`，支持 `append()`, `extend()`, `pop()`, `remove()`, `sort()` 等。
- **列表 (`list`)**：可变，同类项集合。
- **元组 (`tuple`)**：不可变，异构数据存储。
- **范围 (`range`)**：不可变数字序列，高效内存使用。



#### 9. **文本序列类型 (`str`)**

- 不可变 Unicode 码位序列。
- 支持索引、切片、拼接等操作。
- 多行字符串可用三重引号。





