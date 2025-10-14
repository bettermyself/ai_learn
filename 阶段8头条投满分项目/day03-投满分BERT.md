## 1 代码结构

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

> 文件路径：`04-bert/data/bert_pretrain/bert_config.json`



#### 2. `pytorch_model.bin` — BERT 预训练模型权重文件

> 文件路径：`04-bert/data/bert_pretrain/pytorch_model.bin`



#### 3. `vocab.txt` — BERT 预训练模型词典文件

> 文件路径：`04-bert/data/bert_pretrain/vocab.txt`

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
                        mask = [1] * len(token_ids) + [0] * (pad_size - len(token_ids))
                        token_ids = token_ids + [0] * (pad_size - len(token_ids))
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
    return DatasetIterater(
        batches=dataset,
        batch_size=config.batch_size,
        device=config.device,
        model_name=config.model_name
    )
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

