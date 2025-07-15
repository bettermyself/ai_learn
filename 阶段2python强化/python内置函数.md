## python内置函数

### 1、数学运算与数字处理

| 函数                        | 描述         | 示例                                | 版本变化           |
| :-------------------------- | :----------- | :---------------------------------- | :----------------- |
| `abs(x)`                    | 返回绝对值   | `abs(-3.5) → 3.5`                   | -                  |
| `divmod(a, b)`              | 返回商和余数 | `divmod(10, 3) → (3, 1)`            | -                  |
| `pow(base, exp[, mod])`     | 幂运算       | `pow(2, 3) → 8`, `pow(2, 3, 5) → 3` | 3.8+支持关键字参数 |
| `round(number[, ndigits])`  | 四舍五入     | `round(3.14159, 2) → 3.14`          | 3.11+优化浮点精度  |
| `sum(iterable, /, start=0)` | 求和         | `sum([1, 2, 3]) → 6`                | 3.8+支持关键字参数 |

> 在 Python 的函数签名中，**斜杠（`/`）**用于表示其左侧的参数只能是**位置参数（positional-only）**，不能使用关键字参数形式传递。
>
> 具体到 `sum(iterable, /, start=0)` 这个例子：
>
> - **`iterable`** 是位置参数，必须放在第一位，且不能以 `iterable=...` 的形式传递。
>   - ✅ 正确用法：`sum([1, 2, 3])`
>   - ❌ 错误用法：`sum(iterable=[1, 2, 3])`（会报错）
> - **`start`** 在 `/` 右侧，可以是位置参数或关键字参数。
>   - ✅ 两种都合法：
>     `sum([1, 2, 3], 10)`（位置参数）
>     `sum([1, 2, 3], start=10)`（关键字参数）
>
> **为什么用 `/`？**
>
> 这是 Python 3.8+ 的语法，明确限制参数的传递方式。对于 `sum()` 函数，设计者可能希望保持 `iterable` 参数的简洁性（避免显式命名），同时允许 `start` 参数更灵活。



### 2、类型转换

| 函数                                    | 描述           | 示例                                 | 版本变化          |
| :-------------------------------------- | :------------- | :----------------------------------- | :---------------- |
| `ascii(obj)`                            | 完全ASCII表示  | `ascii('中文') → "'\\u4e2d\\u6587'"` | -                 |
| `bin(x)`                                | 二进制字符串   | `bin(3) → '0b11'`                    | -                 |
| `oct(x)`                                | 八进制字符串   | `oct(8) → '0o10'`                    | -                 |
| `hex(x)`                                | 十六进制字符串 | `hex(255) → '0xff'`                  | -                 |
| `bytes([source[, encoding[, errors]]])` | 字节序列       | `bytes('中文', 'utf-8')`             | -                 |
| `bool([x])`                             | 布尔转换       | `bool(0) → False`                    | 3.7+位置参数      |
| `chr(i)`                                | Unicode字符    | `chr(97) → 'a'`                      | -                 |
| `ord(c)`                                | Unicode码位    | `ord('a') → 97`                      | -                 |
| `int(x[, base])`                        | 整数           | `int('10', 2) → 2`                   | 3.7+位置参数      |
| `float(x)`                              | 浮点数         | `float('3.14') → 3.14`               | 3.7+位置参数      |
| `str(object='')`                        | 字符串         | `str(100) → '100'`                   | -                 |
| `complex([real[, imag]])`               | 复数           | `complex('1+2j') → (1+2j)`           | 3.8+支持__index__ |

> **ASCII 和 Unicode 的区别与联系**
>
> **1. ASCII（American Standard Code for Information Interchange）**
>
> - **范围**：仅支持 **128 个字符**（7 位二进制，0~127）。
> - **包含内容**：
>   - 英文字母（大小写）`A-Z, a-z`
>   - 数字 `0-9`
>   - 标点符号 `!@#$%^&*()` 等
>   - 控制字符（如换行 `\n`、制表符 `\t`）
> - **局限性**：
>   - 无法表示其他语言的文字（如中文、日文、阿拉伯文等）。
>   - 仅适用于英语环境。
>
> 
>
> **2. Unicode（统一码）**
>
> - **范围**：支持 **超过 14 万个字符**（目前版本 15.1），涵盖几乎所有语言的文字和符号。
> - **特点**：
>   - 包含 ASCII（0~127 与 ASCII 完全一致）。
>   - 支持 **中文、日文、韩文、阿拉伯文、表情符号（😊）** 等。
>   - 采用 **码点（Code Point）** 表示字符，如 `U+4F60` 表示汉字 `你`。
> - **编码方式**：
>   - **UTF-8**（可变长度，兼容 ASCII，互联网最常用）
>   - **UTF-16**（2 或 4 字节）
>   - **UTF-32**（固定 4 字节）
>
> 
>
> **3. 关键区别**
>
> | 特性         | ASCII               | Unicode                     |
> | :----------- | :------------------ | :-------------------------- |
> | **字符范围** | 128 个（0~127）     | 超过 14 万个（持续扩展）    |
> | **存储方式** | 固定 1 字节（8 位） | 可变长度（UTF-8: 1~4 字节） |
> | **适用场景** | 仅英语              | 全球所有语言                |
> | **兼容性**   | Unicode 包含 ASCII  | ASCII 是 Unicode 的子集     |
>
> 
>
> **4. Python 中的 ASCII 和 Unicode**
>
> 1. **Python 3 默认使用 Unicode**：
>
>    - 所有字符串（`str`）都是 Unicode。
>
>    - 直接支持多语言：
>
>      ```python
>      s = "你好 Hello 😊"  # 合法（Unicode）
>      ```
>
> 2. **`ascii()` 函数的作用**：
>
>    - 将非 ASCII 字符转义为 `\x`、`\u` 或 `\U` 形式：
>
>      ```python
>      print(ascii("你好"))  # 输出: '\u4f60\u597d'
>      ```
>
> 3. **编码与解码（Bytes vs Unicode）**：
>
>    - **`encode()`**：Unicode → Bytes（如 UTF-8）
>
>      ```python
>      "你好".encode("utf-8")  # b'\xe4\xbd\xa0\xe5\xa5\xbd'
>      ```
>
>    - **`decode()`**：Bytes → Unicode
>
>      ```python
>      b'\xe4\xbd\xa0\xe5\xa5\xbd'.decode("utf-8")  # "你好"
>      ```
>
> 
>
> **5. 为什么需要 Unicode？**
>
> - ASCII 只能表示英语，而 Unicode 支持全球语言。
> - 现代应用（如网页、移动端）必须处理多语言文本。
> - 避免乱码（如中文文件在英文系统中显示为 `????`）。



### 3、迭代与序列处理

| 函数                                           | 描述       | 示例                                              | 版本变化        |
| :--------------------------------------------- | :--------- | :------------------------------------------------ | :-------------- |
| `all(iterable)`                                | 全真检测   | `all([1, 2, 3]) → True`                           | -               |
| `any(iterable)`                                | 任一真检测 | `any([0, 1, 0]) → True`                           | -               |
| `enumerate(iterable, start=0)`                 | 枚举迭代   | `list(enumerate(['a', 'b'])) → [(0,'a'),(1,'b')]` | -               |
| `filter(function, iterable)`                   | 过滤       | `list(filter(lambda x: x>0, [-1, 2]))`            | -               |
| `iter(object[, sentinel])`                     | 创建迭代器 | `iter([1, 2, 3])`                                 | `next(i)`       |
| `len(s)`                                       | 长度       | `len('abc') → 3`                                  | -               |
| `map(function, iterable, ...)`                 | 映射       | `list(map(str.upper, ['a', 'b']))`                | -               |
| `max(iterable, *[, key, default])`             | 最大值     | `max([1, 3, 2]) → 3`                              | 3.4+default参数 |
| `min(iterable, *[, key, default])`             | 最小值     | `min([1, 3, 2]) → 1`                              | 3.4+default参数 |
| `range(stop)` `range(start, stop[, step])`     | 范围序列   | `list(range(3)) → [0, 1, 2]`                      | -               |
| `reversed(seq)`                                | 反向迭代   | `list(reversed([1, 2, 3]))`                       | -               |
| `sorted(iterable, *, key=None, reverse=False)` | 排序       | `sorted([3, 1, 2]) → [1, 2, 3]`                   | -               |
| `zip(*iterables, strict=False)`                | 并行迭代   | `list(zip([1, 2], ['a', 'b']))`                   |                 |

> 在 Python 中，**可迭代对象（Iterable）** 是指任何可以被 `for` 循环遍历的对象，或者可以传递给 `iter()` 函数并返回一个 **迭代器（Iterator）** 的对象。可迭代对象的核心特征是实现了 `__iter__()` 方法（或 `__getitem__()` 方法，旧式兼容）。
>
> **Python 中常见的可迭代对象**
>
> **1. 基本可迭代类型**
>
> | 类型        | 示例               | 说明                 |
> | :---------- | :----------------- | :------------------- |
> | **`list`**  | `[1, 2, 3]`        | 列表                 |
> | **`tuple`** | `(1, 2, 3)`        | 元组                 |
> | **`str`**   | `"hello"`          | 字符串（按字符遍历） |
> | **`dict`**  | `{"a": 1, "b": 2}` | 字典（默认遍历键）   |
> | **`set`**   | `{1, 2, 3}`        | 集合                 |
> | **`range`** | `range(5)`         | 范围对象（惰性生成） |
>
> **总结**
>
> - **可迭代对象**：能用 `for` 循环遍历的（如列表、字符串、字典、生成器等）。
> - **关键方法**：实现 `__iter__()` 或 `__getitem__()`。
> - **工具函数**：`iter(obj)` 可将可迭代对象转为迭代器。
> - **验证方法**：`isinstance(obj, Iterable)`。
>
> ---
>
> 在 Python 的函数定义中，`*` 是一个特殊符号，用于分隔 **位置参数（positional arguments）** 和 **仅关键字参数（keyword-only arguments）**。
>
> 在 `max(iterable, *[, key, default])` 这个函数签名中：
>
> - `iterable` 是一个 **位置参数**（必须传入）。
> - `*` 后面的参数（`key` 和 `default`）是 **仅关键字参数**，必须显式使用参数名传递，不能以位置参数形式传递。
>
> **`\*` 的作用**
>
> - **强制 `key` 和 `default` 必须用关键字传递**
>
>   - ✅ 正确用法：
>
>     ```python
>     max([1, 2, 3], key=lambda x: -x)  # 使用 key=...
>     max([], default=0)                 # 使用 default=...
>     ```
>
>   - ❌ 错误用法：
>
>     ```python
>     max([1, 2, 3], lambda x: -x)  # TypeError: max() 不允许 key 作为位置参数
>     ```
>
> - **`\*` 本身不接收任何参数**
>
>   - 它只是一个语法标记，表示后面的参数必须用关键字传递。
>
> **为什么这样设计？**
>
> - **提高可读性**：`key` 和 `default` 是可选参数，显式命名让代码更清晰。
> - **避免歧义**：如果允许 `key` 作为位置参数，可能会与 `iterable` 的其他用法混淆。
>
> ---
>
> `max()` 是 Python 的内置函数，用于返回一个 **可迭代对象（iterable）** 中的 **最大值**。它的完整语法如下：
>
> ```python
> max(iterable, *[, key, default])
> ```
>
> 其中：
>
> - `iterable`：必需参数，传入一个可迭代对象（如列表、元组、集合等）。
> - `key`（可选）：指定一个函数来定制最大值判断的标准。
> - `default`（可选）：如果 `iterable` 为空，返回的默认值（避免 `ValueError`）。
>
> ```python
> words = ['apple', 'banana', 'cherry', 'date']
> longest_word = max(words, key=lambda word: len(word))
> print(longest_word)  # 输出: 'banana'
> ```
>
> ---
>
> `zip()` 是 Python 的内置函数，用于将 **多个可迭代对象** 的元素按位置打包成一个个元组（tuple），最终返回一个迭代器（zip 对象）。它的完整语法如下：
>
> ```python
> zip(*iterables, strict=False)
> ```
>
> 其中：
>
> - `*iterables`：一个或多个可迭代对象（如列表、元组、字符串等）。
> - `strict`（可选，Python 3.10+ 新增）：如果设为 `True`，当输入的可迭代对象长度不一致时抛出 `ValueError`（默认 `False`，按最短的可迭代对象截断）。



### 4、对象操作与反射

| 函数                                     | 描述         | 示例                          | 版本变化       |
| :--------------------------------------- | :----------- | :---------------------------- | :------------- |
| `callable(object)`                       | 可调用检查   | `callable(str) → True`        | 3.2重新引入    |
| `delattr(object, name)`                  | 删除属性     | `delattr(obj, 'attr')`        | -              |
| `dir([object])`                          | 属性列表     | `dir([])`                     | -              |
| `getattr(object, name[, default])`       | 获取属性     | `getattr(str, 'upper')`       | -              |
| `hasattr(object, name)`                  | 属性检查     | `hasattr([], 'append')`       | -              |
| `hash(object)`                           | 哈希值       | `hash('abc')`                 | -              |
| `id(object)`                             | 对象标识     | `id([])`                      | -              |
| `isinstance(object, classinfo)`          | 实例检查     | `isinstance(1, int)`          | 3.10+支持Union |
| `issubclass(class, classinfo)`           | 子类检查     | `issubclass(bool, int)`       | 3.10+支持Union |
| `memoryview(object)`                     | 内存视图     | `memoryview(b'abc')`          | -              |
| `setattr(object, name, value)`           | 设置属性     | `setattr(obj, 'attr', value)` | -              |
| `vars([object])`                         | __dict__属性 | `vars()`                      | 3.13行为变更   |
| `type(object)` `type(name, bases, dict)` | 类型/创建类  | `type('X', (), {})`           | 3.6+单参数限制 |

> `callable()` 函数用于检查一个对象是否可以被调用（即是否是可调用对象）。
>
> 常见的可调用对象包括：
>
> - 普通函数
> - 方法（如类的实例方法、静态方法、类方法）
> - 类（调用类会创建实例）
> - 实现了 `__call__`  方法的对象（自定义可调用对象）
>
> ---
>
> 在 Python 中，`hash(object)` 是一个内置函数，用于返回对象的哈希值（**整数**）。哈希值通常用于字典、集合等需要快速查找的地方。其基本用法和原理如下：
>
> **用法说明**
>
> ```python
> hash(object)
> ```
>
> - **object**：可以是不可变类型（如字符串、整数、元组等），可变类型（如列表、字典）不可哈希。
> - 返回一个整数，代表对象的哈希值。
>
> **例子**
>
> ```python
> print(hash("hello"))   # 输出一个整数，比如 -1543724287
> print(hash(123))       # 输出 123
> print(hash((1, 2, 3))) # 输出一个整数
> ```
>
> 如果尝试对可变类型（如列表）使用 hash，会报错：
>
> ```python
> print(hash([1, 2, 3])) # TypeError: unhashable type: 'list'
> ```
>
> **应用场景**
>
> - 用作字典的键（dict key）或集合的元素（set item）。
> - 判断对象内容是否发生变化（不可变对象哈希值不变）。
> - 用于数据结构的快速查找和去重。
>
> **原理**
>
> 哈希值是通过对象的内容根据一定算法计算出来的一个整数。不可变对象（如字符串、整数、元组）能保证哈希值的稳定性，可变对象因为内容可变，不能作为 hashable 对象。
>
> ---
>
> 在 Python 中，`id(object)` 是一个内置函数，用于返回对象的“唯一身份标识符”，其实就是对象在内存中的地址（以整数形式表示）
>
> **用法说明**
>
> ```python
> id(object)
> ```
>
> - **object**：任何 Python 对象。
> - 返回该对象的唯一整数标识（通常是内存地址，但具体实现依赖于 Python 解释器）。
>
> **例子**
>
> ```Python
> a = [1, 2, 3]
> b = a
> print(id(a))  # 输出一个整数，比如 139832234326480
> print(id(b))  # 输出同样的整数，因为 b 和 a 指向同一个对象
> 
> c = [1, 2, 3]
> print(id(c))  # 输出不同的整数，因为 c 是另一个对象
> ```
>
> **应用场景**
>
> - 判断两个变量是否引用同一个对象（可以用 `is` 关键字，但底层就是比对 id）。
> - 调试时跟踪对象的生命周期和引用关系。
>
> **注意事项**
>
> - 同一个对象在其生命周期内 id 不变。
> - 不同对象即使内容相同，id 也不同（除非被解释器优化）。
> - 在 CPython（最常用的 Python 解释器）里，`id` 通常就是对象的内存地址。
>
> **总结**：
> `id(object)` 返回对象的唯一标识符（通常为内存地址），可用于判断对象是否为同一个实例。
>
> ---
>
> 在 Python 中，`memoryview(object)` 是一个内置函数，用于创建一个“内存视图”对象，这让你可以在不复制数据的情况下操作原始数据缓冲区，特别适用于大数据处理和高效的二进制数据访问。
>
> **用法说明**
>
> ```Python
> memoryview(object)
> ```
>
> - **object**：必须是支持缓冲区协议的对象，比如 `bytes`, `bytearray`, 或其他二进制数据类型（如 `array.array`）。
> - 返回一个 `memoryview` 对象，可以在不复制数据的情况下读取和修改原始数据。
>
> **举例**
>
> ```python
> data = bytearray(b'hello')
> mv = memoryview(data)
> print(mv[0])        # 输出: 104 (h 的 ASCII)
> mv[0] = 72
> print(data)         # 输出: b'Hello'（原数据已被修改）
> ```
>
> **应用场景**
>
> - **高效处理二进制数据**：无需复制数据即可进行切片、读取和修改。
> - **与 C/C++ 代码交互**：在需要直接操作内存数据时（如 NumPy 或其他底层库）。
> - **大文件或流处理**：避免内存拷贝带来的性能损耗。
>
> **注意事项**
>
> - 只能用于支持“缓冲区协议”的对象（如 bytes、bytearray、array、numpy 等）。
> - 不能直接用于字符串（str 类型），要先转换成 bytes。
>
> **总结**
>
> `memoryview(object)` 提供了一种高效、安全的方式来访问和操作底层二进制数据，适合需要直接处理内存数据的场景。
>
> ---
>
> 在 Python 中，`vars([object])` 是一个内置函数，用于返回对象的 `__dict__` 属性（即对象的属性字典）。它常用于查看一个对象（尤其是自定义类实例）当前的所有属性和对应的值。
>
> **用法说明**
>
> ```python
> vars([object])
> ```
>
> - **object**：通常是自定义类的实例。如果不传参数，则返回当前本地作用域的变量字典（等同于 `locals()`）。
> - 返回一个字典，包含对象的属性和值。
>
> **例子**
>
> ```python
> class Person:
>     def __init__(self, name, age):
>         self.name = name
>         self.age = age
> 
> p = Person("Tom", 22)
> print(vars(p))  # 输出: {'name': 'Tom', 'age': 22}
> ```
>
> 如果对内置类型（如 int、list）使用，通常会报错，因为它们没有 `__dict__` 属性。
>
> ```python
> print(vars(123))        # TypeError: vars() argument must have __dict__ attribute
> ```
>
> **不带参数用法**
>
> 不传参数时，`vars()` 等同于 `locals()`，返回当前作用域的变量字典：
>
> ```python
> a = 10
> b = 20
> print(vars())  # 输出类似: {'a': 10, 'b': 20, ...}
> ```
>
> **总结**
>
> - `vars(object)` 用于获取对象的属性字典，便于调试或动态访问属性。
> - 只适用于有 `__dict__` 属性的对象（通常是自定义类实例）。
> - 不带参数时，返回当前作用域的变量字典。
>
> ---
>
> 在 Python 中，`type(name, bases, dict)` 是一种**动态创建类**的高级用法。它是 `type` 的三参数形式，允许你在运行时创建一个新的类对象。
>
> **用法说明**
>
> ```python
> type(name, bases, dict)
> ```
>
> - **name**：类名（字符串类型）。
> - **bases**：基类元组（如 `(object,)`），指定新类的父类。
> - **dict**：包含方法和属性的字典。
>
> **例子**
>
> ```Python
> # 动态创建一个类
> MyClass = type("MyClass", (object,), {"x": 5, "hello": lambda self: print("hi")})
> 
> obj = MyClass()
> print(obj.x)        # 输出 5
> obj.hello()         # 输出 hi
> ```
>
> 等价于：
>
> ```python
> class MyClass(object):
>     x = 5
>     def hello(self):
>         print("hi")
> ```
>
> **应用场景**
>
> - 元编程：在运行时动态生成类（如 ORM、框架等）。
> - 动态属性和方法注入。
> - 创建工厂类。
>
> **总结**
>
> `type(name, bases, dict)` 是 Python 元编程的重要工具，可以用来动态创建类。常用于高级开发场景，比如自动生成类、动态扩展等。



### 5、输入输出与系统交互

| 函数                            | 描述     | 示例                   | 版本变化       |
| :------------------------------ | :------- | :--------------------- | :------------- |
| `breakpoint(*args, **kws)`      | 调试断点 | `breakpoint()`         | 3.7+新增       |
| `input([prompt])`               | 用户输入 | `input('Name: ')`      | -              |
| `open(file, mode='r', ...)`     | 文件操作 | `open('file.txt')`     | 3.3+opener参数 |
| `print(*objects, sep=' ', ...)` | 打印输出 | `print(1, 2, sep=',')` | 3.3+flush参数  |

> 在 Python 中，`breakpoint(*args, **kws)` 是用于**设置调试断点**的内置函数。它会启动调试器，让你可以在代码运行时进行交互式调试。
>
> **用法说明**
>
> ```python
> breakpoint(*args, **kws)
> ```
>
> - **args / kws**：通常不用传递参数，默认即可，参数会被传递给指定的调试器。
>
> **作用**
>
> - 当程序运行到 `breakpoint()` 这一行时，会自动进入调试模式（默认是内置的 `pdb` 调试器）。
> - 可以在此处暂停程序、检查变量、单步执行等。
>
> **例子**
>
> ```Python
> a = 10
> breakpoint()      # 程序会在这里暂停，进入调试模式
> print(a)
> ```
>
> 运行到 `breakpoint()` 时，命令行会出现调试器提示符（如 `(Pdb)`），你可以输入 p、c、n 等命令进行调试。
>
> **环境变量影响**
>
> - 可通过环境变量 `PYTHONBREAKPOINT` 指定不同的调试器（如 `PYTHONBREAKPOINT=0` 禁用断点，或指定其他调试器模块）。
>
> **与旧用法区别**
>
> - 旧版本 Python 用的是 `import pdb; pdb.set_trace()`，而 `breakpoint()` 是从 Python 3.7 开始推荐的新方式，更简洁且可以配置。
>
> 总结
>
> `breakpoint()` 用于设置调试断点，程序执行到此会进入交互式调试器，是 Python 推荐的现代调试入口。



### 6、代码编译与执行

| 函数                       | 描述       | 示例                              | 版本变化                       |
| :------------------------- | :--------- | :-------------------------------- | :----------------------------- |
| `compile(source, ...)`     | 编译代码   | `compile('print(1)', '', 'exec')` | 3.8+PyCF_ALLOW_TOP_LEVEL_AWAIT |
| `eval(expression, /, ...)` | 执行表达式 | `eval('1 + 1') → 2`               | 3.13+参数变更                  |
| `exec(object, /, ...)`     | 执行代码   | `exec('x = 1 + 1')`               | 3.11+closure参数               |
| `__import__(name, ...)`    | 导入实现   | `__import__('math')`              | 3.3+level限制                  |

> 在 Python 中，`compile(source, filename, mode, ...)` 是一个内置函数，用于将字符串形式的代码编译为代码对象（可由 `exec()` 或 `eval()` 执行）。它常用于动态执行代码的高级场景。
>
> **基本语法**
>
> ```python
> compile(source, filename, mode[, flags[, dont_inherit[, optimize]]])
> ```
>
> - **source**：要编译的代码，可以是字符串、AST对象或字节码。
> - **filename**：代码文件名（字符串，通常用于错误提示，可随意填）。
> - mode：指定代码类型：
>   - `'exec'`：可以是多行语句（比如完整的 Python 文件）。
>   - `'eval'`：只能是单个表达式。
>   - `'single'`：单行语句（交互式命令行用）。
> - **flags, dont_inherit, optimize**：高级参数，通常用不到，控制编译细节。
>
> **例子**
>
> ```python
> code_str = "a = 5\nprint(a)"
> code_obj = compile(code_str, "<string>", "exec")
> exec(code_obj)  # 输出: 5
> 
> expr = "1 + 2"
> code_obj2 = compile(expr, "<string>", "eval")
> print(eval(code_obj2))  # 输出: 3
> ```
>
> **应用场景**
>
> - 动态代码执行（如脚本引擎、在线代码判题等）。
> - 代码安全分析与沙盒环境。
> - 高级元编程。
>
> **总结**
>
> `compile(source, filename, mode)` 可以把字符串、表达式等动态编译成可执行的代码对象，是 Python 动态性和元编程的重要工具。
>
> ---
>
> 在 Python 中，`eval()` 和 `exec()` 都是执行字符串代码的内置函数，但它们**用途和功能不同**：
>
> **`eval(expression, globals=None, locals=None)`**
>
> - **作用**：只执行**单个表达式**，并返回结果。
> - 参数：
>   - `expression`：字符串形式的表达式（如 `"1 + 2"`）。
>   - `globals`, `locals`：可选的全局和局部命名空间。
> - **返回值**：表达式的计算结果。
>
> **示例**：
>
> ```python
> result = eval("1 + 2")    # 返回 3
> print(eval("sum([1,2,3])"))  # 返回 6
> ```
>
> **`exec(object, globals=None, locals=None)`**
>
> - **作用**：执行**一段代码**（可包含多条语句），**不返回结果**。
> - 参数：
>   - `object`：字符串形式的代码（如 `"a = 5\nprint(a)"`）。
>   - `globals`, `locals`：可选的全局和局部命名空间。
> - **返回值**：始终为 `None`。
>
> **示例**：
>
> ```python
> exec("a = 5\nprint(a)")   # 输出 5
> # 执行后 a 变量会被创建
> ```
>
> **主要区别总结**
>
> | 特点         | eval()           | exec()                              |
> | ------------ | ---------------- | ----------------------------------- |
> | 作用范围     | 单个表达式       | 多条语句（完整代码块）              |
> | 是否有返回值 | 有（表达式结果） | 无（总是返回 None）                 |
> | 常见用途     | 计算表达式       | 执行脚本、动态代码                  |
> | 示例         | eval("3*4+2")    | exec("for i in range(3): print(i)") |
>
> **简要记忆**：
>
> - `eval` 用于“求值”，只能计算表达式并返回结果；
> - `exec` 用于“执行”，能运行多条语句但不会返回结果。
>
> ---
>
> `__import__(name, ...)` 是 Python 的一个内置函数，用于动态导入模块。它通常在底层由 `import` 语句自动调用，但你也可以直接使用它来实现更灵活的模块导入方式，尤其在需要根据字符串变量导入模块时很有用。
>
> **语法：**
>
> ```python
> __import__(name, globals=None, locals=None, fromlist=(), level=0)
> ```
>
> - **name**：要导入的模块名（字符串类型），如 `"os"`、`"sys"`。
> - **globals** 和 **locals**：一般用于指定当前的全局和局部命名空间，通常不用管，直接写 `None`。
> - **fromlist**：如果你只需要模块中的某些子模块或属性，可以在这里列出；否则返回的是顶层模块。
> - **level**：指定导入的层级，0 代表绝对导入，1 或更高代表相对导入。
>
> **基本用法：**
>
> ```python
> mod = __import__('math')
> print(mod.sqrt(16))  # 输出 4.0
> ```
>
> **带 fromlist 的用法：**
>
> ```python
> mod = __import__('os', fromlist=['path'])
> print(mod.path)  # 输出 <module 'posixpath' ...>
> ```
>
> 如果 fromlist 为空，则只返回顶层模块（如 `os`），否则会返回具体的子模块（如 `os.path`）。
>
> **注意事项：**
>
> - 一般情况下直接用 `import` 语句更简洁易读。
> - `__import__` 适合在需要动态按字符串导入模块时使用，比如插件系统或反射场景。
> - 若不了解其细节，建议谨慎使用。



### 7、装饰器与类工具

| 函数                       | 描述           | 示例            | 版本变化      |
| :------------------------- | :------------- | :-------------- | :------------ |
| `classmethod(function)`    | 类方法装饰器   | `@classmethod`  | 3.10+属性继承 |
| `property(fget=None, ...)` | 属性装饰器     | `@property`     | 3.5+文档可写  |
| `staticmethod(function)`   | 静态方法装饰器 | `@staticmethod` | 3.10+属性继承 |

> `classmethod(function)` 是 Python 的一个内置装饰器，用来把一个方法定义为**类方法**。类方法的第一个参数是类本身（通常命名为 `cls`），而不是实例（通常为 `self`）。这意味着类方法可以通过类或者实例来调用，但它操作的是类对象而不是实例对象。
>
> **用法示例**
>
> ```python
> class MyClass:
>     @classmethod
>     def my_method(cls, arg):
>         print(f"类: {cls.__name__}, 参数: {arg}")
> 
> # 通过类调用
> MyClass.my_method("hello")  # 输出: 类: MyClass, 参数: hello
> 
> # 通过实例调用
> obj = MyClass()
> obj.my_method("world")      # 输出: 类: MyClass, 参数: world
> ```
>
> **主要特点**
>
> - **第一个参数为类对象**（`cls`），不是实例对象（`self`）。
> - 可以通过类或实例调用，但无论怎样，操作的是类本身。
> - 常用于**工厂方法**等场景，比如根据不同参数创建实例。
>
> **与 `staticmethod`、实例方法区别**
>
> - 实例方法：第一个参数为 `self`，只能由实例调用，操作实例数据。
> - 类方法：第一个参数为 `cls`，可由类和实例调用，操作类数据。
> - 静态方法（`@staticmethod`）：无特殊第一个参数，和普通函数类似，只是放在类的命名空间里。
>
> **结论**
>
> `classmethod(function)` 可以让你定义与类相关但不依赖于实例的数据和逻辑的方法。常用于工厂方法、修改类属性等需要访问类对象的场景。
>
> ---
>
> `property(fget=None, fset=None, fdel=None, doc=None)` 是 Python 的一个内置类，用于**创建属性**，可以让你把方法变成类的属性来访问，实现**getter/setter**等功能。
>
> 它通常用于在类中定义属性，使得访问和设置属性时可以调用自定义方法，而不是直接操作数据成员。这是实现**封装**的一种方式。
>
> **参数说明**
>
> - **fget**：获取属性值的函数（getter）。
> - **fset**：设置属性值的函数（setter）。
> - **fdel**：删除属性值的函数（deleter）。
> - **doc**：属性的文档字符串。
>
> **基本用法**
>
> ```Python
> class MyClass:
>     def __init__(self, value):
>         self._value = value
> 
>     def get_value(self):
>         return self._value
> 
>     def set_value(self, val):
>         self._value = val
> 
>     def del_value(self):
>         del self._value
> 
>     value = property(get_value, set_value, del_value, "这是value的说明文档")
> ```
>
> 这样，`value` 就变成了一个属性，可以像属性一样访问和设置：
>
> ```python
> obj = MyClass(10)
> print(obj.value)     # 调用 get_value，输出 10
> obj.value = 20       # 调用 set_value
> del obj.value        # 调用 del_value
> print(MyClass.value.__doc__)  # 输出: 这是value的说明文档
> ```
>
> **推荐方式**
>
> 在现代 Python 中，更推荐使用装饰器语法：
>
> ```python
> class MyClass:
>     def __init__(self, value):
>         self._value = value
> 
>     @property
>     def value(self):
>         "这是value的说明文档"
>         return self._value
> 
>     @value.setter
>     def value(self, val):
>         self._value = val
> 
>     @value.deleter
>     def value(self):
>         del self._value
> ```
>
> **总结**
>
> - `property()` 能把方法变成属性来进行访问。
> - 支持只读属性（只传 fget），或者可读写/可删除（传 fset/fdel）。
> - 推荐使用装饰器语法，更简洁易懂。
>
> ---
>
> `staticmethod(function)` 是 Python 的一个内置装饰器，用于定义**静态方法**。静态方法属于类，但**不需要访问类本身（没有 `cls` 参数）或实例（没有 `self` 参数）**。它本质上和普通函数一样，只是被放在了类的命名空间下，便于组织和调用。
>
> **用法示例**
>
> ```python
> class MyClass:
>     @staticmethod
>     def greet(name):
>         return f"Hello, {name}!"
> 
> # 通过类调用
> print(MyClass.greet("World"))  # 输出: Hello, World!
> 
> # 通过实例调用
> obj = MyClass()
> print(obj.greet("Alice"))      # 输出: Hello, Alice!
> ```
>
> **主要特点**
>
> - 没有 `self` 或 `cls` 参数，不访问类或实例的属性和方法。
> - 可以通过类或者实例来调用，但没有任何自动的数据绑定。
> - 常用于功能性、工具性的方法，这些方法和类/实例状态无关。
>
> **与 `classmethod`、实例方法区别**
>
> - **实例方法**：第一个参数为 `self`，可以访问实例属性和方法。
> - **类方法**：第一个参数为 `cls`，可以访问类属性和方法。
> - **静态方法**：无特殊第一个参数，不能访问类或实例信息。
>
> **总结**
>
> `staticmethod(function)` 让你可以在类中定义与类逻辑相关但不依赖于类或实例状态的方法，适合工具函数、算法等用途。	



### 8、容器构造函数

| 函数                                                         | 描述       | 示例                          | 版本变化    |
| :----------------------------------------------------------- | :--------- | :---------------------------- | :---------- |
| `dict(**kwarg)` `dict(mapping, **kwarg)` `dict(iterable, **kwarg)` | 字典构造   | `dict(a=1, b=2)`              | -           |
| `frozenset([iterable])`                                      | 不可变集合 | `frozenset([1, 2])`           | -           |
| `list([iterable])`                                           | 列表构造   | `list('abc') → ['a','b','c']` | -           |
| `object()`                                                   | 基类实例   | `object()`                    | -           |
| `set([iterable])`                                            | 可变集合   | `set([1, 2])`                 | -           |
| `slice(stop)` `slice(start, stop[, step])`                   | 切片对象   | `slice(1, 10, 2)`             | 3.12+可哈希 |
| `tuple([iterable])`                                          | 元组构造   | `tuple('abc')`                | -           |

> 下面是对 `dict(**kwarg)`、`dict(mapping, **kwarg)`、`dict(iterable, **kwarg)` 的解释：
>
> **`dict(**kwarg)`**
>
> - 创建一个字典，参数以**关键字参数**形式传递。
> - `kwarg` 是键值对，例如：`dict(a=1, b=2)` 等价于 `{'a': 1, 'b': 2}`。
>
> **示例：**
>
> ```python
> d = dict(a=1, b=2)
> print(d)   # 输出: {'a': 1, 'b': 2}
> ```
>
> **`dict(mapping, **kwarg)`**
>
> - `mapping` 是一个字典或**实现了键值对访问接口的对象**（如 `dict`、`UserDict` 等）。
> - `**kwarg` 额外的关键字参数，会被添加到结果字典里。如果有重复键，`kwarg` 会覆盖 `mapping` 中的值。
>
> **示例：**
>
> ```python
> d1 = {'x': 10, 'y': 20}
> d2 = dict(d1, y=99, z=5)
> print(d2)  # 输出: {'x': 10, 'y': 99, 'z': 5}
> ```
>
> **`dict(iterable, **kwarg)`**
>
> - `iterable` 是一个**可迭代对象**，每个元素必须是**长度为2的容器**（比如元组或列表），第一个元素为键，第二个为值。
> - `**kwarg` 额外的关键字参数，也会被添加到字典里。
>
> **示例：**
>
> ```python
> pairs = [('a', 1), ('b', 2)]
> d = dict(pairs, b=22, c=33)
> print(d)   # 输出: {'a': 1, 'b': 22, 'c': 33}
> ```
>
> **总结**
>
> - `dict(**kwarg)`：只用关键字参数创建字典。
> - `dict(mapping, **kwarg)`：先用映射对象创建字典，再加关键字参数（后者覆盖同名键）。
> - `dict(iterable, **kwarg)`：用可迭代对象创建字典，再加关键字参数（后者覆盖同名键）。
>
> **扩展：**
> `dict()` 是 Python 创建字典的标准方式，支持多种初始化方式，灵活构建字典对象。
>
> ---
>
> `frozenset([iterable])` 是 Python 内置的数据类型，用于创建一个**不可变的集合**（即 frozenset）。它和普通的 set 非常类似，但 frozenset 一旦创建，其内容不能再修改（不能添加或删除元素），因此可以作为字典的 key 或放入其他 set 中。
>
> **语法**
>
> ```python
> frozenset([iterable])
> ```
>
> - **iterable**：可迭代对象，如列表、元组、字符串、set 等。可以省略，省略时返回一个空的 frozenset。
>
> **主要特点**
>
> - **不可变**：创建后不能修改内容（不能 add/remove）。
> - **去重**：同 set，会自动去除重复元素。
> - **可哈希**：可以作为 dict 的 key 或其它 set 的元素。
>
> **示例代码**
>
> ```python
> # 从列表创建
> fs = frozenset([1, 2, 3, 2])
> print(fs)  # 输出: frozenset({1, 2, 3})
> 
> # 空 frozenset
> empty_fs = frozenset()
> print(empty_fs)  # 输出: frozenset()
> 
> # 可以作为字典的 key
> d = {frozenset([1, 2]): "value"}
> print(d)  # 输出: {frozenset({1, 2}): 'value'}
> ```
>
> **常见用途**
>
> - 用于需要不可变集合的场景
> - 作为字典的键或 set 的元素
>
> ---
>
> `object()` 是 Python 内置的一个类，几乎所有类都是从 `object` 继承的。它是所有新式类的基类，也是 Python 中最基础的对象类型。
>
> **语法**
>
> ```python
> obj = object()
> ```
>
> **主要作用**
>
> - 创建一个空对象实例（没有属性和方法）。
> - 常作为占位符或用于实现不可变对象。
> - 是所有类默认的基类（如果没有显式继承其它类，自动继承自 object）。
>
> **特点**
>
> - 创建的对象没有任何属性和方法（除了默认的）。
> - 不能向该对象添加属性（因为没有 `__dict__`）。
> - 主要用于继承体系和类型判断。
>
> **示例**
>
> ```python
> a = object()
> b = object()
> print(a == b)     # False，不同实例
> print(isinstance(a, object))  # True
> 
> # 不能添加属性
> a.x = 1   # AttributeError: 'object' object has no attribute 'x'
> ```
>
> **常见用法**
>
> - 作为单例哨兵对象（比如默认值占位符）：
>
>   ```python
>   _sentinel = object()
>   def func(x=_sentinel):
>       if x is _sentinel:
>           print("未传入参数")
>   ```
>
> - 继承体系：
>
>   ```python
>   class MyClass(object):
>       pass
>   ```
>
> **总结**
>
> `object()` 是 Python 中所有类的基类，用于创建最简单的对象实例，常用于继承和哨兵标记。
>
> ---
>
> `set([iterable])` 是 Python 的一个内置数据类型，用于创建一个**可变集合**对象。集合（set）是一种无序、元素唯一的数据结构，适用于去重、集合运算等场景。
>
> **语法**
>
> ```python
> set([iterable])
> ```
>
> - **iterable**：可迭代对象（如列表、元组、字符串、字典、集合等）。省略时返回一个空集合。
>
> **功能说明**
>
> - 自动去重：集合中的元素不会重复。
> - 可变：可以添加、移除元素。
> - 无序：元素没有固定顺序。
>
> **示例**
>
> ```python
> # 由列表创建集合
> s = set([1, 2, 3, 2])
> print(s)  # 输出: {1, 2, 3}
> 
> # 空集合
> empty_s = set()
> print(empty_s)  # 输出: set()
> 
> # 集合运算
> a = set([1, 2, 3])
> b = set([2, 3, 4])
> print(a & b)  # 交集: {2, 3}
> print(a | b)  # 并集: {1, 2, 3, 4}
> print(a - b)  # 差集: {1}
> ```
>
> **常用方法**
>
> - `add(x)`：添加元素
> - `remove(x)`：删除元素（若不存在则报错）
> - `discard(x)`：删除元素（若不存在则不报错）
> - `update(iterable)`：批量添加元素
> - `pop()`：随机删除并返回一个元素
> - `clear()`：清空集合
> - `union()`, `intersection()`, `difference()` 等集合运算方法
>
> **总结**
>
> - `set([iterable])` 用于创建一个可变、无序、去重的集合对象。
> - 适合用于数据去重、集合运算等场景。
> - 与 `frozenset` 的区别是：`set` 可变，`frozenset` 不可变。
>
> ---
>
> `slice()` 是 Python 内置的一个切片对象，用于指定序列（如列表、字符串、元组等）**截取的起止位置和步长**，常用于高级切片操作。
>
> **语法**
>
> - `slice(stop)`
> - `slice(start, stop[, step])`
>
> **参数说明**：
>
> - `start`：起始索引（默认为 0）
> - `stop`：结束索引（不包含该索引）
> - `step`：步长（默认为 1）
>
> **用法举例**
>
> **`slice(stop)`**
>
> 等价于 `slice(0, stop, 1)`，从头到 `stop-1` 步长为 1。
>
> ```python
> s = slice(5)
> lst = [0, 1, 2, 3, 4, 5, 6]
> print(lst[s])  # 输出: [0, 1, 2, 3, 4]
> ```
>
> **`slice(start, stop[, step])`**
>
> ```Python
> s = slice(1, 6, 2)
> lst = [0, 1, 2, 3, 4, 5, 6]
> print(lst[s])  # 输出: [1, 3, 5]
> ```
>
> **直接在序列中使用切片（通常用`[start:stop:step]`语法）**
>
> ```python
> lst = [0, 1, 2, 3, 4, 5, 6]
> print(lst[1:6:2])  # 输出: [1, 3, 5]
> ```
>
> 但如果需要动态地指定切片，可以用 `slice()` 对象：
>
> ```python
> s = slice(2, 5)
> print(lst[s])  # 输出: [2, 3, 4]
> ```
>
> **典型应用场景**
>
> - 用于需要动态指定切片区间的场合（如函数参数传递）。
> - 对多维数组（如 numpy 数组）做切片操作时，常见于科学计算。
>
> **总结**
>
> - `slice()` 用于创建一个切片对象，方便传递或组合切片区间。
> - 等价于序列的 `[start:stop:step]` 用法，但更适合动态和高级用法。
>
> ---
>
> `tuple([iterable])` 是 Python 内置的 `tuple()` 构造函数的用法。
>
> **解释**
>
> - **`tuple()`** 是用来创建元组（tuple）对象的函数。
> - **`[iterable]`** 是可选参数，表示一个可迭代对象（例如列表、字符串、字典、集合等）。
>
> **用法说明**
>
> ```python
> tuple([iterable])
> ```
>
> - 如果你传入一个可迭代对象，`tuple()` 会将其转换为一个元组，其中每个元素就是迭代对象中的元素。
> - 如果不传参数，`tuple()` 会返回一个空元组 `()`。
>
> **示例**
>
> - **列表转换为元组**
>
>   ```python
>   lst = [1, 2, 3]
>   t = tuple(lst)
>   print(t)  # 输出: (1, 2, 3)
>   ```
>
> - **字符串转换为元组**
>
>   ```python
>   s = "abc"
>   t = tuple(s)
>   print(t)  # 输出: ('a', 'b', 'c')
>   ```
>
> - **集合转换为元组**
>
>   ```python
>   s = {1, 2, 3}
>   t = tuple(s)
>   print(t)  # 输出: (1, 2, 3)  # 注意集合无序
>   ```
>
> - **空参数**
>
>   ```python
>   t = tuple()
>   print(t)  # 输出: ()
>   ```
>
> **总结**
>
> - `tuple([iterable])` 的作用就是将一个可迭代对象转换成元组。
> - 元组是不可变的数据结构，类似于列表，但不能修改内容。
>
> ---
>
> **元组**（tuple）是不可变的数据结构，那么它和**不可变的集合**（frozenset）有什么区别？
>
> | 特性         | 元组 (tuple) | frozenset  |
> | ------------ | ------------ | ---------- |
> | 是否有序     | 有序         | 无序       |
> | 是否可重复   | 可以         | 不可以     |
> | 是否可哈希   | 可以         | 可以       |
> | 元素类型要求 | 无           | 必须可哈希 |
> | 支持操作     | 索引/切片    | 集合运算   |
> | 应用场景     | 顺序数据     | 不可变集合 |
>
> ---
>
> **问题：**“集合既然是无序的，那么for循环是如何拿到每个子元素的？”
>
> **集合（set）确实是无序的**，这意味着集合中的元素没有固定的顺序，也无法通过索引访问。但这并不影响我们用 `for` 循环遍历集合中的每一个元素。
>
> **for 循环如何遍历集合？**
>
> - 当你对集合进行 `for` 循环时，Python 会自动使用集合的**迭代器（iterator）**，每次返回一个元素，直到遍历完所有元素。
> - **遍历的顺序是不确定的**，和你插入元素的顺序没有必然关系，也不会每次都一样。
>
> **示例**
>
> ```python
> s = {3, 1, 2}
> for item in s:
>     print(item)
> ```
>
> 输出可能是：
>
> ```code
> 1
> 2
> 3
> ```
>
> 也可能是：
>
> ```
> 3
> 1
> 2
> ```
>
> 具体顺序由 Python 的底层实现决定。
>
> #### 结论
>
> - 集合是无序的，但可以被迭代。
> - for 循环通过集合的迭代器一个个“拿”元素，直到全部遍历完。
> - 遍历顺序不可预测，但每个元素都能被访问到一次。
>
> 如果你需要有序的遍历，可以先用 `sorted()` 排序：
>
> ```python
> for item in sorted(s):
>     print(item)
> ```
>
> 这样就可以按照你想要的顺序遍历集合啦！



### 9、其他

| 函数                               | 描述         | 示例                          | 版本变化     |
| :--------------------------------- | :----------- | :---------------------------- | :----------- |
| `aiter(async_iterable)`            | 异步迭代器   | `aiter(async_obj)`            | 3.10+新增    |
| `anext(async_iterator[, default])` | 异步next     | `await anext(async_iter)`     | 3.10+新增    |
| `format(value, format_spec='')`    | 格式化       | `format(3.14, '.1f') → '3.1'` | -            |
| `globals()`                        | 全局命名空间 | `globals()`                   | -            |
| `help([object])`                   | 交互帮助     | `help(list)`                  | -            |
| `locals()`                         | 局部命名空间 | `locals()`                    | 3.13行为变更 |
| `repr(object)`                     | 可打印表示   | `repr([1, 2]) → '[1, 2]'`     | -            |
| `super([type[, object]])`          | 父类代理     | `super().__init__()`          | -            |

> `aiter(async_iterable)` 是 Python 3.10 及以上版本中的一个内置函数，用于获取异步可迭代对象的异步迭代器。
>
> **详细解释**
>
> - **异步可迭代对象**：实现了 `__aiter__()` 方法的对象，比如异步生成器。
> - `aiter()` 函数会返回该对象的异步迭代器，可以用在 `async for` 循环中。
>
> **语法**
>
> ```python
> aiter(async_iterable)
> ```
>
> - `async_iterable`：任何异步可迭代对象。
>
> **示例**
>
> ```python
> async def gen():
>     for i in range(3):
>         yield i
> 
> async def main():
>     async_iter = aiter(gen())
>     async for item in async_iter:
>         print(item)
> ```
>
> **输出：**
>
> ```
> 0
> 1
> 2
> ```
>
> **用途**
>
> - 主要用于需要显式获得异步迭代器的场合，比如在自定义异步遍历逻辑时。
> - 常配合 `anext()`（获取下一个异步项）一起使用。
>
> ### 注意
>
> - 该函数仅在 Python 3.10 及以上版本可用。
> - 如果你直接用 `async for`，Python 会自动调用 `__aiter__()`，但如果你需要手动获得异步迭代器，可以用 `aiter()`。
>
> ---
>
> `anext(async_iterator[, default])` 是 Python 3.10 及以上版本的内置函数之一，用于从**异步迭代器**获取下一个值。
>
> **详细解释**
>
> - `async_iterator`：一个异步迭代器，比如异步生成器或实现了 `__anext__()` 方法的对象。
> - `default`（可选）：如果迭代器已耗尽（没有更多元素），则返回 `default`。如果未提供并且迭代器耗尽，则会抛出 `StopAsyncIteration` 异常。
>
> **用法**
>
> `anext` 必须在 **异步函数**（`async def`）内与 `await` 配合使用。
>
> **语法**
>
> ```python
> await anext(async_iterator)
> await anext(async_iterator, default)
> ```
>
> **示例**
>
> ```python
> async def async_gen():
>     for i in range(2):
>         yield i
> 
> async def main():
>     agen = async_gen()
>     print(await anext(agen))            # 输出 0
>     print(await anext(agen))            # 输出 1
>     print(await anext(agen, 'done'))    # 输出 'done'，因为已迭代完
> 
> import asyncio
> asyncio.run(main())
> ```
>
> **作用总结**
>
> - 让你可以在异步代码里**手动获取下一个异步迭代器的值**。
> - 配合 `default` 参数，可以优雅地处理迭代完成的情况，避免异常。
> - 类似于同步的 `next(iterator[, default])`，但用于异步场景。
>
> ------
>
> **一句话总结：**
> `anext` 用于在异步函数中异步获取迭代器的下一个元素，支持可选默认值，适合异步流式数据处理。
>
> 
>
> ---
>
> `format(value, format_spec='')` 是 Python 的一个内置函数，用于**格式化输出**，返回格式化后的字符串。
>
> 这个函数非常常用，尤其是在字符串拼接和数字、日期输出时。
>
> **语法**
>
> ```python
> format(value, format_spec='')
> ```
>
> - **value**：要格式化的对象（如数字、字符串等）。
> - **format_spec**：格式化说明字符串，决定输出的格式（如宽度、精度、类型等），默认为空字符串。
>
> **作用和常见用法**
>
> **1. 格式化数字**
>
> ```python
> num = 3.1415926
> print(format(num, '.2f'))   # 保留两位小数，输出：3.14
> print(format(num, '10.2f')) # 宽度为10，保留两位小数，输出：      3.14
> print(format(42, '04d'))    # 宽度4，前面补0，输出：0042
> ```
>
> **2. 格式化字符串**
>
> ```python
> s = 'test'
> print(format(s, '>10'))   # 右对齐，宽度10，输出：      test
> print(format(s, '<10'))   # 左对齐，宽度10，输出：test      
> print(format(s, '^10'))   # 居中对齐，宽度10，输出：   test   
> ```
>
> **3. 格式化百分比**
>
> ```python
> print(format(0.45, '.0%')) # 输出：45%
> ```
>
> **4. 格式化十六进制、二进制**
>
> ```python
> print(format(255, 'x')) # 输出：ff
> print(format(255, 'b')) # 输出：11111111
> ```
>
> **与 `str.format()` 的区别**
>
> - `format()` 是一个**单独的函数**，只格式化一个值。
> - `str.format()` 是字符串的方法，可以一次格式化多个值：
>
> ```python
> print('{} {}'.format('hello', 123))
> ```
>
> **总结**
>
> - `format(value, format_spec)` 用于对一个值进行定制化格式输出。
> - `format_spec` 控制输出的样式，比如小数位数、对齐方式、进制等。
>
> ---
>
> `globals()` 是 Python 的一个内置函数，主要用于**返回当前全局符号表的字典**。符号表就是变量名和对象之间的映射关系。
>
> **详细解释**
>
> - **调用方式**：`globals()` 不带任何参数。
> - **返回值**：返回一个表示当前全局符号表的字典。
> - **作用域**：通常在模块级别（即文件最外层），它包含所有全局变量和函数名。
> - 用途：
>   - 动态访问或修改全局变量。
>   - 调试时查看当前全局命名空间有哪些变量和对象。
>
> **示例**
>
> ```python
> x = 10
> 
> def foo():
>     print(globals())  # 显示全局命名空间的内容
> 
> foo()
> # 输出类似
> # {'__name__': '__main__', '__doc__': None, ..., 'x': 10, 'foo': <function foo at ...>}
> ```
>
> **动态修改全局变量**
>
> ```python
> globals()['y'] = 20
> print(y)  # 输出 20
> ```
>
> **与 `locals()` 区别**
>
> - `globals()` 返回的是**全局命名空间**（通常是模块级别）
> - `locals()` 返回的是**当前局部命名空间**（如函数内部）
>
> **总结**
>
> - `globals()` 用于获取和操作当前全局变量的字典
> - 适用于需要动态访问全局变量的场景
>
> ---
>
> `help()` 是 Python 的一个内置函数，用于获取对象的帮助信息。它是 Python 交互式解释器中非常有用的工具。
>
> **基本用法**
>
> - **不带参数调用**：
>
>   ```python
>   help()
>   ```
>
>   这会进入交互式帮助系统，你可以输入模块、类、函数等的名称来获取帮助信息。
>
> - **带参数调用**：
>
>   ```python
>   help(object)
>   ```
>
>   这会显示关于该对象的帮助文档。
>
> **参数说明**
>
> - `object`（可选）：可以是模块、函数、类、方法、关键字或文档主题。如果省略，则进入交互式帮助系统。
>
> **示例**
>
> ```python
> # 获取列表的帮助信息
> help(list)
> 
> # 获取特定方法的帮助
> help(str.split)
> 
> # 获取模块的帮助
> help(math)  # 需要先 import math
> 
> # 获取关键字的帮助
> help('for')
> ```
>
> **输出内容**
>
> `help()` 通常会显示：
>
> - 对象的描述
> - 使用方法
> - 参数说明
> - 相关方法/函数
> - 示例（如果有）
>
> **工作原理**
>
> `help()` 实际上是从对象的 `__doc__` 属性中获取文档字符串，并以更友好的格式显示出来。
>
> **注意事项**
>
> - 并非所有对象都有详细的帮助文档，这取决于该对象是否定义了文档字符串
> - 在编写代码时，良好的文档字符串可以让 `help()` 输出更有用的信息
>
> ---
>
> `locals()` 是 Python 的一个内置函数，用于返回当前局部符号表的字典。
>
> **基本用法**
>
> ```python
> locals()
> ```
>
> **返回值**
>
> 返回一个字典，包含当前局部作用域中的所有变量名和对应的值。
>
> **功能说明**
>
> - **局部作用域**：在函数内部调用时，返回函数的局部变量（包括参数）
> - **全局作用域**：在模块级别调用时，返回与 `globals()` 相同的内容
> - **字典特性**：返回的是一个字典对象，可以像普通字典一样操作
>
> **示例**
>
> ```python
> # 在模块级别使用
> x = 10
> y = 'hello'
> print(locals())  # 显示包含x和y的字典
> 
> # 在函数内部使用
> def test(a, b):
>     c = a + b
>     print(locals())
>     return c
> 
> test(3, 4)  # 输出: {'a': 3, 'b': 4, 'c': 7}
> ```
>
> **注意事项**
>
> - **字典是动态视图**：返回的字典会反映局部命名空间的实时变化
> - **不应修改字典**：虽然技术上可以修改返回的字典来改变局部变量，但这是不被推荐的做法
> - **与 `globals()` 的区别**：`globals()` 总是返回模块全局命名空间，而 `locals()` 的行为取决于调用位置
>
> **典型用途**
>
> - 调试时查看当前作用域的所有变量
> - 动态访问局部变量
> - 在特殊场景下动态创建或检查变量
>
> **性能考虑**
>
> 频繁调用 `locals()` 可能会影响性能，特别是在循环中应谨慎使用。
>
> ---
>
> `repr()` 是 Python 的一个内置函数，用于获取对象的"官方"字符串表示形式（representation）。
>
> **基本语法**
>
> ```python
> repr(object)
> ```
>
> **功能说明**
>
> - **返回字符串**：返回一个包含对象可打印表示的字符串
> - **可重现性**：理想情况下，`eval(repr(obj)) == obj` 应该成立
> - **与 `str()` 的区别**：
>   - `repr()` 面向开发者，提供精确的、无歧义的对象表示
>   - `str()` 面向用户，提供可读性更好的表示
>
> **示例**
>
> ```python
> # 基本类型
> repr(123)      # 返回 '123'
> repr('hello')  # 返回 "'hello'"
> 
> # 容器类型
> repr([1, 2, 3])  # 返回 '[1, 2, 3]'
> 
> # 自定义类
> class Point:
>     def __init__(self, x, y):
>         self.x = x
>         self.y = y
>     
>     def __repr__(self):
>         return f"Point({self.x}, {self.y})"
> 
> p = Point(3, 4)
> repr(p)  # 返回 'Point(3, 4)'
> ```
>
> **自定义 `__repr__`**
>
> 可以通过在类中定义 `__repr__` 方法来自定义 `repr()` 的行为：
>
> ```python
> class MyClass:
>     def __repr__(self):
>         return 'MyClass()'
> ```
>
> **注意事项**
>
> - **应包含必要信息**：好的 `__repr__` 应该包含重建对象所需的所有信息
> - **不应有副作用**：`__repr__` 方法不应该修改对象状态
> - **调试用途**：常用于调试和日志记录
> - **安全性**：不要对不受信任的输入使用 `eval(repr(obj))`
>
> **与 `str()` 对比**
>
> ```python
> import datetime
> now = datetime.datetime.now()
> 
> str(now)   # 返回可读性更好的时间字符串，如 '2023-05-15 14:30:00'
> repr(now)  # 返回更精确的表示，如 'datetime.datetime(2023, 5, 15, 14, 30, 0)'
> ```
>
> ---
>
> `super([type[, object]])` 是 Python 中的一个内置函数，用于调用父类（超类）的方法，常用于类的继承结构中。下面是详细解释：
>
> **基本语法**
>
> ```python
> super([type[, object]])
> ```
>
> - `type`：通常是当前类的名字。
> - `object`：通常是 `self`，即当前实例对象。
>
> 在大多数情况下，你会这样用：
>
> ```python
> class Parent:
>     def hello(self):
>         print("Hello from Parent")
> 
> class Child(Parent):
>     def hello(self):
>         super().hello()  # 调用父类的 hello 方法
>         print("Hello from Child")
> ```
>
> **用法详解**
>
> - **无参数形式：`super()`**
>   - 只在 Python 3 及以后使用，等价于 `super(当前类, self)`。
>   - 通常在类的方法内部使用，用来调用父类的方法。
> - **带参数形式：`super(type, object)`**
>   - `type`：你想查找的父类顺序起点（一般是当前类）。
>   - `object`：你想用来查找的方法的实例（一般是 `self`）。
>   - 这样 `super(type, object)` 会返回一个代理对象，可以访问 `type` 的父类的方法。
>
> **举例说明**
>
> **1. 常见用法**
>
> ```python
> class A:
>     def foo(self):
>         print("A foo")
> 
> class B(A):
>     def foo(self):
>         super().foo()  # 等价于 super(B, self).foo()
>         print("B foo")
> 
> b = B()
> b.foo()
> # 输出
> # A foo
> # B foo
> ```
>
> **2. 多重继承下的查找**
>
> ```python
> class A:
>     def foo(self):
>         print("A")
> 
> class B(A):
>     def foo(self):
>         print("B")
>         super().foo()
> 
> class C(A):
>     def foo(self):
>         print("C")
>         super().foo()
> 
> class D(B, C):
>     def foo(self):
>         print("D")
>         super().foo()
> 
> d = D()
> d.foo()
> # 输出
> # D
> # B
> # C
> # A
> ```
>
> 这里 `super()` 会按 MRO（方法解析顺序）查找父类。
>
> **总结**
>
> - `super()` 用于调用父类的方法，常见于继承结构中。
> - `super([type[, object]])` 可以指定查找起点和对象，但常用的是无参数版本。
> - 多重继承时，`super()` 按 MRO 顺序查找。
>
> **MRO 查找顺序规则**
>
> Python 使用一种叫做 **C3 线性化算法** 来确定 MRO 顺序。基本原则如下：
>
> 1. **自己优先**：先查找当前类自身的方法。
> 2. **父类从左到右**：按照继承列表，从左到右依次查找父类。
> 3. **避免重复**：同一个父类只会查找一次。
> 4. **保证子类优先于父类**。
>
> ---
>
> **拓展：什么是异步编程**
>
> **异步编程**是一种程序设计方式，指的是任务在发起后不需要等待其完成，可以继续执行后续代码，等任务完成后再处理其结果。这种方式让程序在遇到等待（例如网络请求、文件读写、数据库操作等）时不会阻塞主线程，从而提升效率和并发能力。
>
> **异步编程的核心特点**
>
> - **非阻塞**
>   程序执行到耗时操作时不会卡住，而是可以继续执行其他任务。
> - **任务调度**
>   有专门的“事件循环”或调度器来管理和分发任务，等异步操作完成时再恢复执行。
> - **高效资源利用**
>   非常适合需要并发处理大量I/O、网络或用户请求的场景。
>
> **同步与异步对比**
>
> - **同步编程**：每一步必须等前一步完成后才能继续，遇到慢操作会阻塞整个程序。
> - **异步编程**：慢操作发起后，程序可以继续做其他事情，操作完成后再处理结果。
>
> **示例（Python）**
>
> **同步代码**
>
> ```python
> result = slow_io_operation()
> print(result)  # 只有等到 slow_io_operation 完成后才能继续
> ```
>
> **异步代码**
>
> ```python
> import asyncio
> 
> async def main():
>     task = asyncio.create_task(slow_io_operation())
>     print("任务已发起，可以做其他事")
>     result = await task
>     print(result)
> 
> asyncio.run(main())
> ```
>
> **关键技术**
>
> - **回调函数**（callback）
> - **Promise / Future**（JavaScript、Python等）
> - **async/await**（现代主流语言）
>
> **适用场景**
>
> - 网络请求、API调用
> - 高并发服务器
> - 实时数据流
> - GUI程序响应用户操作
>
> **总结：**
> 异步编程让程序能在等待慢操作时继续做其他事情，提升了效率与并发能力，是现代软件开发的重要技术。
>
> 
>
> **拓展：python中的异步编程**
>
> `async` 关键字是 Python用于**异步编程**的一个重要语法标记。
>
> **Python 中的 `async`**
>
> **1. 作用**
>
> - 用于定义**异步函数**或**异步生成器**。
> - 标记一个函数为异步，允许在函数体内使用 `await`，以挂起当前协程并等待异步操作完成。
>
> **2. 语法**
>
> ```python
> async def func():
>     await some_async_operation()
> ```
>
> - `async def` 声明一个**异步函数**（返回值是一个协程对象）。
> - 在异步函数内部可以用 `await` 等待异步任务。
>
> **3. 示例**
>
> ```python
> import asyncio
> 
> async def hello():
>     await asyncio.sleep(1)
>     print('Hello, async!')
> 
> asyncio.run(hello())
> ```
>
> **4. 异步生成器**
>
> 也可用于定义异步生成器：
>
> ```python
> async def async_gen():
>     for i in range(3):
>         yield i
> ```
>
> **总结**
>
> - `async` 用于声明异步函数和生成器，支持异步编程模型。
> - 只有在 `async def` 定义的函数里才能用 `await`。
> - 异步函数必须用事件循环（如 `asyncio.run`）调用。