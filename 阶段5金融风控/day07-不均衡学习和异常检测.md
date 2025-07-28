## 1、样本不均衡

### 1. 问题定义

- **理想状态**：分类任务中各目标类别样本量均衡（比例接近1:1）
- **现实挑战**：
  - 真实场景普遍存在数据倾斜（如风控领域负样本稀缺）
  - 梯度下降时，样本量差异过大会阻碍最优解收敛

### 2. 典型案例

| 场景     | 正样本（标签0） | 负样本（标签1） | 比例  |
| -------- | --------------- | --------------- | ----- |
| 金融风控 | 100,000         | 1,000           | 100:1 |
| 梯度影响 | 主导模型训练    | 信息贡献仅1%    | -     |



### 3. 风控场景解决方案

#### **3.1 下探（Direct Sampling）**

- **机制**：在拒绝客户中主动放行部分高风险样本，即通过牺牲一部分收益，积累负样本，供后续模型学习
- **代价**：
  - 直接风险：坏账率上升
  - 隐性成本：需动态平衡收益与风险，缺乏量化标准



#### **3.2 代价敏感学习（Cost-Sensitive）**

- **核心**：对少数类（负样本）施加权重，强制模型关注稀缺类别



#### **3.3 采样算法（Sampling Methods）**

- **欠采样**（Undersampling）：减少多数类样本
- **过采样**（Oversampling）：复制或生成少数类样本（如SMOTE）



### 4. 代价敏感加权

#### **4.1 核心概念**

- **别名**：在传统风控领域又称**展开法（Re-Weighting）**
- **原理**：通过调整已知表现样本的权重，间接推断拒绝样本的表现
- **局限性**：
  - 仅**放大负样本贡献**，未引入新信息
  - **未解决选择偏误**（Selection Bias），但未产生负面影响(**未引入额外风险**)



#### 4.2 类权重计算公式

```python
weight = n_samples / (n_classes * np.bincount(y))
```

- `n_samples`: 总样本数
- `n_classes`: 类别数量（二分类时为2）
- `np.bincount(y)`: 返回每个类别的样本数（如 `[负样本数, 正样本数]`）



#### 4.3 逻辑回归实现

- **参数设置**：`class_weight="balanced"`（自动使正负样本的总权重相等）



#### 4.4 实验对比：标准模型 vs 代价敏感模型

- **标准模型**—使用之前逻辑回归评分卡的例子

```python
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score,roc_curve,auc

data = pd.read_csv('../data/Bcard.txt')
feature_lst = ['person_info','finance_info','credit_info','act_info']
train = data[data.obs_mth != '2018-11-30'].reset_index().copy()
val = data[data.obs_mth == '2018-11-30'].reset_index().copy()
x = train[feature_lst]
y = train['bad_ind']

val_x =  val[feature_lst]
val_y = val['bad_ind']

lr_model = LogisticRegression(C=0.1)
lr_model.fit(x,y)

y_pred = lr_model.predict_proba(x)[:,1] #取出训练集预测值
fpr_lr_train,tpr_lr_train,_ = roc_curve(y,y_pred) #计算TPR和FPR
train_ks = abs(fpr_lr_train - tpr_lr_train).max() #计算训练集KS
print('train_ks : ',train_ks)

y_pred = lr_model.predict_proba(val_x)[:,1] #计算验证集预测值
fpr_lr,tpr_lr,_ = roc_curve(val_y,y_pred)   #计算验证集预测值
val_ks = abs(fpr_lr - tpr_lr).max()         #计算验证集KS值
print('val_ks : ',val_ks)
```

><font color='red'>显示结果：</font>
>
>```shell
>train_ks :  0.41573985983413414
>val_ks :  0.3928959732014397
>```

查看正负样本比例发现 y = 1样本 和y=0 样本比例约为 100:2左右

```python
print('训练集：\n',y.value_counts())
print('跨时间验证集：\n',val_y.value_counts())
```

><font color='red'>显示结果：</font>
>
>```shell
>训练集：
> 0.0    78361
>1.0     1470
>
>跨时间验证集：
> 0.0    15647
>1.0      328
>
>```

```python
#按照计算公式，算出权重
import numpy as np
y.shape[0]/(2 * np.bincount(y))
```

><font color='red'>显示结果：</font>
>
>```
>array([ 0.50937967, 27.15340136])
>```



- **代价敏感模型**—使用相同的特征和数据，添加逻辑回归参数`class_weight = 'balanced'`

```python
lr_model = LogisticRegression(C=0.1,class_weight = 'balanced')
lr_model.fit(x,y)

y_pred = lr_model.predict_proba(x)[:,1] #取出训练集预测值
fpr_lr_train,tpr_lr_train,_ = roc_curve(y,y_pred) #计算TPR和FPR
train_ks = abs(fpr_lr_train - tpr_lr_train).max() #计算训练集KS
print('train_ks : ',train_ks)

y_pred = lr_model.predict_proba(val_x)[:,1] #计算验证集预测值
fpr_lr,tpr_lr,_ = roc_curve(val_y,y_pred)   #计算验证集预测值
val_ks = abs(fpr_lr - tpr_lr).max()         #计算验证集KS值
print('val_ks : ',val_ks)
```

><font color='red'>显示结果：</font>
>
>```shell
>train_ks :  0.4482325608488951
>val_ks :  0.4198642457760936
>```



**性能对比（KS值）**

| 模型类型     | 训练集KS | 验证集KS | 提升幅度 |
| ------------ | -------- | -------- | -------- |
| 标准模型     | 0.4157   | 0.3929   | -        |
| 代价敏感模型 | 0.4482   | 0.4199   | **+2%**  |



### 5. 过采样

#### 5.1 背景

- 代价敏感加权只能部分缓解类别不平衡；
- 要进一步提升效果，必须为模型**引入更多高质量负样本**；
- 常见方案：**过采样**
  - **随机过采样**：简单复制少数类，易过拟合，泛化差
  - **SMOTE**：合成少数类样本，工业界与学术界广泛认可



#### 5.2 SMOTE算法

**核心思想**

在少数类样本的**特征空间邻域内插值**，生成**人工合成样本**，直至与多数类数量相当。

**算法步骤**

- 对每个少数类样本，用 K-近邻算法找出 **K 个同类邻居**
- 随机选择其中 **N 个邻居**
- 在该样本与邻居的**连线上随机插值**，生成新样本
- 合并新样本与原数据集，形成新的训练集



![](assets/day07\smote_1.jpg)

> SMOTE核心：就是通过人工合成的方式把少数类样本数量增加，直到和多数类样本数量一致。
>



#### 5.3 SMOTE案例

接下来通过引入SMOTE算法使该模型得到更好的模型效果。由于SMOTE算法是基于样本空间进行插值的，会放大数据集中的噪声和异常，因此要对训练样本进行清洗。

这里使用LightGBM算法对数据进行拟合，将预测结果较差的特征不参与SMOTE算法的插值过程。

##### Step 1 训练 LightGBM，识别噪声

```python
def lgb_test(train_x, train_y, test_x, test_y):
    import lightgbm as lgb
    clf = lgb.LGBMClassifier(
        boosting_type='gbdt',
        objective='binary',
        metric='auc',
        learning_rate=0.1,
        n_estimators=24,
        max_depth=4,
        num_leaves=25,
        max_bin=40,
        min_data_in_leaf=5,
        bagging_fraction=0.6,
        bagging_freq=0,
        feature_fraction=0.8,
    )
    clf.fit(train_x, train_y,
            eval_set=[(train_x, train_y), (test_x, test_y)],
            eval_metric='auc')
    return clf, clf.best_score_['valid_1']['auc']
```

##### Step 2 预测并排序

> 去掉lightGBM拟合效果不好的数据，不使用这些数据进行过采样

```python
#根据前面内容得知，如下四个列是特征筛选后留下的列，也就是去掉了其他不重要的列
feature_lst = ['person_info','finance_info','credit_info','act_info']

#准备数据
train_x = train[feature_lst]
train_y = train['bad_ind']
test_x = val[feature_lst]
test_y = val['bad_ind']

#调用函数，进行训练
lgb_model,lgb_auc  = lgb_test(train_x,train_y,test_x,test_y)  

#模型预测
sample = train_x.copy()
sample['bad_ind'] = train_y 
sample['pred'] = lgb_model.predict_proba(train_x)[:,1]

#对预测结果进行降序排序，这样，排序后的结果中，预测为正样本（坏人）概率越大的越靠前
sample = sample.sort_values(by=['pred'],ascending=False).reset_index()  
sample['rank'] = sample.index.values/len(sample)  
sample
```

><font color='red'>显示结果：</font>
>
>|       | index | person_info | finance_info | credit_info | act_info | bad_ind |     pred |     rank |
>| ----: | ----: | ----------: | -----------: | ----------: | -------: | ------: | -------: | -------: |
>|     0 | 12039 |    0.062660 |     0.690476 |        0.85 | 0.076923 |     1.0 | 0.614655 | 0.000000 |
>|     1 | 79624 |    0.078853 |     0.619048 |        0.86 | 0.076923 |     0.0 | 0.538042 | 0.000013 |
>|     2 | 50459 |    0.078853 |     0.571429 |        0.17 | 0.153846 |     1.0 | 0.520490 | 0.000025 |
>|     3 | 56269 |    0.078853 |     0.738095 |        0.35 | 0.525641 |     1.0 | 0.508676 | 0.000038 |
>|     4 | 12355 |    0.078853 |     0.666667 |        0.25 | 0.397436 |     0.0 | 0.473718 | 0.000050 |
>|   ... |   ... |         ... |          ... |         ... |      ... |     ... |      ... |      ... |
>| 79826 | 22029 |   -0.322581 |     0.023810 |        0.00 | 0.576923 |     0.0 | 0.003539 | 0.999937 |
>| 79827 | 22000 |   -0.322581 |     0.023810 |        0.00 | 0.576923 |     0.0 | 0.003539 | 0.999950 |
>| 79828 | 40540 |   -0.322581 |     0.023810 |        0.00 | 0.551282 |     0.0 | 0.003539 | 0.999962 |
>| 79829 | 56988 |   -0.322581 |     0.023810 |        0.00 | 0.525641 |     0.0 | 0.003539 | 0.999975 |
>| 79830 | 39915 |   -0.322581 |     0.023810 |        0.00 | 0.538462 |     0.0 | 0.003539 | 0.999987 |
>
>79831 rows × 9 columns

##### Step 3 过滤噪声样本

定义函数去掉预测值与实际值不符的部分

```python
#x：真实的结果
#y：预测的结果
#过滤预测和真实的情况严重不相符的样本
#由于上述表格中，我们是按照pred降序排序，因此越往前，是正样本（坏人）的概率越大，但是实际上是负样本（好人），所以这部分的数据要排除，同理，越往后，是负样本（好人）的概率越大，但是实际上是正样本（坏人），这部分的数据也要排除。
def weight(x, y):
    # 真实标签为0，违约概率为所有样本中最高的10%
    if x == 0 and y < 0.1:
        return 0.1
    # 真实标签为1  违约概率为所有样本中最低的30%
    elif x == 1 and y > 0.7:
        return 0.1
    else:
        return 1

sample['weight'] = sample.apply(lambda row:weight(row['bad_ind'],row['rank']),axis = 1)
#把预测相对比较准的取出来进行过采样
smote_sample = sample[sample.weight == 1]
train_x_smote = smote_sample[feature_lst]
train_y_smote = smote_sample['bad_ind']
smote_sample.shape
```

><font color='red'>显示结果：</font>
>
>```
>(72533, 9)
>```

##### Step 4 SMOTE 过采样

创建smote过采样函数，进行过采样

```python
def smote(train_x_smote,train_y_smote,K=15,random_state=0):
    from imblearn.over_sampling import SMOTE
    smote = SMOTE(k_neighbors=K, n_jobs=1,random_state=random_state)
    #fit_resample，找K个邻居，然后进行过采样
    rex,rey = smote.fit_resample(train_x_smote,train_y_smote)
    return rex,rey
rex,rey =smote(train_x_smote,train_y_smote)

#查看数据
train_y_smote.value_counts()
rey.value_counts()
```

##### Step 5 用合成数据重新训练逻辑回归

使用过采样数据建模，使用训练集数据和测试集数据验证

```python
lr_model = LogisticRegression(C=0.1)
lr_model.fit(rex[feature_lst],rey)
x = train[feature_lst]
y = train['bad_ind']
val_x =  val[feature_lst]
val_y = val['bad_ind']

y_pred = lr_model.predict_proba(x)[:,1] #取出训练集预测值
fpr_lr_train,tpr_lr_train,_ = roc_curve(y,y_pred) #计算TPR和FPR
train_ks = abs(fpr_lr_train - tpr_lr_train).max() #计算训练集KS
print('train_ks : ',train_ks)

y_pred = lr_model.predict_proba(val_x)[:,1] #计算验证集预测值
fpr_lr,tpr_lr,_ = roc_curve(val_y,y_pred)   #计算验证集预测值
val_ks = abs(fpr_lr - tpr_lr).max()         #计算验证集KS值
print('val_ks : ',val_ks)
```

><font color='red'>显示结果：</font>
>
>```shell
>train_ks :  0.4716648926514621
>val_ks :  0.42672424543316184
>```

上述结果发现，比使用`class_weight = 'balanced'`，效果有进一步提升



**结果对比**

| 方法                       | 训练集 KS  | 验证集 KS  | 相对提升     |
| -------------------------- | ---------- | ---------- | ------------ |
| 原始模型                   | 0.4157     | 0.3929     | —            |
| `class\_weight="balanced"` | 0.4482     | 0.4199     | +2 %         |
| **SMOTE + 清洗**           | **0.4717** | **0.4267** | **再+1~2 %** |

> **结论**：
> 在代价敏感加权基础上，**SMOTE + 噪声清洗** 进一步提高了模型在不平衡数据上的表现，且验证集 KS 稳定增长，无过拟合风险。



## 2、反欺诈和异常点检测

### 2.1 反欺诈检测的难点

> “看似二分类，实则多分类”——每类欺诈都需独立建模

| 挑战             | 描述                         | 影响                |
| ---------------- | ---------------------------- | ------------------- |
| **标签匮乏**     | 绝大多数数据无标签           | 监督学习失效        |
| **噪声 vs 异常** | 难以区分正常噪声与真实异常   | 需要专家直觉        |
| **欺诈类型混杂** | 多种欺诈并存且定义不明       | 分类边界模糊        |
| **历史局限性**   | 监督模型只能复现“见过的欺诈” | 对新型/变种欺诈失效 |

> **结论**：**不依赖单一监督模型**，必须结合无监督学习与领域专家持续反馈。



### 2.2 解决反欺诈问题的思路

1️⃣ 迁移学习（Transfer Learning）

| 类型         | 思想           | 前提           | 局限             |
| ------------ | -------------- | -------------- | ---------------- |
| **实例迁移** | 重用源域样本   | 需相关源域数据 | 分布差异大时失效 |
| **特征迁移** | 对齐特征空间   | 需共享特征     | 需领域适配       |
| **模型迁移** | 微调预训练模型 | 需相似任务     | 负迁移风险       |

> 缺点：需要拥有与当前目标场景相关的源域数据。



2️⃣ 专家模型（Expert Rule）

- **定义**：基于信贷专家多年经验的定性打分系统
- **操作**
  - 凭经验指定特征重要性
  - 手工赋予变量权重
- **缺点**
  - 强依赖行业经验
  - 主观性强，难以复现与说服



3️⃣ 无监督算法（Unsupervised Learning）

> 无先验标签时，通过**相似性（聚类）**或**相异性（异常检测）**发现模式

① 聚类（Clustering）

| 算法         | 特点                           | 适用场景                     |
| ------------ | ------------------------------ | ---------------------------- |
| **K-Means**  | 需预设簇数、球形簇             | 简单快速                     |
| **DBSCAN**   | 无需预设簇数、可发现任意形状簇 | 密度差异大、含噪声           |
| **社区发现** | 基于图结构识别“小团体”         | **团伙欺诈检测**（知识图谱） |

> **社区发现**核心：将逾期客群拆分为 **欺诈风险** vs **信用风险**，通过图谱关系捕获聚集性欺诈。

② 异常检测（Anomaly Detection）

- **目标**：发现与大多数样本显著不同的个体
- **方法**：孤立森林、One-Class SVM、AutoEncoder 等
- **输出**：异常分数 → 专家验证 → 反馈闭环



### 2.3 异常点检测

> 又称 **离群点检测**，目标：识别与总体行为显著偏离的个体。
>
> **核心假设**
>
> - 异常数据跟样本中大多数数据不太一样。
> - 常数据在整体数据样本中占比比较小。（通常 < 5 %）

典型应用场景：

| 领域         | 示例                      |
| ------------ | ------------------------- |
| **金融风控** | 信用卡反欺诈、羊毛党识别  |
| **工业质检** | 设备损毁、缺陷检测        |
| **互联网**   | 广告点击作弊、刷单/刷好评 |



异常点（outlier）是一个数据对象，它明显不同于其他的数据对象。如下图1所示，N1、N2区域内的点是正常数据。而离N1、N2较远的O1、O2、O3区域内的点是异常点。



<img src ='assets/day07\6.png' align='left'/>

> 异常检测一般是无监督的，和普通的二分类问题也不大相同，因为异常检测往往看似是二分类，但其实是多分类（造成异常的原因各不相同）。
>



#### 1. 主要思想

主流异常检测方法都是基于样本（小群体）间的相似度（proximity），如下是它的度量指标。

| 度量维度     | 代表算法 / 思想                       |
| ------------ | ------------------------------------- |
| **距离**     | k-NN Distance、LOF                    |
| **密度**     | LOF、DBSCAN                           |
| **角度**     | ABOD（Angle-Based Outlier Detection） |
| **隔离难度** | Isolation Forest                      |
| **簇偏离度** | 远离任何簇中心的程度                  |

**为什么选择「无监督」？**

| 场景         | 原因                                                         |
| ------------ | ------------------------------------------------------------ |
| **冷启动**   | 无标签或标签极少（很多场景没有标签或者标签很少，不能训练监督模型） |
| **数据漂移** | 欺诈手段持续变化                                             |
| **异构群体** | 需在小群体内找异常                                           |
| **假设匹配** | 异常“少且远离”符合先验                                       |

> ⚠️ 注意：团体欺诈（团伙）内部密度高，**传统无监督方法可能失效**。



#### 2. 常用算法

| 算法                 | 思想一句话                   | 适用特点                   |
| -------------------- | ---------------------------- | -------------------------- |
| **Z-Score**          | 偏离均值 > n 个标准差        | 高斯分布、快速初筛         |
| **LOF**              | 局部密度显著低于邻居         | 密度差异大、含噪声         |
| **Isolation Forest** | 随机切分，越容易被隔离越异常 | 高维、大数据、无需距离计算 |

> **小结**
>
> - **异常检测 ≈ 无监督**
> - **度量相似度** 是核心
> - **个体欺诈** 优先用距离/密度/隔离模型
> - **团伙欺诈** 需结合图算法（社区发现）
>
> 下一步：根据数据规模、维度、实时性要求，选择最合适的算法组合。



### 2.4 z-score

> 基于**标准正态分布假设**，度量样本偏离均值的程度。

**核心原理**

- **前提假设**

  样本服从 **N(μ, σ²)**（均值 μ，标准差 σ）。

- **Z 值公式**
  $$
  \mu=\frac{1}{m} \sum_{i=0}^{m} x^{(i)}\\\sigma^{2}=\frac{1}{m} \sum_{i=1}^{m}\left(x^{(i)}-\mu\right)^{2}\\Z = \frac{x - \mu}{\sigma}
  $$
  

  - **|Z| > 2**：约 95 % 置信区间外 → **可疑异常**
  - **|Z| > 3**：约 99.7 % 置信区间外 → **高度异常**

<img src ='assets/day07/zscore1.png' align='left'/>

> 上图中展示了一组符合正态分布的数据，从图中看出
>
> - 68% 的数据分布在 +/- 1 倍标准差之间
> - 95%  的数据分布在 +/- 2 倍标准差之间
> - 99.7%  的数据分布在 +/- 3 倍标准差之间

- **实施步骤**
  - 计算样本均值 μ 与标准差 σ
  - 对每个样本计算 Z
  - **阈值判定**：通常 |Z| > 2 或 3 视为异常



**优缺点速览**

| 优点                 | 缺点                                     |
| -------------------- | ---------------------------------------- |
| 计算简单、结果可解释 | **强依赖正态假设**（现实数据往往不满足） |
| 无需训练，快速初筛   | 对偏态/多峰分布失效                      |



**使用建议**

- **适用场景**：数据近似正态、需要快速粗筛
- **改进方案**：
  - 先做 Box-Cox / Yeo-Johnson 变换，逼近正态
  - 或改用 **非参数方法**（如 IQR、Isolation Forest）

> 一句话总结：Z-Score 是“快而糙”的异常检测第一刀，切勿盲目套用。



### 2.5 Local Outlier Factor

> **发表于 SIGMOD 2000**
> 首个**基于密度的可量化异常分数**算法，无需分布假设。



#### 1. LOF 核心思想

在 LOF 之前的异常检测算法大多是基于统计方法的，或者是借用了一些聚类算法用于异常点的识别，基于统计的异常检测算法通常需要假设数据**服从特定的概率分布**，但假设往往不成立。聚类方法通常只能给出 0/1的判断（即：是不是异常点），**不能量化每个数据点的异常程度**  。

基于密度的LOF算法要更简单、直观，不需要对数据的分布做太多要求，还能量化每个数据点的异常程度（outlierness）。

| 维度     | 描述                                |
| -------- | ----------------------------------- |
| **输入** | 数据集 + 近邻数 `k`                 |
| **输出** | 每个点的 **LOF 分数**（越大越异常） |
| **阈值** | ≈1 正常  >>1 异常                   |



#### 2. 关键概念

- **首先要确定参数K**，K是LOF计算时需要考虑的近邻点数量
  - LOF通过计算最近的K个点的距离来计算密度，然后将其与其它点的密度进行比较
  - K的选择会对结果产生影响
    - 选择比较小的K值，会只计算附近的点，但会受到噪声的影响
    - 如果K选的比较大，可能会错过局部离群点

<img src ='assets/day07\LOF1.png' align='left'/>

- **K-邻近距离（k-distance）**：K确定下来，我们可以计算k-distance，即点到第k个邻居的距离。 如果k为3，则k-distance将是点到第三最近点的距离

<img src ='assets/day07\LOF2.png' align='left'/>

- **可达距离（reachability distance）**：该距离表示的是两个点的距离和第二个点的k-distance中的最大值。
  - reach-dist(a,b) = max{k-distance(b), dist(a,b)}
  - 为了便于理解，可以当做两点之间的距离
- **局部可达密度（local reachability density）lrd**：LRD可以通过reach-dist计算得出
  - 点a的lrd，首先计算a到它的所有k个最近邻居的reach-dist，并取该数字的平均值，lrd是该平均值的倒数
  - LRD代表一种密度，因此，到下一个近邻点的距离越长，相应点所在的区域就越稀疏。反之密度越小
  - lrd(a) = 1/(sum(reach-dist(a,n))/k)
  - 通俗点儿说，LRD告诉我们，从一点到另一个点或者另一堆点，距离多远，LRD越小，密度越低，距离越远

<img src ='assets/day07\LOF3.png' align='left'/>

>上图中，右上角的点的lrd = 它最近的邻居[ (-1, -1), (-1.5, -1.5) , (-1, -2)] 这三个点的reach-dist的平均值的倒数
>
>但是计算下面点的lrd时不会把右上角的点计算进去

- **LOF 局部异常因子（local outlier factor）**：将每个点的lrd与它们的k个邻居的lrd相比较
  - 某点的LOF= K个邻居的LRD的平均值/该点的LRD
  - LRD越小，密度越低距离越远，离群点的LRD小，它的邻居的LRD会比较大
  - 离群点的LOF = 较大的邻居的LRD平均值/ 较小的离群点的LRD >>1

| 术语                      | 公式 / 解释                              | 直观理解            |
| ------------------------- | ---------------------------------------- | ------------------- |
| **k-distance**            | 点到第 k 个邻居的距离                    | 局部邻域半径        |
| **reachability distance** | `max(k-distance(b), dist(a,b))`          | 防“邻居过近”        |
| **局部可达密度 LRD**      | `LRD(a) = 1 / mean(reach-dist(a, n))`    | 密度越高值越大      |
| **LOF 分数**              | `LOF(a) = mean(LRD(neighbors)) / LRD(a)` | 邻居密度 / 自身密度 |

> **记忆口诀**：
> “邻居比我密，我就异常” → LOF >> 1



#### **3. 算法流程**

```tex
1. 去重后计算所有点两两距离
2. 将步骤1中的距离升序排列。
3. 为每个点找 k 近邻
4. 计算 LRD 与 LOF
5. LOF >> 1 标记为异常
```



根据局部异常因子的定义

- 如果数据点 p 的 LOF 得分在1附近，表明数据点p的局部密度跟它的邻居们差不多；
- 如果数据点 p 的 LOF 得分小于1，表明数据点p处在一个相对密集的区域，不像是一个异常点；
- 如果数据点 p 的 LOF 得分远大于1，表明数据点p跟其他点比较疏远，很有可能是一个异常点
- 下面这个图来自 Wikipedia 的 LOF 词条，展示了一个二维的例子。上面的数字标明了相应点的LOF得分

<img src ='assets/day07\11.png' align='left'/>



PyOD是一个用于检测数据中异常值的库。它提供对20多种不同算法的访问，以检测异常值，下面的算法都通过PYOD实现。

pyod需要安装：

~~~shell
pip install pyod -i https://pypi.tuna.tsinghua.edu.cn/simple/
~~~

案例：

```python
from pyod.models.lof import LOF
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_curve

# 1. LOF 检测
clf = LOF(n_neighbors=20, algorithm='auto')  #n_neighbors K个最近的邻居 ，algorithm：找到最近邻居的算法，传入auto 会根据传入的数据自动选择最合适算法
clf.fit(x)
train['out_pred'] = clf.predict_proba(x)[:, 1]

# 2. 按 93% 分位过滤异常
key = train['out_pred'].quantile(0.93)
x = train[train.out_pred< key][feature_lst]
y = train[train.out_pred < key]['bad_ind']

val_x =  val[feature_lst]
val_y = val['bad_ind']

lr_model = LogisticRegression(C=0.1,class_weight='balanced')
lr_model.fit(x,y)
y_pred = lr_model.predict_proba(x)[:,1]
fpr_lr_train,tpr_lr_train,_ = roc_curve(y,y_pred)
train_ks = abs(fpr_lr_train - tpr_lr_train).max()
print('train_ks : ',train_ks)  # 0.4448

y_pred = lr_model.predict_proba(val_x)[:,1]
fpr_lr,tpr_lr,_ = roc_curve(val_y,y_pred)
val_ks = abs(fpr_lr - tpr_lr).max()
print('val_ks : ',val_ks)  # 0.4213

from matplotlib import pyplot as plt
plt.plot(fpr_lr_train,tpr_lr_train,label = 'train LR')
plt.plot(fpr_lr,tpr_lr,label = 'evl LR')
plt.plot([0,1],[0,1],'k--')
plt.xlabel('False positive rate')
plt.ylabel('True positive rate')
plt.title('ROC Curve')
plt.legend(loc = 'best')
plt.show()
```

><font color='red'>显示结果：</font>
>
>![img](data:image/png;base64,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)



**小结**

| 亮点               | 局限                 |
| ------------------ | -------------------- |
| ✅ 无分布假设       | ❗ 需调 k             |
| ✅ 输出异常分数     | ❗ 高维稀疏时效果下降 |
| ✅ 易与下游模型集成 | ❗ 计算复杂度 O(n²)   |

> **一句话**：
> **LOF = “密度放大镜”**，先清噪再建模，风控冷启动必备。



### 2.6 Isolation Forest

> 无需标签、高维友好、线性时间复杂度
> **核心直觉**：异常点“疏离”，用很少次随机切分即可“孤立”。

#### 1. 直观理解

先用一个简单的例子来说明 Isolation Forest 的基本想法

- 假设现在有一组一维数据（如下图所示），我们要对这组数据进行随机切分，希望可以把点 A 和点 B 单独切分出来
- 先在最大值和最小值之间随机选择一个值 x，然后按照 <x 和 >=x 可以把数据分成左右两组
- 在这两组数据中分别重复这个步骤，直到数据不可再分。点 B 跟其他数据比较疏离，可能用很少的次数就可以把它切分出来
- 点 A 跟其他数据点聚在一起，可能需要更多的次数才能把它切分出来。

<img src ='assets/day07\1.png' align='left'/>

把数据从一维扩展到两维，沿着两个坐标轴进行随机切分，尝试把下图中的点A'和点B'分别切分出来

- 先随机选择一个特征维度，在这个特征的最大值和最小值之间随机选择一个值，按照跟特征值的大小关系将数据进行左右切分
- 在左右两组数据中重复上述步骤，随机按某个特征维度的取值把数据细分，直到无法细分（剩下一个数据点，或剩下的数据都相同。
- 点B'跟其他数据点比较疏离，可能只需要很少的几次操作就可以将它细分出来；点A'需要的切分次数可能会更多一些。

<img src ='assets/day07\2.png' align='left'/>



按照之前提到的关于“异常”的两个假设，一般情况下在上面的例子中：

- 点B和点B' 由于跟其他数据隔的比较远，会被认为是异常数据
- 而点A和点A' 会被认为是正常数据
- 直观上，异常数据由于跟其他数据点较为疏离，可能需要较少几次切分就可以将它们单独划分出来，而正常数据恰恰相反。
- 这正是Isolation Forest（IF）的核心概念。

| 维度         | 正常点 A | 异常点 B |
| ------------ | -------- | -------- |
| **分布**     | 密集     | 远离主体 |
| **切分次数** | 多       | 极少     |
| **路径长度** | 长       | 短       |

> **越容易被孤立 → 越异常**



#### 2. 算法流程

**① 训练阶段：构建 iTree 森林**

- **子采样**：从数据集中随机抽取 ψ 条样本
- **随机切分**
  - 随机选特征
  - 随机选切分点
  - 递归左右子树
- **终止条件**
  - 只剩一条样本，或者全部数据相同
  - 或达到最大深度

> 重复以上步骤 → 生成 `n_estimators` 棵 iTree



**② 预测阶段：计算异常分数**

预测：综合多棵二叉树的结果，计算每个数据点的异常分值。

| 符号      | 含义                                              |
| --------- | ------------------------------------------------- |
| `h(x)`    | 样本 x 在单棵 iTree 中的路径长度                  |
| `E(h(x))` | 所有 iTree 的平均路径长度                         |
| `c(n)`    | 用 n 条样本构建二叉树的平均路径长度（归一化因子） |

**异常分数公式**
$$
S \operatorname{core}(x)=2^{-\frac{E(h(x))}{C(φ)}}
$$

| Score 区间 | 解释     |
| ---------- | -------- |
| ≈ 1        | 高度异常 |
| ≈ 0.5      | 难以区分 |
| ≈ 0        | 明显正常 |



> 预测：计算数据 x 的异常分值时，先要估算它在每棵 iTree 中的路径长度（也可以叫深度）。具体的，先沿着一棵 iTree，从根节点开始按不同特征的取值从上往下，直到到达某叶子节点。假设 iTree 的训练样本中同样落在 x 所在叶子节点的样本数为 T.size，则数据 x 在这棵 iTree 上的路径长度 h(x)，可以用下面这个公式计算：
> $$
> h(x)=e+C(T . \text {size})
> $$
> 公式中，e 表示数据 x 从 iTree 的根节点到叶节点过程中经过的边的数目，C(T.size) 可以认为是一个修正值，它表示在一棵用 T.size 条样本数据构建的二叉树的平均路径长度。一般的，C(n) 的计算公式如下：
> $$
> C(n)=2 H(n-1)-\frac{2(n-1)}{n}
> $$
> 其中，H(n-1) 可用 ln(n-1)+0.5772156649 估算，这里的常数是欧拉常数。数据 x 最终的异常分值 Score(x) 综合了多棵 iTree 的结果：
> $$
> S \operatorname{core}(x)=2^{-\frac{E(h(x))}{C(φ)}}
> $$
> 公式中，E(h(x)) 表示数据 x 在多棵 iTree 的路径长度的均值，$φ$表示单棵 iTree 的训练样本的样本数，$C(φ)$表示用$φ$条数据构建的二叉树的平均路径长度，它在这里主要用来做归一化。
>
> - 从异常分值的公式看
>   - 如果数据 x 在多棵 iTree 中的平均路径长度越短，得分越接近 1，表明数据 x 越异常
>   - 如果数据 x 在多棵 iTree 中的平均路径长度越长，得分越接近 0，表示数据 x 越正常
>   - 如果数据 x 在多棵 iTree 中的平均路径长度接近整体均值，则打分会在 0.5 附近。
>

<img src ='assets/day07\7.png' align='left'/>

- 对比之前的评分卡案例

```python
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score,roc_curve,auc

#数据加载
data = pd.read_csv('../data/Bcard.txt')
data.head()

#数据集划分
train = data[data.obs_mth != '2018-11-30'].reset_index().copy()
val = data[data.obs_mth == '2018-11-30'].reset_index().copy()
feature_lst = ['person_info','finance_info','credit_info','act_info']

x = train[feature_lst]
y = train['bad_ind']

val_x =  val[feature_lst]
val_y = val['bad_ind']

#模型训练
lr_model = LogisticRegression(C=0.1,class_weight='balanced')
lr_model.fit(x,y)

#模型预测
y_pred = lr_model.predict_proba(x)[:,1]
fpr_lr_train,tpr_lr_train,_ = roc_curve(y,y_pred)
train_ks = abs(fpr_lr_train - tpr_lr_train).max()
print('train_ks : ',train_ks)

y_pred = lr_model.predict_proba(val_x)[:,1]
fpr_lr,tpr_lr,_ = roc_curve(val_y,y_pred)
val_ks = abs(fpr_lr - tpr_lr).max()
print('val_ks : ',val_ks)

#画图
from matplotlib import pyplot as plt
plt.plot(fpr_lr_train,tpr_lr_train,label = 'train LR')
plt.plot(fpr_lr,tpr_lr,label = 'evl LR')
plt.plot([0,1],[0,1],'k--')
plt.xlabel('False positive rate')
plt.ylabel('True positive rate')
plt.title('ROC Curve')
plt.legend(loc = 'best')
plt.show()
```

><font color='red'>显示结果：</font>
>
>```
>train_ks :  0.4482453222991063
>val_ks :  0.4198642457760936
>```
>
>![img](data:image/png;base64,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)



- 使用原有数据，对数据进行清洗，将异常样本通过无监督算法进行筛选

```python
from pyod.models.iforest import IForest
clf = IForest(behaviour='new',n_estimators=500, n_jobs=-1)#behaviour = 'new' 为了兼容后续版本
clf.fit(x)
```

><font color='red'>显示结果：</font>
>
>```shell
>IForest(behaviour='new', bootstrap=False, contamination=0.1, max_features=1.0,
>    max_samples='auto', n_estimators=500, n_jobs=-1,
>    verbose=0)
>```

- 去掉原有数据中异常值可能性较大的进行建模

```python
out_pred = clf.predict_proba(x,method ='linear')[:,1]
train['out_pred'] = out_pred

#out_pred值越接近1，表示样本越异常，越接近0，表示样本越正常
x = train[train.out_pred< 0.7][feature_lst]
y = train[train.out_pred < 0.7]['bad_ind']

val_x =  val[feature_lst]
val_y = val['bad_ind']

lr_model = LogisticRegression(C=0.1,class_weight='balanced')
lr_model.fit(x,y)
y_pred = lr_model.predict_proba(x)[:,1]
fpr_lr_train,tpr_lr_train,_ = roc_curve(y,y_pred)
train_ks = abs(fpr_lr_train - tpr_lr_train).max()
print('train_ks : ',train_ks)

y_pred = lr_model.predict_proba(val_x)[:,1]
fpr_lr,tpr_lr,_ = roc_curve(val_y,y_pred)
val_ks = abs(fpr_lr - tpr_lr).max()
print('val_ks : ',val_ks)

from matplotlib import pyplot as plt
plt.plot(fpr_lr_train,tpr_lr_train,label = 'train LR')
plt.plot(fpr_lr,tpr_lr,label = 'evl LR')
plt.plot([0,1],[0,1],'k--')
plt.xlabel('False positive rate')
plt.ylabel('True positive rate')
plt.title('ROC Curve')
plt.legend(loc = 'best')
plt.show()
```

><font color='red'>显示结果：</font>
>
>```
>train_ks :  0.4236319500363655
>val_ks :  0.4303032062563228
>```
>
>![img](data:image/png;base64,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)

> 可以看出，验证集上KS表现有所提升



**小结**

| 优点                | 局限                           |
| ------------------- | ------------------------------ |
| ✅ 无分布假设        | ❗ 对高维稀疏数据需调参         |
| ✅ 线性复杂度        | ❗ 局部密度差异大时易漏报       |
| ✅ 支持并行 & 大规模 | ❗ 纯异常检测，不解释“为何异常” |

> **一句话**：
> **Isolation Forest = “随机切分 + 森林投票”**，
> 在大数据场景下，用最小的成本先把最可疑的点拎出来。



## 3、preA模型

- PreA模型指在申请评分卡之前，设置一张根据免费数据进行粗筛选的评分卡
  - 贷款用户首次申请贷款时，平台通常要查询外部收费数据，如征信数据等，从而更好地评估用户信用情况
  - 避免资金浪费，贷款平台会用一些免费数据对用户进行初筛(被拒绝的用户调用收费数据，这部分用户数据的钱相当于白花了)
  - preA模型可以拒绝很少量的客群，其中大部分是负样本

- 使用IF模型做冷启动/反欺诈模型

  - 假设前面的A卡没有标签，我们来看一下直接无监督建模的模型实际效果会是怎么样

```python
#clf就是IF的对象，它是一个无监督的模型，因此效果不是特别理想
y_pred = clf.predict_proba(x,method ='linear')[:,1]
fpr_lr_train,tpr_lr_train,_ = roc_curve(y,y_pred)
train_ks = abs(fpr_lr_train - tpr_lr_train).max()
print('train_ks : ',train_ks)

y_pred = clf.predict_proba(val_x,method ='linear')[:,1]
fpr_lr,tpr_lr,_ = roc_curve(val_y,y_pred)
val_ks = abs(fpr_lr - tpr_lr).max()
print('val_ks : ',val_ks)

from matplotlib import pyplot as plt
plt.plot(fpr_lr_train,tpr_lr_train,label = 'train LR')
plt.plot(fpr_lr,tpr_lr,label = 'evl LR')
plt.plot([0,1],[0,1],'k--')
plt.xlabel('False positive rate')
plt.ylabel('True positive rate')
plt.title('ROC Curve')
plt.legend(loc = 'best')
plt.show()
```

><font color='red'>显示结果：</font>
>
>```
>train_ks :  0.31704360914573587
>val_ks :  0.30647599399557623
>```
>
>![img](data:image/png;base64,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)

- 模型报告

```python
import math
#准备数据
model = clf
bins = 20
temp_ = pd.DataFrame() #创建空白DataFrame
temp_['bad_rate_predict'] = [s[1] for s in model.predict_proba(val_x)]# 预测结果（坏人概率）
temp_['real_bad'] = val_y # 真实结果
temp_ = temp_.sort_values('bad_rate_predict',ascending = False)#按照预测坏人概率降序排列
temp_['num'] = [i for i in range(temp_.shape[0])] #添加序号列，用于分组
temp_['num'] = pd.cut(temp_.num,bins = bins,labels = [i for i in range(bins)])#分成20组，为每组添加组号

#创建报告
report = pd.DataFrame()#创建空白DataFrame
#计算每一组坏人数量
report['BAD'] = temp_.groupby('num').real_bad.sum().astype(int)
#计算每一组好人数量
report['GOOD'] = temp_.groupby('num').real_bad.count().astype(int)-report['BAD']
#累计求和坏人数量
report['BAD_CNT'] = report['BAD'].cumsum()
#累计求和好人数量
report['GOOD_CNT'] = report['GOOD'].cumsum()
good_total = report.GOOD_CNT.max()
bad_total = report.BAD_CNT.max()
#计算到当前组坏人比例（占所有坏人比例）
report['BAD_PCTG'] = round(report.BAD_CNT/bad_total,3)
#计算当前组坏人概率
report['BADRATE'] =report.apply(lambda x: round(x.BAD/(x.BAD+x.GOOD),3),axis = 1)
#计算KS值
def cal_ks(x):
  #当前箱累计坏人数量/总坏人数量  - 当前箱累计好人数量/好人数量
    ks = (x.BAD_CNT/bad_total)-(x.GOOD_CNT/good_total)
    return round(math.fabs(ks),3)
report['KS'] = report.apply(cal_ks,axis = 1)
report
```

><font color='red'>显示结果：</font>
>
>|  num |  BAD | GOOD | BAD_CNT | GOOD_CNT | BAD_PCTG | BADRATE |    KS |
>| ---: | ---: | ---: | ------: | -------: | -------: | ------: | ----: |
>|    0 |   70 |  729 |      70 |      729 |    0.213 |   0.088 | 0.167 |
>|    1 |   36 |  763 |     106 |     1492 |    0.323 |   0.045 | 0.228 |
>|    2 |   27 |  772 |     133 |     2264 |    0.405 |   0.034 | 0.261 |
>|    3 |   27 |  771 |     160 |     3035 |    0.488 |   0.034 | 0.294 |
>|    4 |   18 |  781 |     178 |     3816 |    0.543 |   0.023 | 0.299 |
>|    5 |   18 |  781 |     196 |     4597 |    0.598 |   0.023 | 0.304 |
>|    6 |   10 |  788 |     206 |     5385 |    0.628 |   0.013 | 0.284 |
>|    7 |   13 |  786 |     219 |     6171 |    0.668 |   0.016 | 0.273 |
>|    8 |   14 |  785 |     233 |     6956 |    0.710 |   0.018 | 0.266 |
>|    9 |   20 |  779 |     253 |     7735 |    0.771 |   0.025 | 0.277 |
>|   10 |    6 |  792 |     259 |     8527 |    0.790 |   0.008 | 0.245 |
>|   11 |    2 |  797 |     261 |     9324 |    0.796 |   0.003 | 0.200 |
>|   12 |   10 |  789 |     271 |    10113 |    0.826 |   0.013 | 0.180 |
>|   13 |    3 |  795 |     274 |    10908 |    0.835 |   0.004 | 0.138 |
>|   14 |   12 |  787 |     286 |    11695 |    0.872 |   0.015 | 0.125 |
>|   15 |    5 |  794 |     291 |    12489 |    0.887 |   0.006 | 0.089 |
>|   16 |   10 |  788 |     301 |    13277 |    0.918 |   0.013 | 0.069 |
>|   17 |    5 |  794 |     306 |    14071 |    0.933 |   0.006 | 0.034 |
>|   18 |    9 |  790 |     315 |    14861 |    0.960 |   0.011 | 0.011 |
>|   19 |   13 |  786 |     328 |    15647 |    1.000 |   0.016 | 0.000 |

- 相比于逻辑回归有监督的评分卡来看效果还是稍差一些的，但是对于无监督学习来说效果是非常不错的
- 实际效果可能没有这么好，上面数据中的变量是通过有监督的方式筛选出来的
