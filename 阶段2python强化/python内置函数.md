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
> 
>
> 



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