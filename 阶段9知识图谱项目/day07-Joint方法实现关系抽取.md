## 1. Joint方法原理

Joint联合抽取方法通过修改标注方式和模型结构，直接输出文本中包含的 (subject, relation, object) 三元组。根据解码方式不同，主要分为以下两类：

### 1.1 参数共享的联合模型

**特点**：实体抽取和关系抽取任务共享编码层参数，但解码过程异步进行，各任务独立计算损失，最终损失为各任务损失之和。

**模型结构图示**：

<img src="assets/4-1-1.png" alt="img" style="zoom:50%;" />



### 1.2 联合解码的联合模型

**特点**：头实体、关系和尾实体的抽取过程完全同步，通过统一标注体系直接生成SPO三元组。

**模型结构图示**：

<img src="assets/4-1-2.png" alt="img" style="zoom:50%;" />

**标注方式示例**：

- 假设有N种关系类型
- 采用BIOS标注法结合实体序号（1,2）
- 总标签数：`2 × 3 × N + 1`（其中1表示不属于任何关系）



**对比表格**：

| 特性           | 参数共享模型         | 联合解码模型         |
| :------------- | :------------------- | :------------------- |
| **解码方式**   | 异步解码，各任务独立 | 同步解码，统一输出   |
| **损失函数**   | 各任务损失之和       | 单一联合损失         |
| **模型复杂度** | 中等，结构清晰       | 较高，标注复杂       |
| **优势**       | 训练灵活，易调试     | 全局优化，误差传递小 |



## 2. Casrel算法思想

### 2.1 核心创新

Casrel（Cascade Relational Learning）是2020年ACL会议上提出的一种基于**参数共享**的联合抽取模型，主要解决**关系三元组重叠问题**：

- **SEO（Single Entity Overlap）**：单个实体参与多个三元组
- **EPO（Entity Pair Overlap）**：同一实体对具有多种关系

### 2.2 方法本质

Casrel属于**参数共享的联合抽取方法**，通过级联解码器分步提取三元组，有效处理实体重叠场景。



## 3. Casrel模型架构

### 3.1 整体框架

**处理流程**：编码（`bert`编码） → 头实体识别 → 关系-尾实体联合识别

**模型结构**：

![img](assets/4-2-1-1762837878417-3.png)

### 3.2 模型细节

#### 3.2.1 头实体识别部分

**实现方式**：采用**二分类**策略，识别头实体的起始和结束位置。

![img](assets/4-2-2-1762838003220-5.png)

**数学表达**：
$$
p_i^{start\_s} = \sigma (\mathbf{W}_{start}\mathbf{x}_i + \mathbf{b}_{start})\\p_i^{end\_s} = \sigma (\mathbf{W}_{end}\mathbf{x}_i + \mathbf{b}_{end})
$$
**处理流程**：

1. 利用一个线性层 + 一个`sigmoid`激活函数对编码后每个token进行二分类判断
2. 识别所有可能的start和end位置
3. 采用**最近匹配原则**配对生成候选头实体集合



#### 3.2.2 关系与尾实体联合识别

![img](assets/4-2-3-1762838352844-7.png)

**特征融合机制**：

- 输入：编码向量 + 头实体特征向量
- 头实体特征：若实体含多个词，则取平均向量

**融合公式**：
$$
h'_i = h_i + (1/k) Σ_{j=start}^{end} h_j
$$

> 其中$k$为头实体长度，$h_i$为第$i$个token的编码向量。



**解码过程**：

对于识别出来的每一个subject, 对应的每一种关系会解码出其 object 的 start 和 end 索引位置，与 Subject 类似，公式如下：
$$
p_{i}^{start\_o} = \sigma(\mathbf{W}_{start}^r(\mathbf{x}_i + \mathbf{v}_{sub}^k) + \mathbf{b}_{start}^r)\\
p_{i}^{end\_o} = \sigma(\mathbf{W}_{end}^r(\mathbf{x}_i + \mathbf{v}_{sub}^k) + \mathbf{b}_{end}^r))
$$


#### 3.2.3 模型结果示例

以句子"**Jackie R. Brown was born in Washington, United States Of America**"为例：

- **头实体**：Jackie R. Brown → 识别出两个尾实体
  - 关系：`Birth_place` → 尾实体：Washington
  - 关系：`Birth_place` → 尾实体：United States Of America
- **头实体**：Washington → 识别出：
  - 关系：`Capital_of` → 尾实体：United States Of America



### 3.3 Casrel解决的问题

✅ **成功处理SEO和EPO重叠问题**，显著提升复杂文本场景下的关系抽取准确率。



## 4. 项目代码架构

**代码组织结构**：

```
relationship_extract/
├── bert-base-chinese/
├── data/                      # 数据集目录
│   ├── train.json            # 训练数据（55,433条）
│   ├── dev.json              # 验证数据（11,191条）
│   ├── test.json             # 测试数据（13,417条）
│   └── relation.json         # 关系类型定义（18类）
├── codes/
│   ├── config.py             # 配置文件
│   ├── train.py              # 训练脚本
│   ├── test.py               # 测试脚本
│   ├── predict.py            # 预测脚本
│   ├── model/
│   │   └── CasrelModel.py    # 模型定义
│   └── utils/
│       ├── process.py        # 数据处理函数
│       └── data_loader.py    # DataLoader封装
└── save_model/               # 模型保存目录
```



## 5. 数据预处理

### 5.1 数据集概览

⚠️ **数据来源**：千言数据集（http://www.luge.ai/#/），开源数据集可直接使用。实际工作中需自行标注。



**数据集统计表**：

| 数据集            | 样本数量 | 用途     | 关键字段       |
| :---------------- | :------- | :------- | :------------- |
| **train.json**    | 55,433   | 模型训练 | text, spo_list |
| **dev.json**      | 11,191   | 验证调参 | text, spo_list |
| **test.json**     | 13,417   | 效果测试 | text, spo_list |
| **relation.json** | 18       | 关系定义 | id → relation  |



**关系类型示例**（共18类）：

```json
{
  "0": "出品公司",
  "1": "国籍",
  "2": "出生地",
  "3": "民族",
  "4": "出生日期",
  "5": "毕业院校",
  "6": "歌手",
  "7": "所属专辑",
  "8": "作词",
  "9": "作曲",
  "10": "连载网站",
  "11": "作者",
  "12": "出版社",
  "13": "主演",
  "14": "导演",
  "15": "编剧",
  "16": "上映时间",
  "17": "成立日期"
}
```



**数据样例结构**：

```python
{
  "text": "《今晚会在哪里醒来》是黄家强的一首粤语歌曲...",
  "spo_list": [
    {
      "predicate": "作曲",      # 关系类型
      "object_type": "人物",    # 尾实体类型
      "subject_type": "歌曲",   # 头实体类型
      "object": "黄家强",       # 尾实体
      "subject": "今晚会在哪里醒来"  # 头实体
    }
  ]
}
```



### 5.2 配置类实现

- 文件路径: `/home/ec2-user/Casrel_RE/relationship_extract/codes/config.py`

```python
# coding:utf-8
import torch
from fastNLP import Vocabulary  # 用于构建str到int的映射
from transformers import BertTokenizer, AdamW
import json

class Config(object):
    """模型配置类：集中管理所有超参数和路径配置"""
    def __init__(self):
        # 设备配置：自动检测GPU，否则使用CPU
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # 预训练模型路径（需替换为实际路径）
        self.bert_path = "预训练模型的绝对路径"
        
        # 模型超参数
        self.num_rel = 18          # 关系类别数
        self.batch_size = 8        # 批次大小
        self.learning_rate = 1e-5  # 学习率
        self.bert_dim = 768        # BERT隐藏层维度
        self.epochs = 10           # 训练轮数
        
        # 数据路径配置（需替换为实际路径）
        self.train_data_path = "训练数据集的绝对路径"
        self.dev_data_path = "验证数据集的绝对路径"
        self.test_data_path = "测试数据集的绝对路径"
        self.rel_dict_path = "关系数据文件的绝对路径"
        
        # 加载关系词典并构建Vocabulary
        id2rel = json.load(open(self.rel_dict_path, encoding='utf8'))
        self.rel_vocab = Vocabulary(padding=None, unknown=None)
        self.rel_vocab.add_word_lst(list(id2rel.values()))  # 添加关系词表
        
        # 初始化BERT分词器
        self.tokenizer = BertTokenizer.from_pretrained(self.bert_path)
```



### 5.3 数据处理函数

- 文件路径: `/home/ec2-user/Casrel_RE/relationship_extract/codes/utils/process.py`

```python
# coding:utf-8
from codes.config import Config
import torch
from random import choice
from collections import defaultdict

conf = Config()

def find_head_idx(source, target):
    """
    在source序列中查找target子序列的起始索引位置
    :param source: 原始token id列表
    :param target: 目标实体token id列表
    :return: 起始索引，未找到返回-1
    """
    target_len = len(target)
    # 滑动窗口匹配
    for i in range(len(source)):
        if source[i: i + target_len] == target:
            return i
    return -1

def create_label(inner_triples, inner_input_ids, seq_len):
    """
    为单个样本生成训练标签张量
    :param inner_triples: spo三元组列表
    :param inner_input_ids: 输入文本的token id序列
    :param seq_len: 序列长度
    :return: 包含sub_len, sub_head2tail, sub_heads, sub_tails, obj_heads, obj_tails的张量
    """
    # 初始化标签张量（全0）
    inner_sub_heads = torch.zeros(seq_len)    # 头实体起始位置标签
    inner_sub_tails = torch.zeros(seq_len)    # 头实体结束位置标签
    inner_obj_heads = torch.zeros((seq_len, conf.num_rel))  # 尾实体起始位置+关系类型
    inner_obj_tails = torch.zeros((seq_len, conf.num_rel))  # 尾实体结束位置+关系类型
    inner_sub_head2tail = torch.zeros(seq_len)  # 头实体span掩码
    inner_sub_len = torch.tensor([1], dtype=torch.float)  # 默认头实体长度（防除0）
    
    # 构建头实体到关系-尾实体的映射字典
    s2ro_map = defaultdict(list)
    
    for inner_triple in inner_triples:
        # 将文本转换为token id
        triple = (
            conf.tokenizer(inner_triple['subject'], add_special_tokens=False)['input_ids'],
            conf.rel_vocab.to_index(inner_triple['predicate']),  # 关系转索引
            conf.tokenizer(inner_triple['object'], add_special_tokens=False)['input_ids']
        )
        
        # 查找实体在序列中的位置
        sub_head_idx = find_head_idx(inner_input_ids, triple[0])
        obj_head_idx = find_head_idx(inner_input_ids, triple[2])
        
        if sub_head_idx != -1 and obj_head_idx != -1:
            sub = (sub_head_idx, sub_head_idx + len(triple[0]) - 1)
            obj = (obj_head_idx, obj_head_idx + len(triple[2]) - 1, triple[1])  
            s2ro_map[sub].append(obj)  # 构建映射  {(3,5):[(7,8,0)]} 0是关系
    
    # 生成标签
    if s2ro_map:
        # 随机选择一个头实体作为当前样本的训练目标,多轮次全部能够训练到
        sub_head_idx, sub_tail_idx = choice(list(s2ro_map.keys()))
        
        # 标记头实体位置
        inner_sub_heads[sub_head_idx] = 1
        inner_sub_tails[sub_tail_idx] = 1
        
        # 标记头实体span掩码
        inner_sub_head2tail[sub_head_idx:sub_tail_idx + 1] = 1
        inner_sub_len = torch.tensor([sub_tail_idx + 1 - sub_head_idx], dtype=torch.float)
        
        # 标记对应关系和尾实体位置
        for ro in s2ro_map.get((sub_head_idx, sub_tail_idx), []):
            inner_obj_heads[ro[0]][ro[2]] = 1  # 尾实体起始位置
            inner_obj_tails[ro[1]][ro[2]] = 1  # 尾实体结束位置
    
    return inner_sub_len, inner_sub_head2tail, inner_sub_heads, inner_sub_tails, inner_obj_heads, inner_obj_tails

def collate_fn(data):
    """
    自定义批次数据整理函数，用于DataLoader
    :param data: 原始数据列表，每个元素为(text, spo_list)元组
    :return: 处理后的inputs和labels字典
    """
    # 分离文本和三元组
    text_list = [value[0] for value in data]
    triple_list = [value[1] for value in data]
    
    # 批量编码，自动填充到当前批次最大长度
    text = conf.tokenizer.batch_encode_plus(text_list, padding=True)
    
    batch_size = len(text['input_ids'])
    seq_len = len(text['input_ids'][0])
    
    # 初始化批次标签列表
    sub_heads, sub_tails = [], []
    obj_heads, obj_tails = [], []
    sub_len, sub_head2tail = [], []
    
    # 逐样本生成标签
    for batch_index in range(batch_size):
        inner_input_ids = text['input_ids'][batch_index]
        inner_triples = triple_list[batch_index]
        
        # 创建单个样本的标签
        results = create_label(inner_triples, inner_input_ids, seq_len)
        sub_len.append(results[0])
        sub_head2tail.append(results[1])
        sub_heads.append(results[2])
        sub_tails.append(results[3])
        obj_heads.append(results[4])
        obj_tails.append(results[5])
    
    # 转换为张量并移动到设备
    input_ids = torch.tensor(text['input_ids']).to(conf.device)
    mask = torch.tensor(text['attention_mask']).to(conf.device)
    sub_heads = torch.stack(sub_heads).to(conf.device)
    sub_tails = torch.stack(sub_tails).to(conf.device)
    sub_len = torch.stack(sub_len).to(conf.device)
    sub_head2tail = torch.stack(sub_head2tail).to(conf.device)
    obj_heads = torch.stack(obj_heads).to(conf.device)
    obj_tails = torch.stack(obj_tails).to(conf.device)
    
    # 组装输入和标签字典
    inputs = {
        'input_ids': input_ids,
        'mask': mask,
        'sub_head2tail': sub_head2tail,
        'sub_len': sub_len
    }
    labels = {
        'sub_heads': sub_heads,
        'sub_tails': sub_tails,
        'obj_heads': obj_heads,
        'obj_tails': obj_tails
    }
    
    return inputs, labels
```

> `torch.stack` 是 PyTorch 中用于**张量堆叠**的核心函数，其作用是将一组张量沿着**新维度**进行拼接。与 `torch.cat` 在**已有维度**上连接不同，`stack` 会创建一个新的维度。
>
> #### 核心区别：`stack` vs `cat`
>
> ```python
> import torch
> 
> # 准备两个形状相同的张量
> a = torch.tensor([1, 2, 3])  # shape: (3,)
> b = torch.tensor([4, 5, 6])  # shape: (3,)
> 
> # torch.stack：创建新维度
> stacked = torch.stack([a, b], dim=0)  # shape: (2, 3)
> print(stacked)
> # tensor([[1, 2, 3],
> #         [4, 5, 6]])
> 
> # torch.cat：在已有维度上连接
> catenated = torch.cat([a, b], dim=0)  # shape: (6,)
> print(catenated)
> # tensor([1, 2, 3, 4, 5, 6])
> ```
>
> #### 主要参数
>
> ```python
> torch.stack(tensors, dim=0)
> ```
>
> - **`tensors`**  ：要堆叠的张量序列（必须形状相同）
> - **`dim`**  ：指定新维度插入的位置（0 ≤ dim ≤ len(tensor.shape)）
>
> #### 典型示例
>
> #### 1. 在 batch 维度上堆叠
>
> ```python
> # 将多个样本堆叠成batch
> image1 = torch.randn(3, 224, 224)  # 单张图片
> image2 = torch.randn(3, 224, 224)
> image3 = torch.randn(3, 224, 224)
> 
> batch = torch.stack([image1, image2, image3], dim=0)
> print(batch.shape)  # torch.Size([3, 3, 224, 224])
> ```
>
> #### 2. 在不同位置插入新维度
>
> ```python
> tensors = [torch.randn(4, 5) for _ in range(3)]
> 
> # 在第0维堆叠
> print(torch.stack(tensors, dim=0).shape)  # torch.Size([3, 4, 5])
> 
> # 在第1维堆叠
> print(torch.stack(tensors, dim=1).shape)  # torch.Size([4, 3, 5])
> ```
>
> ---

### 5.4 DataLoader封装

- 代码路径: `/home/ec2-user/Casrel_RE/relationship_extract/codes/utils/data_loader.py`

```python
# coding:utf-8
from torch.utils.data import DataLoader, Dataset
from utils.process import *
from codes.config import Config

conf = Config()

class MyDataset(Dataset):
    """自定义数据集类"""
    def __init__(self, data_path):
        super().__init__()
        # 读取JSON文件，每行一个样本
        self.dataset = [json.loads(line) for line in open(data_path, encoding='utf8')]
    
    def __len__(self):
        return len(self.dataset)
    
    def __getitem__(self, index):
        """获取单个样本"""
        content = self.dataset[index]
        text = content['text']
        spo_list = content['spo_list']
        return text, spo_list

def get_data():
    """
    创建训练和评估所需的数据加载器
    :return: train_dataloader, dev_dataloader, test_dataloader
    """
    # 实例化数据集
    train_data = MyDataset(conf.train_data_path)
    dev_data = MyDataset(conf.dev_data_path)
    test_data = MyDataset(conf.test_data_path)
    
    # 创建DataLoader
    train_dataloader = DataLoader(
        dataset=train_data,
        batch_size=conf.batch_size,
        shuffle=True,              # 训练时随机打乱
        collate_fn=collate_fn,     # 自定义批次处理函数
        drop_last=True             # 丢弃不完整的最后一个批次
    )
    
    dev_dataloader = DataLoader(
        dataset=dev_data,
        batch_size=conf.batch_size,
        shuffle=True,
        collate_fn=collate_fn,
        drop_last=True
    )
    
    test_dataloader = DataLoader(
        dataset=test_data,
        batch_size=conf.batch_size,
        shuffle=True,
        collate_fn=collate_fn,
        drop_last=True
    )
    
    return train_dataloader, dev_dataloader, test_dataloader
```

> `json.load()` 和 `json.loads()` 是 Python 标准库 `json` 模块中两个用于解析 JSON 数据的核心函数，主要区别在于**数据来源不同**。
>
> #### **1. `json.loads()` — 解析字符串**
>
> - **作用**：将 **JSON 格式的字符串** 转换为 Python 对象（字典、列表等）
> - **全称**："load string"
> - **签名**：`json.loads(s, *, ...)`
> - **参数**：第一个参数是 JSON 字符串
>
> **示例**：
>
> ```python
> import json
> 
> json_string = '{"name": "Alice", "age": 30}'
> python_obj = json.loads(json_string)
> print(python_obj)  # {'name': 'Alice', 'age': 30}
> print(type(python_obj))  # <class 'dict'>
> ```
>
> #### **2. `json.load()` — 解析文件**
>
> - **作用**：从 **文件对象**（已打开的文件）中读取 JSON 数据并转换为 Python 对象
> - **全称**："load"（从文件加载）
> - **签名**：`json.load(fp, *, ...)`
> - **参数**：第一个参数是支持 `.read()` 方法的文件对象
>
> **示例**：
>
> ```python
> import json
> 
> # 从文件读取
> with open('data.json', 'r', encoding='utf-8') as f:
>     python_obj = json.load(f)
>     print(python_obj)
> ```
>
> #### **核心对比**
>
> | 特性         | `json.loads()`                   | `json.load()`                  |
> | :----------- | :------------------------------- | :----------------------------- |
> | **数据来源** | JSON 字符串 (`str`)              | 文件对象 (`file object`)       |
> | **参数类型** | `s: str`                         | `fp: file object`              |
> | **使用场景** | 处理 API 响应、字符串变量        | 处理本地 JSON 文件             |
> | **示例**     | `json.loads('{"key": "value"}')` | `json.load(open('file.json'))` |
>
> **简单总结**：API 返回的字符串用 `loads()`，本地文件用 `load()`。