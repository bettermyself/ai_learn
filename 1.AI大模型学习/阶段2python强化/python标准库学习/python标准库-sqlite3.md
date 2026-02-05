Python 的 sqlite3 标准库是处理轻量级、基于文件的数据库的绝佳工具。它不需要单独的服务器进程，非常适合小型应用、原型开发和数据分析。

### 第一部分：核心 API 详解

sqlite3 的使用主要围绕两个核心对象：Connection（连接） 和 Cursor（游标）。

#### 1. 建立连接与基本对象 (Connect & Cursor)

* `sqlite3.connect(database)`: 连接到数据库。如果文件不存在，会自动创建。
* `connection.cursor()`: 创建游标对象，用于执行 SQL 语句。

```python
import sqlite3

# 1. 连接到数据库
# 'example.db' 是文件名。如果想在内存中运行（不保存文件），使用 ':memory:'
conn = sqlite3.connect('example.db')

# 2. 创建游标
cursor = conn.cursor()

print("数据库连接成功")
```

#### 2. 执行 SQL 语句 (Execute & Create Table)

* `cursor.execute(sql)`: 执行单条 SQL 语句。

```python
# 创建一个表 (如果不存在)
# 常用数据类型: NULL, INTEGER, REAL (浮点数), TEXT, BLOB
create_table_sql = '''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    email TEXT
)
'''
cursor.execute(create_table_sql)
```

#### 3. 插入数据与参数化查询 (Insert & Placeholders)

**重要：** 为了防止 SQL 注入攻击，永远不要使用 Python 的字符串拼接（如 f-string）来构建 SQL。请使用 `?` 占位符。

* `cursor.execute(sql, parameters)`: 安全地带参数执行。

```python
# 错误的做法 (有 SQL 注入风险):
# cursor.execute(f"INSERT INTO users VALUES ('{name}', {age})") 

# 正确的做法 (使用 ? 占位符):
user_data = ('Alice', 30, 'alice@example.com')
cursor.execute('INSERT INTO users (name, age, email) VALUES (?, ?, ?)', user_data)

# 另一种占位符风格 (命名风格):
user_data_dict = {'n': 'Bob', 'a': 25, 'e': 'bob@example.com'}
cursor.execute('INSERT INTO users (name, age, email) VALUES (:n, :a, :e)', user_data_dict)
```

#### 4. 批量操作 (Executemany)

* `cursor.executemany(sql, seq_of_parameters)`: 一次性执行多条相同结构的 SQL，性能比循环调用 `execute` 高得多。

```python
users_list = [
    ('Charlie', 35, 'charlie@xyz.com'),
    ('David', 40, 'david@xyz.com'),
    ('Eve', 22, 'eve@xyz.com')
]

cursor.executemany('INSERT INTO users (name, age, email) VALUES (?, ?, ?)', users_list)
```

#### 5. 提交与回滚 (Commit & Rollback)

数据修改（增删改）不会立即写入磁盘，必须显式提交。

* `connection.commit()`: 保存更改。
* `connection.rollback()`: 撤销自上次提交以来的更改（通常在发生错误时使用）。

```python
try:
    # 模拟一个事务
    cursor.execute("UPDATE users SET age = 31 WHERE name = 'Alice'")
    
    # 假设这里发生了一个错误
    # raise Exception("模拟错误")
    
    conn.commit() # 成功则提交
    print("事务提交成功")
    
except Exception as e:
    conn.rollback() # 出错则回滚
    print(f"发生错误，已回滚: {e}")
```

#### 6. 查询数据 (Fetch)

执行 SELECT 语句后，使用 fetch 方法获取结果。

* `cursor.fetchone()`: 获取下一行数据（返回元组或 None）。
* `cursor.fetchmany(size)`: 获取指定数量的行（返回列表）。
* `cursor.fetchall()`: 获取剩余所有行（返回列表）。

```python
cursor.execute('SELECT * FROM users WHERE age > 25')

# 获取第一条
row1 = cursor.fetchone()
print(f"第一条: {row1}")

# 获取剩余所有
rows = cursor.fetchall()
print("其余结果:")
for row in rows:
    print(row)
```

#### 7. 高级技巧：使用 sqlite3.Row (字典化访问)

默认返回的行是元组 `(1, 'Alice', ...)`，通过索引访问不直观。设置 `row_factory` 可以像字典一样通过列名访问。

```python
# 设置行工厂
conn.row_factory = sqlite3.Row
cursor = conn.cursor() # 重新获取游标

cursor.execute('SELECT * FROM users LIMIT 1')
row = cursor.fetchone()

# 现在可以通过列名访问
print(f"Name: {row['name']}, Email: {row['email']}")
# 也可以像元组一样访问
print(f"ID: {row[0]}")
```

#### 8. 执行脚本与关闭 (Script & Close)

* `cursor.executescript(sql_script)`: 执行包含多条 SQL 语句（用分号隔开）的字符串。
* `connection.close()`: 关闭数据库连接，释放资源。

```python
script = """
DELETE FROM users WHERE name = 'Bob';
UPDATE users SET age = 100 WHERE name = 'Eve';
"""
cursor.executescript(script)
conn.commit()

conn.close() # 最后别忘了关闭
```

### 第二部分：实战小项目——简易库存管理系统

这是一个完整的命令行小工具，用于管理商品库存。它演示了上下文管理器（`with`）、增删改查（CRUD）以及异常处理的综合运用。

**功能：**

* 初始化数据库。
* 添加商品。
* 调整库存。
* 查询所有商品。
* 查询低库存预警。

```python
import sqlite3
import sys

class InventoryManager:
    def __init__(self, db_name="inventory.db"):
        self.db_name = db_name
        self.init_db()

    def get_connection(self):
        # 使用 row_factory 让结果更易读
        conn = sqlite3.connect(self.db_name)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """初始化数据库表结构"""
        sql = '''
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            price REAL NOT NULL,
            quantity INTEGER DEFAULT 0
        )
        '''
        with self.get_connection() as conn:
            # 在 sqlite3 模块中，Connection 对象内部会自动管理 Cursor。当你调用 conn.execute(sql) 时，实际上是隐式地创建了一个 Cursor 对象，并通过它执行 SQL 语句，如果 SQL 语句是查询（如 SELECT），conn.execute() 会返回一个 Cursor 对象，你可以通过它获取结果。如果是其他操作（如 INSERT、UPDATE、DELETE），则不会返回结果。
            conn.execute(sql)
            # 这里的 commit 是自动处理的，因为使用了 context manager (with conn:)
            # 注意：只有在 conn 作为上下文管理器时才会自动 commit，cursor 不会。

    def add_product(self, name, price, quantity):
        """添加新产品"""
        try:
            with self.get_connection() as conn:
                conn.execute(
                    "INSERT INTO products (name, price, quantity) VALUES (?, ?, ?)",
                    (name, price, quantity)
                )
            print(f"成功添加产品: {name}")
        except sqlite3.IntegrityError:
            print(f"错误: 产品 '{name}' 已存在。")

    def update_stock(self, name, change_amount):
        """更新库存 (正数为入库，负数为出库)"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            # 检查产品是否存在
            cursor.execute("SELECT quantity FROM products WHERE name = ?", (name,))
            row = cursor.fetchone()
            
            if not row:
                print(f"错误: 找不到产品 '{name}'")
                return

            new_qty = row['quantity'] + change_amount
            if new_qty < 0:
                print(f"错误: 库存不足，操作取消。当前库存: {row['quantity']}")
                return

            cursor.execute("UPDATE products SET quantity = ? WHERE name = ?", (new_qty, name))
            action = "入库" if change_amount > 0 else "出库"
            print(f"{action}成功。'{name}' 新库存: {new_qty}")

    def list_products(self):
        """列出所有产品"""
        print("\n--- 当前库存清单 ---")
        print(f"{'ID':<5} {'名称':<20} {'价格':<10} {'库存':<10}")
        print("-" * 45)
        
        with self.get_connection() as conn:
            cursor = conn.execute("SELECT * FROM products ORDER BY id")
            for row in cursor:
                print(f"{row['id']:<5} {row['name']:<20} {row['price']:<10.2f} {row['quantity']:<10}")
        print("-" * 45 + "\n")

    def check_low_stock(self, threshold=5):
        """检查库存不足的产品"""
        print(f"--- 预警：库存低于 {threshold} 的产品 ---")
        with self.get_connection() as conn:
            cursor = conn.execute("SELECT name, quantity FROM products WHERE quantity < ?", (threshold,))
            rows = cursor.fetchall()
            if not rows:
                print("暂无缺货风险。")
            else:
                for row in rows:
                    print(f"警告: {row['name']} (剩余: {row['quantity']})")

# --- 运行示例 ---
if __name__ == "__main__":
    manager = InventoryManager()

    # 1. 添加一些初始数据
    print(">>> 初始化数据...")
    manager.add_product("Python 编程书", 59.90, 20)
    manager.add_product("机械键盘", 399.00, 5)
    manager.add_product("无线鼠标", 89.00, 50)
    
    # 尝试添加重复数据
    manager.add_product("Python 编程书", 60, 10) 

    # 2. 查看列表
    manager.list_products()

    # 3. 模拟销售 (出库)
    print(">>> 模拟销售...")
    manager.update_stock("机械键盘", -3) # 卖出3个
    manager.update_stock("Python 编程书", -100) # 尝试卖出过多

    # 4. 查看低库存预警
    print("\n>>> 检查库存...")
    manager.check_low_stock(threshold=10)
    
    # 5. 最终确认
    manager.list_products()
```

### 关键点总结 (Best Practices)

* **Context Managers (`with`):**
    * 推荐写法：`with sqlite3.connect("db") as conn:`。
    * 优点：如果代码块内发生异常，自动 rollback；如果正常结束，自动 commit。无需手动写 `try/except/commit`。
* **安全性:**
    * 始终使用 `?` 或 `:name` 占位符。
* **并发性:**
    * SQLite 是文件级锁。虽然支持多个进程同时读取，但同一时间只能有一个进程（或线程）进行写入。如果你的应用需要高并发写入，可能需要考虑 PostgreSQL 或 MySQL。

