# APP Store 数据分析案例

## 学习目标

- 掌握描述性数据分析流程
- 熟练使用pandas、seaborn进行数据分析和可视化

## 1 案例介绍

- 案例背景
  - 对APP下载和评分数据分析帮助App开发者获取和留存用户
  - 通过对应用商店的数据分析为开发人员提供可操作的意见
- 通过数据分析要解决的问题
  - 免费和收费的App都集中在哪些类别
  - 收费app的价格是如何分布的，不同类别的价格分布怎样
  - App文件的大小和价格以及用户评分之间是否有关
- 分析流程
  - 数据概况分析
    - 数据行/列数量 
    - 缺失值分布
  - 单变量分析
    - 数字型变量的描述指标（平均值，最小值，最大值，标准差等）
    - 类别型变量（多少个分类，各自占比）
  - 多变量分析
    - 按类别交叉对比
    - 变量之间的相关性分析
  - 可视化分析
    - 分布趋势（直方图）
    - 不同组差异（柱状图）
    - 相关性（散点图/热力图）

- 数据字段说明
  - id : App ID 每个App唯一标识
  - track_name: App的名称
  - size_bytes: 以byte为单位的app大小
  - price：定价（美元）
  - rating_count_tot: App所有版本的用户评分数量
  - rating_count_ver: App当前版本的用户评分数量
  - prime_genre: App的类别
  - user_rating: App所有版本的用户评分
  - sup_devices.num: 支持的iOS设备数量
  - ipadSc_urls.num: app提供的截屏展示数量
  - lang.num 支持的语言数量

## 2 数据清洗

- 加载数据查看数据基本信息

```python
#调用基本包
import pandas as pd
#数据读取
app=pd.read_csv('data/applestore.csv')
#数据的基本信息
app.info()
```

><font color='red'>显示结果：</font>
>
>```shell
><class 'pandas.core.frame.DataFrame'>
>RangeIndex: 7197 entries, 0 to 7196
>Data columns (total 11 columns):
> #   Column            Non-Null Count  Dtype  
>---  ------            --------------  -----  
> 0   Unnamed: 0        7197 non-null   int64  
> 1   id                7197 non-null   int64  
> 2   track_name        7197 non-null   object 
> 3   size_bytes        7197 non-null   int64  
> 4   price             7197 non-null   float64
> 5   rating_count_tot  7197 non-null   int64  
> 6   user_rating       7197 non-null   float64
> 7   prime_genre       7197 non-null   object 
> 8   sup_devices       7197 non-null   int64  
> 9   ipadSc_urls       7197 non-null   int64  
> 10  lang              7197 non-null   int64  
>dtypes: float64(2), int64(7), object(2)
>memory usage: 618.6+ KB
>```

```python
app.head()
```

- 发现了unname 0这个奇怪的变量，需要进行清理

```python
app.drop('Unnamed: 0',axis=1,inplace=True)
#drop默认是对行
#inplace表示直接替换掉原有数据
#同样可以用位置来取
#app.drop(app.columns[0],axis=1,inplace=True)
app.describe()
```

- 考虑将sizebytes变成mb，新增数据

```python
app['size_mb'] = app['size_bytes'] / (1024 * 1024.0)
app.size_mb.describe()
```

><font color='red'>显示结果：</font>
>
>```shell
>count    7197.000000
>mean      189.909414
>std       342.566408
>min         0.562500
>25%        44.749023
>50%        92.652344
>75%       173.497070
>max      3839.463867
>Name: size_mb, dtype: float64
>```

- 根据价格新增标签

```python
app['paid'] = app['price'].apply(lambda x: 1 if x > 0 else 0)
#lambda阐述规则，X为price，为paid赋值，即当price＞0，paid为1，其他情况下，paid为0
app.paid.describe()
```

><font color='red'>显示结果：</font>
>
>```shell
>count    7197.000000
>mean        0.436432
>std         0.495977
>min         0.000000
>25%         0.000000
>50%         0.000000
>75%         1.000000
>max         1.000000
>Name: paid, dtype: float64
>```

- 小结
  - 清洗异常值（unamed)
  - 处理了给分析造成难度的值(size-bytes)
  - 添加了方便分析的特征（免费/收费)

## 3 单变量分析

```python
#value_counts (price,prime_genre)
#value_Coutn只能对应series，不能对整个dataframe做操作
app.price.value_counts()
```

><font color='red'>显示结果：</font>
>
>```shell
>0.00      4056
>0.99       728
>2.99       683
>1.99       621
>4.99       394
>3.99       277
>6.99       166
>9.99        81
>5.99        52
>7.99        33
>14.99       21
>19.99       13
>8.99         9
>24.99        8
>13.99        6
>11.99        6
>29.99        6
>12.99        5
>15.99        4
>59.99        3
>17.99        3
>22.99        2
>23.99        2
>20.99        2
>27.99        2
>16.99        2
>49.99        2
>39.99        2
>74.99        1
>18.99        1
>34.99        1
>99.99        1
>299.99       1
>47.99        1
>21.99        1
>249.99       1
>Name: price, dtype: int64
>```

- 从数据中可以看出，价格>50的比较少，将价格快速分组

```python
bins = [0,2,10,300]
labels = ['<2', '<10','<300']
app['price_new']=pd.cut(app.price, bins, right=False, labels=labels)
#分组后查看数据分布情况
app.groupby(['price_new'])['price'].describe()
```

><font color='red'>显示结果：</font>
>

- groupby的操作,不同类别app的价格分布

```python
app.groupby(['prime_genre'])['price'].describe()
```

><font color='red'>显示结果：</font>
>

- 删除价格大于等于49.99的app

```python
app=app[app['price']<=49.99]
#评论情况分析
app.rating_count_tot.describe()
```

><font color='red'>显示结果：</font>
>
>```shell
>count    7.190000e+03
>mean     1.290515e+04
>std      7.577526e+04
>min      0.000000e+00
>25%      2.725000e+01
>50%      3.005000e+02
>75%      2.796750e+03
>max      2.974676e+06
>Name: rating_count_tot, dtype: float64
>```

- 对用户打分的分组

```python
bins = [0,1000,5000,100000,5000000]
app['rating_new']=pd.cut(app.rating_count_tot, bins, right=False)
#用户打分和价格的关系
app.groupby(['rating_new'])['price'].describe()
```

><font color='red'>显示结果：</font>
>

## 4 业务数据可视化

```python
#可视化部分
import matplotlib.pyplot as plt
import seaborn as sns

```

查看不同应用类别的评分情况

```python
fig, ax = plt.subplots(figsize=(20,10))#调整大小
sns.barplot(x="prime_genre", y="user_rating",data=app) #柱状图
plt.xticks(
    rotation=45,
    horizontalalignment='right',
    fontweight='light',
    fontsize='x-large'
)
plt.show()
```

><font color='red'>显示结果：</font>
>
>![](assets/image-20230424020619932.png)

- 价格分布

```python
app1=app[app['price']<=9.99]
#直方图，APP价格的分布
sns.distplot(app1['price'])
```

><font color='red'>显示结果：</font>
>
>![assets](assets\appstore8.png)

- 从上面的结果中看出，大部分应用都是免费的，极少数APP的收费>5元

- 业务问题2：收费app的价格分布是如何的？不同类别之间有关系吗？

```python
plt.figure(figsize=(15,8))#调整大小
sns.boxplot(x='price',y='prime_genre',data=app[app['paid']==1])
plt.yticks(fontweight='light',fontsize='x-large')
```

><font color='red'>显示结果：</font>
>
>![assets](assets\appstore7.png)

- 价格绝大部分都集中在9.99美元以内，个别类别（如医疗）等因专业性总体价格会高于其他类别
- 通过箱线图，绘制前五个类别的app价格

```python
#只保留应用数量最多的前5个类别
top5 = app.groupby(['prime_genre'])['price'].count().sort_values(ascending = False).head().index.tolist()
app5 = app[app.prime_genre.isin(top5)]
plt.figure(figsize=(10,8))#调整大小
sns.boxplot(x='price',y='prime_genre',data=app5[app['paid']==1])
```

><font color='red'>显示结果：</font>
>
>![assets](assets\appstore6.png)

- 从上图可以看出，Games的价格分布更广，最大值也较高，异常值也较多

- 关于箱线图

  ![](assets/app_plot10.png)

  - 箱子的中间有一条线，代表了数据的中位数
  - 箱子的上下底，分别是数据的上四分位数（Q3）和下四分位数（Q1）
  - 箱体包含了50%的数据。因此，**箱子的高度在一定程度上反映了数据的波动程度**
  - 上下边缘则代表了该组数据的最大值和最小值
  - 有时候箱子外部会有一些点，可以理解为数据中的“**异常值**” 
  
- 散点图，价格和用户评分的分布

```python
plt.figure(figsize=(10,8))
sns.scatterplot(x='price',y='user_rating',data=app)
```

><font color='red'>显示结果：</font>
>
>![assets](assets\appstore5.png)

- 从散点图可以看出，价格和评价关联不强，高价的应用评价两级分化，但数据相对较少

```python
sns.jointplot(x='price',y='user_rating',data=app,kind='hex',height=10) #散点图
#从散点图可以看出，价格和评价关联不强，高价的应用评价两级分化，但数据相对较少
plt.show()
```

<img src="assets/image-20230424015521067.png" style="zoom:50%;" />



- 柱状图，前5个类别app的用户评分均值

```python
#同一类别，将免费和付费的评分进行对比
plt.figure(figsize=(10,8))
sns.barplot(x='prime_genre',y='user_rating',hue='paid',data=app5)
```

><font color='red'>显示结果：</font>
>
>![assets](assets\appstore4.png)

## 5 业务解读

- 问题一 免费或收费APP集中在哪些类别
  - 第一步，将数据加总成每个类别有多少个app
  - 第二步，从高到低进行排列
  - 第三步，将数据进行可视化
  
  ```python
  #使用countplot--count是对数据加总，plot将数据进行可视化
  #参数order 指定数据显示的顺序
  plt.figure(figsize=(20,10))
  sns.countplot(y='prime_genre',hue='paid',data=app,order=app['prime_genre'].value_counts().index)
  plt.tick_params(labelsize=20)
  ```
  
  ><font color='red'>显示结果：</font>
  >
  >![assets](assets\appstore1.png)
  
  - 业务解答：免费或收费都是高度集中在游戏类别

- 免费与收费的APP在不同评分区间的分布

  -  将评分进行分箱，查看落入不同箱中应用的数量

  ```python
  bins=[0,0.5,2.5,4.5,5.1]
  app['rating_level']=pd.cut(app.user_rating,bins,right=False)
  app.groupby(['rating_level'])['user_rating'].describe()
  ```

  ><font color='red'>显示结果：</font>
  >
  >|              |  count |     mean |      std |  min |  25% |  50% |  75% |  max |
  >| -----------: | -----: | -------: | -------: | ---: | ---: | ---: | ---: | ---: |
  >| rating_level |        |          |          |      |      |      |      |      |
  >|   [0.0, 0.5) |  929.0 | 0.000000 | 0.000000 |  0.0 |  0.0 |  0.0 |  0.0 |  0.0 |
  >|   [0.5, 2.5) |  206.0 | 1.650485 | 0.400213 |  1.0 |  1.5 |  2.0 |  2.0 |  2.0 |
  >|   [2.5, 4.5) | 2903.0 | 3.646056 | 0.467987 |  2.5 |  3.5 |  4.0 |  4.0 |  4.0 |
  >|   [4.5, 5.1) | 3152.0 | 4.578046 | 0.181500 |  4.5 |  4.5 |  4.5 |  4.5 |  5.0 |

  ```python
  plt.figure(figsize=(15,8))
  sns.countplot(x='paid',hue='rating_level',data=app)
  ```

  ><font color='red'>显示结果：</font>
  >
  >![assets](assets\appstore2.png)

  -   免费和收费APP，评分的分布基本相似，收费的APP低分的相对少一些

  

- 业务问题3：APP的大小和用户评分之间有关系吗？

  -   通过热力图来查看变量之间两两相关系数

  ```python
  q4=['user_rating','price','size_mb']
  app[q4].corr()
  ```

  ><font color='red'>显示结果：</font>
  >
  >|             | user_rating | price    | size_mb  |
  >| :---------- | :---------- | :------- | :------- |
  >| user_rating | 1.000000    | 0.073237 | 0.066160 |
  >| price       | 0.073237    | 1.000000 | 0.314386 |
  >| size_mb     | 0.066160    | 0.314386 | 1.000000 |

  ```python
  sns.heatmap(app[q4].corr())
  #热力图，展现变量之间两两之间关系的强弱
  ```

  ><font color='red'>显示结果：</font>
  >
  >
  >
  >![assets](assets\appstore3.png)
  >
  >-   业务解答：应用的大小、价格与评分没有很明显的关联，但是价格和大小之间有正相关关系

## 小结

- 常规的探索性数据分析套路：查看概况->单变量分析->多变量分析->可视化分析
- Seaborn绘图的时候，有些api在调整图片大小时，使用plt.figure(figsize=())无效，此时可以使用 `height` 关键字来控制图片高度 `aspect` 控制宽高比例
- Seaborn在绘制柱状图的时候，可以使用hue参数 传入类别型变量，方便进行对比