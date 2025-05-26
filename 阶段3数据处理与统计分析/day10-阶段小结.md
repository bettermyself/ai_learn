## 阶段小结

### 1 数据处理

作用: 

- 数据分析
- 建模之间的数据处理 / 特征工程

#### Pandas

- 基本数据类型的方法和属性 Series /DataFrame
  - shape dtype index/columns  values series.name  loc/iloc
  - info() describe()  value_counts()  统计方法 sum/count/mean/min/max
- 数据的增加/删除/修改
  - df['名字'] = 
  - df.drop() 删除一行/一列  
  - df.drop_duplicates()
  - 修改行列名字
    - rename()
    - df.columns =    /df.index = 
      - df.columns.to_list() df.index.to_list()
- 数据清洗
  - 缺失值处理
    - df.fillna()
    - df.dropna()
  - 异常值处理
    - 异常值处理 目前采取的策略都是删除这部分数据
    - IQR = 3/4分位数 -1/4分位数   
      - 可以接受的数据上限  3/4分位数+1.5IQR
      - 可以接受的数据下限  1/4分位数-1.5IQR
  - 重复值处理
    - df.drop_duplicates()
- 数据处理/查询
  - 分组聚合
    - 分组转换
    - 分组过滤
  - 透视表
  - 连续值的列→类别的
    - pd.cut
  - 自定义的操作
    - s.apply( 函数对象)  函数处理的是Series中的每一个值
    - df.apply(函数对象)   函数处理的是Series  一列/一行

- 数据连接
  - concat   axis  join 'outer'/'inner'  默认outer
    - index 值相同
    - columns值相同
  - merge
    - 两列值相等, 建立关联
    - how outer inner left right
- 日期时间类型
  - datetime64 → DatetimeIndex
  - timedelta64 → TimedeltaIndex
  - Timestamp
  - pd.to_datetime(series)
  - df['date'].dt.XXX
- 可视化
  - matplotlib/pandas/seaborn
  - seaborn  自带颜色配色比较靠谱, 如果做Ppt给别人讲问题, 推荐用seaborn绘图
  - pandas 自己来发现数据中的规律找模式 可以使用pandas
  - matplotlib  控制比较精细的时候使用

Numpy

- ndarray  shape/size/ndim/dtype
- 生成初始化ndarray np.ones/np.zeros/np.empty()
- np.linspace/np.logspace

#### SQL

DDL/DML/DQL/DCL

DDL

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

rename table 表名 to  新表名
```

DML

- 插入数据

```sql
insert into 表(字段1, 字段2 ... ) values (值1, 值2...)
insert into 表 values (值1, 值2...) # 值的顺序和个数跟表结构完全一致
```

- 更新数据

```python
update 表名 set 字段=值, 字段=值...;
update 表名 set 字段=值, 字段=值... where 条件;
```

- 删除数据

```sql
delete from 表名 [where 条件] ;  # 可以不接where条件
truncate table 表名;
truncate category
```

约束

主键约束 Primary key  相当于 Not Null 和 Unique

自动增长 auto_increment

非空约束 Not Null 

唯一约束 Unique

默认值约束 DEFAULT

外键约束CONSTRAINT  foreign key(字段) REFERENCES 表名(字段)

DQL

```python
select * from 表名;
select 字段, 字段 from 表名
select 字段, 字段 from where
# 比较 > < != = >= <=
# 范围 BETWEEN .. AND...   IN(具体取值)
# 模糊查询  LIKE '%'零个或者多个任意字符  _ 一个字符
# 非空  IS NULL/ IS NOT NULL
# 逻辑 and or not
# 排序 ORDER BY  ASC 升序 默认值|DESC降序 
```

聚合函数

```SQL
count() # count(*)不过滤空值 count(字段)会过滤空值
sum()
max()
min()
avg() 
```

分组 group by

```sql
select 字段1,字段2 , 聚合函数(字段) FROM 表名 GROUP BY 分组字段 HAVING 分组条件
select category_id, count(*) from product GROUP BY category_id Having count(*)>1
LIMIT M(从第几条开始), N要显示多少条
```

多表查询

select * from a inner join b on a.字段=b.字段

select * from a left join b on 条件

select * from a right join b on 条件



子查询

select * from 表名 as 别名 where 别名.列名 = (select 字段 from 表名 where 条件)

查询的结果保存成一张表

```sql
create table test_rfm(select 年份,会员ID from rfm);
```

select XXX from (select XXX from) c

子查询作为一张表来使用的时候, 一定更要起别名

case when  将数值型列 → 类别型 作用和pandas的cut 类似

```python

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

开窗函数/窗口函数/window function

- Mysql 8.0以后才能用

```sql
select 窗口函数 over(partition by 分组字段 order by 排序字段)
```



- count/sum/min/max/mean  分组之后, 组内的每一个值和聚合值之间进行计算
  - 开窗partition by 接聚合  和 group by 分组聚合之间的区别
    -  group by 分组 之后 聚合的结果和分组字段有多少个取值相关
    - 开窗partition by 接聚合  原始数据有多少条, 结果还有多少条
- row_number()/rank()/dense_rank()  组内排序



### 2 Liunx

基本命令

cd / ls / 相对路径 绝对路径

目录文件的创建/删除/移动/复制/查看文件内容

- touch 创建文件  mkdir
- 查看 cat/more
- 复制/移动  cp mv
- 删除 rm 

查找

- which

- find

grep |

vi/vim

- 命令模式 ESC
- 编辑模式   i a o
- 底行模式  :

常用操作

- 常用快捷键

  - ctrl + c /ctrl+d

- 当端口被占用, 如何杀掉占用的进程

  - netstat -anp |grep 端口号 → 占用当前端口的进程编号
  - ps -ef|grep 进程编号  → 进程的详细信息
  - kill -9 进程编号

- 配置环境变量

  - /etc/profile

    export PATH=$PATH:/路径

  - ~/.bashrc

- 压缩解压缩
  打包

  - tar  `tar -cvf xxx.tar  要打包的文件1.xxx 要打包的文件2.xxxx`
  - tar.gz  `tar -zcvf xxx.tar.gz  要打包的文件1.xxx 要打包的文件2.xxxx`

  解包

  - tar  `tar -xvf xxx.tar -C 要解到的路径`
  - tar.gz  `tar -zxvf xxx.tar.gz  -C 要解到的路径`

  zip/unzip

  `zip XXX.zip  要打包的文件1.xxx 要打包的文件2.xxxx`

  `zip -r XXX.zip  要打包的文件夹 要打包的文件.xxxx`

  `upzip XXX.zip -d 要解压到的路径`

用户和权限

chmod +x XXX.sh

chmod 777 文件名            chmod 521 文件名   101010001  r-x-w---x

chown xxx  文件名   chown :xxx 文件名