##  1、深度学习

### 1.1 与机器学习的差别

- **无需人工特征工程**
  - 传统机器学习：先人工做特征工程 → 再做分类/回归
  - 深度学习：特征提取 + 分类/回归 由同一个网络来完成



### 1.2 优点

- **精度高**：在大量数据上表现优异
- **拟合能力强**：可逼近任意非线性关系
- **工具丰富**：TensorFlow、PyTorch 等成熟框架，无需“造轮子”



### 1.3 缺点

- **黑箱模型**：可解释性差，难理解内部决策逻辑
- **超参数多**：网络结构、学习率、正则化等参数需要精细调节
- **数据饥渴**：需要海量训练数据，训练时间长，对算力要求高
- **易过拟合**：在小数据集上表现不佳，需正则化、数据增强等手段缓解



## 2、pytorch框架

### 2.1 环境 & 安装

```
pip install torch==1.10.0 -i https://pypi.tuna.tsinghua.edu.cn/simple
```



### 2.2 张量创建

| 功能                         | 接口                                       | 示例（来自 PDF）                          |
| ---------------------------- | ------------------------------------------ | ----------------------------------------- |
| 从已有数据                   | `torch.tensor(data)`                       | `torch.tensor([[10.,20.],[30.,40.]])`     |
| 指定形状（随机值）或已有数据 | `torch.Tensor(*shape)`                     | `torch.Tensor(2,3)`/`torch.Tensor([100])` |
| 指定类型                     | `torch.IntTensor/FloatTensor/DoubleTensor` | `torch.IntTensor([1,2,3])`                |
| 线性间隔-**左闭右开**        | `torch.arange(start,end,step)`             | `torch.arange(0,10,2)`                    |
| 线性等分-**左闭右闭**        | `torch.linspace(start,end,num)`            | `torch.linspace(0,9,10)`                  |
| 随机正态                     | `torch.randn(*shape)`                      | `torch.randn(2,3)`                        |
| 随机整型-**左闭右开**        | `torch.randint(low,high,size)`             | `torch.randint(0,10,[2,3])`               |
| 获取随机数据种子             | `torch.random.initial_seed()`              | -                                         |
| 设置随机数据种子             | `torch.manual_seed(seed)`                  | `torch.manual_seed(100)`                  |
| 全 0                         | `torch.zeros(shape)`                       | `torch.zeros(2,3)`                        |
| 全 1                         | `torch.ones(shape)`                        | `torch.ones(2,3)`                         |
| 全指定值                     | `torch.full(shape,val)`                    | `torch.full([2,3], 7)`                    |
| 复用形状                     | `*_like` 系列                              | `torch.zeros_like(x)`                     |

```python
import torch
import numpy as np

# 1. 张量创建 ----------------------------------------------------------
x_list = [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]
t1 = torch.tensor(x_list)                # 从 Python 列表
t2 = torch.Tensor(2, 3)                  # 未初始化，仅分配空间
t3 = torch.arange(0, 10, 2)              # 线性 [0,2,4,6,8]
t4 = torch.linspace(0, 9, 10)            # 等分 10 个点
t5 = torch.randn(2, 3)                   # 标准正态 N(0,1)
t6 = torch.randint(0, 10, (2, 3))        # 离散均匀 [0,10)
t7 = torch.zeros(2, 3)                   # 全 0
t8 = torch.ones(2, 3)                    # 全 1
t9 = torch.full((2, 3), 7)               # 全 7
```

> **区别**：`torch.tensor([100])`创建的是1维张量(形状为[1])，而`torch.tensor(100)`创建的是0维张量(标量，形状为[])



### 2.3 类型转换

| 场景           | 不共享内存                                                   | 共享内存                |
| -------------- | ------------------------------------------------------------ | ----------------------- |
| Tensor → NumPy | `data_tensor.numpy().copy()`                                 | `data_tensor.numpy()`   |
| NumPy → Tensor | `torch.tensor(arr) \ torch.from_numpy(data_np.copy())`       | `torch.from_numpy(arr)` |
| 张量的元素类型 | `data_tensor = data_tensor.type(torch.DoubleTensor)` 或 `data_tensor.double()` | —                       |

```python
# 截图 2：类型转换 ----------------------------------------------------

# 共享内存  Tensor <--> NumPy
data_tensor = torch.tensor([2, 3, 4])
data_numpy = data_tensor.numpy()          

data_numpy[0] = 100
print(data_tensor)                        # tensor([100, 3, 4])

# 不共享
data_numpy = data_tensor.numpy().copy()
data_numpy[0] = 200
print(data_tensor)                        # tensor([100, 3, 4])

# NumPy -> Tensor
data_np = np.array([2, 3, 4])
data_tensor = torch.from_numpy(data_np)   # 共享内存
data_tensor[0] = 300
print(data_np)                            # [300 3 4]

data_tensor = torch.tensor(data_np)       # 不共享
data_tensor[0] = 400
print(data_np)                            # [300 3 4]
```



### 2.4 张量 ↔ Python 标量

```python
scalar = torch.tensor(3.14)
value  = scalar.item()      # 3.14 data_tensor.item()
```



### 2.5 基本运算

| 数学       | 函数                      | 方法调用(不修改原数据) | 原地版本（修改原数据） |
| ---------- | ------------------------- | ---------------------- | ---------------------- |
| +          | `torch.add(a,b)`          | `a.add(b)`             | `a.add_(b)`            |
| -          | `torch.sub(a,b)`          | `a.sub(b)`             | `a.sub_(b)`            |
| \*（点乘） | `torch.mul(a,b)` 或 `a*b` | `a.mul(b)`             | `a.mul_(b)`            |
| /          | `torch.div(a,b)`          | `a.div(b)`             | `a.div_(b)`            |
| 取负       | `torch.neg(a)`            | `a.neg()`              | `a.neg_()`             |

```python
# 3：基本运算 ----------------------------------------------------
data = torch.randint(0, 10, [2, 3])
print(data)

new_data = data.add(10)                   # 不修改原 data
print(new_data)

data.add_(10)                             # 原地修改
print(data)

print(data.sub(100))
print(data.mul(100))
print(data.div(100))
print(data.neg())
```



### 2.6 线性代数运算

| 操作             | 语法                           | 备注                       |
| ---------------- | ------------------------------ | -------------------------- |
| 点乘（Hadamard） | `a * b` 或 `torch.mul(a,b)`    | 形状必须完全相同           |
| 矩阵乘法         | `a @ b` 或 `torch.matmul(a,b)` | 形状 (n,m) × (m,p) → (n,p) |

```python
# 点乘
data1 = torch.tensor([[1, 2], [3, 4]])
data2 = torch.tensor([[5, 6], [7, 8]])
print(torch.mul(data1, data2))
print(data1 * data2)

# 矩阵乘法
data1 = torch.tensor([[1, 2], [3, 4], [5, 6]])
data2 = torch.tensor([[5, 6], [7, 8]])
print("data1 @ data2:\n", data1 @ data2)
print("torch.matmul:\n", torch.matmul(data1, data2))
```



### 2.7 统计 & 数学函数

| 功能     | 示例                                                         |
| -------- | ------------------------------------------------------------ |
| 均值     | `data_tensor.mean(dim=0)`                                    |
| 求和     | `data_tensor.sum(dim=1)`                                     |
| 平方     | `torch.pow(data_tensor, 2)`                                  |
| 平方根   | `data_tensor.sqrt()`                                         |
| 指数 e^x | `data_tensor.exp()`                                          |
| 对数     | `data_tensor.log()` / `data_tensor.log2()` / `data_tensor.log10()` |

```python
# 均值 avg
print(data.mean(dim=1))
# 求和
print(data.sum(dim=1))
# 指数
print(torch.pow(data,0.5））
# 开方
print(data.sqrt())
# 以e为底的指数
print(data.exp())
# 对数
print(data.log10())
print(data.log2())
print(data.log()) # 以e为底
```



### 2.8 索引 & 切片

| 需求      | 写法                |
| --------- | ------------------- |
| 取第 1 行 | `data[0]`           |
| 取第 1 列 | `data[:, 0]`        |
| 列表索引  | `data[[0,1],[2,3]]` |
| 范围      | `data[2:10:2, :2]`  |
| 布尔      | `data[data[:,2]>5]` |
| 多维      | `data[:, :, 0]`     |

```python
# 行列索引
print(data[1])         # 取第1行（下标从0开始），返回一维张量
print(data[:,1])       # 取所有行的第1列，返回一维张量

# 列表索引（高级索引）
print(data[[1,2],[3,3]]) 
# 取 (1,3) 和 (2,3) 这两个位置的元素，结果是一维张量，等价于 [data[1,3], data[2,3]]

print(data[[[1],[2]],[2,3]])
# 第一个索引是二维([[1],[2]] shape为(2,1))，第二个索引是一维([2,3] shape为(2,))
# 广播后得到 shape (2,2)，等价于：
# [[data[1,2], data[1,3]],
#  [data[2,2], data[2,3]]]

# 范围索引
print(data[2:10:2,:2])
# 取第2行到第10行（步长为2），每行的前两列

# 布尔索引
print(data[data[:,2]>5, data[0]>5])
# 先筛选出第3列大于5的行，再筛选第1行大于5的列，筛选出同时满足的区域

# 多维索引
print(data[:,:,1])
# 取所有行、所有列的第1个通道（适用于三维及以上张量）
```

> 在 data[[[1],[3]],[1,3]] 这种索引方式中，广播（broadcasting）的意思是：
> 第一个索引 [[[1],[3]]] 形状为 (2,1)，第二个索引 [1,3] 形状为 (2,)，PyTorch 会自动将它们扩展为相同的形状 (2,2)，然后组合成所有可能的索引对，最终取出如下元素：
> data[1,1], data[1,3]
> data[3,1], data[3,3]
> 结果是一个 2x2 的张量。
> 这种自动扩展索引长度的机制就叫做广播

> <font color='red'>`,`区分行和列，但是要具体看数据的维度，来确定哪个`,`才是区分点。</font>要理解`data[[1,2],[3,4]]`为什么取取 (1,3) 和 (2,4) 这两个位置的元素。



### 2.9 形状操作

| 目标       | 接口                 | 注意事项               |
| ---------- | -------------------- | ---------------------- |
| 改变形状   | `x.reshape(1, -1)`   | 元素总数不变           |
| 升维       | `x.unsqueeze(dim)`   | 插入 size=1 的维度     |
| 降维       | `x.squeeze()`        | 去掉所有 size=1 的维度 |
| 交换两维   | `x.transpose(d1,d2)` | 之后内存可能不连续     |
| 多维度重排 | `x.permute(order)`   | 同上                   |
| 连续化     | `x.contiguous()`     | 与 `view` 连用         |
| 展平       | `x.view(-1)`         | 要求内存连续           |

```python
# 调整形状：保证数据元素个数不能变换
data.reshape(1,6)

# unsqueeze 升维  squeeze降维 
data.unsqueeze(dim=-1).squeeze()

# transpose 只交换两个维度 permute 多个维度
print(torch.transpose(torch.transpose(data,1,2),0,1).shape)
print(torch.permute(data,[2,0,1]).shape)
print(data.permute([2,0,1]).shape)

# view作用与reshape一样的，使用时抻平成一个向量，内存要连续
data =torch.transpose(data,0,1)
if data.is_contiguous():
    print('T')
    print(data.view(-1))
else:
    print('F')
    print(data.contiguous().view(-1))
```



### 2.10 拼接

```python
# 拼接：两个张量，要求除指定维度其他维度维数是一样
# torch.cat([data1,data2],dim=0)

import torch

a = torch.ones(2, 3)     # [[1,1,1],[1,1,1]]
b = torch.zeros(2, 3)    # [[0,0,0],[0,0,0]]

# 按第 0 维（行）拼
c = torch.cat([a, b], dim=0)   # -> shape 4×3
print(c)
```

```tex
tensor([[1., 1., 1.],
        [1., 1., 1.],
        [0., 0., 0.],
        [0., 0., 0.]])
```

```python
import torch

a = torch.ones(2, 3)     # [[1,1,1],[1,1,1]]
b = torch.zeros(2, 3)    # [[0,0,0],[0,0,0]]

# 按第 1 维（列）拼
c = torch.cat([a, b], dim=1)   # -> shape 2×6
print(c)
```

```tex
tensor([[1., 1., 1., 0., 0., 0.],
        [1., 1., 1., 0., 0., 0.]])
```



### 2.11 自动微分

```python
import torch

# 1. 当 x 为标量时梯度的计算
def test01():
    # 输入标量
    x = torch.tensor(5.0, dtype=torch.float32)

    # 目标值
    y = torch.tensor(0.0, dtype=torch.float32)

    # 权重 w 与偏置 b，设置 requires_grad=True 以便自动求导
    w = torch.tensor(1.0, requires_grad=True, dtype=torch.float32)
    b = torch.tensor(3.0, requires_grad=True, dtype=torch.float32)

    # 前向计算：z = x * w + b
    z = x * w + b

    # 定义并计算损失
    loss_fn = torch.nn.MSELoss()
    loss = loss_fn(z, y)

    # 反向传播
    loss.backward()

    # 打印梯度
    print("W 的梯度:", w.grad)
    print("b 的梯度:", b.grad)

if __name__ == "__main__":
    test01()
```



## 3、案例-线性回归

```python
# 构造数据集
from sklearn.datasets import make_regression
# 构造适合torch数据集
from torch.utils.data import TensorDataset, DataLoader
import matplotlib.pyplot as plt
import torch

# 构建数据集
x, y, coef = make_regression(n_samples=100,  # 样本个数
                             n_features=1,  # 特征维度
                             noise=10,  # 噪声
                             bias=1.5,  # 偏置
                             coef=True  # 返回,斜率
                             )

plt.scatter(x, y)

# 数据获取

# 转换成tensor
x = torch.tensor(x)
y = torch.tensor(y)
# 构造适合torch数据集:100个数据
dataset = TensorDataset(x, y)
# 构建batch数据
daloader = DataLoader(dataset=dataset, batch_size=8, shuffle=True, drop_last=False)

# 构建模型:线性回归
model = torch.nn.Linear(in_features=1,  # 输入x的维度
                        out_features=1  # 输出y的维度
                        )

print(model.parameters())

# 模型训练
# 损失:均方误差
cri = torch.nn.MSELoss()
# 优化器
optimizer = torch.optim.SGD(params=model.parameters(), lr=0.001)
# 遍历"epoch batch
loss_num = []
# 遍历每个epoch
for i in range(100):
    sum = 0
    sample = 0
    # 获取batch数据
    for x_, y_ in daloader:
        # 模型预测
        y_predict = model(x_.type(torch.float32))
        # 损失计算
        loss = cri(y_predict, y_.reshape(-1, 1).type(torch.float32))  #一定要加上reshape(-1, 1)，以为要和y_predict维度保持一致
        sum += loss.item()
        sample += len(y_)
        # 梯度清零
        #梯度清零（optimizer.zero_grad()）需要放在前面，是因为 PyTorch 在每次反向传播时，梯度是累加的（而不是自动清零）。如果不在每次反向传播前清零，梯度会叠加，导致参数更新不正确。因此，通常在每个 batch 的 loss.backward() 之前先调用 optimizer.zero_grad()，确保每次只用当前 batch 的梯度进行参数更新。
        optimizer.zero_grad()
        # 自动微分
        loss.backward()
        # 更新参数
        optimizer.step()
    loss_num.append(sum / sample)

# 绘制拟合直线
x = torch.linspace(x.min(), x.max(), 1000)
y1 = torch.tensor([v * model.weight + model.bias for v in x])
y2 = torch.tensor([v * coef + 1.5 for v in x])
plt.plot(x, y1, label='train')
plt.plot(x, y2, label='real')
plt.grid()
plt.legend()
plt.show()

# 绘制损失变化曲线
plt.plot(range(100), loss_num)
plt.grid()
plt.show()
```
