## 1、金融风控相关业务介绍

### 1.1 信贷&风控介绍

#### 信贷业务本质

- 商业银行和互联网金融的核心盈利业务
- 运作模式：通过放款收回本金和利息，扣除成本获得利润
- 核心能力：预测用户还款概率，向高还款概率用户放贷



#### 风控核心价值

- **风险来源**：小额贷无抵押物，存在用户违约风险
- **风控目标**：管理信用风险，减少坏账损失
- **风控策略**：
  - 高风险用户：拒绝放款
  - 中风险用户：降低额度、提高利率



#### 风险分类体系

| 风险类型     | 特征                  | 应对系统     |
| :----------- | :-------------------- | :----------- |
| **信用风险** | 还款能力/意愿出现问题 | 信用评分系统 |
| **欺诈风险** | 恶意诈骗不还款        | 反欺诈系统   |



#### 传统审批 vs AI风控

| 维度     | 人工审批       | 机器学习模型   |
| :------- | :------------- | :------------- |
| 效率     | 低（单笔处理） | 高（批量处理） |
| 处理量   | 有限           | 百万级/天      |
| 准确性   | 依赖经验       | 数据驱动       |
| 适用场景 | 大额贷款       | 金融零售业务   |





### 1.2 常见信贷产品及常见风险介绍

#### 主流信贷产品

| 个人信贷产品 |              |                                     |
| ------------ | ------------ | ----------------------------------- |
| 大额借贷     | 房贷车贷     |                                     |
|              | 小微企业贷   |                                     |
| 小额借贷     | 消费贷       | 蚂蚁花呗，京东白条                  |
|              | 现金贷       | 蚂蚁借呗，京东金条，微粒贷,各类网贷 |
| 数据服务     | 信用分服务   | 芝麻信用分，京东小白分              |
|              | 信用数据服务 | 同盾数据，百融，集奥，大峰...       |



#### 现金贷产品特征

申请借款->放款给客户->客户还款

| 维度     | 参数           |
| :------- | :------------- |
| 额度     | 500~3000元     |
| 利率     | 24%~36%        |
| 期限     | 7/14/30天      |
| 放款形式 | 现金，不限场景 |
| 可选功能 | 订单展期       |



#### 消费贷产品特征

  信用卡，花呗，白条等产品，申请消费贷 -> 额度授信->客户使用消费贷消费

| 维度     | 参数                   |
| :------- | :--------------------- |
| 额度     | 1000~10000元           |
| 利率     | 24%                    |
| 账期     | 30天                   |
| 放款形式 | 指定消费场景           |
| 可选功能 | 分期/最低还款/临时额度 |



#### 产品类型与还款方式

**产品类型**：

- 单期产品
- 多期产品
- 循环额度产品

**还款方式**：

- 砍头息（含服务费）
- 等额本金
- 等额本息



#### 风险形式分析

- **冒名顶替/黑产骗贷**

- **多头借贷风险链**：

  ```tex
  多张信用卡 → 多个网贷平台 → 借新还旧 → 负债增加 → 流动性风险 → 逾期
  ```

  - 风险信号：大量借款APP、催收短信

- **POS机套现**

  - 手续费0.6%，实现资金周转

- **数据造假**

  - 刻意制造良好信用记录
  - 典型行为：花呗分期购物、基金保险购买



### 1.3 风控相关术语介绍

| 术语        | 解释                                                         |
| ----------- | ------------------------------------------------------------ |
| DPD         | Day  past due 逾期天数  DPD0为到期当日，DPD1为逾期一日，DPD7为逾期一周 |
| FPD         | First  time past due 首次逾期天数                            |
| F/S/T/QPD   | 首次  二次 三次 四次 逾期天数                                |
| M1          | 逾期1-30天                                                   |
| M1+         | 逾期30天以上                                                 |
| default     | 坏账                                                         |
| delinquency | 拖欠                                                         |
| flow  rate  | 流动率  一般指M1向M2，M2向M3转移的比例                       |
| bad  rate   | 坏账率（不良资产/总资产）                                    |
| vintage     | 账龄分析                                                     |

> **重点术语**：DPD、M1 在业务中使用频率最高



## 2、风控业务案例

### 2.1 案例背景及目的

- **数据集**：基于真实业务数据改造
- **关键字段**：
  - 账单金额 - 实收金额 = 未收金额
  - 应付日期 = 还款时间
  - 账期类型：60天/90天
  - 实际到账日空白 = 未还款

- **目的：**

  - 每个季度账单金额和坏账率（逾期90天以上）
    - 坏账率=所有未收金额/所有账单金额
    - 未收金额 = 账单金额-实收金额

  - 每个季度60天账期的入催率，90天账单的入催率
    - 入催率 = 入催金额/账单金额

  - 历史逾期天数的回款情况（回收账单数）
    - 历史逾期天数：历史有逾期，但是相对现在来说，钱已经还完了
    - 当前逾期天数：现在还欠着钱，也就是说钱没还完



![image-20200421234104098](assets\day01/fk1.png)



### 2.2代码实现

- 数据加载

```python
import pandas as pd
from pyecharts.charts import *  # 画图需要，暂时不需要了解pyecharts画图的代码
from pyecharts import options as opts

df1 = pd.read_excel('data/业务数据.xlsx') 

#要使用原始数据构建新指标，所以保留原始数据，copy新的数据，在新的数据中创建新指标
df2 = df1.copy()
df2.head()
```

>**显示结果**
>
>|      | 销售 | 账单状态 | 账单周期 | 账单金额 | 开票金额 | 实收金额 | 未收金额 | 预计付款日 |   应付日期 | 商务催收日期 | 账期 | 实际到账日 | 开票日期 | 客服 |
>| ---: | ---: | -------: | -------: | -------: | -------: | -------: | -------: | ---------: | ---------: | -----------: | ---: | ---------: | -------: | ---: |
>|    0 | s101 |   未确认 |  2019-05 |  29805.0 |      NaN |      NaN |      NaN | 2019-07-31 | 2019-07-31 |   2019-08-15 |   60 |        NaN |      NaN | a201 |
>|    1 | s102 |   未确认 |  2019-05 |   1572.6 |      NaN |      NaN |      NaN | 2019-07-31 | 2019-07-31 |   2019-08-15 |   60 |        NaN |      NaN | a202 |
>|    2 | s103 |   已确认 |  2019-04 | 487551.2 | 487551.2 |      NaN | 487551.2 | 2019-06-30 | 2019-06-30 |   2019-07-15 |   60 |        NaN |    05-16 | a203 |
>|    3 | s104 |   已确认 |  2019-04 | 378835.0 | 378835.0 |      NaN | 378835.0 | 2019-07-31 | 2019-07-31 |   2019-08-15 |   90 |        NaN |    05-08 | a204 |
>|    4 | s105 |   已确认 |  2019-04 | 326866.0 | 326866.0 |      NaN | 326866.0 | 2019-07-31 | 2019-07-31 |   2019-08-15 |   90 |        NaN |    05-10 | a205 |



- 查看数据基本情况

```python
df2.info()
```

>显示结果，需要用到的字段**开票金额、实收金额、未收金额、实际到账日**存在空值，**日期**全部为object类型
>
>```shell
><class 'pandas.core.frame.DataFrame'>
>RangeIndex: 5257 entries, 0 to 5256
>Data columns (total 14 columns):
> #   Column  Non-Null Count  Dtype  
>---  ------  --------------  -----  
> 0   销售      5257 non-null   object 
> 1   账单状态    5257 non-null   object 
> 2   账单周期    5257 non-null   object 
> 3   账单金额    5257 non-null   float64
> 4   开票金额    5010 non-null   float64
> 5   实收金额    4470 non-null   float64
> 6   未收金额    5010 non-null   float64
> 7   预计付款日   5256 non-null   object 
> 8   应付日期    5257 non-null   object 
> 9   商务催收日期  5257 non-null   object 
> 10  账期      5257 non-null   int64  
> 11  实际到账日   4387 non-null   object 
> 12  开票日期    4996 non-null   object 
> 13  客服      5257 non-null   object 
>dtypes: float64(4), int64(1), object(9)
>memory usage: 575.1+ KB
>```

```python
df2.describe()
```

>显示结果
>
>|       |     账单金额 |     开票金额 |     实收金额 |     未收金额 |        账期 |
>| ----: | -----------: | -----------: | -----------: | -----------: | ----------: |
>| count | 5.257000e+03 | 5.010000e+03 | 4.470000e+03 | 5.010000e+03 | 5257.000000 |
>|  mean | 4.073241e+04 | 4.096896e+04 | 4.082419e+04 | 4.684636e+03 |   64.539661 |
>|   std | 8.176172e+04 | 8.007245e+04 | 7.970628e+04 | 2.888464e+04 |   15.622765 |
>|   min | 0.000000e+00 | 2.500000e+01 | 0.000000e+00 | 0.000000e+00 |    0.000000 |
>|   25% | 5.103000e+03 | 5.300000e+03 | 5.112250e+03 | 0.000000e+00 |   60.000000 |
>|   50% | 1.436500e+04 | 1.486560e+04 | 1.434000e+04 | 0.000000e+00 |   60.000000 |
>|   75% | 4.178000e+04 | 4.220250e+04 | 4.170750e+04 | 0.000000e+00 |   75.000000 |
>|   max | 1.508796e+06 | 1.356215e+06 | 1.301665e+06 | 1.277098e+06 |   90.000000 |



- 数据处理，填充缺失值，将日期时间类型转换成datetime类型

```python
# 获取最大的日期，作为当前时间
today_time = pd.to_datetime(df2['实际到账日'].fillna('0').max())

#给缺失值填充0
df2['实收金额'] = df2['实收金额'].fillna(0)
df2['未收金额'] = df2['未收金额'].fillna(0)
df2['开票金额'] = df2['开票金额'].fillna(0)

#把时间类型转换为datetime类型
df2['账单周期'] = pd.to_datetime(df2['账单周期'])
df2['应付日期'] = pd.to_datetime(df2['应付日期'])

df2['实际到账日'] = pd.to_datetime(df2['实际到账日']).fillna(today_time)
```

> **为什么fillna填充的参数0需要用引号？**
>
> - df2['实际到账日'] 这一列是字符串（object）类型而不是日期（datetime）或数字类型。用不带引号的 0（即数字）填充会导致类型不匹配，因为 fillna(0) 表示用整数 0 填充，而字符串列无法直接接受数值类型。
>
> **既然df2['实际到账日'] 是字符串类型，为什么可以用max来取最大的日期？**
>
> - 字符串在进行比较时（例如 '2023-01-01' > '2022-12-31'），会按照字符的 Unicode 编码逐个字符进行比较。这种比较方式称为“字典序”。
> - 如果 df2['实际到账日'] 列中的日期格式是标准的（如 'YYYY-MM-DD'），那么字符串的字典序和实际的日期顺序是一致的。
> - 如果日期字符串格式不统一（例如混合了 '2023-01-01' 和 '01/01/2023'），字典序比较可能会导致错误的结果。
> - 在进行复杂的日期操作（如计算时间差、提取月份等）时，建议将字符串转换为 datetime 类型



- 为了后续计算，在原始数据基础上构造新的字段：是否到期，是否到期90天，未收金额2（校验原始数据中的未收金额），历史逾期天数，当前逾期天数

```python
df2['是否到期'] = df2.apply(lambda x : 0 if x.应付日期 > today_time else 1,axis=1)  # 这里axis=1代表按行，按列会提示ValueError: The truth value of a Series is ambiguous. Use a.empty, a.bool(), a.item(), a.any() or a.all().

#map可以看做是apply，效果类似
df2['是否到期90天'] =  ( today_time - df2.应付日期 ).map(lambda x : 1 if x.days >= 90 else 0)

df2['未收金额2'] =  (df2.账单金额 - df2.实收金额)

df2['历史逾期天数'] = df2.apply(lambda x : (x.实际到账日 -  x.应付日期).days if x.未收金额2 == 0  else  (today_time - x.应付日期).days,axis=1)

#df2['当前逾期天数'] = df2.apply(lambda x : (x.历史逾期天数) if x.未收金额2 > 0  else 0 ,axis = 1)
df2['当前逾期天数'] = df2.apply(lambda x:(today_time - x['应付日期']).days if x['未收金额2'] > 0 else 0,axis=1)
```



- 查询实际到账日期字段得知当前最近的到账日为2019年5月17日，如果以2019年5月17日为观察点，有些贷款还没到还款日，没法统计DPD90的数据，所以，这里只统计2019年之前的情况，下面将对应时间段的数据取出

```python
df3 =df2.copy()
#创建’账单季度‘字段，将日期转换成季度，to_period函数可以转换为季度信息
df3['账单季度'] = df3['账单周期'].map(lambda x : x.to_period('Q'))
#提取2017年3季度到2018年4季度数据
df3 = df3[(df3['账单季度']<='2018Q4') & (df3['账单季度']>='2017Q3')]
df3.shape
```

><font color='red'>显示结果</font>
>
>```
>(3856, 20)
>```



- 按照季度统计账单金额，到期金额(逾期90天以上)，和逾期金额(逾期90天以上)

```python
#账单金额
fn1 = df3.groupby('账单季度')[['账单金额']].sum()
fn1.columns = ['账单金额']
fn1
```

><font color='red'>显示结果</font>
>
>|          |    账单金额 |
>| -------: | ----------: |
>| 账单季度 |             |
>|   2017Q3 |  8247952.62 |
>|   2017Q4 | 11643604.99 |
>|   2018Q1 | 17149674.79 |
>|   2018Q2 | 31097661.29 |
>|   2018Q3 | 38292071.12 |
>|   2018Q4 | 51963089.64 |

```python
#90天到期金额
df4 = df3[(df3.是否到期90天 == 1)]
fn2 = df4.groupby('账单季度')[['账单金额']].sum()
fn2.columns = ['到期金额']
fn2
```

><font color='red'>显示结果</font>
>
>|          |    到期金额 |
>| -------: | ----------: |
>| 账单季度 |             |
>|   2017Q3 |  8247952.62 |
>|   2017Q4 | 11643604.99 |
>|   2018Q1 | 17149674.79 |
>|   2018Q2 | 31097661.29 |
>|   2018Q3 | 38292071.12 |
>|   2018Q4 | 28265677.59 |

```python
#当前逾期90+金额
df4 = df3[(df3.是否到期90天 == 1)]
fn3 = df4.groupby('账单季度')[['未收金额2']].sum()
fn3.columns = ['当前逾期90+金额']
fn3
```

><font color='red'>显示结果</font>
>
>|          | 当前逾期90+金额 |
>| -------: | --------------: |
>| 账单季度 |                 |
>|   2017Q3 |         63883.0 |
>|   2017Q4 |         57380.0 |
>|   2018Q1 |         64283.0 |
>|   2018Q2 |        106930.0 |
>|   2018Q3 |        412920.1 |
>|   2018Q4 |        304183.0 |



- 合并数据计算坏账率

```python
dfs = [fn1,fn2,fn3]
final1 = pd.concat(dfs,axis=1)
final1
```

><font color='red'>显示结果</font>
>
>|          |    账单金额 |    到期金额 | 当前逾期90+金额 |
>| -------: | ----------: | ----------: | --------------: |
>| 账单季度 |             |             |                 |
>|   2017Q3 |  8247952.62 |  8247952.62 |         63883.0 |
>|   2017Q4 | 11643604.99 | 11643604.99 |         57380.0 |
>|   2018Q1 | 17149674.79 | 17149674.79 |         64283.0 |
>|   2018Q2 | 31097661.29 | 31097661.29 |        106930.0 |
>|   2018Q3 | 38292071.12 | 38292071.12 |        412920.1 |
>|   2018Q4 | 51963089.64 | 28265677.59 |        304183.0 |

```python
final1['90+净坏账率'] = round(final1['当前逾期90+金额'] / final1.到期金额,3)
final1
```

><font color='red'>显示结果</font>
>
>|          |    账单金额 |    到期金额 | 当前逾期90+金额 | 90+净坏账率 |
>| -------: | ----------: | ----------: | --------------: | ----------: |
>| 账单季度 |             |             |                 |             |
>|   2017Q3 |  8247952.62 |  8247952.62 |         63883.0 |       0.008 |
>|   2017Q4 | 11643604.99 | 11643604.99 |         57380.0 |       0.005 |
>|   2018Q1 | 17149674.79 | 17149674.79 |         64283.0 |       0.004 |
>|   2018Q2 | 31097661.29 | 31097661.29 |        106930.0 |       0.003 |
>|   2018Q3 | 38292071.12 | 38292071.12 |        412920.1 |       0.011 |
>|   2018Q4 | 51963089.64 | 28265677.59 |        304183.0 |       0.011 |

- pyecharts绘图

```python
bar = (
    Bar()
    .add_xaxis(list(final1.index.values.astype(str)))
    .add_yaxis(
        "账单金额",
        list(final1.账单金额),
        yaxis_index=0,
        color="#5793f3",
    )
    .set_global_opts(
        title_opts=opts.TitleOpts(title="90+净坏账率"),
    )
    .extend_axis(
        yaxis=opts.AxisOpts(
            name="90+净坏账率",
            type_="value",
            min_=0,
            max_=0.014,
            position="right",
            axisline_opts=opts.AxisLineOpts(
                linestyle_opts=opts.LineStyleOpts(color="#d14a61")
            ),
            axislabel_opts=opts.LabelOpts(formatter="{value}"),
        )
    )
)
line = (
    Line()
    .add_xaxis(list(final1.index.values.astype(str)))
    .add_yaxis(
        "90+净坏账率",
        list(final1['90+净坏账率']),
        yaxis_index=1,
        color="#675bba",
        label_opts=opts.LabelOpts(is_show=False),
    )
)
bar.overlap(line).render()
```

><font color='red'>显示结果</font>
>
>![image-20200831162411053](assets\day01\fk2.png)



- 计算每个季度的60天账单金额、60天入催金额，90天账单金额、90天入催金额

```python
#60天账期的账单金额
df4 = df3[(df3.账期 == 60)&(df3.是否到期 == 1)]
fn1 = df4.groupby('账单季度')[['账单金额']].sum()
fn1.columns = ['60天账期的账单金额']
#60天账期的入催金额
df4 = df3[(df3.账期 == 60)&(df3.是否到期 == 1)&(df3.历史逾期天数>0)]
fn2 = df4.groupby('账单季度')[['未收金额2']].sum()
fn2.columns = ['60天账期的入催金额']
#90天账期的账单金额
df4 = df3[(df3.账期 == 90)&(df3.是否到期 == 1)]
fn3 = df4.groupby('账单季度')[['账单金额']].sum()
fn3.columns = ['90天账期的账单金额']
#90天账期的入催金额
df4 = df3[(df3.账期 == 90)&(df3.是否到期 == 1)&(df3.历史逾期天数>0)]
fn4 = df4.groupby('账单季度')[['未收金额2']].sum()
fn4.columns = ['90天账期的入催金额']
```

- 计算入催率

```python
dfs = [fn1,fn2,fn3,fn4]
final2 = pd.concat(dfs,axis=1)
# final2 = fn1.merge(fn2,on='账单季度').merge(fn3,on='账单季度',how='left').merge(fn4,on='账单季度')
final2['60天账期入催率'] = round(final2['60天账期的入催金额'] / final2['60天账期的账单金额'],3)
final2['90天账期入催率'] = round(final2['90天账期的入催金额']/final2['90天账期的账单金额'],3)
final2
```

><font color='red'>显示结果</font>
>
>|          | 60天账期的账单金额 | 60天账期的入催金额 | 90天账期的账单金额 | 90天账期的入催金额 | 60天账期入催率 | 90天账期入催率 |
>| -------: | -----------------: | -----------------: | -----------------: | -----------------: | -------------: | -------------: |
>| 账单季度 |                    |                    |                    |                    |                |                |
>|   2017Q3 |         4854770.94 |            36983.0 |          2769264.0 |             1900.0 |          0.008 |          0.001 |
>|   2017Q4 |         6737327.99 |            52750.0 |          3921491.0 |                0.0 |          0.008 |          0.000 |
>|   2018Q1 |        12106356.79 |            62460.0 |          4244304.0 |              800.0 |          0.005 |          0.000 |
>|   2018Q2 |        19234086.87 |            13590.0 |          8427775.0 |                0.0 |          0.001 |          0.000 |
>|   2018Q3 |        22830710.42 |           380265.1 |          9835629.0 |             8235.0 |          0.017 |          0.001 |
>|   2018Q4 |        26337959.52 |           584789.5 |         17706430.0 |           325141.0 |          0.022 |          0.018 |



- pyecharts绘图

```python
line = (
    Line()
    .add_xaxis(list(final1.index.values.astype(str)))
    .add_yaxis(
        "60天账期入催率",
        list(final2['60天账期入催率']),
        yaxis_index=0,
        color="#675bba",
        label_opts=opts.LabelOpts(is_show=False),
    )
    .set_global_opts(
    title_opts=opts.TitleOpts(title="不同账期入催率"),
    )
    .add_xaxis(list(final1.index.values.astype(str)))
    .add_yaxis(
        "90天账期入催率",
        list(final2['90天账期入催率']),
        yaxis_index=0,
        color="#d14a61",
        label_opts=opts.LabelOpts(is_show=False),
    )
)
line.render()
```

><font color='red'>显示结果</font>
>
>![image-20200831163551975](assets\day01\fk3.png)



- 历史逾期天数的回收情况（回收账单数）

```python
df5 = df3[(df3.未收金额2 == 0)&(df3.是否到期 == 1)].copy()
#使用cut，讲数据按照逾期天数分箱，然后添加分箱之后结果标签
df5['历史逾期天数'] = pd.cut(df5['历史逾期天数'],bins=[-999,0,5,10,15,20,30,60,90,999],right=True,
                       labels=['0','1-5','6-10','11-15','16-20','21-30','31-60','61-90','91+'])
final3 = df5.groupby('历史逾期天数')[['账期']].count()
final3.columns = ['回收账单数']
final3
```

><font color='red'>显示结果</font>
>
>|              | 回收账单数 |
>| -----------: | ---------: |
>| 历史逾期天数 |            |
>|            0 |       2400 |
>|          1-5 |        358 |
>|         6-10 |        235 |
>|        11-15 |        215 |
>|        16-20 |         92 |
>|        21-30 |        189 |
>|        31-60 |        156 |
>|        61-90 |         60 |
>|          91+ |         88 |

- pyecharts绘图

```python
ydata = final3['回收账单数'].values.tolist()
bar = (
    Bar()
    .add_xaxis(list(final3.index.values.tolist()))
    .add_yaxis("收回账单数",ydata,yaxis_index=0,color="#675bba")
    .set_global_opts(
    title_opts=opts.TitleOpts(title="不同逾期天数的已收回账单数"),
    )
)
bar.render()
```

><font color='red'>显示结果</font>
>
>![image-20200831164310198](assets\day01\fk4.png)



### 2.3 业务解读

- 从数据中看出，在2018年Q2季度之前，运营策略比较保守，坏账金额和入催率都比较低
- 2018年Q2之后，有可能是由于运营策略调整，给更多的人放贷，但坏账率和入催率均在3%一下，在合理范围内
- 不同逾期天数收回账单的数据看，30天内能收回绝大部分账单



### 2.4 案例流程小结

![1723280532691](assets\day01/1723280532691.png)



## 3、风控报表

###  3.1 信贷业务逻辑

**核心部门协作**：

```mermaid
graph LR
A[市场部] -->|获客| B[风控部]
B -->|审批| C[资金部]
C -->|放款| D[催收部]
D -->|回款| C
```

**信贷业务行为路径与转化漏斗**

- **首贷、复贷概念**
  - 第一次借款成功称为首贷
  - 借完一次之后， 再次借款称为复贷

- **首贷业务逻辑**

![](assets\day01\loan1.png)



- 在我们的数据库中，数据表大致分为两种形式，状态表和log表（日志表）
  - **状态表**：记录当前时刻状态（覆盖历史）
    
  - **日志表**：记录所有操作历史




- 信贷业务转化漏斗

  ![](assets\day01\loan2.png)



- 数据表中数据条数对应关系

  ![](assets\day01\loan3.png)



### 3.2 业务报表介绍

> Schema：表结构。
>

#### **注册表 (u_user)**

```mysql
CREATE TABLE `u_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `username` varchar(64) ,
  `mobile` varchar(20) ,
  `password` varchar(64) ,
  `nickname` varchar(64) ,
  `role_type` int NOT NULL DEFAULT '0' COMMENT '角色(-1:普通用户)',
  `type` int NOT NULL DEFAULT '0' COMMENT '(暂时保留)0：借款用户,1:资金账户用户',
  `status` int NOT NULL DEFAULT '0' COMMENT '用户状态',
  `on_off` char(4) NOT NULL DEFAULT '1' COMMENT '开关(0:关闭,1:开启)',
  `inserttime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '插入时间',
  `updatetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isactive` tinyint(1) NOT NULL DEFAULT '1' COMMENT '逻辑删除(1,有效)',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_mobile` (`mobile`,`on_off`,`status`,`isactive`,`password`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=11050 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
```

> - 一个手机号:对应注册表的一个id
>
>   - 一个手机号: 注册完成后, 对应一个user_id , 手机号和人
>
>
>   - 所以注册表有两种情况: 
>     - 有手机号, 但是没有user_id, 说明没有注册完成
>     - 有手机号,且有对应的user_id, 注册完成（通常风控的报表,从注册完成开始看）
>
> - 上表中不包含注册未完成的用户
>



#### **用户信息表 (u_personal_info)**

```mysql
CREATE TABLE `u_personal_info` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `user_id` bigint NOT NULL DEFAULT '0' COMMENT '用户id',
  `loan_purpose` varchar(255)  COMMENT '借款目的，tb_data_dict表中type=4',
  `sex` varchar(20)  COMMENT '性别(0：男 1：女)，tb_data_dict表中type=1',
  `birthdate` varchar(20)  COMMENT '出生日期',
  `birthplace` varchar(256)  COMMENT '出生地',
  `religion` varchar(20)  COMMENT '宗教，tb_data_dict表中type=3',
  `education` varchar(20)  COMMENT '教育程度，tb_data_dict表中type=2',
  `nation` varchar(20)  COMMENT '民族',
  `tribe` varchar(20)  COMMENT '部落，tb_data_dict表中type=10',
  `living_state` varchar(20)  COMMENT '居住状态，tb_data_dict表中type=9',
  `province` varchar(128)  COMMENT '居住省',
  `city` varchar(128)  COMMENT '居住市',
  `district` varchar(128)  COMMENT '居住区',
  `address` varchar(500)  COMMENT '居住详细地址',
  `children_number` varchar(20)  COMMENT '孩子数量(字典.type=15)',
  `number_of_provide` int DEFAULT NULL COMMENT '需供养人数',
  `phone_use_duration` varchar(20)  COMMENT '当前手机使用时长(字典)',
  `address_live_duration` varchar(20)  COMMENT '当前地址居住时长(字典)',
  `credit_card_number` varchar(20)  COMMENT '信用卡数量(字典)',
  `house_status` varchar(20)  COMMENT '住房状态(字典)',
  `other_phone_no` varchar(255)  COMMENT '其他电话号码',
  `email` varchar(128)  COMMENT '邮箱',
  `zalo_id` varchar(255) ,
  `facebook_id` varchar(255) ,
  `inserttime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '插入时间',
  `updatetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isactive` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否逻辑删除(1:不删除)',
  `app_version` varchar(20) ,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `user_id` (`user_id`,`isactive`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=871 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='个人信息';
```

> - 用户信息表的主键是id
> - 可以通过user_id 字段 与注册表进行关联
> - 除了personal_info之外还有work_info 关于用户不同维度的信息这里在不同的表中保存
>



#### **借款表 (loan_list)**

> 每次申请都会有一条记录

```mysql
CREATE TABLE `loan_list` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `borrower_id` bigint NOT NULL COMMENT '借款人ID',
  `apply_amount` decimal(18,2) NOT NULL COMMENT '用户申请的额度',
  `period_no` int NOT NULL COMMENT '期数',
  `term_quantity` int NOT NULL COMMENT '每期贷款时长',
  `term_unit` varchar(4) NOT NULL,
  `product_id` int NOT NULL COMMENT '产品ID',
  `prod_type` tinyint NOT NULL COMMENT '1=PDL, 2=INSTALLMENT',
  `interest` decimal(18,2) NOT NULL COMMENT '利息',
  `interest_rate` decimal(10,5) NOT NULL COMMENT '借款利率',
  `service_fee` decimal(18,2) NOT NULL COMMENT 'drools给的应收服务费，实际收取逻辑是service_fee - service_fee_discount',
  `service_fee_discount` decimal(18,2) DEFAULT '0.00' COMMENT '服务费优惠减免',
  `service_rate` decimal(10,5) NOT NULL COMMENT '借款服务费率',
  `service_fee_type` int NOT NULL COMMENT '服务费是否分期1是不分，2是分',
  `overdue_penalty_rate` decimal(10,5) NOT NULL COMMENT '逾期罚息费率',
  `overdue_notify_rate` decimal(10,5) NOT NULL COMMENT '逾期催收费率',
  `overdue_fixed_charge` decimal(10,2) NOT NULL COMMENT '滞纳金',
  `withdraw_adjust_amount` decimal(10,2) DEFAULT NULL COMMENT '提现的时候为了满足尾数需求（假设5的倍数），调整的金额，大于零表示实际提现金额比应提现金额大，小于零表示实际提现金额小于应提现金额',
  `status` int NOT NULL COMMENT '标的状态，兼容历史数据使用',
  `stage` int NOT NULL COMMENT '标的处在的生命周期阶段, 10初始化，30审核，40投标，50转账，70提现，80还款，100结束，负数表示流标',
  `current_stage_status` tinyint NOT NULL COMMENT '当前生命周期的状态， -1失败，0进行中，1成功',
  `list_title` varchar(80) ,
  `list_desc` varchar(200) ,
  `ass_type` int DEFAULT NULL COMMENT '攒标=1, 理财app可投； 不攒标=2,理财app不可投',
  `agreement_id` bigint DEFAULT NULL COMMENT '借款协议id',
  `loan_title` varchar(80) ,
  `loan_purpose_code` varchar(80) ,
  `audit_time` timestamp NULL DEFAULT NULL COMMENT '审核系统给出审核结果时间',
  `full_bid_time` timestamp NULL DEFAULT NULL COMMENT '成标时间',
  `effective_time` timestamp NULL DEFAULT NULL COMMENT '用户收到款项时间',
  `inserttime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isactive` tinyint DEFAULT NULL COMMENT '逻辑删除 null=删除 1=正常',
  `risk_pass_time` timestamp NULL DEFAULT NULL COMMENT '风控通过时间,兼容印尼使用，非印尼请使用audit_time',
  `amount` decimal(18,2) DEFAULT NULL COMMENT '借款金额，额度评估结果',
  `risk_level` varchar(20)  COMMENT 'pata给出标的风险等级',
  `result` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
  PRIMARY KEY (`id`) USING BTREE,
  KEY `idx_borrower_id` (`borrower_id`) USING BTREE,
  KEY `idx_status` (`status`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=1107 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='loan list table';
```

> - borrower_id  可以与注册表里的user_id进行关联
> - 之所以叫borrower_id  是因为这里的用户都发起了借款申请, 注册表中的用户不一定都会申请借款
>



#### **放款表 (loan_debt)**

```mysql
CREATE TABLE `loan_debt` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `list_id` bigint NOT NULL COMMENT '标的 id',
  `list_amount` decimal(18,2) NOT NULL COMMENT '标的金额',
  `agreement_id` bigint DEFAULT NULL COMMENT '借款协议id',
  `borrower_id` bigint NOT NULL COMMENT '借款人 id',
  `due_date` timestamp NOT NULL COMMENT '应还时间',
  `period_no` int NOT NULL COMMENT '分期期数',
  `period_seq` int NOT NULL COMMENT '第几期',
  `principal` decimal(18,2) NOT NULL COMMENT '本金',
  `interest` decimal(18,2) NOT NULL COMMENT '利息',
  `service_fee` decimal(18,2) NOT NULL COMMENT '服务费',
  `pre_service_fee` decimal(18,2) DEFAULT '0.00' COMMENT '前置收取的服务费',
  `penalty_fee` decimal(18,2) NOT NULL COMMENT '罚息',
  `overdue_notify_fee` decimal(18,2) NOT NULL COMMENT '催收',
  `amount` decimal(18,2) NOT NULL COMMENT '债务总额',
  `status` tinyint NOT NULL COMMENT 'debt status, 0=正常未还, 1=已还全部, 2=部分还款，3=未还逾期',
  `repay_code_status` tinyint DEFAULT NULL COMMENT '0=未生成, 1=手动生成,2=自动生成,3=生成失败',
  `repay_code_time` timestamp NULL DEFAULT NULL COMMENT '获取还款码的时间',
  `owing_principal` decimal(18,2) NOT NULL COMMENT '未付本金',
  `owing_interest` decimal(18,2) NOT NULL COMMENT '未付利息',
  `owing_service_fee` decimal(18,2) NOT NULL COMMENT '未付服务费',
  `owing_penalty_fee` decimal(18,2) NOT NULL COMMENT '未付罚息',
  `owing_overdue_notify_fee` decimal(18,2) NOT NULL COMMENT '未付罚息',
  `overdue_day` int DEFAULT NULL COMMENT '违约的天数',
  `owing_amount` decimal(18,2) NOT NULL COMMENT '未付债务总额',
  `payment_time` timestamp NULL DEFAULT NULL COMMENT '还款时间',
  `payment_amount` decimal(18,2) DEFAULT NULL COMMENT '已付总额',
  `overdue_fixed_charge` decimal(10,2) NOT NULL COMMENT '滞纳金',
  `user_actual_payment_time` timestamp NULL DEFAULT NULL COMMENT '用户实际还款的时间，来自资金',
  `version` int DEFAULT NULL COMMENT '版本',
  `inserttime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isactive` tinyint DEFAULT NULL COMMENT '逻辑删除 null=删除 1=正常',
  `init_due_date` datetime DEFAULT NULL COMMENT '债务初始化的应还时间',
  `delay_count` int DEFAULT '0' COMMENT '已成功展期的次数',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=7093 DEFAULT CHARSET=utf8mb3 COMMENT='债务';
```

> - 这张表是一个状态表, 还款信息只会记录最新的状态
>



#### 还款表

```mysql
CREATE TABLE `tb_repayment_slave_order` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `master_order_id` bigint NOT NULL DEFAULT '0' COMMENT '主订单ID',
  `borrower_id` bigint NOT NULL DEFAULT '0' COMMENT '借款人ID',
  `debt_id` bigint NOT NULL DEFAULT '0' COMMENT '债务ID',
  `principal` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '还款中的本金',
  `interest` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '还款中的利息',
  `penalty_fee` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '还款中的罚息',
  `overdue_notify_fee` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '还款中的催费',
  `service_fee` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '还款中的手续费',
  `inserttime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '插入时间',
  `updatetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isactive` tinyint(1) NOT NULL DEFAULT '1' COMMENT '逻辑删除(null=删除,1:未删除)',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=854 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='还款订单明细，可以推导出tb_repayment_record';
```

> - 还款表记录了每一笔还款的情况
> - 同一个订单可能会有多次还款
>



### 3.3 风控报表指标

| 部门       | 核心指标       | 报表类型               |
| :--------- | :------------- | :--------------------- |
| **市场部** | 转化率、留存率 | 转化漏斗表、渠道分析表 |
| **风控部** | 通过率、逾期率 | 通过率表、vintage表    |
| **催收部** | 催回率、接通率 | 催收绩效表、还款分布表 |
| **运营部** | 指标提升率     | 策略效果对比表         |



### 3.4 前置操作

#### 数据导入

数据在`loan.sql`文件，需要我们在MySQL中把它导入进去即可。

```shell
#0.启动MySQL数据库（一般是开机自启，忽略）
#查看MySQL的状态
systemctl status mysqld
#启动MySQL
systemctl start mysqld
#设置开机自启
systemctl enable mysqld
#禁止开机自启
systemctl disable mysqld

#1.登录MySQL数据库
mysql -uroot -p123456

#2.创建数据库
create database financial charset utf8;

#3.切换数据库
use financial;

#4.导入SQL数据，指定loan.sql文件在Linux的路径，不是一个具体的路径
#可以用工具，只要能导入成功就行
source /path/to/loan.sql
source /root/loan.sql
```



### 连接数据库

使用PyCharm工具远程连接MySQL数据库。

![1723284203066](assets\day01\1723284203066.png)

点击PyCharm工具右边的Database，新建数据源，选择MySQL，配置Host、Username、Password，Driver，点击测试连接，连接成功后，如下图所示：

![1716196410330](assets\day01\1716196410330.png)



## 4、风控基础报表介绍

### 4.1 各阶段转化率表

**需求**：统计每天注册的客户中，有多少人进行了申请，多少人通过，有多少人放款，有多少人还款

![image-20210804013834640](assets\day01\loan4.png)



- 需要注意的问题

  - 涉及到多张表， 用哪张表做主表
  - 用到哪些表, 怎么join
  - 需要注意的一些细节（一个人修改了多次信息， 一个人申请了多次）
  - 要做哪些计算

- 主表是哪张

  - 注册表的人数是最多的，我们的转化漏斗也是从注册开始，计算每一个环节的人数转化率
  - 以注册表作为主表去left join其它表不会有错

- 用到哪些表，怎么join

  - 用户的详细信息在personal_info表中, 用表中的user_id与主表的id相连
  - loan_list 借款申请表 borrower_id  对应注册表中的 id
  - loan_debt 放款表  list_id对应loan_list中的id

  ```mysql
  SELECT
  FROM
  	u_user AS u
  	LEFT JOIN u_personal_info AS pi ON u.id = pi.user_id
  	LEFT JOIN loan_list AS al ON al.borrower_id = u.id
  	LEFT JOIN loan_debt AS ld ON al.id = ld.list_id
  ```

- 一个人多次申请，一个人多条修改记录

  - 我们这里只统计人数，多条记录也是一个人头
  - 可以使用max 或者 distinct 取出一条用于计算人数

  ```mysql
  SELECT
  		u.id AS user_id, -- 用户ID
  		al.id AS list_id,-- 申请ID
  		ld.id AS order_id,-- 放款ID
  		date( u.inserttime ) AS regist_time,
  		max( CASE WHEN pi.user_id IS NOT NULL THEN 1 ELSE 0 END ) AS if_fillin_pi,
  		max( CASE WHEN al.borrower_id IS NOT NULL THEN 1 ELSE 0 END ) AS if_apply,
  		max( CASE WHEN al.STATUS > 70 THEN 1 ELSE 0 END ) AS if_pass,
  		max( CASE WHEN ld.borrower_id IS NOT NULL THEN 1 ELSE 0 END ) AS if_loan,
  		max( CASE WHEN ld.payment_amount > 0 THEN 1 ELSE 0 END ) AS if_pay,
  		max( CASE WHEN ld.owing_principal = 0 THEN 1 ELSE 0 END ) AS if_pay_1done 
  		-- owing_principal欠款本金
  	FROM
  		u_user AS u
  		LEFT JOIN u_personal_info AS pi ON u.id = pi.user_id
  		LEFT JOIN loan_list AS al ON al.borrower_id = u.id
  		LEFT JOIN loan_debt AS ld ON al.id = ld.list_id 
  	GROUP BY
  		u.id,
  		al.id,
  		ld.id 
  	ORDER BY
  		u.id 
  ```

- 完整SQL

```mysql
WITH temp AS (
	SELECT
		u.id AS user_id,
		al.id AS list_id,
		ld.id AS order_id,
		date( u.inserttime ) AS regist_time,
		max( CASE WHEN pi.user_id IS NOT NULL THEN 1 ELSE 0 END ) AS if_fillin_pi, -- 是否填表
		max( CASE WHEN al.borrower_id IS NOT NULL THEN 1 ELSE 0 END ) AS if_apply, -- 是否申请
		max( CASE WHEN al.STATUS > 70 THEN 1 ELSE 0 END ) AS if_pass, -- 是否通过
		max( CASE WHEN ld.borrower_id IS NOT NULL THEN 1 ELSE 0 END ) AS if_loan, -- 是否借款
		max( CASE WHEN ld.payment_amount > 0 THEN 1 ELSE 0 END ) AS if_pay, -- 是否还款
		max( CASE WHEN ld.owing_principal = 0 THEN 1 ELSE 0 END ) AS if_pay_1done  -- 是否还清
	FROM
		u_user AS u
		LEFT JOIN u_personal_info AS pi ON u.id = pi.user_id
		LEFT JOIN loan_list AS al ON al.borrower_id = u.id
		LEFT JOIN loan_debt AS ld ON al.id = ld.list_id 
	GROUP BY
		u.id,
		al.id,
		ld.id 
	ORDER BY
		u.id 
	) SELECT
	regist_time,
	count( user_id ) AS regist_num,
	sum( if_fillin_pi ) AS fill_in_pi_num,
	sum( if_apply ) AS apply_num,
	sum( if_pass ) AS pass_num,
	sum( if_loan ) AS loan_num,
	sum( if_pay ) AS pay_num,
	sum( if_apply )/ count( user_id ) AS '注册→申请',
	sum( if_pass )/ sum( if_apply ) AS '申请→通过',
	sum( if_loan )/ sum( if_pass ) AS '通过→放款',
	sum( if_pay )/ sum( if_loan ) AS '放款→还过款',
	sum( if_pay_1done )/ sum( if_loan ) AS '还款→至少1期还完' 
FROM
	temp 
GROUP BY
	regist_time 
ORDER BY
	regist_time
```



### 4.2 通过率表

统计每天申请的客户有多少人，有多少人申请通过

- user_type 新客老客，如何区分

![image-20210804024430685](assets\day01\loan5.png)



- 主表：统计申请的情况，所以主表肯定是申请表

  ```mysql
  select 
  from loan_list as l
  ```

- 定义新客，老客

  - 放过款的客户，再来申请，就是老客
  - 没放过款的客户，就是新客，可能是第一次来，也可能是之前的申请被拒接了
  - 所以先计算第一次成功借款时间

  ```mysql
  select borrower_id,min(effective_time) as effective_time 
  -- 第一次成功放款时间 等于 loan_debt inserttime
  from loan_list
  where stage in (80,100) --成功标志
  group by borrower_id
  ```

  - 当前申请时间与第一次成功放款时间比较, 得出新老客定义

  ```mysql
  with first_loan as (
  select borrower_id,min(effective_time) as effective_time  
  from loan_list
  where stage in (80,100) -- 成功标志
  group by borrower_id
  )
  SELECT ls.borrower_id,case when ls.inserttime > first_loan.effective_time THEN '老客' else '新客' end as user_type
  from loan_list ls
  left join first_loan
  on ls.borrower_id = first_loan.borrower_id
  	
  ```

- 计算整张报表

```mysql
with first_loan as (
select borrower_id,min(effective_time) as effective_time  
from loan_list
where stage in (80,100) -- 成功标志
group by borrower_id
), -- 多个with as同时写的时候，with只能写一次，后面都是 临时表名 + as，select部分需要通过括号包裹起来，多个as需要用都好分割
u_type as (
SELECT ls.*,case when ls.inserttime > first_loan.effective_time THEN '老客' else '新客' end as user_type
from loan_list ls
left join first_loan
on ls.borrower_id = first_loan.borrower_id
)
SELECT date(l.inserttime) as apply_time,
user_type,l.period_no,
l.term_quantity,
count(l.id) as apply_num,
sum(case WHEN l.`status`>70 then 1 else 0 end ) as if_pass_num,
avg(l.apply_amount) as mean_apply_amount,
sum(case WHEN l.`status`>70 then 1 else 0 end ) /count(l.id) as passrate -- 申请通过数量/申请数量 计算通过率
from loan_list l 
LEFT JOIN u_type on u_type.id = l.id
WHERE user_type is not null
GROUP BY apply_time,user_type,l.period_no,l.term_quantity -- 看每天, 不同的客群(新客, 老客) 不同的产品 通过率
ORDER BY apply_time,user_type
```



### 放款统计表

- 统计每天放款的客户, 有多少人是新客, 多少人是老客, 件均是多少

![image-20210804030346994](C:\Users\Administrator\Desktop\ai_learn\阶段5金融风控\assets\day01\loan6.png)

- 在通过率的报表基础上, 直接更换主表为放款loan_debt 表即可

```mysql
with first_loan as (
select borrower_id,min(effective_time) as effective_time  
from loan_list
where stage in (80,100) -- 成功标志
group by borrower_id
),
u_type as (
SELECT ls.*,case when ls.inserttime > first_loan.effective_time THEN '老客' else '新客' end as user_type
from loan_list ls
left join first_loan
on ls.borrower_id = first_loan.borrower_id
)
SELECT 
date(ld.inserttime) as '放款日',
user_type,
l.period_no,
concat(l.term_quantity,l.term_unit) as '期限', -- concat函数 字符串拼接
COUNT(DISTINCT list_id) as loan_num,
sum(ld.list_amount) /COUNT(DISTINCT list_id) as '件均'
FROM loan_debt ld
LEFT JOIN loan_list l on ld.list_id = l.id
LEFT JOIN u_type on u_type.id = l.id
WHERE user_type is not null
GROUP BY 1,2,3,4
ORDER BY 1,2
```



### Vintage报表

- vintage这个词源于葡萄酒业，意思是葡萄酒的酿造年份。

- 我们在比较放贷质量的时候，要按账龄（month of book，MOB  ）的长短同步对比，从而了解同一产品不同时期放款的资产质量情况。

- 举例来说，今天是2021年6月25日，我们取今天贷款第一期到期的客户作为观察群体，观察他们今后29天的还款情况。如果你将将今天所有贷款到期的客户作为观察群体（里面有第一期到期的，也有第二期到期的，也有第三期到期的，等等），那么这个群体里面的客户就不是位于同一层面上了。

- 到了下个月，7月25号，我们取7月25号贷款第一期到期的客户作为观察群体，观察他们之后29天的还款情况。这样你就可以比较6月25号的群体和7月25号的群体的还款情况差异

- 如果8月25号的群体还款质量有显著性降低，那么你可能会审视一下你这一个月来的营销策略是否变宽松了，或者这一个月来国家政策有什么改动等等

  | 当期未还本金/当期应还金额 | DAY0 | DAY1 | .... | DAY29 |
  | ------------------------- | ---- | ---- | ---- | ----- |
  | 2021-06-25                | 60%  | 55%  | ...  | 15%   |
  | 2021-07-25                | 80%  | 75%  | ...  | 25%   |

- vintage将不同时期的数据拉平到同一时期比较，可以很直观地比较和反思不同时期公司的营销策略的效果。

- 每天到期的贷款的逾期情况，不是按照到期是哪天来看，按照逾期第几天来看，比较放贷的质量随时间的变化情况

**报表计算**

```sql
with cte as (
SELECT ld.id,date(ld.due_date) as due_date,
sum(ld.principal) as total_principal,
sum(case WHEN rl.inserttime is NOT NULL and DATEDIFF(date(rl.inserttime),date(ld.due_date))<=0 THEN rl.principal end) as d0_principal,
sum(case WHEN rl.inserttime is NOT NULL and DATEDIFF(date(rl.inserttime),date(ld.due_date))=1 THEN rl.principal end) as d1_principal,
sum(case WHEN rl.inserttime is NOT NULL and DATEDIFF(date(rl.inserttime),date(ld.due_date))=2 THEN rl.principal end) as d2_principal
from loan_debt ld
LEFT JOIN tb_repayment_slave_order rl on rl.debt_id = ld.id
GROUP BY 1, 2)
select due_date ,
sum(total_principal) as total_principal,
sum(d0_principal) as d0_principal,
sum(d1_principal) as d1_principal,
sum(d2_principal) as d2_principal,
sum(d0_principal)/sum(total_principal) as d0,
sum(d1_principal)/sum(total_principal) as d1,
sum(d2_principal)/sum(total_principal) as d2
from cte
GROUP BY 1
```



### 催收报表

- 催收分案表

```mysql
CREATE TABLE `tb_dun_case_allocation` (
  `id` bigint NOT NULL,
  `borrower_id` bigint NOT NULL COMMENT '借款人ID',
  `allocator_id` bigint NOT NULL COMMENT '分案操作者',
  `status` int NOT NULL COMMENT '1-催收中；2-已被转移走；3-催收结束已关闭',
  `dun_case_id` bigint NOT NULL COMMENT '案件Id',
  `owner_id` bigint NOT NULL COMMENT '经办人',
  `previous_owner_id` bigint DEFAULT NULL COMMENT '前一个经办人',
  `max_overdue_day` int NOT NULL COMMENT '分案时最大逾期天数',
  `inserttime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '插入时间',
  `updatetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isactive` tinyint(1) DEFAULT NULL COMMENT '逻辑删除(null:删除,1:未删除)',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `ix_borrower_id` (`borrower_id`) USING BTREE,
  KEY `ix_dun_case_id` (`dun_case_id`) USING BTREE,
  KEY `ix_owner_id` (`owner_id`) USING BTREE,
  KEY `ix_status` (`status`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COMMENT='催收分案';
```

- 催收分案明细

```mysql
CREATE TABLE `tb_dun_case_allocation_detail` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `borrower_id` bigint NOT NULL COMMENT '借款人ID',
  `allocation_id` bigint NOT NULL COMMENT '分案Id',
  `dun_case_id` bigint NOT NULL COMMENT '案件Id',
  `list_id` bigint NOT NULL COMMENT '标的 id',
  `debt_id` bigint NOT NULL COMMENT '债务ID',
  `owner_id` bigint NOT NULL COMMENT '经办人',
  `overdue_day` int NOT NULL COMMENT '分案时逾期天数',
  `start_owing_amount` decimal(18,2) NOT NULL COMMENT '起始逾期金额',
  `start_owing_principal` decimal(18,2) NOT NULL COMMENT '起始逾期本金',
  `start_owing_interest` decimal(18,2) NOT NULL COMMENT '起始逾期利息',
  `start_owing_notify_fee` decimal(18,2) NOT NULL COMMENT '起始逾期公司罚息',
  `start_owing_penalty_fee` decimal(18,2) NOT NULL COMMENT '起始逾期用户罚息',
  `start_owing_service_fee` decimal(18,2) NOT NULL COMMENT '起始逾期用户服务费',
  `dun_over_time` timestamp NULL DEFAULT NULL COMMENT '结束时间，还清',
  `dun_repay_amount` decimal(18,2) NOT NULL COMMENT '已还金额',
  `dun_repay_principal` decimal(18,2) NOT NULL COMMENT '已还本金',
  `dun_repay_interest` decimal(18,2) NOT NULL COMMENT '已还利息',
  `dun_repay_notify_fee` decimal(18,2) NOT NULL COMMENT '已还公司罚息',
  `dun_repay_penalty_fee` decimal(18,2) NOT NULL COMMENT '已还用户罚息',
  `dun_repay_service_fee` decimal(18,2) NOT NULL COMMENT '已还服务费',
  `dun_repay_status` int NOT NULL COMMENT '入催后的还款状态，跟随loan_debt，2-已全全部，3-部分还款，4-未还逾期',
  `inserttime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '插入时间',
  `updatetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `isactive` tinyint(1) DEFAULT NULL COMMENT '逻辑删除(null:删除,1:未删除)',
  `delay_flag` tinyint(1) DEFAULT '0' COMMENT '对应债务在催期间是否展期',
  PRIMARY KEY (`id`) USING BTREE,
  KEY `ix_allocation_id` (`allocation_id`) USING BTREE,
  KEY `ix_borrower_id` (`borrower_id`) USING BTREE,
  KEY `ix_debt_id` (`debt_id`) USING BTREE,
  KEY `ix_dun_case_id` (`dun_case_id`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb3 COMMENT='催收分案明细';
```

- 催收人员表

```mysql
CREATE TABLE `tb_backend_user` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
  `username` varchar(64)  NOT NULL,
  `realname` varchar(128)  NOT NULL COMMENT '用户真实姓名',
  `mobile` varchar(20)  DEFAULT NULL,
  `password` varchar(64)  DEFAULT NULL,
  `email` varchar(64)  DEFAULT NULL,
  `email_password` varchar(64)  DEFAULT '' COMMENT '用户邮箱密码',
  `department` varchar(128)  DEFAULT NULL COMMENT '部门',
  `department_id` bigint NOT NULL,
  `role_type` int DEFAULT NULL COMMENT '角色(-1:普通用户)',
  `type` int DEFAULT NULL COMMENT '0：借款用户,1:资金账户用户',
  `status` int NOT NULL COMMENT '用户状态',
  `on_off` char(4)  NOT NULL COMMENT '开关(0:关闭,1:开启)',
  `operate_id` bigint NOT NULL DEFAULT '0' COMMENT '操作人的id',
  `softphone_account` varchar(20)  DEFAULT NULL COMMENT '外呼系统软电话坐席号/分机号',
  `inserttime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '插入时间',
  `updatetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `isactive` tinyint(1) DEFAULT NULL COMMENT '逻辑删除',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `uk_username` (`username`,`isactive`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=84 DEFAULT CHARSET=utf8mb3 COMMENT='后台用户表';
```

![](assets\day01\loan7.png)

- 催收报表

  - 定义分案归属, 当天最后一次分案算作最终分案归属

    ```mysql
    SELECT max(id) as id from tb_dun_case_allocation GROUP BY date(inserttime), dun_case_id
    ```

  - 主表: 分案表, 计算逾期天数还需要loan_debt

    ```mysql
    select 
    from cte1
    LEFT JOIN tb_dun_case_allocation dca on cte1.id = dca.id
    LEFT JOIN tb_dun_case_allocation_detail dcad on dcad.allocation_id = dca.id 
    LEFT JOIN loan_debt ld on ld.id = dcad.debt_id
    WHERE date(dcad.inserttime)>=date('2020-01-07') and dcad.overdue_day<=7 ORDER BY dcad.debt_id),
    ```

  - 催收人员可能换组, 利用人名做限制

    ```mysql
    left JOIN tb_backend_user bu on cte2.owner_id = bu.id
    ```

- 完整SQL

```mysql
with cte1 as (
SELECT max(id) as id from tb_dun_case_allocation GROUP BY date(inserttime), dun_case_id
),
cte2 as (
select cte1.id,dca.borrower_id,dca.dun_case_id,dcad.list_id,dcad.debt_id,dcad.inserttime as fenan_time, dcad.overdue_day,ld.due_date,dcad.owner_id,dcad.start_owing_amount,dcad.start_owing_principal,dcad.dun_repay_amount,dcad.dun_repay_principal
from cte1
LEFT JOIN tb_dun_case_allocation dca on cte1.id = dca.id
LEFT JOIN tb_dun_case_allocation_detail dcad on dcad.allocation_id = dca.id 
LEFT JOIN loan_debt ld on ld.id = dcad.debt_id
WHERE date(dcad.inserttime)>=date('2020-01-07') and dcad.overdue_day<=7 ORDER BY dcad.debt_id),
c as (
SELECT date(cte2.fenan_time) as fenan_time,bu.realname,sum(cte2.start_owing_amount) as lj_owing_amount,
sum(cte2.dun_repay_amount) as lj_repay_amount,
sum(cte2.dun_repay_amount)/sum(cte2.start_owing_amount) as repay_rate_amount, sum(cte2.start_owing_principal) as lj_owing_principal,
sum(cte2.dun_repay_principal) as lj_repay_principal,sum(cte2.dun_repay_principal)/sum(cte2.start_owing_principal) as repay_rate_principal,
count(cte2.dun_case_id) as fenan_cnt,sum(case WHEN cte2.dun_repay_amount>0 then 1 else 0 end) as repay_cnt,
SUM(case WHEN cte2.dun_repay_amount>0 then 1 else 0 end)/COUNT(cte2.dun_case_id) as repay_rate_cnt
FROM cte2 
left JOIN tb_backend_user bu on cte2.owner_id = bu.id
WHERE cte2.start_owing_amount>=10000 and bu.realname in ('test','test2','test1','test01')
GROUP BY 1,2
ORDER BY 1,2)
SELECT c.fenan_time as '分案日', c.realname as '姓名',0.38 AS '目标',c.lj_owing_amount as '分案金额',c.lj_repay_amount  as ' 还款金额', c.repay_rate_amount as '还款率-金额', c.lj_owing_principal as '分案本金' , c.lj_repay_principal as '还款本金' , c.repay_rate_principal as '还款率-本金', c.fenan_cnt as '分案件数', c.repay_cnt as '还款件数', c.repay_rate_cnt as '还款率-件数'
from c
```

思路

① 拉宽表  

- 数据可能是在不同的表中保存, 取数的时候, 是不是要考虑一些边界条件
- 考虑如何去JOIN  哪张表是主表, 如何JOIN 不会丢信息

② 在宽表的基础上算指标

​	加减乘除,  在算之前, 每一个指标的计算方法一定要搞清楚

③ 整理结果

