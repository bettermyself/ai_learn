### 1. 案例说明

- **任务**：输入一个人名，模型判断其最可能的国家。
- **场景**：国际化注册流程，自动分配国家、国旗、手机号位数等。

> 典型的文本分类任务: 18分类---多分类任务



### 2. 数据格式

注意：两列数据，第一列是人名，第二列是国家类别，中间用制表符号"\t"隔开

```properties
Ang	Chinese
AuYong	Chinese
Yuasa	Japanese
Yuhara	Japanese
Yunokawa	Japanese
```



### 3. 整体步骤

```properties
1. 获取数据:案例中是直接给定的
2. 数据预处理: 脏数据清洗、数据格式转换、数据源Dataset的构造、数据迭代器Dataloader的构造
3. 模型搭建: 构建 RNN 系列模型（RNN / LSTM / GRU）
4. 模型训练和评估（测试）
5. 模型上线---API接口(后续会讲)
```



### 4. 数据预处理

> 这里需要对数据进行处理，以满足训练要求。

#### 4.1 字符集

```python
all_letters = string.ascii_letters + " .,;'"        # 52 个大小写字母 + 5 个常用标点
n_letters   = len(all_letters)            # 57
```



#### 4.2 国家列表

```py
# 国家名 种类数
categorys = ['Italian', 'English', 'Arabic', 'Spanish', 'Scottish', 'Irish', 'Chinese', 'Vietnamese', 'Japanese',
             'French', 'Greek', 'Dutch', 'Korean', 'Polish', 'Portuguese', 'Russian', 'Czech', 'German']
# 国家名 个数
categorynum = len(categorys)             # 18
```



#### 4.3 读文件到内存

目的：将文档里面的数据读取到内存中，将人名存放到一个列表中，国家类别存放到一个列表中

```python
def read_data(filename):
    # 1. 初始化两个空列表
    my_list_x, my_list_y = [], []
    # 2. 读取文件内容
    with open(filename, mode='r', encoding='utf-8') as fr:
        for line in fr.readlines():
            if len(line) <= 5:
                continue
            # strip()方法默认将字符串首尾两端的空白去掉
            x, y = line.strip().split('\t')
            my_list_x.append(x)
            my_list_y.append(y)

    return my_list_x, my_list_y
```



#### 4.4 构建自己的数据源DataSet

```properties
使用Pytorch框架，一般遵从一个规矩：使用DataSet方法构造数据源，来让模型进行使用
构造数据源的过程中:必须继承torch.utils.data.Dataset类，必须构造两个魔法方法：__len__(), __getitem__()
__len__(): 一般返回的是样本的总个数，我们可以直接len(dataset对象)直接就可以获得结果
__getitem__(): 可以根据某个索引取出样本值，我们可以直接用dataset对象[index]来直接获得结果
```

```python
class NameClassDataset(Dataset):
    """
    人名–国家 数据集
    将人名转成 one-hot 张量，国家转成类别索引，供后续 DataLoader 使用。
    """
    def __init__(self, mylist_x, mylist_y):
        self.mylist_x = mylist_x
        self.mylist_y = mylist_y
        self.sample_len = len(mylist_x)

    # --------------------------
    # 魔法方法：返回数据集大小
    # --------------------------
    def __len__(self):
        return self.sample_len

    # ----------------------------------------------
    # 魔法方法：按索引取出一条样本
    # 返回 (tensor_name, tensor_country)
    # ----------------------------------------------
    def __getitem__(self, index):
        # 1.index异常值处理
        index = min(max(index, 0), self.sample_len - 1)
        
        # 2. 根据index取出人名和国家名
        x = self.mylist_x[index]
        y = self.mylist_y[index]

        # 3.需要对人名进行one-hot编码表示：这里的思路是：针对每个人名组成的单词进行one-hot，然后再拼接
        tensor_x = torch.zeros(len(x), n_letter)

        for li, letter in enumerate(x):
            tensor_x[li][all_letters.find(letter)] = 1
       
    	# 4.获取标签
        tensor_y = torch.tensor(categorys.index(y), dtype=torch.long)
        
        return tensor_x, tensor_y
```



#### 4.5 构建数据源Dataloader

目的：把上一步的 `Dataset` 进一步封装成**可迭代对象**，实现：

- `for` 循环遍历
- 自动 **补维（batch）**
- 随机 **打乱顺序**

> ⚠️ 本任务中人名长度不一，若设置 `batch_size>1`，需额外做 **填充 / 截断**；示例先用 `batch_size=1` 便于理解。



代码实现：

```python
from torch.utils.data import DataLoader

# 1. 读取原始数据
filename = './data/name_classfication.txt'
my_list_x, my_list_y = read_data(filename)

# 2. 构建 Dataset
mydataset = NameClassDataset(mylist_x=my_list_x, mylist_y=my_list_y)

# 3. 构建 DataLoader
my_dataloader = DataLoader(dataset=mydataset, 
                           batch_size=1,  # 单条样本，避免长度不一致问题
                           shuffle=True   # 每个 epoch 随机打乱
                          ) 

# 4. 使用示例
for name_tensor, country_idx in my_dataloader:
    print("人名张量形状:", name_tensor.shape)  # (batch_size, seq_len, input_size)
    print("国家索引:", country_idx.item())
    break
```



### 5. 模型搭建

#### 5.1 搭建RNN模型

✅注意事项

```properties
RNN模型在实例化的时候，默认batch_first=False，因此，需要小心输入数据的形状
因为: dataloader返回的结果x->shape->[batch_size, seq_len, input_size], 所以课堂上代码和讲义稍微有点不同，讲义是默认的batch_first=False，而我们的代码是batch_first=True，这样做的目的，可以直接承接x的输入。
```

**✅ 模型定义部分（`MyRNN`）**

```python
class MyRNN(nn.Module):
    def __init__(self, input_size, hidden_size, ouput_size, num_layers=1):
        super().__init__()
        
        # input_size 代表：输入维度（词嵌入维度）
        self.input_size = input_size
        # hidden_size 代表：RNN隐藏层维度
        self.hidden_size = hidden_size
        # output_size 代表：输出维度（国家种类个数）
        self.ouput_size = ouput_size
        # RNN层数
        self.num_layers = num_layers
        
        # 定义RNN层，batch_first=True 表示接收输入形状为 [batch_size, seq_len, input_size]
        self.rnn = nn.RNN(self.input_size, 
                          self.hidden_size,
                          num_layers=self.num_layers, 
                          batch_first=True)
        # 定义输出网络层，将RNN输出映射到类别空间
        self.linear = nn.Linear(self.hidden_size, self.ouput_size)

        # 定义softmax层，用于输出概率分布
        self.softmax = nn.LogSoftmax(dim=-1)

    def forward(self, input, hidden):
        """
        前向传播函数
        :param input: 输入数据，形状为 [batch_size, seq_len, input_size] [1, 9, 57]
        :param hidden: 隐藏状态，形状为 [num_layers, batch_size, hidden_size] [1,1,128]
        :return: output: 模型输出，形状为 [batch_size, output_size]
                 hidden: 更新后的隐藏状态
        """

        # 将input和hidden送入RNN模型得到结果rnn_output【1,9,128】,rnn_hn[1,1,128]
        rnn_output, rnn_hn = self.rnn(input, hidden)  # rnn_output: [batch_size, seq_len, hidden_size]

        # 取最后一个时间步的输出作为分类依据
        last_output = rnn_output[:, -1, :]  # [batch_size, hidden_size]

        # 通过线性层得到输出
        output = self.linear(last_output)  # [batch_size, output_size]

        # 经过softmax
        return self.softmax(output), rnn_hn

    def inithidden(self, batch_size=1):
        """
        初始化隐藏状态
        :param batch_size: 批次大小
        :return: 初始隐藏状态，形状为 [num_layers, batch_size, hidden_size]
        """
        return torch.zeros(self.num_layers, batch_size, self.hidden_size)
```

**✅ 模型测试部分（`test_RNN`）**

```python
def test_RNN():
    # 1. 获取数据加载器
    my_dataloader = get_dataloader()
    
    # 2. 设置模型参数
    input_size = n_letter # 输入维度（例如57）
    hidden_size = 128 # 自定义：设定RNN模型输出结果维度
    output_size = len(categorys) # 输出类别数（例如18）
    
    # 实例化模型
    my_rnn = MyRNN(input_size, hidden_size, output_size)
    
    # 初始化隐藏状态
    h0 = my_rnn.inithidden(batch_size=1)
    
    # 3.将数据送入模型
    for i, (x, y) in enumerate(my_dataloader):
        print(f"输入x的形状: {x.shape}")  # [batch_size, seq_len, input_size]
        
        # 前向传播
        output, hn = my_rnn(input=x, hidden=h0)
        
        print(f"模型输出output的形状: {output.shape}")  # [batch_size, output_size]
        print(f"隐藏状态hn的形状: {hn.shape}")         # [num_layers, batch_size, hidden_size]
        
        break  # 只测试一个batch
```

> **拓展：隐藏状态保持与状态清零**
>
> 问题：在此段代码中，为什么每次训练都需要用初始化的`h0`
>
> ```python
> output, hn = my_rnn(input=x, hidden=h0)
> ```
>
> 因为在当前这个**人名-国家分类任务**中，每条样本都是完全独立的一句话，彼此之间没有任何上下文关系。
> 所以：
>
> > **不需要状态保持，反而“必须清零”隐藏状态，否则会污染预测。**
>
> 
>
> ✅ 举个例子说明：你有 3 条训练样本：
>
> | 样本 | 人名    | 所属国家 |
> | :--- | :------ | :------- |
> | 1    | "Zhang" | China    |
> | 2    | "Jean"  | France   |
> | 3    | "Hans"  | Germany  |
>
> 如果**不清零隐藏状态**，那么：
>
> - 模型在看到 "Jean" 时，**还会记得 "Zhang" 的信息**；
> - 看到 "Hans" 时，**还混着前两条的信息**；
>
> 这就会导致模型**误把当前样本的预测结果，建立在前一条无关样本的基础上**，反而降低准确率。
>
> 
>
> ✅ 所以代码中每次都用：
>
> ```python
> h0 = my_rnn.init_hidden(batch_size=1)
> ```
>
> 来**强制重置隐藏状态**，确保：
>
> > **每个样本的预测只基于它自己，而不是前面无关的信息。**
>
> 
>
> 📌 什么时候需要状态保持？
>
> 只有在你**明确知道样本之间是连续的、有上下文依赖关系**时，才需要状态保持，比如：如果你在**处理一个很长的序列**，但**一次只输入一小段**（比如语言模型训练），你可以：
>
> ```python
> # 保留上一次的 hn，作为下一次的 hidden
> hn = my_rnn.init_hidden()
> for batch in dataloader:
>     output, hn = my_rnn(batch, hn)
>     # 不重置 hn，继续下一轮
> ```
>
> > - 语言模型训练（GPT、RNNLM）
> > - 时间序列预测（股票价格、气温变化）
> > - 对话系统（上下文对话）
>
> ✅ 总结一句话：**当前任务中，每条样本独立，不清零反而错；状态保持反而有害。**



#### 5.2 搭建LSTM模型

✅ 注意事项

```properties
LSTM模型在实例化的时候，默认batch_first=False，因此，需要小心输入数据的形状
因为: dataloader返回的结果x---》shape--〉[batch_size, seq_len, input_size], 所以课堂上代码和讲义稍微有点不同，讲义是默认的batch_first=False，而我们的代码是batch_first=True，这样做的目的，可以直接承接x的输入。
```

✅ 模型定义部分（`MyLSTM`）

```python
class MyLSTM(nn.Module):
    def __init__(self, input_size, hidden_size, ouput_size, num_layers=1):
        """
        :param input_size:  词嵌入维度（例如 57）
        :param hidden_size: LSTM 隐藏层维度（例如 128）
        :param output_size: 分类类别数（例如 18）
        :param num_layers:  LSTM 层数，默认 1
        """
        super().__init__()
        
        # input_size 代表词嵌入维度；
        self.input_size = input_size
        # hidden_size代表LSTM隐藏层维度
        self.hidden_size = hidden_size
        # output_size代表：国家种类个数
        self.ouput_size = ouput_size
        self.num_layers = num_layers
        
        # 定义 LSTM 层：batch_first=True 表示rnn接受的输入为 [batch, seq_len, input_size]
        self.lstm = nn.LSTM(self.input_size, 
                            self.hidden_size,
                            num_layers=self.num_layers, 
                            batch_first=True)
        # 定义输出网络层,将 LSTM 的输出映射到类别空间
        self.linear = nn.Linear(self.hidden_size, self.ouput_size)

        # 定义softmax层
        self.softmax = nn.LogSoftmax(dim=-1)

    def forward(self, input, hidden, cell):
        """
        前向传播
        :param input:  [batch_size, seq_len, input_size]                   [1, 9, 57]
        :param hidden: [num_layers, batch_size, hidden_size]               [1,1,128]
        :param cell:   [num_layers, batch_size, hidden_size]               [1,1,128]
        :return: output:  [batch_size, output_size]
                 lstm_hn: [num_layers, batch_size, hidden_size] —— 新的隐藏状态
                 lstm_cn: [num_layers, batch_size, hidden_size] —— 新的细胞状态
        """
        
        # 将input和hidden、cell送入LSTM模型得到结果rnn_output【1,9,128】,lstm_hn[1,1,128], lstm_cn[1,1,128]
        # LSTM 返回：(output, (lstm_hn, lstm_cn))
        lstm_output, (lstm_hn, lstm_cn) = self.lstm(input, (hidden, cell))

        # 取最后一个时间步的输出作为分类依据
        last_output = lstm_out[:, -1, :]  # [batch, hidden_size]

        # 线性映射到类别维度
        output = self.linear(last_output)  # [batch, output_size]

        # 经过softmax
        output = self.softmax(output)
        
        return output, lstm_hn, lstm_cn

    def inithidden(self, batch_size=1):
        """
        初始化隐藏状态 h0 与细胞状态 c0
        :param batch_size: 批次大小
        :return: (h0, c0)，均为全 0 张量
        """
        h0 = torch.zeros(self.num_layers, batch_size, self.hidden_size)
        c0 = torch.zeros(self.num_layers, batch_size, self.hidden_size)
        return h0, c0
```

✅ 模型测试部分（`test_LSTM`）

```python
def test_LSTM():
    # 1. 获取数据加载器
    my_dataloader = get_dataloader()
    
    # 2. 设置模型超参数
    input_size = n_letter # 输入维度（例如57）
    hidden_size = 128 # 自定义：设定LSTM模型输出结果维度
    output_size = len(categorys) # 输出类别数（例如18）
    
    # 实例化模型
    my_lstm = MyLSTM(input_size, hidden_size, output_size)
    
    # 初始化隐藏状态与细胞状态
    h0, c0 = my_lstm.inithidden()
    
    # 3.将数据送入模型
    for i, (x, y) in enumerate(my_dataloader):
        print(f"输入 x 形状: {x.shape}")        # [batch, seq_len, input_size]

        # 前向计算
        output, hn, cn = my_lstm(input=x, hidden=h0, cell=c0)

        print(f"模型输出 output 形状: {output.shape}")  # [batch, output_size]
        print(f"隐藏状态 hn 形状: {hn.shape}")          # [num_layers, batch, hidden_size]
        print(f"细胞状态 cn 形状: {cn.shape}")          # [num_layers, batch, hidden_size]
        break   # 仅测试一个 batch
```

> **拓展：`nn.CrossEntropyLoss()`与`nn.NLLLoss()`的区别**
>
> | 函数                  | 输入必须是            | 内部是否含 Softmax/LogSoftmax | 典型搭配                      |
> | --------------------- | --------------------- | ----------------------------- | ----------------------------- |
> | `nn.CrossEntropyLoss` | **原始 logits**       | ✅ 内置 `LogSoftmax + NLLLoss` | 模型**不加**任何激活          |
> | `nn.NLLLoss`          | **log-probabilities** | ❌ **没有** LogSoftmax 步骤    | 模型末尾**必须** `LogSoftmax` |
>
> `LogSoftmax()`返回的结果是概率值吗？
>
> **不是概率值**，而是 **log-probabilities**（对数概率）。
>
> ✅ 原因：代码里用的是：
>
> ```python
> self.softmax = nn.LogSoftmax(dim=-1)
> ```
>
> - `LogSoftmax` = **先 softmax 再取自然对数**，输出的是 **log(p)**，其中 **p 是概率**，范围 **(-∞, 0]**。



#### 5.3 搭建GRU模型

✅注意事项

```properties
GRU模型在实例化的时候，默认batch_first=False，因此，需要小心输入数据的形状
因为: dataloader返回的结果x---》shape--〉[batch_size, seq_len, input_size], 所以课堂上代码和讲义稍微有点不同，讲义是默认的batch_first=False，而我们的代码是batch_first=True，这样做的目的，可以直接承接x的输入。
```

✅ 模型定义部分（`MyGRU`）

```python
class MyGRU(nn.Module):
    def __init__(self, input_size, hidden_size, ouput_size, num_layers=1):
      	"""
        :param input_size:  词嵌入维度（如 57）
        :param hidden_size: GRU 隐藏层维度（如 128）
        :param output_size: 分类类别数（如 18）
        :param num_layers:  GRU 层数，默认 1
        """
        super().__init__()
        # input_size 代表词嵌入维度；
        self.input_size = input_size
        # hidden_size代表GRU隐藏层维度
        self.hidden_size = hidden_size
        # output_size代表：国家种类个数
        self.ouput_size = ouput_size
        self.num_layers = num_layers
        
        # 定义GRU 层：batch_first=True → 输入形状 [batch, seq_len, input_size]
        self.gru = nn.GRU(self.input_size, 
                          self.hidden_size,
                          num_layers=self.num_layers, 
                          batch_first=True)
        
        # 定义输出网络层, 输出映射：隐藏层 → 类别空间
        self.linear = nn.Linear(self.hidden_size, self.ouput_size)

        # 定义softmax层, 用于输出 log-probabilities
        self.softmax = nn.LogSoftmax(dim=-1)

    def forward(self, input, hidden):
        """
        前向传播
        :param input:   [batch_size, seq_len, input_size]                [1, 9, 57]
        :param hidden:  [num_layers, batch_size, hidden_size]            [1,1,128]
        :return:
            output: [batch_size, output_size] —— 当前样本的 log-probabilities
            hidden: [num_layers, batch_size, hidden_size] —— 下一步可继续用
        """

  

        # 将input和hidden送入RNN模型得到结果rnn_output【1,9,128】,rnn_hn[1,1,128]
        gru_output, gru_hn = self.gru(input, hidden)  # gru_out: [batch_size, seq_len, hidden]

        # 取最后一个时间步的输出作为分类依据
        last_hidden = gru_out[:, -1, :]             # [batch, hidden]
       
        # 线性层映射到类别维度
        output = self.linear(last_hidden)          # [batch, output_size]

        # 经过softmax, 返回 log-probabilities 与新的隐藏状态
        return self.softmax(output), gru_hn

    def inithidden(self, batch_size=1):
      	"""
        初始化隐藏状态 h0（全 0）
        :param batch_size: 批次大小
        :return: [num_layers, batch_size, hidden_size]
        """
        return torch.zeros(self.num_layers, batch_size, self.hidden_size)
```

✅ 模型测试部分（`test_GRU`）

```python
def test_GRU():
    # 1. 获取数据加载器
    my_dataloader = get_dataloader()

    # 2. 模型超参数
    input_size  = n_letter        # 57
    hidden_size = 128             # 隐藏层维度
    output_size = len(categories) # 18

    # 实例化模型
    my_gru = MyGRU(input_size, hidden_size, output_size)

    # 初始化隐藏状态
    h0 = my_gru.init_hidden(batch_size=1)

    # 3. 遍历数据（仅看第一个 batch）
    for i, (x, y) in enumerate(my_dataloader):
        print(f"输入 x 形状: {x.shape}")          # [batch, seq_len, input_size]

        # 前向计算
        output, hn = my_gru(input=x, hidden=h0)

        print(f"模型输出 output 形状: {output.shape}")  # [batch, output_size]
        print(f"隐藏状态 hn 形状: {hn.shape}")          # [num_layers, batch, hidden_size]

        break  # 只测一个 batch
```



### 6. 模型训练

基本过程

```properties
1.获取数据
2.构建数据源Dataset
3.构建数据迭代器Dataloader
4.加载自定义的模型
5.实例化损失函数对象
6.实例化优化器对象
7.定义打印日志参数
8.开始训练
8.1 实现外层大循环epoch
(可以在这构建数据迭代器Dataloader)
8.2 内部遍历数据迭代球dataloader
8.3 将数据送入模型得到输出结果
8.4 计算损失
8.5 梯度清零: optimizer.zero_grad()
8.6 反向传播: loss.backward()
8.7 参数更新（梯度更新）: optimizer.step()
8.8 打印训练日志
9. 保存模型: torch.save(model.state_dict(), "model_path")
```

**✅ RNN模型训练代码实现**

```python
# 超参数 & 工具
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torch import optim
import time, json
from tqdm import tqdm

my_lr   = 1e-3          # 学习率
epochs  = 1             # 训练轮数
log_interval   = 100    # 每多少个样本记录一次
print_interval = 2000   # 每多少个样本打印一次
save_dir       = "./save_model"
result_dir     = "./save_results"


# 训练主函数 train_rnn
def train_rnn():
    # 1. 读取数据
    my_list_x, my_list_y = read_data(filepath='./data/name_classfication.txt')
    
    # 2. 构建 Dataset
    my_dataset = NameClassDataset(my_list_x, my_list_y)
    
    
    # 3. 实例化模型, n_letters=57, hidden_size=128,类别总数output_size=18
    my_rnn = My_RNN(input_size=57, hidden_size=128, output_size=18)
    
    # 4. 损失函数 & 优化器
    my_nll_loss = nn.NLLLoss()
    my_optim = optim.Adam(my_rnn.parameters(), lr=my_lr)
    
    # 5. 日志初始化
    start_time      = time.time()
    total_iter_num  = 0          # 已训练样本总数
    total_loss      = 0.0        # 累计损失
    total_acc_num   = 0          # 累计正确样本数
    total_loss_list = []         # 每隔n个样本，保存平均损失
    total_acc_list  = []         # 每隔n个样本，保存平均准确率
    
    # 6. 外层 epoch 循环
    for epoch_idx in range(epochs):
        
        # 6.1 实例化dataloader
        my_dataloader = DataLoader(dataset=my_dataset, batch_size=1, shuffle=True)
        
        # 6.2 内层 batch 循环
        for i, (x, y) in enumerate(tqdm(my_dataloader, desc=f"Epoch {epoch_idx+1}/{epochs}")):
          	
            # 6.3 前向传播
            output, hn = my_rnn(input=x, hidden=my_rnn.inithidden())
            # print(f'output--》{output}') # [1, 18]
            
            # 6.4 计算损失
            my_loss = my_nll_loss(output, y)

            # 6.5 反向传播
            # 梯度清零
            my_optim.zero_grad()
            # 反向传播
            my_loss.backward()
            # 梯度更新
            my_optim.step()

            # 6.6 统计
            # 统计一下已经训练样本的总个数
            total_iter_num = total_iter_num + 1

            # 统计一下已经训练样本的总损失
            total_loss = total_loss + my_loss.item()

            # 统计已经训练的样本中预测正确的个数
            i_predict_num = 1 if torch.argmax(output).item() == y.item() else 0
            total_acc_num = total_acc_num + i_predict_num
            
            # 每隔100次训练保存一下平均损失和准确率
            if total_iter_num % 100 == 0:
                avg_loss = total_loss / total_iter_num
                total_loss_list.append(avg_loss)

                avg_acc = total_acc_num / total_iter_num
                total_acc_list.append(avg_acc)
            
            # 每隔2000次训练打印一下日志
            if total_iter_num % 2000 == 0:
                temp_loss = total_loss / total_iter_num
                temp_acc = total_acc_num / total_iter_num
                temp_time = time.time() - start_time
                print(f"轮次：{epoch_idx+1}, "
                      f"损失：{temp_loss:.6f}, "
                      f"时间：{int(temp_time)}s, "
                      f"准确率：{temp_acc:.3f}")
                
        torch.save(my_rnn.state_dict(), './save_model/ai20_rnn_%d.bin'%(epoch_idx+1))
    
    # 计算总时间
    total_time = int(time.time() - start_time)
    print('训练总耗时：', total_time)
    
    # 将结果保存到文件中
    dict1 = {"avg_loss":total_loss_list,
             "all_time": total_time,
             "avg_acc": total_acc_list}
    with open('./save_results/ai_rnn.json', 'w') as fw:
        fw.write(json.dumps(dict1))

    return total_loss_list, total_time, total_acc_list
```

✅**LSTM模型训练代码实现**

```python
基本原理同上
```

**✅GRU模型训练代码**

```python
基本原理同上
```



### 7. 模型预测

**✅基本过程**

```properties
1.获取数据
2.数据预处理：将数据转化one-hot编码
3.实例化模型
4.加载模型训练好的参数: model.load_state_dict(torch.load("model_path"))
5.with torch.no_grad():
6.将数据送入模型进行预测（注意:张量的形状变换）
```

RNN模型预测代码：

```python
# 1. 将字符串转为 one-hot 张量
def line2tensor(x: str):
    """
    :param x: 原始字符串，如 "bai"
    :return:  [seq_len, n_letters] 的 one-hot 矩阵
    """
    tensor_x = torch.zeros(len(x), n_letters)   # [seq_len, 57]
    for li, letter in enumerate(x):
        tensor_x[li][letters.find(letter)] = 1  # 对应位置置 1
    return tensor_x

  
# 2. RNN 预测函数
def rnn_predict(x):
   	"""
    :param x: 待预测人名字符串
    :return: None（直接打印 Top-3 结果）
    """
    # 2.1 数据转换 → [1, seq_len, n_letters]
    tensor_x = line2tensor(x).unsqueeze(0)
    
    # 2.2 加载已训练模型
    my_rnn = My_RNN(input_size=57, hidden_size=128, output_size=18)
    my_rnn.load_state_dict(torch.load("./save_model/ai20_rnn_3.bin"))
    my_rnn.eval()                       # 推理模式
    
    # 2.3 实现模型的预测
    with torch.no_grad():
        # 将数据送入模型
        output, hn = my_rnn(tensor_x, my_rnn.inithidden())   # output: [1, 18]
        
        # 2.4 取概率最高的前 3 个类别
        # output.topk(3, 1, True)
        values, indexes = torch.topk(output, k=3, dim=-1, largest=True)  # [1, 3]
        print(f'values-->{values}')
        print(f'indexes-->{indexes}')
        for i in range(3):
            value = values[0][i]
            index = indexes[0][i]
            category = categorys[index]
            print(f'当前预测的值是：{value}, 国家类别是：{category}')
```

🔍 要点小结

| 步骤              | 作用                      |
| ----------------- | ------------------------- |
| `line2tensor`     | 将字符串转为 one-hot 序列 |
| `load_state_dict` | 载入训练好的权重          |
| `torch.topk`      | 快速取 Top-3 预测         |
| `no_grad`         | 关闭梯度，加速推理        |
