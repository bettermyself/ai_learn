## 1 LLM的PEFT微调方法

### 1. PEFT（大模型参数高效微调）

#### 1.1 技术概述

**参数高效微调（Parameter-Efficient Fine-Tuning, PEFT）** 是目前工业界应用大模型的主流方式。与全量微调相比，PEFT仅微调少量或额外的模型参数，同时固定大部分预训练参数，具有以下核心优势：

- **大幅降低计算和存储成本**
- **实现与全量微调相当的性能**
- **使大模型在消费级硬件上进行微调变得可行**



#### 1.2 三大主流方法分类

| 方法类型                 | 核心思想               | 参数更新位置        | 典型代表                |
| :----------------------- | :--------------------- | :------------------ | :---------------------- |
| **Prefix/Prompt-Tuning** | 添加可训练的前缀tokens | 输入层或隐层        | Prefix Tuning, P-Tuning |
| **Adapter-Tuning**       | 插入小型神经网络模块   | Transformer各层之间 | Adapter Tuning          |
| **LoRA**                 | 低秩矩阵近似权重更新   | 旁路分支            | LoRA, QLoRA             |

> 💡 **HuggingFace PEFT库**：开源的高效微调库，直接支持上述三类方法。



### 2. Prefix Tuning

#### 2.1 核心原理

Prefix-Tuning在模型输入前添加**连续的、任务特定的向量序列**（称为"前缀"），这些前缀被视为"虚拟tokens"，由**不对应真实tokens的自由参数**组成。

**关键特性：**

- 冻结PLM所有参数，仅更新优化特定任务的prefix
- 每个下游任务只需存储学习到的prefix，实现模块化部署
- 显著降低额外计算和存储开销

![img](assets/1-4-5.png)



#### 2.2 工作机制

![img](assets/1-4-6.png)

以GPT-2自回归语言模型为例：

1. **输入重构**：将输入`x`和输出`y`拼接为`z=[x; y]`
2. **添加前缀**：在输入前添加前缀，`z=[Prefix, x, y]`
   - 前缀索引`P_idx`对应参数化向量矩阵`P_θ`，维度为`|P_idx| × dim(h_i)`
3. **隐层计算**：
   - 若索引为前缀索引`P_idx`，直接从参数化矩阵`P_θ`复制对应向量作为隐层表示`h_i`
   - **重要**：在模型**每一层**都添加前缀向量
   - 非前缀位置的`h_i`通过PLM计算得到，但受左侧前缀参数影响

#### 2.3 优化策略

直接优化`P_θ`会导致训练不稳定，因此使用**MLP重参数化**：

- 使用更小的矩阵`P_w`和更大的前馈神经网络`MLP_θ`
- 公式：`P_θ[i,:] = MLP_θ(P_w[i,:])`
- 训练时仅更新前缀参数`θ`，PLM 的参数 `Ø`被固定

#### 2.4 与相关方法对比

| 方法              | 前缀位置   | 参数初始化     | 层间应用 |
| :---------------- | :--------- | :------------- | :------- |
| **Prefix-Tuning** | 固定开头   | MLP初始化      | 每层添加 |
| **P-Tuning**      | 位置不固定 | LSTM+MLP初始化 | 仅输入层 |
| **Prompt Tuning** | 输入层     | 简化方式       | 仅输入层 |



### 3. Adapter Tuning

#### 3.1 核心原理

Adapter Tuning在预训练模型**内部的网络层之间**插入小型神经网络模块（称为**适配器**），微调时仅训练这些适配器参数。

**参数关系：**

- $|w_0| << |w|$：w是预训练模型的参数， $w_0$是新添加的适配器的参数
- $Ø_w(x)$：原始预训练模型
- $Ø_{w,w_0}(x)$：添加适配器后的模型

#### 3.2 架构设计

<img src="assets/1-4-7.png" alt="img" style="zoom: 67%;" />

**Series Adapter结构：**

- 添加到每个Transformer层**两次**：多头注意力后 + 两层前馈网络后
- **Bottleneck结构**：下投影矩阵 → 非线性函数 → 上投影矩阵
- 包含**残差连接**，确保信息流畅



### 4. LoRA

#### 4.1 技术背景

Prefix Tuning存在**优化困难**、**性能非单调变化**、为前缀保留部分序列长度**会减少用于处理下游任务的序列长度**等问题；Adapter Tuning添加适配器层会引入额外的计算，带来**推理延迟**问题。LoRA（Low-Rank Adaptation）通过**低秩矩阵近似**解决这些痛点。

#### 4.2 核心思想

**冻结预训练模型权重**，在每个Transformer块中注入可训练的低秩分解矩阵：

<img src="assets/1-4-8.png" alt="img" style="zoom:67%;" />

**矩阵分解过程：**

- **矩阵A**：将数据从d维降到r维（r为LoRA秩，关键超参数）
- **矩阵B**：将数据从r维升回d维（初始化为0）
- **缩放因子α**：控制低秩矩阵影响强度
- 模型训练结束后，需要将A+B部分的参数与原大模型的参数合并在一起使用。

#### 4.3 Python伪代码实现

```python
# 参数配置
input_dim = 768       # 预训练模型隐藏层大小
output_dim = 768      # 层输出大小
rank = 8              # 低秩适应的秩'r'
alpha = 1.0           # 缩放因子

# 权重定义
W = ...               # 预训练权重 (input_dim x output_dim)
W_A = nn.Parameter(torch.empty(input_dim, rank))   # LoRA权重A
W_B = nn.Parameter(torch.empty(rank, output_dim))  # LoRA权重B

# 初始化
nn.init.kaiming_uniform_(W_A, a=math.sqrt(5))
nn.init.zeros_(W_B)   # B初始化为0确保训练从0开始

def lora_forward_matmul(x, W, W_A, W_B):
    """前向传播：原始权重 + LoRA低秩更新"""
    h = x @ W                    # 常规矩阵乘法
    h += x @ (W_A @ W_B) * alpha # 添加缩放的LoRA更新
    return h
```

#### 4.4 技术优势

💡 **LoRA是目前最通用、效果最好的微调方法之一**，具有以下特点：

- **无推理延迟**：训练完成后可合并参数，推理与原始模型一致
- **参数效率极高**：仅需训练少量低秩矩阵参数
- **模块化设计**：可轻松切换不同任务的适配器



## 2 基于GPT2搭建医疗问诊机器人

### 1. 项目概述

#### 1.1 项目背景

聊天机器人是基于自然语言处理技术的智能对话系统，能够模拟人类自然语言交流。当前在多个领域广泛应用：

- **在线客服**：快速响应用户常见问题
- **个人助手**：提供个性化推荐、日程管理等
- **社交娱乐**：趣味对话、语言学习
- **医疗咨询**：提供专业医疗建议

典型产品包括微软小冰、阿里云小蜜、百度智能云小度等。

本项目聚焦**医疗领域**，构建智能医疗问答系统，为用户提供准确、高效、优质的医疗问诊服务。

#### 1.2 学习目标

| 目标层次     | 具体内容                                         |
| :----------- | :----------------------------------------------- |
| **理解层面** | 理解医疗问诊机器人的开发背景与企业应用场景       |
| **掌握层面** | 掌握基于GPT2模型搭建医疗问诊机器人的完整实现流程 |



### 2. 环境准备

| 依赖项       | 版本要求 | 说明         |
| :----------- | :------- | :----------- |
| Python       | 3.6+     | 基础运行环境 |
| PyTorch      | 1.7.0    | 深度学习框架 |
| Transformers | 4.2.0    | 预训练模型库 |



### 3. 项目结构

<img src="assets/02.png" alt="img" style="zoom: 50%;" />

```
项目根目录/
├── data/                          # 数据存储目录
│   ├── 儿科疾病问诊信息.xlsx      # 原始医疗问诊数据
│   ├── train.txt                  # 转换后的对话语料
│   └── train.pkl                  # tokenize后的序列化数据
├── save_model/                    # 模型保存目录
├── samples/                       # 对话样本保存目录
├── data_preprocess/               # 数据预处理模块
│   ├── data_handle.py            # Excel转TXT
│   ├── preprocess.py             # TXT转PKL
│   ├── dataset.py                # DataSet封装
│   └── dataloader.py             # DataLoader封装
├── train.py                      # 训练主程序
├── interact.py                   # 交互预测程序
├── functions_tools.py            # 工具函数
└── parameter_config.py           # 参数配置
```



### 4. 数据处理流程

#### 4.1 原始数据格式

原始文件 `儿科疾病问诊信息.xlsx` 包含 **101,603** 条医疗问诊记录，结构如下：

| 字段名       | 说明     | 示例                              |
| :----------- | :------- | :-------------------------------- |
| `department` | 科室名称 | 儿科                              |
| `title`      | 疾病标题 | 先天性胃缺失                      |
| `ask`        | 患者问题 | 出生16天，检查出有先天性胃缺失... |
| `answer`     | 医生回答 | 先天性心脏病可以治愈的，建议到... |

#### 4.2 数据预处理步骤

数据转换流程：`Excel → TXT → PKL → DataSet → DataLoader`

```bash
# 步骤1：Excel转TXT格式
python data_handle.py

# 步骤2：TXT转序列化PKL文件
python preprocess.py --train_path data/train.txt --save_path data/train.pkl
```

⚠️ **注意**：对话之间需用**空行**分隔，格式如下：

```
患者问题文本
医生回答文本

患者问题文本
医生回答文本
```



### 5. 模型架构

#### 5.1 GPT2架构解析

```
输入层
  ├─ 词嵌入层 (WordEmbedding)
  └─ 位置嵌入层 (PositionEmbedding)

中间层
  └─ Transformer Decoder模块 × 12层

输出层
  ├─ LayerNorm归一化
  └─ 线性全连接层
```

#### 5.2 核心参数配置

| 参数名        | 值    | 说明            |
| :------------ | :---- | :-------------- |
| `n_embd`      | 768   | 词向量维度      |
| `n_head`      | 12    | 注意力头数      |
| `n_layer`     | 12    | Transformer层数 |
| `n_positions` | 1024  | 最大位置编码    |
| `vocab_size`  | 21128 | 词汇表大小      |



### 6. 训练与验证

💡 **训练流程说明**：

1. 加载预训练GPT2模型或初始化新模型
2. 使用AdamW优化器，配合线性学习率预热
3. 采用梯度累积和梯度裁剪策略
4. 每10个epoch或验证集困惑度最低时保存模型
5. 记录训练/验证损失与预测准确率

**关键训练参数**：

- 批次大小：4
- 最大序列长度：200
- 梯度累积步数： configurable
- 学习率预热步数：configurable

------

### 7. 人机交互

运行 `interact.py` 启动对话系统，支持：

- **多轮对话上下文记忆**
- **Top-k/Top-p采样策略**
- **重复惩罚机制**
- **对话历史自动保存**

bash

复制

```bash
python interact.py
```

⚠️ **操作提示**：输入 `Ctrl+Z` 结束对话，聊天记录自动保存至 `samples/sample.txt`



### 8. 核心代码详解

#### 8.1 数据格式转换：`data_handle.py`

```python
import pandas as pd
from tqdm import tqdm  # 进度条显示库

def read_csv2txt():
    """
    读取Excel文件并转换为对话TXT格式
    - 读取./data/儿科疾病问诊信息.xlsx
    - 提取ask和answer字段组成对话
    - 每条对话后添加两个换行符分隔
    """
    # 读取Excel文件
    data = pd.read_excel('./data/儿科疾病问诊信息.xlsx')
    print(data.head())  # 打印前5行查看数据结构
    
    # 转换为列表格式，便于遍历
    data_list = data.values.tolist()
    
    # 遍历每条记录，提取问答并写入TXT
    for data in tqdm(data_list):  # 显示进度条
        try:
            question = data[2]  # ask字段在第3列 (索引2)
            answer = data[3]    # answer字段在第4列 (索引3)
            
            # 组合成对话格式：问题 + 换行 + 回答
            str1 = question + '\n' + answer
            
            # 以追加模式写入文件，每条对话后添加两个换行符
            with open('./data/train.txt', 'a') as f:
                f.write(str1 + '\n\n')
        except:
            # 异常处理：跳过格式错误的记录
            continue

read_csv2txt()
```

#### 8.2 数据张量转换：`preprocess.py`

```python
from transformers import BertTokenizerFast  # 使用BertTokenizer处理中文
import pickle  # 序列化工具
from tqdm import tqdm

def preprocess(train_txt_path, train_pkl_path):
    """
    对原始语料进行tokenize处理
    每段对话格式: "[CLS]utterance1[SEP]utterance2[SEP]..."
    
    参数:
        train_txt_path: 原始TXT语料路径
        train_pkl_path: 输出PKL文件路径
    """
    # 初始化tokenizer，使用bert-base-chinese预训练模型
    # 特别指定特殊token的标识符
    # 如果不指定，BertTokenizer 会尝试从预训练模型的配置中加载这些特殊标记
    # 在从本地词汇表文件初始化时，可能无法正确识别特殊标记
    tokenizer = BertTokenizerFast.from_pretrained(
        'bert-base-chinese',
        sep_token="[SEP]",      # 句子分隔符
        pad_token="[PAD]",      # 填充符
        cls_token="[CLS]"       # 起始符
    )

    sep_id = tokenizer.sep_token_id  # 获取[SEP]对应的token ID
    cls_id = tokenizer.cls_token_id  # 获取[CLS]对应的token ID

    # 读取训练数据集（以二进制模式读取，再解码为UTF-8）
    with open(train_txt_path, 'rb') as f:
        data = f.read().decode("utf-8")

    # 根据换行符区分不同的对话段落
    # 需兼容Windows(\r\n)和Linux(\n)换行符
    if "\r\n" in data:
        train_data = data.split("\r\n\r\n")
    else:
        train_data = data.split("\n\n")

    print(f"共加载 {len(train_data)} 段对话")

    # 初始化统计和存储列表
    dialogue_len = []  # 记录每段对话tokenize后的长度
    dialogue_list = []  # 记录所有tokenize后的对话

    # 遍历每段对话进行tokenize
    for index, dialogue in enumerate(tqdm(train_data)):
        # 按行分割对话（区分换行符格式）
        if "\r\n" in data:
            sequences = dialogue.split("\r\n")
        else:
            sequences = dialogue.split("\n")

        # 每个对话以[CLS]开头
        input_ids = [cls_id]
        
        # 对每句话进行tokenize并添加分隔符
        for sequence in sequences:
            # add_special_tokens=False: 不自动添加特殊token，手动控制，避免第二个句子开头添加[CLS]
            input_ids += tokenizer.encode(sequence, add_special_tokens=False)
            input_ids.append(sep_id)  # 每句后添加[SEP]

        # 记录长度和token序列
        dialogue_len.append(len(input_ids))
        dialogue_list.append(input_ids)

    # 保存为PKL文件，加速后续加载
    with open(train_pkl_path, "wb") as f:
        pickle.dump(dialogue_list, f)
```

#### 8.3 DataSet封装：`dataset.py`

Python

复制

```python
from torch.utils.data import Dataset  # PyTorch数据集基类
import torch  # 张量处理库

class MyDataset(Dataset):
    """
    自定义数据集类，继承自Dataset
    用于封装医疗对话数据，支持索引访问和长度获取
    """
    
    def __init__(self, input_list, max_len):
        """
        初始化函数
        
        参数:
            input_list: List[List[int]], tokenize后的对话列表
            max_len: int, 最大序列长度，超长截断
        """
        self.input_list = input_list  # 存储所有对话数据
        self.max_len = max_len        # 最大长度限制

    def __len__(self):
        """返回数据集大小"""
        return len(self.input_list)

    def __getitem__(self, index):
        """
        根据索引获取单个样本
        
        参数:
            index: int, 样本索引
            
        返回:
            input_ids: LongTensor, token序列张量
        """
        input_ids = self.input_list[index]          # 获取对应对话
        input_ids = input_ids[:self.max_len]        # 超长截断
        input_ids = torch.tensor(input_ids, dtype=torch.long)  # 转为张量
        return input_ids
```

#### 8.4 DataLoader封装：`dataloader.py`

Python

复制

```python
import torch.nn.utils.rnn as rnn_utils  # 序列填充工具
from torch.utils.data import DataLoader  # 数据加载器
import torch
import pickle
from dataset import MyDataset

def load_dataset(train_path):
    """
    加载训练集和验证集
    
    参数:
        train_path: PKL文件路径
        
    返回:
        train_dataset: 训练数据集
        val_dataset: 验证数据集 (取前200条)
    """
    # 加载PKL文件
    with open(train_path, "rb") as f:
        input_list = pickle.load(f)

    print(f"总数据量: {len(input_list)}")
    
    # 划分训练/验证集 (前200条作为验证集)
    input_list_train = input_list[200:]
    input_list_val = input_list[:200]

    # 创建Dataset对象，设置最大长度200
    train_dataset = MyDataset(input_list_train, max_len=200)
    val_dataset = MyDataset(input_list_val, max_len=200)
    
    return train_dataset, val_dataset

def collate_fn(batch):
    """
    自定义批处理函数
    将变长序列填充至相同长度
    
    参数:
        batch: List[Tensor], 一批样本
        
    返回:
        input_ids: 填充后的输入序列
        labels: 填充后的标签序列 (pad=-100)
    """
    # 对输入序列进行填充，batch_first=True表示第一个维度是batch size
    # padding_value=0表示用0填充
    input_ids = rnn_utils.pad_sequence(batch, batch_first=True, padding_value=0)
    
    # 对标签序列进行填充，padding_value=-100表示这些位置不计入loss
    labels = rnn_utils.pad_sequence(batch, batch_first=True, padding_value=-100)
    
    return input_ids, labels

def get_dataloader(train_path):
    """
    获取DataLoader对象
    
    参数:
        train_path: PKL文件路径
        
    返回:
        train_dataloader: 训练数据加载器
        validate_dataloader: 验证数据加载器
    """
    train_dataset, val_dataset = load_dataset(train_path)
    
    # 训练集DataLoader，shuffle=True表示打乱数据
    train_dataloader = DataLoader(
        train_dataset,
        batch_size=4,              # 批次大小
        shuffle=True,              # 打乱顺序
        collate_fn=collate_fn,     # 自定义批处理
        drop_last=True             # 丢弃不足一个batch的数据
    )
    
    # 验证集DataLoader
    validate_dataloader = DataLoader(
        val_dataset,
        batch_size=4,
        shuffle=True,
        collate_fn=collate_fn,
        drop_last=True
    )
    
    return train_dataloader, validate_dataloader
```

#### 8.5 训练主函数：`train.py`

Python

复制

```python
import torch
import os
from datetime import datetime
from transformers import GPT2LMHeadModel, GPT2Config, BertTokenizerFast
from transformers import AdamW, get_linear_schedule_with_warmup

def train_epoch(model, train_dataloader, optimizer, scheduler, epoch, args):
    """
    单个epoch的训练过程
    
    参数:
        model: GPT2模型
        train_dataloader: 训练数据加载器
        optimizer: 优化器
        scheduler: 学习率调度器
        epoch: 当前epoch索引
        args: 训练参数配置
        
    返回:
        epoch_mean_loss: 本epoch平均损失
    """
    model.train()  # 设置训练模式
    device = args.device
    ignore_index = args.ignore_index
    
    epoch_start_time = datetime.now()
    total_loss = 0
    
    # 统计预测准确率
    epoch_correct_num, epoch_total_num = 0, 0

    # 遍历训练数据
    for batch_idx, (input_ids, labels) in enumerate(train_dataloader):
        # 数据移至GPU/CPU
        input_ids = input_ids.to(device)
        labels = labels.to(device)
        
        # 前向传播
        outputs = model.forward(input_ids, labels=labels)
        logits = outputs.logits
        loss = outputs.loss.mean()  # 对多GPU损失取平均

        # 计算batch准确率
        batch_correct_num, batch_total_num = calculate_acc(
            logits, labels, ignore_index=ignore_index
        )
        
        # 累加epoch统计
        epoch_correct_num += batch_correct_num
        epoch_total_num += batch_total_num
        batch_acc = batch_correct_num / batch_total_num
        
        total_loss += loss.item()

        # 梯度累积处理
        if args.gradient_accumulation_steps > 1:
            loss = loss / args.gradient_accumulation_steps
        
        # 反向传播
        loss.backward()
        
        # 梯度裁剪，防止梯度爆炸 (max_norm=configurable)
        torch.nn.utils.clip_grad_norm_(
            model.parameters(), 
            args.max_grad_norm
        )

        # 更新参数 (每gradient_accumulation_steps步)
        if (batch_idx + 1) % args.gradient_accumulation_steps == 0:
            optimizer.step()      # 更新权重
            scheduler.step()      # 更新学习率
            optimizer.zero_grad() # 清空梯度

        # 定期打印训练信息
        if (batch_idx + 1) % args.loss_step == 0:
            print(f"batch {batch_idx+1}/{len(train_dataloader)}, "
                  f"loss {loss.item() * args.gradient_accumulation_steps:.4f}, "
                  f"acc {batch_acc:.4f}, "
                  f"lr {scheduler.get_lr()[0]:.6f}")

    # 计算epoch平均指标
    epoch_mean_loss = total_loss / len(train_dataloader)
    epoch_mean_acc = epoch_correct_num / epoch_total_num
    print(f"Epoch {epoch+1}: loss {epoch_mean_loss:.4f}, acc {epoch_mean_acc:.4f}")

    # 保存模型 (每10个epoch或最后一个epoch)
    if epoch % 10 == 0 or epoch == args.epochs - 1:
        model_path = os.path.join(args.save_model_path, f'bj_epoch{epoch+1}')
        os.makedirs(model_path, exist_ok=True)
        model.save_pretrained(model_path)
        print(f"模型已保存至: {model_path}")

    return epoch_mean_loss
```

#### 8.6 预测交互：`interact.py`

Python

复制

```python
# 导入必要的库
import os
from datetime import datetime
from transformers import GPT2LMHeadModel, BertTokenizerFast
import torch.nn.functional as F
import torch

def top_k_top_p_filtering(logits, top_k=0, top_p=0.0, filter_value=-float('Inf')):
    """
    Top-k和Top-p采样策略：控制生成文本的多样性和质量
    
    参数:
        logits: 模型输出的logit分布 (vocab_size,)
        top_k: 只保留概率最高的k个token
        top_p: 保留累积概率大于p的最小token集合 (nucleus sampling)
        filter_value: 被过滤token的替代值 (设为负无穷)
        
    返回:
        filtered_logits: 过滤后的logit分布
    """
    assert logits.dim() == 1  # 确保是单条数据
    
    # Top-k过滤
    top_k = min(top_k, logits.size(-1))
    if top_k > 0:
        # 找到top_k阈值，低于该值的设为filter_value
        indices_to_remove = logits < torch.topk(logits, top_k)[0][..., -1, None]
        logits[indices_to_remove] = filter_value
    
    # Top-p (nucleus) 过滤
    if top_p > 0.0:
        # 排序logits
        sorted_logits, sorted_indices = torch.sort(logits, descending=True)
        cumulative_probs = torch.cumsum(F.softmax(sorted_logits, dim=-1), dim=-1)
        
        # 找到累积概率超过top_p的token并移除
        sorted_indices_to_remove = cumulative_probs > top_p
        # 右移一位，保留第一个超过阈值的token
        sorted_indices_to_remove[..., 1:] = sorted_indices_to_remove[..., :-1].clone()
        sorted_indices_to_remove[..., 0] = 0
        
        # 将过滤标记映射回原索引
        indices_to_remove = sorted_indices[sorted_indices_to_remove]
        logits[indices_to_remove] = filter_value
    
    return logits

def main():
    # 加载配置
    pconf = ParameterConfig()
    
    # 设备检测，优先使用GPU
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f'Using device: {device}')
    
    # 设置GPU可见性
    os.environ["CUDA_VISIBLE_DEVICES"] = '0'
    
    # 初始化分词器
    tokenizer = BertTokenizerFast(
        vocab_file=pconf.vocab_path,
        sep_token="[SEP]",
        pad_token="[PAD]",
        cls_token="[CLS]"
    )
    
    # 加载训练好的模型
    model = GPT2LMHeadModel.from_pretrained('./save_model/epoch25')
    model = model.to(device)
    model.eval()  # 设置为评估模式
    
    # 创建聊天记录保存目录
    if pconf.save_samples_path:
        os.makedirs(pconf.save_samples_path, exist_ok=True)
        samples_file = open(pconf.save_samples_path + '/samples.txt', 'a', encoding='utf8')
        samples_file.write(f"聊天记录{datetime.now()}:\n")
    
    # 存储对话历史，每个utterance用token id列表表示
    history = []
    print('开始和chatbot聊天，输入CTRL + Z以退出')
    
    while True:
        try:
            # 获取用户输入
            text = input("user:")
            
            # 保存用户输入到文件
            if pconf.save_samples_path:
                samples_file.write(f"user:{text}\n")
            
            # 将文本转换为token ids
            text_ids = tokenizer.encode(text, add_special_tokens=False)
            history.append(text_ids)  # 添加到历史记录
            
            # 构建模型输入
            input_ids = [tokenizer.cls_token_id]  # 以[CLS]开头
            
            # 添加历史对话（限制最大历史长度）
            for history_utr in history[-pconf.max_history_len:]:
                input_ids.extend(history_utr)
                input_ids.append(tokenizer.sep_token_id)
            
            # 转为张量并添加batch维度
            input_ids = torch.tensor(input_ids).long().unsqueeze(0).to(device)
            
            # 生成回复
            response = []  # 存储生成的token ids
            
            for _ in range(pconf.max_len):  # 最多生成max_len个token
                # 模型前向传播
                outputs = model(input_ids=input_ids)
                logits = outputs.logits
                
                # 取最后一个token的logits
                next_token_logits = logits[0, -1, :]
                
                # 重复惩罚：降低已生成token的概率
                for id in set(response):
                    next_token_logits[id] /= pconf.repetition_penalty
                
                # 避免生成[UNK]
                next_token_logits[tokenizer.convert_tokens_to_ids('[UNK]')] = -float('Inf')
                
                # Top-k/Top-p过滤
                filtered_logits = top_k_top_p_filtering(
                    next_token_logits, 
                    top_k=pconf.topk, 
                    top_p=pconf.topp
                )
                
                # 多项式采样
                next_token = torch.multinomial(
                    F.softmax(filtered_logits, dim=-1), 
                    num_samples=1
                )
                
                # 遇到[SEP]表示生成结束
                if next_token == tokenizer.sep_token_id:
                    break
                
                response.append(next_token.item())
                
                # 更新输入，实现自回归生成
                input_ids = torch.cat(
                    (input_ids, next_token.unsqueeze(0)), 
                    dim=1
                )
            
            # Token转文本
            history.append(response)
            text = tokenizer.convert_ids_to_tokens(response)
            print("chatbot:" + "".join(text))
            
            # 保存回复到文件
            if pconf.save_samples_path:
                samples_file.write("chatbot:" + "".join(text) + "\n")
        
        except KeyboardInterrupt:
            # 用户中断时关闭文件
            if pconf.save_samples_path:
                samples_file.close()
            break

if __name__ == '__main__':
    main()
```

------

### 9. 关键技术要点总结

#### 9.1 数据预处理要点

表格

复制

| 技术点       | 实现方式            | 目的             |
| :----------- | :------------------ | :--------------- |
| **Tokenize** | `BertTokenizerFast` | 高效处理中文分词 |
| **序列化**   | `pickle.dump()`     | 加速后续数据加载 |
| **长度控制** | `max_len=200`       | 防止显存溢出     |
| **填充策略** | `pad_sequence`      | 支持批次训练     |

#### 9.2 训练优化技巧

💡 **梯度累积**：在小批量训练时有效增大batch size效果
⚠️ **梯度裁剪**：`max_grad_norm`防止梯度爆炸
💡 **学习率预热**：warmup_steps让模型稳定收敛
⚠️ **验证集监控**：保存困惑度最低的模型而非最新模型

#### 9.3 生成策略控制

- **Top-k采样**：限制候选词数量，保证生成质量
- **Top-p采样**：动态调整候选词数量，提升多样性
- **重复惩罚**：`repetition_penalty`抑制重复生成
- **历史记忆**：`max_history_len`控制上下文长度

------

### 10. 扩展建议

1. **模型优化**：尝试更大参数量的GPT2模型（如GPT2-large）
2. **领域适配**：增加医疗专业术语词典
3. **性能提升**：使用混合精度训练加速
4. **安全增强**：添加医疗回答置信度过滤机制
5. **部署方案**：考虑模型量化与ONNX导出