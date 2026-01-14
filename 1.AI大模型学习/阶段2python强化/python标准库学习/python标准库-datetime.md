这是一份关于 Python 标准库 datetime 的系统化学习指南。datetime 是 Python 处理日期和时间的核心模块。

为了方便理解，我将内容分为 5个核心类详解、格式化与解析、时区处理，以及一个综合实战项目。

## 第一部分：核心类详解 (Core Classes)
datetime 模块主要包含五个核心类：
* date: 仅处理日期（年-月-日）
* time: 仅处理时间（时-分-秒-微秒）
* datetime: 同时处理日期和时间
* timedelta: 处理时间间隔（时间的加减运算）
* timezone: 处理时区信息 (通常配合 Python 3.9+ 的 zoneinfo 模块使用)

### 1. datetime.date (日期)
用于表示日历中的日期，不包含时间。

```python
from datetime import date

# 1. 获取当前日期
today = date.today()
print(f"今天是: {today}")  # 输出格式: YYYY-MM-DD

# 2. 创建指定日期
my_birthday = date(1995, 12, 10)
print(f"生日: {my_birthday}")

# 3. 获取属性
print(f"年: {today.year}, 月: {today.month}, 日: {today.day}")

# 4. 修改日期 (replace不改变原对象，返回新对象)
next_year_day = today.replace(year=today.year + 1)
print(f"明年今日: {next_year_day}")

# 5. 获取星期几 (0是周一, 6是周日)
print(f"今天是星期: {today.weekday() + 1}") 

# 6. 时间戳转日期
timestamp_date = date.fromtimestamp(1700000000)
print(f"时间戳对应的日期: {timestamp_date}")
```

### 2. datetime.time (时间)
用于表示一天中的时间，独立于任何特定日期。

```python
from datetime import time

# 1. 创建时间 (时, 分, 秒, 微秒)
t = time(14, 30, 5, 100)
print(f"设定时间: {t}")

# 2. 获取属性
print(f"时: {t.hour}, 分: {t.minute}, 秒: {t.second}")

# 3. 常用常量
print(f"最早时间: {time.min}")
print(f"最晚时间: {time.max}")
```

### 3. datetime.datetime (日期+时间)
最常用的类，结合了 date 和 time 的功能。

```python
from datetime import datetime, date, time

# 1. 获取当前日期和时间
now = datetime.now()
print(f"现在: {now}")

# 2. 构造函数
dt = datetime(2023, 1, 1, 12, 0, 0)

# 3. 组合 date 和 time 对象
d = date(2024, 5, 1)
t = time(10, 0)
combined = datetime.combine(d, t)
print(f"组合结果: {combined}")

# 4. 转换为时间戳 (float类型)
ts = now.timestamp()
print(f"当前时间戳: {ts}")

# 5. 时间戳转 datetime
dt_from_ts = datetime.fromtimestamp(ts)
print(f"反转回对象: {dt_from_ts}")
```

### 4. datetime.timedelta (时间计算)
这是进行时间加减运算的神器。

```python
from datetime import datetime, timedelta

now = datetime.now()

# 1. 定义时间间隔
delta_1_day = timedelta(days=1)
delta_2_hours = timedelta(hours=2, minutes=30)
delta_2_weeks = timedelta(weeks=2)

# 2. 时间加法 (未来时间)
tomorrow = now + delta_1_day
print(f"明天此时: {tomorrow}")

# 3. 时间减法 (过去时间)
past = now - delta_2_hours
print(f"2.5小时前: {past}")

# 4. 计算两个日期之间的差值
new_year = datetime(now.year + 1, 1, 1)
countdown = new_year - now
print(f"距离明年还有: {countdown.days} 天, {countdown.seconds} 秒")

# 5. 总秒数
print(f"间隔总秒数: {delta_2_hours.total_seconds()}")
```

## 第二部分：格式化与解析 (Parsing & Formatting)
这是开发中最容易搞混的部分，记住口诀：
* Strftime (String Format Time): 对象 -> 字符串
* Strptime (String Parse Time): 字符串 -> 对象

常用的格式代码：%Y(年), %m(月), %d(日), %H(24时), %M(分), %S(秒)

```python
from datetime import datetime

# 1. 格式化输出 (对象 -> 字符串)
now = datetime.now()
formatted_str = now.strftime("%Y年%m月%d日 %H:%M:%S")
print(f"格式化后: {formatted_str}")
# 输出示例: 2024年01月14日 15:30:00

# 2. 解析字符串 (字符串 -> 对象)
log_time = "2023-11-11 10:00"
dt_obj = datetime.strptime(log_time, "%Y-%m-%d %H:%M")
print(f"解析后的类型: {type(dt_obj)}")
print(f"解析后的对象: {dt_obj}")
```

## 第三部分：时区处理 (Timezone)
在 Python 3.9 之后，推荐使用标准库 zoneinfo (Linux/Mac通常自带，Windows可能需要安装 tzdata 包: pip install tzdata)。

注意：datetime.now() 默认是“naive”（无时区意识的），在跨国业务中必须使用“aware”（有时区意识的）时间。

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo # Python 3.9+ 标准库

# 1. 获取 UTC 标准时间 (Aware)
utc_now = datetime.now(timezone.utc)
print(f"UTC时间: {utc_now}")

# 2. 获取特定时区时间 (例如：上海)
shanghai_tz = ZoneInfo("Asia/Shanghai")
local_now = datetime.now(shanghai_tz)
print(f"北京时间: {local_now}")

# 3. 时区转换 (astimezone)
# 将 UTC 时间转为 纽约时间
ny_tz = ZoneInfo("America/New_York")
ny_time = utc_now.astimezone(ny_tz)
print(f"同时刻的纽约时间: {ny_time}")
```

## 第四部分：实战小项目 —— 全球会议调度助手
这个小项目展示了如何综合使用上述知识点。

功能：用户输入一个未来的会议时间（北京时间），程序自动计算：
* 距离会议还有多久（倒计时）。
* 该会议在 伦敦、纽约、东京 的当地时间分别是多少。
* 判断会议是否在工作日。

```python
import sys
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

class GlobalMeetingPlanner:
    def __init__(self, meeting_str_bj):
        """
        初始化会议时间
        :param meeting_str_bj: 字符串格式的北京时间 "YYYY-MM-DD HH:MM"
        """
        self.bj_tz = ZoneInfo("Asia/Shanghai")
        # 1. 解析字符串为 datetime 对象 (Naive)
        try:
            naive_dt = datetime.strptime(meeting_str_bj, "%Y-%m-%d %H:%M")
            # 2. 赋予时区信息 (变成 Aware)
            self.meeting_dt = naive_dt.replace(tzinfo=self.bj_tz)
        except ValueError:
            print("错误：时间格式不正确，请使用 YYYY-MM-DD HH:MM")
            sys.exit(1)

    def show_countdown(self):
        """显示倒计时"""
        # 获取当前带时区的时间，确保可以直接相减
        now = datetime.now(self.bj_tz)
        
        if self.meeting_dt < now:
            print(f"⚠️ 会议时间已过！")
            return

        # timedelta 计算
        diff = self.meeting_dt - now
        days = diff.days
        hours, remainder = divmod(diff.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        
        print(f"\n[倒计时] 距离会议还有: {days}天 {hours}小时 {minutes}分")

    def convert_to_global_times(self):
        """转换并打印全球主要城市时间"""
        cities = {
            "🇬🇧 伦敦 (London)": "Europe/London",
            "🇺🇸 纽约 (New York)": "America/New_York",
            "🇯🇵 东京 (Tokyo)": "Asia/Tokyo"
        }
        
        print("\n[全球时间表]")
        print(f"🇨🇳 北京 (Source): {self.meeting_dt.strftime('%Y-%m-%d %H:%M %Z')}")
        
        for city_name, tz_name in cities.items():
            try:
                # 核心：astimezone 进行时区转换
                target_tz = ZoneInfo(tz_name)
                local_dt = self.meeting_dt.astimezone(target_tz)
                print(f"{city_name}: {local_dt.strftime('%Y-%m-%d %H:%M %Z')}")
            except ZoneInfoNotFoundError:
                print(f"{city_name}: 时区数据未找到，请检查系统环境。")

    def check_workday(self):
        """检查是否为工作日"""
        # weekday(): 0=周一, 6=周日
        day_index = self.meeting_dt.weekday()
        weekdays = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        
        is_workday = day_index < 5
        status = "✅ 工作日" if is_workday else "☕ 周末"
        print(f"\n[日程检查] 这一天是 {weekdays[day_index]} ({status})")

# --- 运行示例 ---
if __name__ == "__main__":
    # 假设这是用户输入的未来时间
    input_time = "2026-05-20 15:30" 
    
    print(f"正在规划会议: {input_time} (北京时间)...")
    
    planner = GlobalMeetingPlanner(input_time)
    planner.check_workday()
    planner.show_countdown()
    planner.convert_to_global_times()
```
