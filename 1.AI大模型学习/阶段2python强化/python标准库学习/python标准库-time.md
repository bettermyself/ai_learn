Python 的 time 模块是处理时间的基础库，主要用于获取时间戳、格式化时间以及程序延时。

理解 time 库的关键在于理清三种时间表示形式的转换关系：
*   **时间戳 (Timestamp):** 一个浮点数，表示从 Epoch (1970年1月1日 00:00:00 UTC) 至今的秒数。
*   **结构化时间 (Struct_time):** 一个包含年月日时分秒的元组 (Tuple)。
*   **格式化字符串 (Formatted String):** 如 “2023-10-01” 这样人类可读的字符串。

### 1. 核心 API 详解

#### 1.1 获取当前时间与延时 (Basics)
这是最基础的操作，用于打点和暂停程序。
*   `time.time()`: 返回当前时间的时间戳（最常用）。
*   `time.sleep(secs)`: 让程序暂停指定的秒数。
*   `time.ctime([secs])`: 将时间戳直接转换为人类可读的字符串（默认当前时间）。

```python
import time

# 1. 获取时间戳
timestamp = time.time()
print(f"当前时间戳: {timestamp}")  # 输出示例: 1696924800.123456

# 2. 快速获取可读时间
readable = time.ctime()
print(f"当前可读时间: {readable}")  # 输出示例: Tue Oct 10 16:00:00 2023

# 3. 程序睡眠
print("开始休眠 2 秒...")
time.sleep(2)
print("休眠结束！")
```

#### 1.2 时间格式转换 (Conversions)
这是 time 库最复杂也最重要的部分：如何在时间戳、结构化对象和字符串之间切换。

**A. 时间戳 → 结构化时间 (Struct_time)**
*   `time.localtime([secs])`: 转为本地时区的 struct_time。
*   `time.gmtime([secs])`: 转为 UTC (格林威治) 标准时区的 struct_time。

```python
t = time.time()

# 转为本地时间 (比如北京时间)
local_struct = time.localtime(t)
print(f"本地时间对象: {local_struct}")
# 输出: time.struct_time(tm_year=2023, tm_mon=10, tm_mday=10, tm_hour=16, ...)

# 转为 UTC 时间 (比北京时间慢8小时)
utc_struct = time.gmtime(t)
print(f"UTC 时间对象: {utc_struct}")
# 注意观察 tm_hour 的区别
```

**B. 结构化时间 → 时间戳**
*   `time.mktime(t)`: 将本地 struct_time 转换回时间戳。

```python
# 将上面的 local_struct 转回时间戳
back_to_stamp = time.mktime(local_struct)
print(f"还原的时间戳: {back_to_stamp}")
```

**C. 格式化输出 (Formatting)**
*   `time.strftime(format, t)`: Struct_time → 字符串 (String)。
*   `time.strptime(string, format)`: 字符串 (String) → Struct_time。

> 常用格式化符号参考:
> *   `%Y`: 年 (2023) | `%m`: 月 (01-12) | `%d`: 日 (01-31)
> *   `%H`: 时 (24小时制) | `%M`: 分 | `%S`: 秒

```python
# 1. 格式化：对象 -> 字符串
# 这里的 local_struct 来自上面的代码
time_str = time.strftime("%Y-%m-%d %H:%M:%S", local_struct)
print(f"格式化后的时间: {time_str}") # 输出: 2023-10-10 16:00:00

# 2. 解析：字符串 -> 对象
input_time = "2024-01-01 12:00:00"
parsed_struct = time.strptime(input_time, "%Y-%m-%d %H:%M:%S")
print(f"解析后的年份: {parsed_struct.tm_year}") # 输出: 2024
```

#### 1.3 性能计时 (Performance)
在 Python 3.3+ 中，推荐使用以下 API 来测量代码运行时间，而不是 `time.time()`，因为它们精度更高且不受系统时间调整影响。
*   `time.perf_counter()`: 记录代码执行时长的首选方式（包含睡眠时间）。
*   `time.process_time()`: 只记录 CPU 运行时间（不包含 sleep 时间）。

```python
start = time.perf_counter()

# 模拟耗时操作
time.sleep(0.5) 
sum([i**2 for i in range(10000)])

end = time.perf_counter()
print(f"代码运行耗时: {end - start:.6f} 秒")
```

### 2. 实战小项目：专注时钟 (Focus Timer)
这是一个基于命令行的“番茄钟”工具。
**功能：** 用户输入专注时长（分钟），程序倒计时，每秒刷新显示剩余时间，结束后打印完成时间。

#### 代码实现
```python
import time

def focus_timer(minutes):
    """
    一个简单的命令行专注倒计时工具
    """
    seconds = minutes * 60
    start_timestamp = time.time()
    
    # 计算预计结束时间
    # 1. 当前时间戳 + 总秒数 -> 结束时间戳
    # 2. 结束时间戳 -> struct_time -> 格式化字符串
    finish_time = time.strftime("%H:%M:%S", time.localtime(start_timestamp + seconds))
    
    print(f"--- 专注开始！将在 {finish_time} 结束 ---")
    
    try:
        while seconds > 0:
            # divmod 将总秒数拆分为 (分, 秒)
            mins, secs = divmod(seconds, 60)
            
            # 格式化倒计时显示，如 05:09
            timer = f'{mins:02d}:{secs:02d}'
            
            # end='\r' 让光标回到行首，实现单行刷新效果，而不是换行打印
            print(f"剩余时间: {timer} ⏳", end="\r")
            
            time.sleep(1)
            seconds -= 1
            
        print(f"剩余时间: 00:00 ✅             ") # 覆盖最后一行
        print("\n时间到！休息一下吧。")
        
    except KeyboardInterrupt:
        # 允许用户按 Ctrl+C 提前退出
        print("\n\n专注被中断。下次继续加油！")

if __name__ == "__main__":
    print("欢迎使用 Python 专注时钟")
    try:
        user_input = input("请输入专注时长（分钟）: ")
        mins = int(user_input)
        focus_timer(mins)
    except ValueError:
        print("请输入有效的数字！")
```

#### 项目涉及的知识点：
*   **时间计算:** 使用 `time.time()` 加秒数计算未来时间。
*   **格式化:** 使用 `time.strftime()` 显示友好的结束时间。
*   **循环与延时:** `while` 循环配合 `time.sleep(1)` 实现秒级倒数。
*   **CLI 技巧:** `print(..., end="\r")` 实现了在同一行动态更新时间，而不是打印满屏的数字。

