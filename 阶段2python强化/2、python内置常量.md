### python内置常量

| **常量名称**       | **类型/用途**                                                | **注意事项**                                                 |
| :----------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **False**          | `bool` 类型的假值                                            | 不可重新赋值（会引发 `SyntaxError`）。                       |
| **True**           | `bool` 类型的真值                                            | 不可重新赋值（会引发 `SyntaxError`）。                       |
| **None**           | 表示空值，`NoneType` 类型的唯一实例                          | 不可重新赋值（会引发 `SyntaxError`）。                       |
| **NotImplemented** | 双目运算或原地运算方法中表示操作未实现。                     | 1. 不可在布尔上下文中使用（Python 3.9+ 已弃用）。 2. 与 `NotImplementedError` 不同，不可混淆。 |
| **Ellipsis**       | 省略号字面值 `...`，用于扩展切片语法                         | 是 `types.EllipsisType` 类型的唯一实例。                     |
| **__debug__**      | 若 Python 未以 `-O` 选项启动则为 `True`，用于 `assert` 语句调试 | 不可重新赋值（会引发 `SyntaxError`）。                       |

> **双目运算及原地双目运算**
>
> 在 Python（以及其他编程语言）中，**双目运算**和**原地双目运算**是指对两个操作数进行运算的操作方式：
>
> **1. 双目运算（Binary Operation）**
>
> **双目运算**就是指有两个操作数的运算。
> 常见的有：加法、减法、乘法、除法、比较运算等。
>
> **示例**
>
> ```python
> a + b      # 加法
> a - b      # 减法
> a * b      # 乘法
> a / b      # 除法
> a == b     # 等于比较
> a < b      # 小于比较
> ```
>
> 这些运算符在 Python 内部会调用特殊方法，比如：
>
> - `a + b` ⇒ `a.__add__(b)`
> - `a - b` ⇒ `a.__sub__(b)`
> - `a * b` ⇒ `a.__mul__(b)`
> - `a < b` ⇒ `a.__lt__(b)`
>
> **2. 原地双目运算（In-place Binary Operation）**
>
> **原地双目运算**是指在原有对象上直接进行运算并尝试修改自身，而不是生成一个新对象。
> 这种运算通常用“赋值运算符”实现，如 `+=`, `-=`, `*=`, `/=`, 等。
>
> **示例**
>
> ```python
> a += b     # 相当于 a = a + b，但如果 a 类型支持原地修改，可能不会新建对象
> a *= b     # 相当于 a = a * b，可能会原地修改 a
> ```
>
> 这些运算符在 Python 内部会调用原地特殊方法，比如：
>
> - `a += b` ⇒ `a.__iadd__(b)`
> - `a *= b` ⇒ `a.__imul__(b)`
> - `a -= b` ⇒ `a.__isub__(b)`
>
> 原地方法如果不能实现原地修改，通常会退回到普通双目运算。
>
> **3. 关系与区别**
>
> - **双目运算**：总是产生新对象（如 `a + b`）。
> - **原地双目运算**：优先尝试修改原对象（如列表、字典支持原地修改），否则退回新对象。
>
> **4. 与 `NotImplemented` 的关系**
>
> 实现这些特殊方法时，如果遇到不支持的类型，可以返回 `NotImplemented`，让 Python 尝试其他方式或抛异常。
>
> **总结：**
>
> - 双目运算：两个操作数参与的运算，比如 `a + b`。
> - 原地双目运算：在原对象上直接进行运算并赋值，比如 `a += b`，通常由 `__iadd__` 等方法实现。
>
> ---
>
> **`NotImplemented`** 是 Python 的一个内置常量，主要用于运算符重载相关的特殊方法（如 `__eq__`, `__add__`, `__sub__` 等），表示某个操作没有针对当前类型实现。
>
> **1. 作用与使用场景**
>
> 当你实现自定义类的运算符重载方法，如果发现不能处理对方传来的类型，你应当返回 `NotImplemented`。
> 这会告诉 Python 解释器“我不会这个运算，你可以尝试让另一个对象来做”：
>
> ```python
> class MyNumber:
>     def __eq__(self, other):
>         if isinstance(other, MyNumber):
>             return self.value == other.value
>         return NotImplemented  # 不知道怎么比较其他类型
> ```
>
> **解释器行为**：
>
> - 如果你返回 `NotImplemented`，Python 会尝试调用另一对象的反向方法（如 `other.__eq__(self)`）。
> - 如果双方都返回 `NotImplemented`，最终会抛出一个异常（比如 `TypeError`）。
>
> **2. 注意事项**
>
> - **不是异常**：`NotImplemented` 不是 `NotImplementedError`。不能用于抛出异常，只是一个特殊返回值。
> - **类型唯一**：`NotImplemented` 是 `types.NotImplementedType` 的唯一实例。
> - **布尔上下文**：在布尔表达式里用 `if NotImplemented:` 以前会被当作真值，但 3.9 之后弃用，将来会报错。
> - **不要和 `NotImplementedError` 混淆**：后者是一个异常，用于“这个方法没实现”，前者用于运算符重载“不知道怎么处理”。
>
> **3. 示例**
>
> ```python
> class MyNumber:
>     def __add__(self, other):
>         if isinstance(other, MyNumber):
>             return MyNumber(self.value + other.value)
>         return NotImplemented  # 不知道怎么加别的类型
> 
> a = MyNumber(1)
> b = "string"
> result = a + b  # 解释器会尝试 b.__radd__(a)，如果还不行就抛 TypeError
> ```
>
> **4. 总结**
>
> - `NotImplemented` 用于特殊方法（如 `__eq__`、`__add__` 等）里表示“不会此操作”，让 Python 有机会用其他方式处理。
> - 不能用于异常抛出，不是异常类型。
> - 不要在布尔表达式、常规逻辑里使用。
>
> ---
>
> **Ellipsis** 是 Python 的一个特殊内置常量，表示为三个连续的点：`...`。
>
> **1. 基本用途**
>
> - **主要用于扩展切片语法**，例如在多维数组（如 NumPy 数组）中，`...` 代表“选择所有剩余的维度”。
> - 在自定义类实现切片解析时，也可用来识别省略号。
>
> **2. 示例**
>
> **NumPy 多维数组切片**
>
> ```python
> import numpy as np
> a = np.zeros((3, 4, 5))
> a[1, ...]    # 等价于 a[1, :, :]
> ```
>
> ##### 自定义切片
>
> ```python
> class MySeq:
>     def __getitem__(self, item):
>         if item is Ellipsis:
>             return "Got Ellipsis!"
>         return item
> 
> seq = MySeq()
> print(seq[...])   # 输出：Got Ellipsis!
> ```
>
> **3. 类型和唯一性**
>
> - `Ellipsis` 是 `types.EllipsisType` 的唯一实例。
> - 直接输入 `...` 就是 `Ellipsis`。
> - 可以用 `Ellipsis` 或 `...`，效果完全一样。
>
> **4. 其他说明**
>
> - 在普通 Python 代码中用得很少，主要是科学计算、框架开发等场景。
> - 你可以用它作占位符，但更常见的是用 `pass` 或 `raise NotImplementedError()`。
>
> **总结：**
>
> - `Ellipsis` 就是 Python 里的 `...`，常用于多维切片和特殊占位，类型唯一，语法简单。
>
> ---
>
> `__debug__` 是 Python 的一个内置常量，表示当前解释器是否处于调试（非优化）模式。它的作用和特性如下：
>
> **详细解释**
>
> - **默认值为 True**：只要你用正常方式运行 Python 程序（比如直接 python myfile.py），`__debug__` 就是 True。
> - **优化模式为 False**：如果用优化选项（`-O` 或 `-OO`）运行 Python（如 python -O myfile.py），`__debug__` 就会变成 False。
> - **常见用途**：通常用来包裹调试代码或断言（assert），在优化模式下这些代码会被自动忽略。
> - **不可赋值**：你不能给 `__debug__` 赋新值，否则会报错。
> - **与 assert 关联**：所有 assert 语句其实只有在 `__debug__` 为 True 时才会执行。
>
> **示例**
>
> ```python
> if __debug__:
>     print("这是调试模式。")
> 
> assert 2 + 2 == 4  # 只有在 __debug__ 为 True 时有效
> ```
>
> ### 总结
>
> - **`__debug__` == True** ：正常/调试模式
> - **`__debug__` == False** ：优化模式（用 `-O` 启动 Python）
>
> 适合在需要在开发/调试时保留、但生产环境可移除的检查或日志中使用。



### 由 `site` 模块添加的常量（仅限交互式解释器）

| **常量名称**  | **功能描述**           | **调用示例**               |
| :------------ | :--------------------- | :------------------------- |
| **quit()**    | 退出解释器             | `quit()` 或 `quit(code=0)` |
| **exit()**    | 同 `quit()`            | `exit()` 或 `exit(code=0)` |
| **help**      | 提供交互式帮助         | `help()` 或 `help(object)` |
| **copyright** | 打印版权信息           | `print(copyright)`         |
| **credits**   | 打印作者信息           | `print(credits)`           |
| **license**   | 分页显示完整许可证文本 | `license()`                |

> **Python交互式解释器**（Interactive Interpreter）是指一种可以让用户一行一行输入Python代码，并立刻看到运行结果的命令行环境。它是Python最基本、最直接的运行方式，非常适合学习、实验、调试代码。
>
> **主要特点**
>
> - **即时反馈**：输入一行代码，按回车，解释器立即执行并显示结果。
> - **无需写文件**：不需要保存为`.py`文件，直接输入代码即可。
> - **适合实验**：适合测试小段代码、验证语法和函数行为。
> - **支持多种环境**：可以在终端（命令行）、IDLE、IPython、Jupyter Notebook等环境下以交互方式运行。
>
> **如何进入交互式解释器**
>
> **1. 命令行启动**
>
> 在命令行（终端）输入：
>
> ```bash
> python
> ```
>
> 或者
>
> ```
> python3
> ```
>
> 你会看到类似如下提示符：
>
> ```
> >>>
> ```
>
> 此时就进入了交互式解释器，可以输入代码并立即看到结果。
>
> **2. 其他交互环境**
>
> - **IDLE**：Python自带的图形界面，打开后就是一个交互式Shell。
> - **IPython**：功能更强大的交互式解释器。
> - **Jupyter Notebook**：基于网页的交互式开发环境。
>
> **示例**
>
> ```python
> >>> print("Hello, world!")
> Hello, world!
> 
> >>> 2 + 3
> 5
> 
> >>> x = 10
> >>> x * 2
> 20
> ```
>
> **总结**
>
> **Python交互式解释器**就是你可以“即时输入代码、即时看到结果”的Python命令行环境，是学习和调试Python的好帮手。