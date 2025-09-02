## 1、RNN变体

### 1.1 LSTM模型

#### 1. 定义

**LSTM**（Long Short-Term Memory）也称长短时记忆结构。它是传统 RNN 的变体，**能够捕捉长序列语义关联并缓解梯度消失/爆炸**。结构更复杂，核心由 4 部分组成：

- 遗忘门
- 输入门
- 细胞状态
- 输出门



#### 2. LSTM的内部结构图

![img](assets/31.png)

##### 1. 遗忘门（Forget Gate）

- 遗忘门结构

![img](assets/32.png)

- 计算公式
  $$
  f_t = σ(W_f · [h_{t-1}, x_t] + b_f)
  $$
  

- 结构要点

  - 将当前输入 $x_t$ 与上一时刻隐藏状态 $h_{t-1}$ 拼接 ➡ 全连接层 ➡ **Sigmoid** 激活➡得到$f_t$。
  - $f_t$ 被看作“门值”，决定遗忘多少上一时刻细胞状态 $C_{t-1}$ 的信息。



- 激活函数sigmiod的作用

> 用于帮助调节流经网络的值, sigmoid函数将值压缩在0和1之间

![img](assets/RNN27.gif)

- 工作流示意

![img](assets/RNN26.gif)



##### 2. 输入门（Input Gate）

- 输入门结构

![img](assets/34.png)

- 计算公式
  $$
  i_t = \sigma(W_i \cdot [h_{t-1}, x_t] + b_i) \quad \text{(门值，决定保留多少新信息)}\\
  \\\tilde{C}_t = \tanh(W_c \cdot [h_{t-1}, x_t] + b_c)\quad \text{(候选细胞状态)}
  $$

- 



- 结构要点
  - 第一个公式用于产生输入门的门控值，其形式与遗忘门公式相似，主要区别在于作用的目标不同。该公式的作用是确定需要对多少输入信息进行过滤。
  - 第二个公式则与传统RNN的内部结构计算一致，但在LSTM中，它得到的是当前细胞状态，而非经典RNN中的隐含状态。



- 工作流示意

![img](assets/RNN28.gif)

##### 3. 细胞状态更新（Cell State Update）

- 细胞状态更新图

![img](assets/35.png)



- 计算公式

$$
C _ { t } = f _ { t } * C _ { t - 1 } + i _ { t } * \tilde { C } _ { t }
$$



- 结构要点
  - 无全连接层，仅逐元素乘、加操作。
  - $f_t$ 对旧信息做“遗忘”，$i_t$ 对新信息做“写入”。
  - 更新后的 $C_t$ 作为下一时刻输入的一部分。



- 工作流示意

![img](assets/RNN29.gif)

##### 4. 输出门（Output Gate）

- 输出门结构图

![img](assets/37.png)



- 计算公式

$$
o_t = \sigma\left(W_o\ [ h_{t-1}, x_t]\ +\ b_o\right)\\
\\h_t = o_t * \tanh\left(C_t\right)
$$



- 结构要点
  - 计算模式与遗忘门、输入门相同。
  - 用更新后的 $C_t$ 经 **tanh** 激活，再与门值 $o_t$ 逐元素相乘，得到当前隐藏状态 $h_t$。
  - $h_t$ 成为下一时刻的输入之一。



- 工作流示意

![img](assets/RNN30.gif)





#### 3. BI-LSTM模型：

Bi-LSTM（Bidirectional LSTM，双向 LSTM）并未改变 LSTM 内部的任何结构，而是将标准 LSTM **按两个相反方向各运行一次**，再把两者的输出 **拼接** 作为最终结果。

![avatar](assets/38.png)

> 【Bi-LSTM 结构示意】
>
> 输入序列：我爱中国
> 处理方式：
>
> - 从左 → 右：正向 LSTM
> - 从右 → 左：反向 LSTM
>
> 将两次得到的张量拼接 → 最终输出

- 优点
  - 能同时捕捉语法中的前置/后置特征
  - 增强语义关联

- 代价
  - 参数量与计算复杂度 **≈ ×2**
  - 需结合语料规模与算力评估后决定是否使用



#### 4. 使用Pytorch构建LSTM模型

```python
import torch
import torch.nn as nn


def dm02_lstm_for_direction():
    """
    构建并运行一个 LSTM 示例。
    关键参数：
        input_size     : 每个时间步输入向量x的维度
        hidden_size    : 隐藏层的维度，隐藏层神经元个数
        num_layers     : LSTM 隐藏层堆叠层数
        batch_first    : 若 True，输入/输出张量形状为 (batch, seq, feature)
        bidirectional  : 若 True，则使用双向 LSTM
    """

    # 1. 定义网络
    lstm = nn.LSTM(
        input_size=5,      # 每个时间步的输入维度
        hidden_size=6,     # 隐藏层神经元个数
        num_layers=1,      # LSTM 层数
        batch_first=True,  # 输入/输出 shape 为 (batch, seq, feature)
    )

    # 2. 构造随机输入
    
    #    shape: (batch_size, sequence_length, input_size)
    '''
    input
    	第一个参数：batch_size(批次的样本数量)
    	第二个参数：sequence_length(输入序列的长度)
    	第三个参数：input_size(输入张量的维度)
    '''
    x = torch.randn(4, 10, 5)

    # 3. 初始化隐藏状态 h0 与细胞状态 c0
    #    shape: (num_layers * num_directions, batch_size, hidden_size)
    '''
    hn和cn
    	第一个参数：num_layer * num_directions(层数*网络方向)
    	第二个参数：batch_size(批次的样本数)
    	第三个参数：hidden_size(隐藏层的维度， 隐藏层神经元的个数)
    '''
    num_directions = 2 if lstm.bidirectional else 1
    h0 = torch.zeros(lstm.num_layers * num_directions, 4, 6)
    c0 = torch.zeros(lstm.num_layers * num_directions, 4, 6)

    # 4. 前向传播
    output, (hn, cn) = lstm(x, (h0, c0))

    # 5. 打印输出信息
    print(f"output shape : {output.shape}")  # (batch, seq, hidden_size * num_directions)
    print(f"hn     shape : {hn.shape}")      # (num_layers * num_directions, batch, hidden_size)
    print(f"cn     shape : {cn.shape}")      # 同上


if __name__ == "__main__":
    dm02_lstm_for_direction()
```



### 1.2 GRU模型

- 内部结构
  - 更新门
  - 重制门
- GRU模型：

![image-20240618174404615](assets/day04/06.png)

- GRU模型代码实现

  ```python
  # coding:utf-8
  import torch
  import torch.nn as nn
  
  # 模型参数发生变化对其他输入参数的影响
  def  dm01_gru_():
      '''
      第一个参数：input_size(输入张量x的维度)
      第二个参数：hidden_size(隐藏层的维度， 隐藏层的神经元个数)
      第三个参数：num_layer(隐藏层的数量)
      # batch_first = True，代表batch_size 放在第一位
      '''
      gru = nn.GRU(5, 6, 1, batch_first=True)
      print(gru.all_weights)
      print(gru.all_weights[0][0].shape)
      print(gru.all_weights[0][1].shape)
  
      '''
      第一个参数：batch_size(批次的样本数量)
      第二个参数：sequence_length(输入序列的长度)
      第三个参数：input_size(输入张量的维度)
      '''
      input = torch.randn(4, 3, 5)
  
      '''
      第一个参数：num_layer * num_directions(层数*网络方向)
      第二个参数：batch_size(批次的样本数)
      第三个参数：hidden_size(隐藏层的维度， 隐藏层神经元的个数)
      '''
  
      h0 = torch.randn(1, 4, 6)
  
      # 将数据送入模型得到结果
      output, hn = gru(input, h0)
      print(f'output--》{output}')
      print(f'hn--》{hn}')
  
  if __name__ == '__main__':
      dm01_gru_()
  ```

- BI-GRU

```properties
定义: 不改变原始的GRU模型内部结构，只是将文本从左到右计算一遍，再从右到左计算一遍，把最终的输出结果拼接得到模型的完整输出
```

- 优缺点
  - 优点：相比LSTM，结构较为简单，能够和lstm一样缓解梯度消失问题
  - 缺点：RNN系列模型不能实现并行运算，数据量大的话，效率比较低















