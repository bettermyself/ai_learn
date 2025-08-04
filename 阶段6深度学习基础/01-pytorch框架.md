##  深度学习

- 与机器学习的差别
  - 不需要人工特征工程
  - 特征工程+分类/回归 使用一个网络来完成
- 优点
  - 精确度高，性能好，效果好
  - 拟合任意非线性的关系
  - 框架多，不需我们自己造轮子
- 缺点
  - 黑箱，可解释性差
  - 网络参数多，超参数多
  - 需要大量的数据进行训练，训练时间长，对算力有较高要求
  - 小数据集容易过拟合

## pytorch框架

```
pip install torch = X.XXX
```

### 张量创建

#### 创建张量

- torch.tensor() : 将数据创建为张量
- torch.Tensor()：指定形状或指定数据创建张量
- torch.IntTensor()：指定元素类型，指定形状或指定数据创建张量

#### 线性张量

- torch.arange(start,end,step) : 左闭右开[start,end)
- torch.linspace(start,end,num):左闭右闭[start,end]

#### 随机张量

- torch.randn(2,3,4)
- torch.randint(0,10,[2,3,4])
- torch.random.manual_seed():设置随机数据种子
- torch.random.initial_seed():获取随机数据种子

#### 0,1,指定值张量

- torch.zeros(shape)   torch.zeros_like(data) 
- torch.ones(shape)   torch.ones_like(data) 
- torch.full(shape,num)   torch.full_like(data,num) 

#### 元素类型转换

- data.type(torch.IntTensor)
- data.int()

### 张量类型转换

#### 张量与ndarray

- 张量->ndarray
  - data_tensor.numpy()   :共享内存
  - data_tensor.numpy().copy()   :不共享内存
- 张量<-ndarray
  - torch.from_numpy(data_np) :共享内存
  - torch.from_numpy(data_np.copy()) :不共享内存
  - torch.tensor(data_np):不共享内存

#### 张量到数值

- data_tensor.item()

### 张量的运算

#### 加减乘除

- add add_
- sub sub_
- mul mul_
- div div_
- neg neg_

#### 点乘： 数组的形状必须一样的

- torch.mul()
- *号

#### 矩阵乘法： （n,m）x(m,p) = (n,p)

- torch.matmul()
- @号

#### 运算函数

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

### 索引操作

```python
# 行列
print(data[1])
print(data[:,1])
# 列表
print(data[[1,2],[2,3]])
print(data[[[1],[2]],[2,3]])
# 范围
print(data[2:10:2,:2])
# 布尔
print(data[data[:,2]>5,data[0]>5])
# 多维索引
print(data[:,:,1])
```

### 形状操作

```python
# 调整形状：保证数据元素个数不能变换
data.reshape(1,6)
# unsqueeze 升维  squeeze降维 【5,1,1】
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
    
    
 # 拼接：两个张量，要求除指定维度其他维度维数是一样
torch.cat([data1,data2],dim=0)
```









### 自动微分模块

backward()

### 案例



```python
# 导入相关模块
import torch
from torch.utils.data import TensorDataset  # 构造数据集对象
from torch.utils.data import DataLoader  # 数据加载器
from torch import nn  # nn模块中有平方损失函数和假设函数
from torch import optim  # optim模块中有优化器函数
from sklearn.datasets import make_regression  # 创建线性回归模型数据集
import matplotlib.pyplot as plt

# 1.构建数据集
def create_dataset():
    x,y,coef =make_regression(n_samples=100,n_features=1,noise=10,bias=1.5,coef=True)
    x = torch.tensor(x)
    y = torch.tensor(y)
    return x,y,coef

x,y,coef = create_dataset()
print(coef)
dataset=TensorDataset(x,y)
dataloader =DataLoader(dataset=dataset,batch_size=16,shuffle=True)

# 2.构建模型
model =nn.Linear(in_features=1,out_features=1)

# 3.损失函数和优化器设置
loss = nn.MSELoss()
opt = optim.SGD(params=model.parameters(),lr=0.0001)

# 4.模型训练
loss_list = []
total_loss = 0
num = 0
for epoch in range(100):
    for train_x,train_y in dataloader:
        y_pred =model(train_x.float())
        MSE_loss =loss(y_pred,train_y.reshape(-1,1).float())
        total_loss+=MSE_loss.item()
        num += len(train_y)
        opt.zero_grad()
        MSE_loss.backward()
        opt.step()
    loss_list.append(total_loss/num)

plt.plot(range(10),loss_list)
plt.show()

print(model.weight)
print(model.bias)


# if __name__ == '__main__':
#     x,y,coef=create_dataset()
#     plt.scatter(x,y)
#     x = torch.linspace(x.min(),x.max(),1000)
#     y = torch.tensor([i*coef+1.5 for i in x])
#     plt.plot(x,y)
#     plt.grid()
#     plt.show()

```

