## 1、数据处理

### 1.1 核心作用 

- **数据分析**：数据清洗、转换、聚合，为分析提供高质量数据
- **特征工程**：为机器学习建模准备特征，包括特征构造、分箱、归一化等



### 1.2 Pandas 核心操作

#### 1.2.1 数据结构

| **类型**      | **属性**                                        | **方法**                                   |
| :------------ | :---------------------------------------------- | :----------------------------------------- |
| **Series**    | `dtype`, `index`, `name`, `values`              | `value_counts()`, `describe()`, `apply()`  |
| **DataFrame** | `shape`, `columns`, `index`, `dtypes`, `values` | `info()`, `head()`, `tail()`, `describe()` |



#### 1.2.2 数据增删改

```python
# 增加列
df['新列'] = values

# 删除数据
df.drop('A', axis=0)  # 删除单行
df.drop('col1', axis=1)  # 删除单列
df.drop(index=['A', 'B'])  # 删除多行,使用 index 或 columns 参数时，无需再指定 axis。
df.drop(columns=['col1', 'col2'])  # 删除多列

# 删除重复行
df_unique = df.drop_duplicates()  # 默认删除完全相同的行，保留第一个出现的行
df_unique = df.drop_duplicates(subset=['col1', 'col2'])  # 根据指定列删除重复行

# 修改列名
df.rename(columns={'旧列名':'新列名'}, inplace=True)
df.columns = ['列1', '列2']  # 批量修改列名
df.index = ['行1','行2']  # 修改索引名
```

> `df.columns.to_list()`、`df.index.to_list()`



#### 1.2.3 数据清洗

```python
# 缺失值处理
df.fillna(value=0)  # 填充缺失值
df.dropna(axis=0)   # 删除含缺失值的行

# 异常值处理（IQR法示例）,目前采取的策略都是删除这部分数据
Q1 = df['列名'].quantile(0.25)
Q3 = df['列名'].quantile(0.75)
IQR = Q3 - Q1
df = df[(df['列名'] >= Q1-1.5*IQR) & (df['列名'] <= Q3+1.5*IQR)]

# 重复值处理
df.drop_duplicates(subset=['列名'])
```



#### 1.2.4 高级操作

##### **a、分组聚合**：

**目的**：对每个分组计算汇总统计量（如总和、均值等），生成汇总后的新 DataFrame。

**核心方法**

- `groupby().agg()`：接受聚合函数（内置或自定义）。
- 常用内置函数：`sum`, `mean`, `max`, `min`, `std`, `count` 等。

```python
df.groupby('分组列')['聚合列'].agg(['sum', 'mean'])
df.groupby('分组列').agg({'聚合列': 'mean','聚合列': 'max'})
```

**关键点**

- 可对不同的列应用不同的聚合函数。
- 结果的多级列索引可以通过 `agg_result.columns = ['列名1', '列名2', ...]` 简化。



##### b、分组转换（Transformation）

**目的**：对每个分组内的数据应用一个函数，返回与原 DataFrame 相同形状的结果（如标准化、填充缺失值）。

**核心方法**

- `groupby().transform()`：接受函数或字符串方法。

```python
# 分组转换：计算每个分组内 Value 列的 Z-Score 标准化
df['Value_ZScore'] = df.groupby('Category')['Value'].transform(
    lambda x: (x - x.mean()) / x.std()
)

# 分组转换：填充缺失值为组内均值
df['Value'] = df.groupby('Category')['Value'].transform(lambda x: x.fillna(x.mean()))
```

**关键点**

- 转换后的结果与原数据行数一致。
- 常用于特征工程（如归一化、排名等）。



##### c、分组过滤（Filtration）

**目的**：根据分组的统计结果筛选出符合条件的组（如过滤掉小样本组）。

**核心方法**

- `groupby().filter()`：接受一个返回布尔值的函数，决定是否保留该组。

```python
# 分组过滤：保留组内行数 >= 2 的组
filtered_df = df.groupby('Category').filter(lambda group: len(group) >= 2)

# 分组过滤：保留 Sales 总和超过 300 的组
filtered_df = df.groupby('Category').filter(lambda group: group['Sales'].sum() > 300)
```

**关键点**

- `filter()` 的参数函数作用于每个分组，返回 `True` 则保留该组的所有行。



**对比总结**

| **操作类型** | **输入**           | **输出**             | **典型应用场景**               |
| :----------- | :----------------- | :------------------- | :----------------------------- |
| 聚合         | 每个分组           | 每组一行（汇总统计） | 计算分组统计量（总和、均值等） |
| 转换         | 每个分组的每行数据 | 与原数据行数相同     | 组内标准化、填充缺失值、排名   |
| 过滤         | 每个分组           | 符合条件的组的所有行 | 删除小样本组、按条件筛选分组   |



##### **e、透视表**：

```python
df.pivot_table(index='行分组列',columns='列分组列',values='数值列',aggfunc='聚合函数'  )
```



##### **f、分箱（Binning）**：

```python
pd.cut(df['连续列'], bins=[0, 50, 100], labels=['低', '高'])
```



##### g、自定义操作

```python
series.apply(函数对象)  # 函数处理的是Series中的每一个值
df.apply(函数对象)  # 函数处理的是Series  一列/一行
```



#### 1.2.5 数据连接

concat：**index 值相同**或者**columns值相同**

```python
pd.concat([df1, df2], axis=0)  # axis  join 'outer'/'inner'  默认outer外连接
```

merge：**横向合并**，两列值相等, 建立关联

```python
pd.merge(df1, df2, on='关联列', how='inner')  # how outer inner left right
```



#### 1.2.6 时间处理

- datetime64 → DatetimeIndex
- timedelta64 → TimedeltaIndex
- Timestamp
- pd.to_datetime(series)
- df['date'].dt.XXX

```python
df['日期列'] = pd.to_datetime(df['日期列'])
df['年份'] = df['日期列'].dt.year
df['月份'] = df['日期列'].dt.month
df['星期'] = df['日期列'].dt.day_name()
```





#### 1.2.7 可视化

| **场景**   | **推荐工具** | **特点**              |
| :--------- | :----------- | :-------------------- |
| 探索性分析 | Pandas内置   | 快速简便，`df.plot()` |
| 正式报告   | Seaborn      | 美观统计图形          |
| 高度定制   | Matplotlib   | 精细控制              |



### 1.3 NumPy 核心操作

- **数组属性**（ndarray  ）：`shape`, `dtype`, `ndim`, `size`
- **数组创建**：

```python
# 生成初始化ndarray np.ones/np.zeros/np.empty()
np.array([1,2,3])          # 一维数组
np.zeros((3,3))            # 3x3零矩阵

# np.linspace/np.logspace
np.linspace(0, 10, 5)      # 生成等差数组 [0, 2.5, 5, 7.5, 10]
```



### 1.4 SQL 核心语法

#### 1.4.1 DDL（数据定义）

```sql
create database if not exists 数据库名字 charset=utf-8

show databases;

use 数据库名

drop database 数据库名字;

create table if not exists 表名(字段名1 类型(长度) [约束], 字段名2 类型(长度) [约束],....)

create table category ( cid varchar(20) primary key not null , cname varchar(100));

show tables;

desc 表名;

drop table 表名;

alter table 表名 add 列名 类型(长度) [约束];

alter table 表名 change 旧列名 新列名 类型(长度) [约束];

alter table 表名 drop 列名 ;

rename table 表名 to 新表名
```



#### 1.4.2 DML（数据操作）

- 插入数据

```sql
insert into 表(字段1, 字段2 ... ) values (值1, 值2...)
insert into 表 values (值1, 值2...) # 值的顺序和个数跟表结构完全一致
```

- 更新数据

```sql
update 表名 set 字段=值, 字段=值...;
update 表名 set 字段=值, 字段=值... where 条件;
```

- 删除数据

```sql
delete from 表名 [where 条件] ;  # 可以不接where条件（不指定 WHERE 时删除所有行，但保留表结构）
truncate table 表名;  # 作用：快速清空整个表，删除所有行，并释放存储空间（保留表结构）。
truncate category  # 同 truncate table 表名;
```

> 约束：主键约束 Primary key  相当于 Not Null 和 Unique；自动增长 auto_increment；非空约束 Not Null ；唯一约束 Unique；默认值约束 DEFAULT；外键约束CONSTRAINT  foreign key(字段) REFERENCES 表名(字段)



#### 1.4.3 DQL（数据查询）

```python
select * from 表名;
select 字段1, 字段2 from 表名
select 字段1, 字段2 from 表名 where
# 比较 > < != = >= <=
# 范围 BETWEEN .. AND...   IN(具体取值)
# 模糊查询  LIKE '%'零个或者多个任意字符  _ 一个字符  *多个字符
# 非空  IS NULL/ IS NOT NULL
# 逻辑 and or not
# 排序 ORDER BY  ASC 升序 默认值|DESC降序 
```



**聚合函数**

```SQL
count() # count(*)不过滤空值 count(字段)会过滤空值
sum()
max()
min()
avg() 
```



**分组 group by**

```sql
select 字段1,字段2,聚合函数(字段) FROM 表名 GROUP BY 分组字段 HAVING 分组条件
select category_id, count(*) from product GROUP BY category_id Having count(*)>1
LIMIT M(从第几条开始), N要显示多少条
```



**多表查询**

```sql
select * from a inner join b on a.字段=b.字段

select * from a left join b on a.字段=b.字段

select * from a right join b on a.字段=b.字段
```



**子查询**

```sql
# 将其他表的查询结果作为一个值
select * from 表名 as 别名 where 别名.列名 = (select 字段 from 表名 where 条件)
# 子查询作为一张表来使用的时候, 一定更要起别名
select XXX from (select XXX from) c
```





**查询的结果保存成一张表**

```sql
create table test_rfm(select 年份,会员ID from rfm);
```



#### 1.4.4 高级技巧

- **CASE WHEN 分箱**：将数值型列 → 类别型 作用和pandas的cut 类似

```sql
SELECT
  product_id,
  product_name,
  units_in_stock,
  CASE
    WHEN units_in_stock > 100 THEN 'high'
    WHEN units_in_stock > 50 THEN 'moderate'
    WHEN units_in_stock > 0 THEN 'low'
    WHEN units_in_stock = 0 THEN 'none'
  END AS availability
FROM products;
```



- **窗口函数**(Mysql 8.0以后才能用)

```sql
select 窗口函数 over(partition by 分组字段 order by 排序字段)
```

##### a、聚合类窗口函数

对组内每个值与聚合函数进行计算（如 `COUNT/SUM/MIN/MAX/AVG`），**不减少原表行数**。

```sql
-- 示例：
SELECT 
    user_id, 
    order_amount,
    SUM(order_amount) OVER(PARTITION BY user_id) AS user_total
FROM orders;
```

`窗口函数`🆚 与 `GROUP BY` 的区别

| **特性**             | `GROUP BY` 分组聚合       | `PARTITION BY` 窗口聚合       |
| :------------------- | :------------------------ | :---------------------------- |
| **结果行数**         | 等于分组字段的取值数量    | **等于原始数据行数**          |
| **聚合值展示位置**   | 每个分组单独一行展示      | 每行显示对应分组的聚合值      |
| **能否保留原始字段** | 只能显示分组字段+聚合结果 | 可同时显示所有原始字段+聚合值 |



##### b、排序类窗口函数

在分组内按指定字段排序并编号（需配合 `ORDER BY`）。

常用函数对比：

| **函数**       | **特点**                     | **示例结果** (分数：100, 95, 95, 90) |
| :------------- | :--------------------------- | :----------------------------------- |
| `ROW_NUMBER()` | 唯一连续编号（不处理重复值） | 1, 2, 3, 4                           |
| `RANK()`       | 相同值同序号，后续**跳号**   | 1, 2, 2, 4                           |
| `DENSE_RANK()` | 相同值同序号，后续**不跳号** | 1, 2, 2, 3                           |



## 2. Linux 常用命令

### 2.1 基本命令

**1. 路径类型**

- **绝对路径**：从根目录 `/` 开始，如 `/home/user/file.txt`
- **相对路径**：相对于当前目录，如 `./file.txt`（当前目录） 或 `../folder`（上级目录）



**2. 基本命令速查**

| **分类**     | **命令**    | **功能**           | **常用参数**                                      |
| :----------- | :---------- | :----------------- | :------------------------------------------------ |
| **目录操作** | `cd`        | 切换目录           | `cd ~`，`cd /path`，`cd ../`                      |
|              | `ls`        | 列出目录内容       | `-l`（详情），`-a`（隐藏文件）                    |
| **文件操作** | `touch`     | 创建文件           | `touch file.txt`（创建空文件）                    |
|              | `mkdir`     | 创建目录           | `-p`（递归创建）`mkdir -p dir1/dir2`              |
|              | `cat`       | 查看文件           | `cat file.txt`（显示全部内容（适合小文件））      |
|              | `more`      | 查看文件，支持分页 | `more file.txt`                                   |
|              | `less`      | 查看文件，支持分页 | `less file.txt`                                   |
|              | `head/tail` | 查看文件头/尾      | `-n 5`（指定行数）`head -n 5 file.txt`：查看前5行 |
|              | `cp`        | 复制文件           | `-r`（递归）`cp file.txt newfile.txt`：复制文件   |
|              | `cp`        | 复制文件夹         | `cp -r dir1 dir2`：递归复制目录                   |
|              | `mv`        | 移动文件           | `mv file.txt newdir/`：移动文件                   |
|              | `mv`        | 重命名             | `mv oldname.txt newname.txt`：重命名              |
|              | `rm`        | 删除               | `-rf`（强制递归删除）                             |
| **查找**     | `find`      | 文件搜索           | `-name "*.txt"`                                   |
|              | `grep`      | 内容搜索           | `-i`（忽略大小写）                                |
| **编辑器**   | `vi/vim`    | 文本编辑           | 三种模式切换                                      |



**4. 查找**

- **`which`**：查找命令的绝对路径
  - `which python` → 输出 `/usr/bin/python`

- **`find`**：高级文件搜索
  - 按名称查找：`find /home -name "*.txt"`
  - 按类型查找：`find . -type d`（查找目录）
- **`grep`**：文本内容搜索
  - `grep "error" log.txt`：查找包含 "error" 的行
  - 结合管道：`cat log.txt | grep "error"`



**5. vi/vim 编辑器模式**

- **三种模式切换**：

```sh
命令模式（ESC） → 编辑模式（i/a/o） → 底行模式（:）
```

- **常用操作**：
  - **命令模式**：
    - `i`：插入模式
    - `dd`：删除当前行
    - `yy`：复制当前行
    - `p`：粘贴
  - **底行模式**：
    - `:wq`：保存并退出
    - `:q!`：强制退出不保存
    - `:/keyword`：搜索关键字



### 2.2 常用操作

**1. 常用快捷键**

| 快捷键     | 作用                                    |
| :--------- | :-------------------------------------- |
| `Ctrl + C` | 终止当前正在运行的命令                  |
| `Ctrl + D` | 退出当前终端或结束输入流（如`cat`命令） |
| `Ctrl + L` | 清屏                                    |



**2. 端口占用处理**

```sh
# 1. 查找占用端口的进程ID（PID）
netstat -anp | grep 端口号 
# 2. 获取进程的详细信息
ps -ef| grep 进程编号
# 3. 杀死进程
kill -9 进程编号
```



**3. 环境变量配置**

1. **全局配置**（所有用户生效）
   编辑 `/etc/profile`，添加以下内容：

   ```sh
   export PATH=$PATH:/自定义路径
   ```

   生效命令：

   ```sh
   source /etc/profile
   ```

2. **用户级配置**（仅当前用户生效）
   编辑 `~/.bashrc` 或 `~/.bash_profile`，添加相同内容，然后执行：

   ```sh
   source ~/.bashrc
   ```



**4. 压缩与解压缩**

| 格式      | 压缩命令                                     | 解压命令                                |
| :-------- | :------------------------------------------- | :-------------------------------------- |
| `.tar`    | `tar -cvf 压缩包名.tar 文件1 文件2 ...`      | `tar -xvf 压缩包名.tar -C 目标路径`     |
| `.tar.gz` | `tar -zcvf 压缩包名.tar.gz 文件1 文件夹 ...` | `tar -zxvf 压缩包名.tar.gz -C 目标路径` |
| `.zip`    | `zip -r 压缩包名.zip 文件1 文件夹 ...`       | `unzip 压缩包名.zip -d 目标路径`        |

**关键参数说明**：

- `-c`: 创建压缩包
- `-x`: 解压
- `-v`: 显示过程
- `-f`: 指定文件名
- `-z`: 处理gzip压缩
- `-r`: 递归压缩目录（zip专用）



**5. 用户和权限**

| 操作                   | 命令示例             | 用途                                |
| :--------------------- | :------------------- | :---------------------------------- |
| 添加执行权限           | `chmod +x script.sh` | 使脚本可执行                        |
| 设置权限为 `rwxr-x--x` | `chmod 751 file`     | 用户：全权，组：读+执行，其他：执行 |
| 修改所有者             | `chown alice file`   | 将文件所有者改为 `alice`            |
| 修改所属组             | `chown :dev file`    | 将文件所属组改为 `dev`              |