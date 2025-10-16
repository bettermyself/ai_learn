## 1 项目代码结构

```plaintext
04-bert/
├── data/
│   ├── bert_pretrain/        # 预训练模型
│   └── data1/								# 数据集
├── src/
│   ├── models/
│   │   └── bert.py           # 模型构建
│   ├── saved_dic/            # 模型权重
│   ├── saved_dic1/
│   ├── app.py                # 模型部署
│   ├── demo.py
│   ├── predict.py            # 模型预测
│   ├── run.py                # 模型训练的入口函数
│   ├── run1.py
│   ├── train_eval.py         # 模型训练与评估
│   └── utils.py              # 工具函数
```



## 2 数据处理

### 2.1 项目数据集

- **数据集路径**：`toutiao/data/data/`
- **包含内容**：
  - 训练集
  - 测试集
  - 验证集
  - 类别信息文件

> 与前文介绍一致，共包含 4 个文件。



### 2.2 预训练模型相关数据

- **文件夹路径**：`data/bert_pretrain/`
- **包含文件**（共 3 个）：

```
data/
└── bert_pretrain/
    ├── bert_config.json
    ├── pytorch_model.bin
    └── vocab.txt
```

#### 1. `bert_config.json` — BERT 模型超参数配置文件

| 参数                           | 说明                                                       |
| :----------------------------- | :--------------------------------------------------------- |
| `attention_probs_dropout_prob` | 注意力机制中的 dropout 概率，设为 0.1                      |
| `directionality`               | 模型方向性，设置为双向（`bidi`）                           |
| `hidden_act`                   | 隐藏层激活函数，使用 `GELU`                                |
| `hidden_dropout_prob`          | 隐藏层 dropout 概率，设为 0.1                              |
| `hidden_size`                  | 隐藏层维度，768（对应 H）                                  |
| `initializer_range`            | 权重初始化截断正态分布标准差，0.02                         |
| `intermediate_size`            | Encoder 中间层维度，3072（对应 4H）                        |
| `max_position_embeddings`      | 最大位置编码长度，512                                      |
| `num_attention_heads`          | 多头注意力头数，12（对应 A）                               |
| `num_hidden_layers`            | Encoder 层数，12（对应 L）                                 |
| `pooler_fc_size`               | 池化层全连接维度，768                                      |
| `pooler_num_attention_heads`   | 池化层注意力头数，12                                       |
| `pooler_num_fc_layers`         | 池化层全连接层数，3                                        |
| `pooler_size_per_head`         | 每个注意力头的维度，128                                    |
| `pooler_type`                  | 池化方式，使用第一个 token 变换（`first_token_transform`） |
| `type_vocab_size`              | 类型词汇表大小，2                                          |
| `vocab_size`                   | 词汇表大小，21128                                          |



#### 2. `pytorch_model.bin` — BERT 预训练模型权重文件



#### 3. `vocab.txt` — BERT 预训练模型词典文件

部分内容示例：

```
[PAD]
[unused1]
[unused2]
...
[unused99]
[UNK]
[CLS]
[SEP]
[MASK]
<S>
<T>
```



## 3 工具类函数（`utils.py`）

> 文件路径：`04-bert/src/utils.py`



✅ 导入依赖

```python
import torch
from tqdm import tqdm
import time
from datetime import timedelta
```



### 3.1 数据集构建函数：`build_dataset`

```python
def build_dataset(config):
    """
    根据配置信息构建训练/验证/测试数据集。

    参数
    ----
    config : object
        配置对象，需包含以下属性：
        - tokenizer      : transformers.PreTrainedTokenizer
        - train_path     : str  训练集路径
        - dev_path       : str  验证集路径
        - test_path      : str  测试集路径
        - pad_size       : int  统一序列长度（不足补 0，多余截断）

    返回
    ----
    tuple(list, list, list)
        (train, dev, test) 三个列表，每个元素为
        (token_ids, label, seq_len, mask)
    """
    def load_dataset(path, pad_size=32):
        """
        加载单个数据集文件并进行预处理。

        步骤
        ----
        1. 按行读取文本，跳过空行；
        2. 用 \\t 分割文本与标签；
        3. 分词、加 [CLS]、转 ID；
        4. 填充或截断到 pad_size；
        5. 生成填充掩码 mask（1 表示有效 token，0 表示填充）。

        参数
        ----
        path : str
            数据文件路径。
        pad_size : int, optional
            统一序列长度，默认 32。

        返回
        ----
        list[tuple]
            [(token_ids, label, seq_len, mask), ...]
        """
        contents = []

        with open(path, "r", encoding="utf-8") as f:
            for line in tqdm(f, desc=f"Loading {path}"):
                line = line.strip()
                if not line:
                    continue

                # 分离文本与标签
                content, label = line.split("\t")

                # 分词并添加特殊标记 [CLS]
                tokens = config.tokenizer.tokenize(content)
                tokens = ["[CLS]"] + tokens
                seq_len = len(tokens)

                # token → id
                token_ids = config.tokenizer.convert_tokens_to_ids(tokens)

                # 填充或截断
                if pad_size:
                    if len(token_ids) < pad_size:
                        # 需要填充
                        mask = [1] * seq_len + [0] * (pad_size - seq_len)
                        token_ids = token_ids + [0] * (pad_size - seq_len)
                    else:
                        # 需要截断
                        mask = [1] * pad_size
                        token_ids = token_ids[:pad_size]
                        seq_len = pad_size

                contents.append((token_ids, int(label), seq_len, mask))

        return contents

    # 加载三个数据集
    train = load_dataset(config.train_path, config.pad_size)
    dev   = load_dataset(config.dev_path,   config.pad_size)
    test  = load_dataset(config.test_path,  config.pad_size)

    return train, dev, test
```



### 3.2 工具函数 `build_iterator`

该模块包含一个数据迭代器类 `DatasetIterater` 和一个工厂函数 `build_iterator`，均位于 `utils.py` 中。

**类：`DatasetIterater`**

| 方法名       | 功能描述                                                     |
| :----------- | :----------------------------------------------------------- |
| `__init__`   | 初始化迭代器，接收批次数据、批次大小、设备类型和模型名称，设置相关属性。 |
| `_to_tensor` | 将批次数据转换为 PyTorch 的 Tensor 格式。                    |
| `__next__`   | 获取下一个批次的样本，处理不规则批次和索引溢出。             |
| `__iter__`   | 返回迭代器对象本身。                                         |
| `__len__`    | 获取迭代器的总批次长度。                                     |

**函数：`build_iterator`**

- **功能**：根据配置信息和给定的数据集构建数据集迭代器对象。
- **返回值**：返回一个 `DatasetIterater` 迭代器实例，可用于训练或验证过程中的数据遍历。

```python
# utils.py
import torch
from torch import LongTensor


class DatasetIterater(object):
    """
    自定义数据集迭代器，支持：
    1. 按 batch_size 将样本列表切分成若干批次；
    2. 自动将 numpy/list 数据转换成 PyTorch 张量；
    3. 根据模型名称返回不同格式的张量组（BERT 需要 mask，TextCNN 不需要）；
    4. 支持 CPU / GPU 设备切换；
    5. 尾部不足 batch_size 的剩余样本可一次返回（residue 机制）。
    """

    def __init__(self, batches, batch_size, device, model_name):
        """
        参数
        ----
        batches : list[tuple]
            由 build_dataset 生成的列表，每个元素为
            (token_ids, label, seq_len, mask) 
        batch_size : int
            每批次的样本量。
        device : str
            数据最终放置的设备，如 'cpu' 或 'cuda'。
        model_name : str
            模型名称，决定返回张量格式。
            - 'bert'     -> (x, seq_len, mask), y
            - 'textCNN'  -> (x, seq_len), y
        """
        self.batches = batches
        self.batch_size = batch_size
        self.model_name = model_name
        self.device = device

        # 计算完整 batch 数
        self.n_batches = len(batches) // batch_size
        # 标记是否存在剩余样本
        self.residue = (len(batches) % batch_size != 0)

        self.index = 0          # 当前 batch 索引

    # ------------------------------------------------
    # 内部工具：把 Python List 转成 PyTorch 张量
    # ------------------------------------------------
    def _to_tensor(self, datas):
        """
        将一批原始数据转换为模型所需的张量格式。

        参数
        ----
        datas : list[tuple]
            当前 batch 的原始数据列表。

        返回
        ----
        tuple
            根据 model_name 返回不同格式：
            BERT:    ((x, seq_len, mask), y)
            TextCNN: ((x, seq_len), y)
        """
        # 逐列拆解
        x       = LongTensor([_[0] for _ in datas]).to(self.device)  # token_ids
        y       = LongTensor([_[1] for _ in datas]).to(self.device)  # label
        seq_len = LongTensor([_[2] for _ in datas]).to(self.device)  # 实际长度

        if self.model_name == 'bert':
            mask = LongTensor([_[3] for _ in datas]).to(self.device)  # padding mask
            return (x, seq_len, mask), y
        if self.model_name == 'textcnn':
            return (x, seq_len), y

    # ------------------------------------------------
    # Python 迭代器协议
    # ------------------------------------------------
    def __next__(self):
        """
        返回下一个 batch 的张量数据。
        当遍历完所有 batch 后抛出 StopIteration。
        """
        # 情况 1：还有剩余样本，且当前正好指向最后一个完整 batch 之后
        if self.residue and self.index == self.n_batches:
            subs = self.batches[self.index * self.batch_size:]
            self.index += 1
            return self._to_tensor(subs)

        # 情况 2：已经遍历完所有 batch（含剩余）
        if self.index >= self.n_batches:
            self.index = 0          # 重置，方便下次再 iter
            raise StopIteration     # raise StopIteration 会终止 __next__ 函数的执行，并向调用者（通常是迭代器协议的使用者，如 for 循环）发出信号：迭代已经结束。

        # 情况 3：普通完整 batch
        start = self.index * self.batch_size
        end   = (self.index + 1) * self.batch_size
        subs  = self.batches[start:end]
        self.index += 1
        return self._to_tensor(subs)

    def __iter__(self):
        """迭代器协议：返回自身即可。"""
        return self

    def __len__(self):
        """
        返回总 batch 数（含剩余样本的一 batch）。
        方便 tqdm 等工具显示进度条。
        """
        return self.n_batches + (1 if self.residue else 0)


# ------------------------------------------------
# 工厂函数：根据配置一键生成迭代器
# ------------------------------------------------
def build_iterator(dataset, config):
    """
    根据配置信息构建数据集迭代器。

    参数
    ----
    dataset : list[tuple]
        由 build_dataset 返回的训练/验证/测试集列表。
    config : object
        配置对象，需包含：
        - batch_size : int
        - device     : str
        - model_name : str

    返回
    ----
    DatasetIterater
        可直接用于 for 循环或 DataLoader 包装。
    """
    iter = DatasetIterater(
        batches=dataset,
        batch_size=config.batch_size,
        device=config.device,
        model_name=config.model_name
    )
    
    return iter
```

> 拓展，变量的生存周期
>
> 在Python中，变量的生存周期（lifetime）指的是变量从创建到销毁的整个过程。生存周期主要取决于变量的作用域和引用计数。以下是详细说明：
>
> ------
>
> 1. **局部变量（Local Variables）**
>
> - **创建**：在函数内部定义时创建。
>
> - **销毁**：函数执行结束后自动销毁。
>
> - **示例**：
>
>   ```
>   def my_function():
>       x = 10  # 局部变量 x 被创建
>       print(x)
>         
>   my_function()
>   # print(x)  # 这里会报错，因为 x 已被销毁
>   ```
>
> ------
>
> 2. **全局变量（Global Variables）**
>
> - **创建**：在模块级别（函数外部）定义时创建。
>
> - **销毁**：程序运行结束或模块被卸载时销毁。
>
> - **示例**：
>
>   ```
>   global_var = 20  # 全局变量，生存周期直到程序结束
>         
>   def func():
>       print(global_var)  # 可访问全局变量
>         
>   func()
>   print(global_var)  # 仍然可访问
>   ```
>
> ------
>
> 3. **类变量（Class Variables）**
>
> - **创建**：在类中定义时创建。
>
> - **销毁**：程序运行结束或类被垃圾回收时销毁。
>
> - **示例**：
>
>   ```
>   class MyClass:
>       class_var = 30  # 类变量，所有实例共享
>         
>   obj = MyClass()
>   print(obj.class_var)  # 通过实例访问
>   print(MyClass.class_var)  # 通过类访问
>   ```
>
> ------
>
> 4. **实例变量（Instance Variables）**
>
> - **创建**：在 `__init__` 方法或实例方法中通过 `self.` 定义。
>
> - **销毁**：实例被垃圾回收时销毁。
>
> - **示例**：
>
>   ```
>   class MyClass:
>       def __init__(self):
>           self.instance_var = 40  # 实例变量
>         
>   obj = MyClass()
>   print(obj.instance_var)
>   del obj  # 实例被销毁，instance_var 也随之销毁
>   ```
>
> ------
>
> 5. **闭包中的变量**
>
> - **创建**：在外部函数中定义，被内部函数引用。
>
> - **销毁**：当内部函数不再被引用时，闭包变量销毁。
>
> - **示例**：
>
>   ```
>   def outer():
>       closure_var = 50
>       def inner():
>           print(closure_var)  # 引用外部函数的变量
>       return inner
>         
>   closure_func = outer()
>   closure_func()  # 输出 50
>   # closure_var 会持续存在，直到 closure_func 被销毁
>   ```
>
> ------
>
> 6. **动态生成的变量**
>
> - 使用 `globals()`、`locals()` 或 `exec()` 动态创建的变量遵循相同的作用域规则。
>
> - **示例**：
>
>   python
>
>   ```
>   def dynamic_var():
>       exec('x = 100')  # 在局部作用域创建 x
>       print(locals()['x'])
>         
>   dynamic_var()
>   # x 在函数结束后销毁
>   ```
>
> ------
>
> 关键机制：引用计数与垃圾回收
>
> - **引用计数**：Python通过引用计数管理内存。当变量的引用计数降为0时，内存被释放。
> - **垃圾回收**：循环引用等场景下，垃圾回收器（GC）会介入销毁对象。
>
> ------
>
> 总结
>
> | 变量类型 | 创建时机       | 销毁时机           |
> | :------- | :------------- | :----------------- |
> | 局部变量 | 函数执行时     | 函数执行结束       |
> | 全局变量 | 模块加载时     | 程序结束或模块卸载 |
> | 类变量   | 类定义时       | 程序结束或类被回收 |
> | 实例变量 | 实例化对象时   | 实例被垃圾回收时   |
> | 闭包变量 | 外部函数执行时 | 内部函数被销毁时   |



### 3.3 工具类函数 `get_time_dif`

该函数接收一个“开始时间戳”作为参数，计算当前时间与开始时间的差值，并将差值转换为 `timedelta` 对象，表示已使用的时间。这种计算时间差的方式常用于测量程序运行耗时。

```python
import time
from datetime import timedelta


def get_time_dif(start_time):
    """
    计算已使用的时间差。

    参数:
        start_time (float): 起始时间戳（通常由 time.time() 获得）。

    返回:
        timedelta: 两个时间点之间的时间差，精确到秒。
    """
    # 获取当前时间
    end_time = time.time()

    # 计算时间差（单位：秒）
    time_dif = end_time - start_time

    # 将时间差四舍五入为整数秒，并封装为 timedelta 对象返回
    return timedelta(seconds=int(round(time_dif)))
```



## 4 BERT分类模型搭建

本部分实现一个基于 **BERT** 的文本分类模型，包含配置类 `Config` 和模型类 `Model`。
代码路径：`04-bert/src/models/bert.py`



### 4.1 工具包导入

```python
import torch
import torch.nn as nn
import os
from transformers import BertModel, BertTokenizer, BertConfig
```



### 4.2 配置类 `Config`

该类封装了模型训练、数据处理所需的全部参数。

```python
class Config(object):
    def __init__(self):
        # 模型名称
        self.model_name = "bert"

        # 数据集路径
        self.data_path = "/Users/mac/Desktop/投满分项目/03-code/04-bert/data/data1/"

        # 训练/验证/测试集路径
        self.train_path = self.data_path + "train.txt"
        self.dev_path   = self.data_path + "dev.txt"
        self.test_path  = self.data_path + "test.txt"

        # 类别名单
        self.class_list = [x.strip() for x in open(self.data_path + "class.txt").readlines()]

        # 模型保存路径（训练结果）
        self.save_path = "/Users/mac/Desktop/投满分项目/03-code/04-bert/src/saved_dict/"
        if not os.path.exists(self.save_path):
            os.mkdir(self.save_path)
        self.save_path += self.model_name + ".pt"

        # 量化模型保存路径
        self.save_path2 = "/Users/mac/Desktop/投满分项目/03-code/04-bert/src/saved_dict1/"
        if not os.path.exists(self.save_path2):
            os.mkdir(self.save_path2)
        self.save_path2 += self.model_name + "_quantized.pt"

        # 训练设备：优先使用 GPU，否则使用 CPU
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # 模型量化时强制使用 CPU（如需启用，注释掉上一行，取消下一行注释）
        # self.device = 'cpu'

        # 模型参数
        self.num_classes  = len(self.class_list)  # 类别数
        self.num_epochs   = 2                     # 训练轮数
        self.batch_size   = 128                   # mini-batch 大小
        self.pad_size     = 32                    # 每句话处理成的长度（短填长切）
        self.learning_rate = 5e-5                 # 学习率

        # BERT 预训练模型路径
        self.bert_path = "/Users/mac/Desktop/投满分项目/03-code/04-bert/data/bert_pretrain/"

        # BERT 分词器与配置
        self.tokenizer = BertTokenizer.from_pretrained(self.bert_path)
        self.bert_config = BertConfig.from_pretrained(self.bert_path + '/bert_config.json')

        # BERT 隐藏层维度
        self.hidden_size = 768
```



### 4.3 实现 Model 类代码

模型类 `Model` 继承自 `torch.nn.Module`，实现了一个基于 **BERT** 的文本分类网络。
主要功能如下：

- 在 `__init__` 中加载预训练 **BERT** 模型，并额外定义一个全连接层用于分类。
- 在 `forward` 中，将输入送入 **BERT** 得到句向量，再经全连接层输出分类 logits。

```python
import torch.nn as nn
from transformers import BertModel


class Model(nn.Module):
    """
    基于 BERT 的文本分类模型。
    """

    def __init__(self, config):
        """
        初始化模型。

        参数:
            config: 配置对象，必须包含以下属性：
                - bert_path (str): 预训练 BERT 模型路径或名称。
                - hidden_size (int): BERT 隐层维度。
                - num_classes (int): 分类类别数。
        """
        super(Model, self).__init__()

        # 加载预训练 BERT 模型
        self.bert = BertModel.from_pretrained(config.bert_path, config=config.bert_config)

        # 全连接层：将 BERT 输出的句向量映射到类别空间
        self.fc = nn.Linear(config.hidden_size, config.num_classes)

    def forward(self, x):
        """
        前向传播。

        参数:
            x (list/tuple): 长度为 3 的列表或元组，依次包含：
                x[0] —— input_ids:  句子 token id 序列，shape: (batch_size, seq_len)
                     —— token_type_ids: 句子类型 id（可选，此处未使用，因为这是单句子任务，系统会会自动创建全0的tensor）
                x[2] —— attention_mask: 填充掩码，1 表示有效 token，0 表示 padding

        返回:
            logits: 分类 logits，shape: (batch_size, num_classes)
        """
        input_ids = x[0]          # 输入句子
        attention_mask = x[2]     # 填充掩码

        # 通过 BERT 获取句向量（pooled_output 对应 [CLS] 经线性层+Tanh 后的表示）
        _, pooled = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask,
            return_dict=False
        )

        # 全连接层输出分类 logits
        logits = self.fc(pooled)

        return logits
```



## 5 编写训练函数,测试函数,评估函数

### 5.1 编写训练函数

训练函数实现了模型的训练过程，使用了 **交叉熵损失函数** 和 **AdamW 优化器**。具体包括以下内容：

| 模块     | 关键内容             | 说明                                             |
| -------- | -------------------- | ------------------------------------------------ |
| 优化器   | AdamW + weight decay | 设置带权重衰减的 AdamW 优化器                    |
| 训练循环 | epoch → batch        | 前向传播 → 计算损失 → 反向传播 → 参数更新        |
| 评估     | 每 100 个 batch      | 输出：训练损失、训练准确率、验证损失、验证准确率 |
| 模型保存 | 验证损失 ↓           | 若当前验证损失更低，则保存模型参数               |
| 时间计算 | 总耗时               | 记录并输出本次训练总时间                         |



✅具体实现如下：

```python
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F
from sklearn import metrics
import time
from utils import get_time_dif
from transformers.optimization import AdamW
from tqdm import tqdm
import math
import logging

# 定义损失函数：使用交叉熵损失
def loss_fn(outputs, labels):
    """
    计算交叉熵损失
    :param outputs: 模型输出，形状为 [batch_size, num_classes]
    :param labels: 真实标签，形状为 [batch_size]
    :return: 损失值
    """
    return nn.CrossEntropyLoss()(outputs, labels)


def train(config, model, train_iter, dev_iter):
    """
    模型训练函数
    :param config: 配置对象，包含超参数、路径等
    :param model: 待训练的BERT模型
    :param train_iter: 训练集 DataLoader
    :param dev_iter: 验证集 DataLoader
    """
    start_time = time.time()  # 记录训练开始时间

    # 设置优化器参数分组：部分参数不加权重衰减
    param_optimizer = list(model.named_parameters())
    no_decay = ["bias", "LayerNorm.bias", "LayerNorm.weight"]

    optimizer_grouped_parameters = [
        {
            "params": [p for n, p in param_optimizer if not any(nd in n for nd in no_decay)],
            "weight_decay": 0.01,  # 权重衰减
        },
        {
            "params": [p for n, p in param_optimizer if any(nd in n for nd in no_decay)],
            "weight_decay": 0.0,  # 不 decay
        },
    ]

    # 使用 AdamW 优化器
    optimizer = AdamW(optimizer_grouped_parameters, lr=config.learning_rate)

    # 初始化最佳验证损失
    dev_best_loss = float("inf")

    # 设置模型为训练模式
    model.train()

    total_batch = 0  # 记录当前是第几个 batch

    # 遍历每个 epoch
    for epoch in range(config.num_epochs):
        print(f"Epoch [{epoch + 1}/{config.num_epochs}]")

        # 遍历每个 batch
        for i, (trains, labels) in enumerate(tqdm(train_iter)):
            # 前向传播
            outputs = model(trains)

            # 梯度清零
            model.zero_grad()

            # 计算损失
            loss = loss_fn(outputs, labels)

            # 反向传播
            loss.backward()

            # 更新参数
            optimizer.step()

            # 每 100 个 batch 打印一次训练与验证结果
            if total_batch % 100 == 0 and total_batch != 0:
                # 计算训练集准确率
                true = labels.data.cpu()  # .data 获取无梯度的数据（旧方式，不推荐，推荐用.detach()）; .cpu()将张量移到 CPU
                predic = torch.max(outputs.data, 1)[1].cpu()
                train_acc = metrics.accuracy_score(true, predic)

                # 验证集评估
                dev_acc, dev_loss = evaluate(config, model, dev_iter)

                # 若验证集损失更低，保存模型
                if dev_loss < dev_best_loss:
                    dev_best_loss = dev_loss
                    torch.save(model.state_dict(), config.save_path)
                    improve = "*"  # 标记为提升
                else:
                    improve = ""

                # 计算已用时间
                time_dif = get_time_dif(start_time)

                # 打印训练与验证结果
                msg = (
                    "Iter: {0:>6},  Train Loss: {1:>5.2},  Train Acc: {2:>6.2%},  "
                    "Val Loss: {3:>5.2},  Val Acc: {4:>6.2%},  Time: {5} {6}"
                )
                print(msg.format(total_batch, loss.item(), train_acc, dev_loss, dev_acc, time_dif, improve))

                # 恢复训练模式
                model.train()

            # 更新 batch 计数
            total_batch += 1
```



### 5.2 编写验证函数

模型验证函数 `evaluate` 用于在验证集或测试集上评估模型的性能。其主要功能包括：

| 功能模块       | 描述                                                         |
| -------------- | ------------------------------------------------------------ |
| **损失计算**   | 通过循环遍历数据集，计算模型在每个样本上的损失，并累加得到总损失。 |
| **预测记录**   | 记录模型对每个样本的预测结果及其对应的真实标签。             |
| **准确率计算** | 根据记录的预测结果与真实标签，计算模型的整体准确率。         |
| **测试集评估** | 若为测试集评估，额外生成分类报告（classification report）与混淆矩阵（confusion matrix）。 |

> 函数目的： 提供一种简便的方式，在训练过程中监控模型性能，并在必要时保存表现较优的模型参数。



✅具体实现如下：

```PY
import numpy as np
import torch
import torch.nn.functional as F
from sklearn import metrics


def evaluate(config, model, data_iter, test=False):
    """
    模型评估函数

    参数：
        config：配置信息对象
        model：待评估的模型
        data_iter：数据迭代器
        test：是否为测试集评估（默认False）

    返回：
        验证集：acc, avg_loss
        测试集：acc, avg_loss, classification_report, confusion_matrix
    """

    # 采用量化模型进行推理时需要关闭
    model.eval()

    loss_total = 0  # 累计损失
    predict_all = np.array([], dtype=int)  # 预测结果
    labels_all = np.array([], dtype=int)  # 真实标签

    # 不计算梯度，加速推理
    with torch.no_grad():
        for texts, labels in data_iter:
            outputs = model(texts)  # 前向传播
            loss = nn.CrossEntropyLoss()(outputs, labels)  # 计算交叉熵损失
            loss_total += loss.item()  # 累计损失

            labels = labels.data.cpu().numpy()  # 真实标签转numpy
            predic = torch.max(outputs.data, 1)[1].cpu().numpy()  # 预测类别

            labels_all = np.append(labels_all, labels)
            predict_all = np.append(predict_all, predic)

    # 计算准确率
    acc = metrics.accuracy_score(labels_all, predict_all)

    avg_loss = loss_total / len(data_iter)

    if test:
        # 测试集：额外输出分类报告和混淆矩阵
        report = metrics.classification_report(
            labels_all, predict_all, target_names=config.class_list, digits=4
        )
        confusion = metrics.confusion_matrix(labels_all, predict_all)
        return acc, avg_loss, report, confusion
    else:
        # 验证集：仅返回准确率和平均损失
        return acc, avg_loss
```



### 5.3 编写测试函数

测试`test` 函数用于在测试集上进行最终的模型测试。它调用了之前定义的 `evaluate` 函数，然后输出测试集上的损失、准确率、分类报告和混淆矩阵等信息。

```python
import time
from utils import get_time_dif   # 假设工具函数在该模块中


def test(config, model, test_iter):
    """
    在测试集上执行最终评估，打印测试损失、准确率、分类报告及混淆矩阵。

    参数
    ----
    config : Config
        全局配置对象，包含 device、eval_batch_size 等超参。
    model : torch.nn.Module
        训练完毕的模型，已在主函数中加载好最优权重。
    test_iter : DataLoader
        仅用于测试的数据迭代器，shuffle=False，drop_last=False。
    """
    # ----------------  推理前准备  ----------------
    model.eval()                         # 关闭 Dropout/BN 更新，必须！
    start_time = time.time()             # 记录起始时间，便于统计耗时

    # ----------------  核心评估逻辑  ----------------
    # 复用 evaluate() 计算各项指标
    test_acc, test_loss, test_report, test_confusion = evaluate(
        config, model, test_iter, test=True
    )

    # ----------------  结果打印  ----------------
    # 1. 损失与准确率
    msg = "Test Loss: {:>5.2f},  Test Acc: {:>6.2%}"
    print(msg.format(test_loss, test_acc))

    # 2. 精确率、召回率、F1 分数
    print("Precision, Recall and F1-Score...")
    print(test_report)

    # 3. 混淆矩阵
    print("Confusion Matrix...")
    print(test_confusion)

    # 4. 耗时统计
    time_dif = get_time_dif(start_time)
    print("Time usage:", time_dif)
```



## 6 编写训练评估主函数

我们实现一个简单的入口脚本，用于指定模型类型，然后加载对应模型的配置和模型定义，构建数据集和数据迭代器，最后进行模型的训练和测试。

代码位置：

```
04-bert/src/run.py
```



✅具体实现如下：

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Chinese Text Classification —— 主入口脚本
支持通过命令行 --model 指定不同模型（如 bert、roberta、ernie 等），
自动完成数据构建、迭代器生成、模型训练与测试。
"""

import argparse
import time
import numpy as np
import torch

# 动态导入模型定义与配置
from importlib import import_module

# 工具函数
from utils import build_dataset, build_iterator, get_time_dif

# 训练 / 评估函数
from train_eval import train, test


def parse_args():
    """解析命令行参数"""
    parser = argparse.ArgumentParser(description="Chinese Text Classification")
    parser.add_argument(
        "--model",
        type=str,
        default="bert",
        help="选择模型: bert、roberta、ernie 等（对应 models/ 下的文件名）"
    )
    return parser.parse_args()


def set_seed(seed=1):
    """
    固定随机种子，保证实验可重复性
    针对 CPU、GPU、CUDA 卷积加速库均做设置
    """
    np.random.seed(seed)
    torch.manual_seed(seed)                      # CPU
    torch.cuda.manual_seed(seed)                 # 当前 GPU
    torch.cuda.manual_seed_all(seed)             # 所有 GPU
    # 强制卷积使用确定性算法，牺牲速度换可重复性
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


if __name__ == "__main__":
    args = parse_args()          # 1. 解析参数
    model_name = args.model      # 2. 获取模型名

    # 3. 动态导入对应模型的「配置类」与「模型类」
    #    约定：models/ 目录下需存在 <model_name>.py，且内含 Config、Model 两个类
    model_module = import_module(f"models.{model_name}")
    config = model_module.Config()

    # 4. 设置随机种子
    set_seed(seed=1)

    # 5. 构建训练 / 验证 / 测试数据集与迭代器
    start_time = time.time()
    train_data, dev_data, test_data = build_dataset(config)
    train_iter = build_iterator(train_data, config)
    dev_iter   = build_iterator(dev_data,   config)
    test_iter  = build_iterator(test_data,  config)
    print(f"数据加载完成，耗时：{get_time_dif(start_time)}")

    # 6. 实例化模型并移至指定设备（CPU / GPU）
    model = model_module.Model(config).to(config.device)

    # 7. 训练
    train(config, model, train_iter, dev_iter)

    # 8. 测试
    test(config, model, test_iter)
```

> **总体指标：**
>
> - **Test Accuracy:** 93.64%
> - **Test Loss:** 0.2
>
> **Precision, Recall, F1-Score 按类别：**
>
> | 类别             | Precision | Recall | F1-Score | Support |
> | :--------------- | :-------- | :----- | :------- | :------ |
> | finance          | 0.9246    | 0.9320 | 0.9283   | 1000    |
> | realty           | 0.9484    | 0.9370 | 0.9427   | 1000    |
> | stocks           | 0.8787    | 0.8980 | 0.8882   | 1000    |
> | education        | 0.9511    | 0.9730 | 0.9619   | 1000    |
> | science          | 0.9236    | 0.8950 | 0.9091   | 1000    |
> | society          | 0.9430    | 0.9270 | 0.9349   | 1000    |
> | politics         | 0.9267    | 0.9100 | 0.9183   | 1000    |
> | sports           | 0.9780    | 0.9780 | 0.9780   | 1000    |
> | game             | 0.9514    | 0.9600 | 0.9557   | 1000    |
> | entertainment    | 0.9390    | 0.9540 | 0.9464   | 1000    |
> | **Macro Avg**    | 0.9365    | 0.9364 | 0.9364   | 10000   |
> | **Weighted Avg** | 0.9365    | 0.9364 | 0.9364   | 10000   |
>
> 
>
> 🔍 混淆矩阵（Confusion Matrix）
>
> | 实际\预测 | finance | realty | stocks | education | science | society | politics | sports | game | entertainment |
> | :-------- | :------ | :----- | :----- | :-------- | :------ | :------ | :------- | :----- | :--- | :------------ |
> | finance   | 932     | 10     | 37     | 2         | 5       | 5       | 7        | 1      | 1    | 0             |
> | realty    | 13      | 937    | 11     | 2         | 4       | 10      | 5        | 5      | 5    | 8             |
> | stocks    | 49      | 12     | 898    | 1         | 19      | 1       | 15       | 0      | 2    | 3             |
> | education | 1       | 1      | 0      | 973       | 0       | 8       | 7        | 0      | 1    | 9             |
> | science   | 4       | 4      | 28     | 7         | 895     | 10      | 12       | 2      | 27   | 11            |
> | society   | 2       | 8      | 4      | 16        | 9       | 927     | 18       | 1      | 5    | 14            |
> | politics  | 3       | 8      | 34     | 12        | 9       | 19      | 910      | 0      | 0    | 5             |
> | sports    | 2       | 3      | 2      | 1         | 1       | 1       | 4        | 978    | 1    | 7             |
> | game      | 0       | 2      | 4      | 0         | 24      | 1       | 3        | 1      | 960  | 5             |
> | entertain | 2       | 3      | 4      | 9         | 7       | 1       | 12       | 7      | 954  | 1             |
>
> 
>
> ✅ 结论
>
> - **BERT 模型在测试集上的准确率为 93.64%**，相较于第一章中 FastText 模型的最佳表现（91.93%），**提升了 1.71 个百分点**，属于**显著性提升**。
> - 各类别 F1 分数均衡，模型整体表现稳定，尤其在 **sports** 和 **education** 类别上表现优异。



## 7 模型预测

接下来使用上一部分训练好的模型权重进行预测，实现了一个推理过程，该部分代码在：

```
04-bert/src/predict.py
```

首先导入工具包：

```python
import torch
from importlib import import_module
import numpy as np
```



### 7.1 推理函数定义

推理函数用于对新样本进行预测，具体包括以下内容：

**1. 定义特殊符号与类别映射**

- 特殊符号定义：
  - `[UNK]`：未知词
  - `[PAD]`：填充符
  - `[CLS]`：分类起始符
- 类别映射：定义类别 ID 到类别名称的映射关系，便于后续结果解释。

**2. 编写推理函数 `inference`**

函数功能：接收模型、模型配置和待分析文本，返回模型对该文本的预测结果。



```python
# ==========================================
#  predict.py  |  BERT 文本分类推理脚本
# ==========================================
import torch
import numpy as np
from importlib import import_module

# -------------------------------------------------
# 1. 全局常量：特殊符号 & 类别 ID → 中文名称映射
# -------------------------------------------------
PAD, CLS = "[PAD]", "[CLS]"

id_to_name = {
    0: "finance",
    1: "realty",
    2: "stocks",
    3: "education",
    4: "science",
    5: "society",
    6: "politics",
    7: "sports",
    8: "game",
    9: "entertainment"
}


# -------------------------------------------------
# 2. 推理函数：对单条文本进行前向预测
# -------------------------------------------------
def inference(model, config, input_text, pad_size=32):
    """
    单条文本分类推理

    参数
    ----
    model : nn.Module
        已加载权重的 BERT 模型
    config : Config
        模型配置对象，需包含 tokenizer 与 device
    input_text : str
        待预测文本
    pad_size : int
        固定序列长度（不足补 PAD，超长截断）

    返回
    ----
    int
        预测得到的类别 ID
    """

    # 1) 分词并添加 [CLS] 标志
    content = config.tokenizer.tokenize(input_text)
    content = [CLS] + content
    seq_len = len(content)

    # 2) token → id
    token_ids = config.tokenizer.convert_tokens_to_ids(content)

    # 3) 填充或截断
    if seq_len < pad_size:
        mask = [1] * len(token_ids) + [0] * (pad_size - seq_len)
        token_ids += [config.tokenizer.vocab[PAD]] * (pad_size - seq_len)
    else:
        mask = [1] * pad_size
        token_ids = token_ids[:pad_size]
        seq_len = pad_size

    # 4) 转换为张量并移至 GPU/CPU
    x = torch.LongTensor(token_ids).unsqueeze(0).to(config.device)          # shape: (1, pad_size)
    mask = torch.LongTensor(mask).unsqueeze(0).to(config.device)            # shape: (1, pad_size)
    seq_len_tensor = torch.LongTensor([seq_len]).to(config.device)          # shape: (1,)
	data = (x, seq_len, mask)
    # 5) 前向计算
    with torch.no_grad():
        logits = model(data)   # 模型输出 shape: (1, num_classes)

    # 6) 取最大概率对应的类别 ID
    pred_id = torch.argmax(logits, dim=1).item()
    return pred_id


# -------------------------------------------------
# 3. 主函数：加载模型 → 推理 → 打印结果
# -------------------------------------------------
if __name__ == "__main__":
    # 1) 动态导入模型定义
    model_name = "bert"
    module = import_module(f"models.{model_name}")
    config = module.Config()

    # 2) 固定随机种子，保证可复现
    np.random.seed(1)
    torch.manual_seed(1)
    torch.cuda.manual_seed_all(1)
    torch.backends.cudnn.deterministic = True

    # 3) 实例化模型并加载最优权重
    model = module.Model(config).to(config.device)
    model.load_state_dict(torch.load(config.save_path, map_location=config.device))
    model.eval()  # 切换到评估模式

    # 4) 待预测文本
    input_text = "日本地震：金吉列关注在日学子系列报道"

    # 5) 执行推理
    pred_id = inference(model, config, input_text)
    print("预测类别：", id_to_name[pred_id])
```

执行上述代码输出的结果为：

```
education
```



## 8 模型部署

将训练好的机器学习模型应用到实际生产环境，以 **Web 服务** 的形式暴露接口，供其它系统通过 HTTP API 调用，实现模型的可复用性与高可用。

## 8.1 服务端代码（Flask）

源码路径：

````
04-bert/src/app.py
````

### 1. 依赖导入

```python
import torch
import numpy as np
from flask import Flask, request
from importlib import import_module
```

### 2. 全局配置 & 模型加载

```python
# BERT 特殊符号与类别映射
CLS = '[CLS]'
id_to_name = {
    0: 'finance',
    1: 'realty',
    2: 'stocks',
    3: 'education',
    4: 'science',
    5: 'society',
    6: 'politics',
    7: 'sports',
    8: 'game',
    9: 'entertainment'
}

# 加载预训练模型
model_name = 'bert'
x = import_module('models.' + model_name)
config = x.Config()

# 固定随机种子，保证可复现
np.random.seed(1)
torch.manual_seed(1)
torch.cuda.manual_seed_all(1)
torch.backends.cudnn.deterministic = True

# 实例化模型并加载权重
model = x.Model(config).to(config.device)
model.load_state_dict(
    torch.load(config.save_path, map_location='cpu')
)
model.eval()          # 推理模式
```

### 3. 推理函数

```python
def inference(model, config, input_text, pad_size=32):
    # 1) 分词
    content = config.tokenizer.tokenize(input_text)
    content = [CLS] + content
    seq_len = len(content)

    # 2) token → id
    token_ids = config.tokenizer.convert_tokens_to_ids(content)

    # 3) 填充 / 截断
    if seq_len <= pad_size:
        mask = [1] * seq_len + [0] * (pad_size - seq_len)
        token_ids += [0] * (pad_size - seq_len)
    else:
        mask = [1] * pad_size
        token_ids = token_ids[:pad_size]
        seq_len = pad_size

    # 4) 转 Tensor 并增加 batch 维度
    x = torch.LongTensor(token_ids).unsqueeze(0).to(config.device)
    seq_len = torch.LongTensor([seq_len]).to(config.device)
    mask = torch.LongTensor(mask).unsqueeze(0).to(config.device)

    # 5) 模型前向
    with torch.no_grad():
        output = model((x, seq_len, mask))

    # 6) 解析结果
    pred = torch.max(output.data, 1)[1].item()
    return id_to_name[pred]
```

### 4. Flask 路由

```python
app = Flask(__name__)

@app.route('/v1/main_server/', methods=["POST"])
def main_server():
    uid  = request.form['uid']
    text = request.form['text']
    res  = inference(model, config, text)
    return res

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
```

启动日志示例：

```
* Serving Flask app 'app'
* Debug mode: off
WARNING: This is a development server. Do not use it in a production deployment.
* Running on http://127.0.0.1:5000
Press CTRL+C to quit
```



## 8.2 客户端代码（Demo）

源码路径：

````
04-bert/src/demo.py
````

```python
import requests
import time

url  = 'http://127.0.0.1:5000/v1/main_server/'
data = {
    'uid':  'AI-12-001',
    'text': '日本地震：金吉列关注在日学子系列报道'
}

start = time.time()
rsp = requests.post(url, data=data)
cost = (time.time() - start) * 1000

print('文本类别：', rsp.text)
print('单条样本耗时：%.2f ms' % cost)
```

运行结果：

```
文本类别：education
单条样本耗时：181.69 ms
```

















