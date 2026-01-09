csv模块主要用于处理逗号分隔值（Comma-Separated Values）文件，是数据处理中最基础的技能之一。

## 第一部分：核心 API 详解与代码示例

在使用 csv 模块时，最关键的注意事项是：在 Python 3 中打开 CSV 文件写入时，务必指定 `newline=''`，否则在 Windows 系统下可能会产生多余的空行。

### 1. 基础写入 (csv.writer)
用于将数据作为**列表（List）**写入文件。

*   **常用方法：**
    *   `writerow(row)`: 写入单行。
    *   `writerows(rows)`: 写入多行。

```python
import csv

data = [
    ['ID', 'Name', 'Department'],
    [1, 'Alice', 'Engineering'],
    [2, 'Bob', 'HR'],
    [3, 'Charlie', 'Engineering']
]

# newline='' 是防止 Windows 下出现空行的关键
with open('basic_output.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    
    # 写入表头（单行）
    writer.writerow(data[0])
    
    # 写入数据（多行）
    writer.writerows(data[1:])

print("基础 CSV 写入完成。")
```

### 2. 基础读取 (csv.reader)
用于将 CSV 文件按行读取，每行返回一个字符串列表-`next()`或者`for`循环

```python
import csv

with open('basic_output.csv', 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    
    # 获取表头
    header = next(reader) 
    print(f"表头: {header}")
    
    # 遍历剩余行
    for row in reader:
        print(f"数据行: {row}") 
        # 输出示例: ['1', 'Alice', 'Engineering'] (注意数字也被读作字符串)

# next(reader) 会消耗一行，指针会移动到下一行
# for 循环从当前位置继续，不会重复读取表头
# 迭代器状态是连续的，不会自动回到开头
```

### 3. 字典写入 (csv.DictWriter)
更常用的方式。将**字典（Dictionary）**写入 CSV，通过键名自动映射到列。

*   **常用方法：**
    *   `writeheader()`: 写入表头（必须调用）。
    *   `writerow(dict)`: 写入一行字典数据。

```python
import csv

headers = ['ID', 'Name', 'Score']
rows = [
    {'ID': 101, 'Name': 'David', 'Score': 88},
    {'ID': 102, 'Name': 'Eva', 'Score': 95},
    {'ID': 103, 'Name': 'Frank', 'Score': 70}
]

with open('dict_output.csv', 'w', newline='', encoding='utf-8') as f:
    # 必须指定 fieldnames
    writer = csv.DictWriter(f, fieldnames=headers)
    
    writer.writeheader() # 写入表头
    writer.writerows(rows) # 写入数据

print("字典模式写入完成。")
```

### 4. 字典读取 (csv.DictReader)
最推荐的读取方式。每行被解析为 OrderedDict (Python 3.8+ 为普通 dict)，可以通过列名访问数据，代码可读性更高。

```python
import csv

with open('dict_output.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    
    # 不需要手动跳过表头，DictReader 会自动将第一行作为 Key
    for row in reader:
        # 直接通过列名访问，无需关心索引位置
        print(f"{row['Name']} 的分数是: {row['Score']}")
```

### 5. 自定义格式 (Dialect 与格式参数)
处理非标准 CSV（例如使用 `|` 分隔，或者所有字段都需要引号）。

*   **常用参数：**
    *   `delimiter`: 分隔符（默认为 `,`）。
    *   `quotechar`: 引用符（默认为 `"`）。
    *   `quoting`: 引用策略（如 `csv.QUOTE_ALL` 强制给所有字段加引号）。

```python
import csv

data = [['ID', 'Desc'], [1, 'Hello, World'], [2, 'Line\nBreak']]

with open('custom_format.csv', 'w', newline='', encoding='utf-8') as f:
    # quoting: 控制何时对字段值添加引号；quotechar: 指定用作引号的字符
    writer = csv.writer(f, delimiter='|', quoting=csv.QUOTE_ALL, quotechar='"')  
    writer.writerows(data)

# 输出的文件内容样子:
# "ID"|"Desc"
# "1"|"Hello, World"
# "2"|"Line
# Break"
```

### 6. 自动探测格式 (csv.Sniffer)
当你不知道 CSV 文件的分隔符是逗号还是分号时使用。

```python
import csv

# 假设我们不知道这个文件的格式
with open('custom_format.csv', 'r', encoding='utf-8') as f:
    # 读取前 1024 个字节进行分析
    sample = f.read(1024)
    f.seek(0) # 重置文件指针到开头
    
    sniffer = csv.Sniffer()
    # 探测 dialect
    dialect = sniffer.sniff(sample)
    # 判断是否有表头
    has_header = sniffer.has_header(sample)
    
    print(f"检测到的分隔符: {dialect.delimiter}")
    print(f"检测到表头: {has_header}")
    
    # 使用检测到的 dialect 读取
    reader = csv.reader(f, dialect=dialect)
    for row in reader:
        print(row)
```



## 第二部分：实战小项目——简易库存分析工具

**项目描述：**
这是一个模拟的库存管理脚本。它首先生成一份包含商品信息的原始 CSV 数据，然后读取该数据，计算库存总价值（价格 * 数量），筛选出库存预警的商品（数量 < 5），最后将分析报告导出为一个新的 CSV 文件。

**涉及知识点：** `DictWriter`, `DictReader`, 数据类型转换, 文件路径操作。

```python
import csv
import os

class InventoryAnalyzer:
    def __init__(self, raw_file, report_file):
        self.raw_file = raw_file
        self.report_file = report_file

    def generate_dummy_data(self):
        """生成模拟的原始库存数据"""
        headers = ['product_id', 'product_name', 'price', 'quantity', 'category']
        data = [
            {'product_id': 'P001', 'product_name': 'Gaming Laptop', 'price': 1200.00, 'quantity': 10, 'category': 'Electronics'},
            {'product_id': 'P002', 'product_name': 'Wireless Mouse', 'price': 25.50, 'quantity': 3, 'category': 'Electronics'}, # 低库存
            {'product_id': 'P003', 'product_name': 'Coffee Mug', 'price': 12.00, 'quantity': 50, 'category': 'Home'},
            {'product_id': 'P004', 'product_name': 'Desk Chair', 'price': 150.00, 'quantity': 4, 'category': 'Furniture'}, # 低库存
            {'product_id': 'P005', 'product_name': 'Monitor', 'price': 300.00, 'quantity': 8, 'category': 'Electronics'},
        ]

        print(f"正在生成原始数据: {self.raw_file} ...")
        with open(self.raw_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(data)

    def analyze_and_report(self):
        """读取数据，分析库存价值，导出低库存警告"""
        if not os.path.exists(self.raw_file):
            print("错误：未找到原始文件。")
            return

        print("正在分析数据...")
        
        total_inventory_value = 0.0
        low_stock_items = []
        low_stock_threshold = 5

        # 1. 读取并处理数据
        with open(self.raw_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            for row in reader:
                # CSV 读取的都是字符串，需要转换类型进行计算
                price = float(row['price'])
                qty = int(row['quantity'])
                name = row['product_name']
                
                # 计算总价值
                total_inventory_value += price * qty
                
                # 检查是否低库存
                if qty < low_stock_threshold:
                    # 我们希望在报告中增加一列 'status'
                    row['status'] = 'LOW_STOCK_WARNING'
                    row['total_value'] = price * qty
                    low_stock_items.append(row)

        print(f"当前库存总价值: ${total_inventory_value:,.2f}")
        print(f"发现 {len(low_stock_items)} 个低库存商品。")

        # 2. 写入分析报告
        if low_stock_items:
            # 定义报告的新表头（比原始数据多两列）
            report_headers = ['product_id', 'product_name', 'quantity', 'price', 'total_value', 'status']
            
            with open(self.report_file, 'w', newline='', encoding='utf-8') as f:
                # extrasaction='ignore' 表示如果字典里有表头里没有的Key（比如 category），则忽略不报错
                writer = csv.DictWriter(f, fieldnames=report_headers, extrasaction='ignore')
                
                writer.writeheader()
                writer.writerows(low_stock_items)
            
            print(f"分析报告已生成: {self.report_file}")
        else:
            print("库存状况良好，无需生成警告报告。")

# --- 运行主程序 ---
if __name__ == "__main__":
    # 定义文件名
    raw_csv = "inventory_raw.csv"
    report_csv = "inventory_report.csv"

    tool = InventoryAnalyzer(raw_csv, report_csv)
    
    # 第一步：造数据
    tool.generate_dummy_data()
    
    # 第二步：分析并生成报告
    tool.analyze_and_report()
```

## 总结

*   **首选 DictReader/DictWriter**：大多数情况下，使用字典模式处理 CSV 更直观，不易出错（不用数第几列）。
*   **类型转换**：CSV 读取出来默认都是字符串，涉及到计算务必转 `int` 或 `float`。
*   **编码与换行**：永远记得 `newline=''` 和 `encoding='utf-8'`。

