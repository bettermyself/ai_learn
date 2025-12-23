## 1. 什么是 LangChain？

<img src="assets/langchain-color.png" style="zoom:25%;" />

LangChain 是由 **Harrison Chase** 于 2022 年 10 月创建的开源框架，专为构建基于大语言模型（LLMs）的应用程序而设计。

**核心理念**：为各类 LLMs（如 GPT-4、文心一言、通义千问等）提供标准化接口，将 LLM 相关组件"链接"（Chain）在一起，极大简化复杂 LLM 应用的开发难度。框架提供 **Python** 和 **Node.js** 两种语言实现。

**官方参考文档**：https://python.langchain.com/docs/



## 2. LangChain 六大核心组件

LangChain 应用通常由多个组件协同实现，主要支持以下六种组件：

| 组件类型    | 核心功能                   |
| :---------- | :------------------------- |
| **Models**  | 各类模型集成与统一管理接口 |
| **Prompts** | 提示词管理、优化与序列化   |
| **Memory**  | 保存和管理模型交互上下文   |
| **Indexes** | 文档结构化处理与检索       |
| **Chains**  | 组件间调用链的编排         |
| **Agents**  | 智能决策与工具调用代理     |

### 2.1 Models 组件

Models 组件提供与各类模型的深度集成，并统一接口标准。目前支持 **三种模型类型**：**<font color='orange'>LLMs、Chat Models(聊天模型)、Embeddings Models(嵌入模型）</font>**

#### 2.1.1 LLMs（大语言模型）

直接接收**文本字符串**输入，返回**文本字符串**输出。适用于大多数自然语言处理任务。

**常用模型来源**：[Hugging Face Models](https://huggingface.co/models)

**💡 示例：调用文心一言模型**

```python
import os
from langchain_community.llms import QianfanLLMEndpoint

# 设置百度千帆平台的API密钥
os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 初始化LLM实例
# streaming=True: 启用流式响应
# model="ERNIE-Bot-turbo": 指定使用文心一言模型
llm = QianfanLLMEndpoint(streaming=True, model="ERNIE-Bot-turbo")

# 调用模型生成内容
res = llm("帮我讲个笑话吧")
print(res)
```

**⚠️ 注意**：使用前需在百度智能云千帆大模型平台申请 API Key 和 Secret Key



#### 2.1.2 Chat Models（聊天模型）

基于 LLMs 构建，但使用**结构化消息**作为输入输出，更适合对话场景。

**支持的消息类型**：

表格

复制

| 消息类型        | 说明                           | 使用场景               |
| :-------------- | :----------------------------- | :--------------------- |
| `HumanMessage`  | 用户输入的消息                 | 用户提问、指令         |
| `AIMessage`     | AI 模型的回复                  | 模型回答、响应         |
| `SystemMessage` | 系统级提示，设定模型角色和环境 | 角色扮演、输出格式要求 |
| `ChatMessage`   | 通用消息类型（通常使用前三种） | 自定义场景             |

**💡 示例：生成唐诗**

Python

复制

```python
import os
from langchain_community.chat_models import QianfanChatEndpoint
from langchain_core.messages import HumanMessage

# 配置API密钥
os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 初始化聊天模型
chat = QianfanChatEndpoint(streaming=True, model="ERNIE-Bot-turbo")

# 构建消息列表（包含用户请求）
messages = [
    HumanMessage(content="给我写一首唐诗")
]

# 调用模型并获取结果
res = chat(messages)
print(res)
```

------

#### 2.1.3 Prompt Templates（提示模板）

通过预定义模板，快速生成结构化提示词，确保输出格式符合预期。

**💡 示例：生成商品文案**

Python

复制

```python
import os
from langchain.chat_models import QianfanChatEndpoint
from langchain_core.prompts import ChatPromptTemplate

# 配置API密钥
os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 创建带变量的提示模板
template_str = """您是一位专业的鲜花店文案撰写员。
对于售价为 {price} 元的 {flower_name}，您能提供一个吸引人的简短描述吗？
注意：文字不要超过50个字符"""

# 将字符串模板转换为LangChain提示模板对象
promp_template = ChatPromptTemplate.from_template(template_str)

# 填充模板变量，生成最终提示
prompt = promp_template.format_messages(
    flower_name="玫瑰",  # 替换花名变量
    price='50'           # 替换价格变量
)

# 实例化模型并调用
chat = QianfanChatEndpoint(streaming=True, model="ERNIE-Bot-turbo")
result = chat(prompt)
print(result)
```

------

#### 2.1.4 Embeddings Models（嵌入模型）

将**文本**转换为**浮点数向量**，用于语义搜索、相似度计算等场景。

<div align="center"> <img src="./assets/6-4.png" alt="Embeddings模型工作原理" style="zoom:40%;" /> </div>

**💡 示例：文本向量化**

Python

复制

```python
import os
from langchain_community.embeddings import QianfanEmbeddingsEndpoint

# 配置API密钥
os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 初始化嵌入模型
embed = QianfanEmbeddingsEndpoint()

# 对单条文本进行向量化
res1 = embed.embed_query('这是第一个测试文档')
print(res1)  # 返回浮点数列表

# 对多条文本进行批量向量化
res2 = embed.embed_documents([
    '这是第一个测试文档',
    '这是第二个测试文档'
])
print(res2)  # 返回向量列表
```

**支持的嵌入模型**：

- AzureOpenAI、Baidu Qianfan、Hugging Face Hub
- OpenAI、Llama-cpp、SentenceTransformers

------

### 2.2 Prompts 组件

Prompts 组件用于管理和优化提示词，支持多种提示策略：

#### Zero-Shot 提示（零样本）

直接提问，不提供示例。

Python

复制

```python
from langchain_core.prompts import PromptTemplate
from langchain_community.llms import QianfanLLMEndpoint
import os

# 配置API密钥
os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 定义带占位符的模板
template = "我的邻居姓{lastname}，他生了个儿子，给他儿子起个名字"

# 创建提示模板对象
# input_variables: 模板中需要替换的变量名列表
prompt = PromptTemplate(
    input_variables=["lastname"],
    template=template,
)

# 使用实际值填充模板
prompt_text = prompt.format(lastname="王")
print(prompt_text)  # 输出: 我的邻居姓王，他生了个儿子，给他儿子起个名字

# 调用LLM生成结果
llm = QianfanLLMEndpoint()
result = llm(prompt_text)
print(result)
```

#### Few-Shot 提示（少样本）

提供示例，引导模型学习特定模式。

Python

复制

```python
from langchain_core.prompts import PromptTemplate, FewShotPromptTemplate
from langchain_community.llms import QianfanLLMEndpoint
import os

os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 1. 定义示例数据（输入输出对）
examples = [
    {"word": "开心", "antonym": "难过"},
    {"word": "高", "antonym": "矮"},
]

# 2. 创建单个示例的格式化模板
example_template = """
单词: {word}
反义词: {antonym}\\
"""

# 3. 将示例模板转换为PromptTemplate对象
example_prompt = PromptTemplate(
    input_variables=["word", "antonym"],
    template=example_template,
)

# 4. 创建Few-Shot提示模板
few_shot_prompt = FewShotPromptTemplate(
    examples=examples,              # 示例列表
    example_prompt=example_prompt,  # 示例格式化模板
    prefix="给出每个单词的反义词",    # 提示前缀（任务说明）
    suffix="单词: {input}\\n反义词:",  # 提示后缀（当前输入）
    input_variables=["input"],      # 用户输入变量
    example_separator="\\n",        # 示例分隔符
)

# 5. 生成最终提示文本
prompt_text = few_shot_prompt.format(input="粗")
print(prompt_text)

# 6. 调用LLM
llm = QianfanLLMEndpoint(temperature=0.9)
print(llm(prompt_text))  # 预期输出: 细
```

------

### 2.3 Chains（链）

Chains 将多个组件（LLM、Prompt、工具等）组合成工作流，实现复杂任务编排。

**💡 示例：单链应用**

Python

复制

```python
from langchain_core.prompts import PromptTemplate
from langchain_community.llms import QianfanLLMEndpoint
from langchain.chains import LLMChain
import os

os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 1. 定义提示模板
template = "我的邻居姓{lastname}，他生了个儿子，给他儿子起个名字"
prompt = PromptTemplate(
    input_variables=["lastname"],
    template=template,
)

# 2. 初始化LLM
llm = QianfanLLMEndpoint()

# 3. 创建链：将LLM和Prompt组合
chain = LLMChain(llm=llm, prompt=prompt)

# 4. 执行链（自动处理输入→提示→模型→输出）
print(chain.run("王"))
```

**💡 示例：多链串联（SimpleSequentialChain）**

Python

复制

```python
from langchain_core.prompts import PromptTemplate
from langchain_community.llms import QianfanLLMEndpoint
from langchain.chains import LLMChain, SimpleSequentialChain
import os

os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 第一条链：生成正式名字
first_prompt = PromptTemplate(
    input_variables=["lastname"],
    template="我的邻居姓{lastname}，他生了个儿子，给他儿子起个名字"
)
first_chain = LLMChain(
    llm=QianfanLLMEndpoint(temperature=0.9),
    prompt=first_prompt
)

# 第二条链：基于正式名字生成小名
second_prompt = PromptTemplate(
    input_variables=["child_name"],
    template="邻居的儿子名字叫{child_name}，给他起一个小名"
)
second_chain = LLMChain(
    llm=QianfanLLMEndpoint(temperature=0.9),
    prompt=second_prompt
)

# 组合两条链：自动将第一条链的输出作为第二条链的输入
# verbose=True: 显示详细的推理过程
overall_chain = SimpleSequentialChain(
    chains=[first_chain, second_chain],
    verbose=True
)

# 只需提供初始输入，链条自动执行
catchphrase = overall_chain.run("王")
print(catchphrase)
```

------

### 2.4 Agents（代理）

Agents 是 LangChain 最强大组件，能**自主决策**调用哪些工具，并观察执行结果，直到完成任务。

**核心概念**：

表格

复制

| 组件              | 功能                                     |
| :---------------- | :--------------------------------------- |
| **Agent**         | 制定计划，选择下一步行动，控制整体逻辑   |
| **Tool**          | 第三方工具集成（搜索、计算、代码执行等） |
| **Toolkit**       | 完成特定目标所需的工具组                 |
| **AgentExecutor** | 代理执行器，迭代运行代理直到满足停止条件 |

**支持的 Agent 类型**：

表格

复制

| Agent 类型                                    | 特点                               | 适用场景     |
| :-------------------------------------------- | :--------------------------------- | :----------- |
| `zero-shot-react-description`                 | 仅基于工具描述选择工具，无会话记忆 | 简单任务     |
| `structured-chat-zero-shot-react-description` | 支持多输入工具和结构化参数         | 复杂工具调用 |
| `conversational-react-description`            | 支持会话记忆，适合对话环境         | 聊天机器人   |

**⚠️ 示例：实时信息查询**

Python

复制

```python
# 安装依赖：pip install duckduckgo-search

import os
from langchain.agents import load_tools, initialize_agent, AgentType
from langchain_community.chat_models import QianfanChatEndpoint

# 配置API密钥
os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 初始化聊天模型
llm = QianfanChatEndpoint()

# 加载工具："ddg-search"（DuckDuckGo搜索）、"llm-math"（数学计算）
tools = load_tools(["ddg-search", "llm-math"], llm=llm)

# 初始化Agent
# agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION: 使用zero-shot策略
# verbose=True: 显示详细执行过程
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
    verbose=True
)

# 执行查询（Agent会自动判断需要调用搜索工具）
agent.run("中国目前有多少人口")

# 如需使用serpapi（Google搜索），需：
# 1. 申请 SERPAPI_API_KEY
# 2. 安装: pip install google-search-results
# 3. 使用 load_tools(["serpapi", "llm-math"], llm=llm)
```

**💡 查看所有可用工具**

Python

复制

```python
from langchain.agents import get_all_tool_names

# 获取所有内置工具名称列表
results = get_all_tool_names()
print(results)

# 常用工具：
# - ddg-search: DuckDuckGo搜索
# - serpapi: Google搜索API
# - llm-math: 数学计算
# - python_repl: Python代码执行
# - wikipedia: 维基百科查询
```

**LangChain 部分工具列表**：

表格

复制

| 工具              | 描述               |
| :---------------- | :----------------- |
| Bing Search       | Bing搜索引擎       |
| Google Search     | Google搜索引擎     |
| Google Serper API | Google搜索数据提取 |
| Python REPL       | 执行Python代码     |
| Wikipedia         | 维基百科检索       |
| Wolfram Alpha     | 数学计算与知识引擎 |

------

### 2.5 Memory（记忆）

Memory 组件为 LangChain 提供**上下文记忆能力**，模拟人类对话中的历史记录功能。

**记忆类型**：

- **短期记忆**：单一会话上下文传递
- **长期记忆**：跨会话信息存储与检索

**💡 示例：基础记忆存储**

Python

复制

```python
from langchain.memory import ChatMessageHistory

# 创建消息历史记录对象
history = ChatMessageHistory()

# 添加用户消息
history.add_user_message("在吗？")

# 添加AI回复
history.add_ai_message("有什么事？")

# 查看历史记录
print(history.messages)
# 输出: [HumanMessage(content='在吗？'), AIMessage(content='有什么事？')]
```

**💡 示例：带记忆的对话链**

Python

复制

```python
from langchain.chains import ConversationChain
from langchain_community.chat_models import QianfanChatEndpoint
import os

os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 创建对话链（自动管理历史消息）
llm = QianfanChatEndpoint()
conversation = ConversationChain(llm=llm)

# 第一轮对话
result1 = conversation.predict(input="小明有1只猫")
print(result1)

# 第二轮对话（模型能记住前文）
result2 = conversation.predict(input="小刚有2只狗")
print(result2)

# 提问涉及历史信息（模型自动整合上下文）
result3 = conversation.predict(input="小明和小刚一共有几只宠物？")
print(result3)
```

**💡 示例：历史消息持久化**

Python

复制

```python
from langchain.memory import ChatMessageHistory
from langchain.schema import messages_from_dict, messages_to_dict

# 创建并填充消息历史
history = ChatMessageHistory()
history.add_user_message("hi!")
history.add_ai_message("whats up?")

# 将消息序列化为字典（便于存储到文件或数据库）
dicts = messages_to_dict(history.messages)
print(dicts)
# 输出: [{'type': 'human', 'data': {'content': 'hi!', ...}}, ...]

# 从字典反序列化恢复消息
new_messages = messages_from_dict(dicts)
print(new_messages)
# 输出: [HumanMessage(content='hi!'), AIMessage(content='whats up?')]
```

------

### 2.6 Indexes（索引）

Indexes 组件提供**文档处理全流程能力**，包括加载、分割、存储和检索文档。

#### 2.6.1 文档加载器

支持多种文件格式，基于 `Unstructured` 包实现文件解析。

**💡 示例：加载文本文件**

Python

复制

```python
from langchain_community.document_loaders import UnstructuredFileLoader, TextLoader

# 方式一：使用通用加载器（自动识别格式）
loader = UnstructuredFileLoader('衣服属性.txt', encoding='utf8')
docs = loader.load()
print(f"文档数量: {len(docs)}")
print(f"前4个字符: {docs[0].page_content[:4]}")

# 方式二：使用专用加载器（性能更好）
loader = TextLoader('衣服属性.txt', encoding='utf8')
docs = loader.load()
print(f"文档数量: {len(docs)}")
print(f"前4个字符: {docs[0].page_content[:4]}")
```

**支持的文档加载器（部分）**：

表格

复制

| 加载器                | 支持的文件类型  |
| :-------------------- | :-------------- |
| CSV Loader            | `.csv` 文件     |
| JSON Loader           | `.json` 文件    |
| PDF Loader            | `.pdf` 文件     |
| Markdown Loader       | `.md` 文件      |
| HTML Loader           | `.html` 文件    |
| Image Loader          | 图片文件（OCR） |
| File Directory Loader | 整个目录        |

------

#### 2.6.2 文档分割器

将长文本按语义分割为小块，避免超过模型上下文限制。

**💡 示例：按字符长度分割**

Python

复制

```python
from langchain.text_splitter import CharacterTextSplitter

# 创建分割器实例
text_splitter = CharacterTextSplitter(
    separator=" ",        # 使用空格作为分隔符
    chunk_size=5,         # 每个块最大5个字符
    chunk_overlap=0,      # 块之间不重叠
)

# 分割单句文本
a = text_splitter.split_text("a b c d e f")
print(a)  # 输出: ['a b c', 'd e f']

# 批量分割多文档
texts = text_splitter.create_documents(
    ["a b c d e f", "e f g h"]
)
print(texts)  # 输出多个Document对象
```

**其他分割器类型**：

表格

复制

| 分割器                   | 适用场景     | 特点                   |
| :----------------------- | :----------- | :--------------------- |
| `LatexTextSplitter`      | LaTeX文档    | 按标题、枚举等结构分割 |
| `MarkdownTextSplitter`   | Markdown文档 | 按标题、代码块分割     |
| `PythonCodeTextSplitter` | Python代码   | 按类、函数定义分割     |
| `TokenTextSplitter`      | 通用文本     | 按OpenAI token数分割   |

------

#### 2.6.3 VectorStores（向量存储）

专门存储文本向量的数据库，支持相似度搜索。

**💡 示例：使用 Chroma 向量数据库**

Python

复制

```python
# 安装：pip install chromadb

import os
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import QianfanEmbeddingsEndpoint

# 配置API密钥
os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 1. 读取并分割文档
with open('./pku.txt') as f:
    state_of_the_union = f.read()

text_splitter = CharacterTextSplitter(chunk_size=100, chunk_overlap=0)
texts = text_splitter.split_text(state_of_the_union)

# 2. 初始化嵌入模型
embeddings = QianfanEmbeddingsEndpoint()

# 3. 创建向量存储并添加文档
docsearch = Chroma.from_texts(texts, embeddings)

# 4. 执行相似度搜索
query = "1937年北京大学发生了什么？"
docs = docsearch.similarity_search(query)
print(docs)
```

**支持的 VectorStores**：

表格

复制

| 向量数据库        | 特点                             |
| :---------------- | :------------------------------- |
| **Chroma**        | 开源嵌入式数据库，轻量级         |
| **FAISS**         | Facebook AI 相似性搜索，性能优异 |
| **Milvus**        | 企业级向量数据库，支持海量数据   |
| **Pinecone**      | 云原生向量数据库，功能丰富       |
| **ElasticSearch** | 传统搜索引擎扩展向量搜索         |

------

#### 2.6.4 Retrievers（检索器）

提供统一的检索接口，底层可对接不同向量数据库。

**💡 示例：基于 FAISS 的检索器**

Python

复制

```python
# 安装：pip install faiss-cpu

from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import QianfanEmbeddingsEndpoint
import os

os.environ['QIANFAN_AK'] = "SPPejIX4r2mEUdjdkVNwxTHc"
os.environ['QIANFAN_SK'] = "hOGdXomPZu8FRL51dkBZrEee4tqaS6PM"

# 1. 加载并分割文档
loader = TextLoader('./pku.txt')
documents = loader.load()
text_splitter = CharacterTextSplitter(chunk_size=100, chunk_overlap=0)
texts = text_splitter.split_documents(documents)

# 2. 创建FAISS向量存储
embeddings = QianfanEmbeddingsEndpoint()
db = FAISS.from_documents(texts, embeddings)

# 3. 转换为检索器（返回最相关1条结果）
retriever = db.as_retriever(search_kwargs={'k': 1})

# 4. 执行检索
docs = retriever.get_relevant_documents("北京大学什么时候成立的")
print(docs)
```

**支持的检索器**：

表格

复制

| 检索器                | 描述               |
| :-------------------- | :----------------- |
| VectorStore Retriever | 通用向量存储检索器 |
| ElasticSearch BM25    | 基于BM25算法的检索 |
| TF-IDF Retriever      | 传统TF-IDF检索     |
| Wikipedia Retriever   | 维基百科内容检索   |
| Arxiv Retriever       | 学术论文检索       |

------

## 3. LangChain 典型使用场景

表格

复制

| 场景           | 说明                         | 涉及组件                    |
| :------------- | :--------------------------- | :-------------------------- |
| **个人助手**   | 智能任务规划与执行           | Agents + Tools + Memory     |
| **知识库问答** | 基于私域文档的精准问答       | Indexes + Retrievers + LLMs |
| **聊天机器人** | 多轮对话交互                 | Chat Models + Memory        |
| **数据分析**   | Tabular数据查询与分析        | Agents + Python REPL        |
| **API 交互**   | 与外部API智能交互            | Agents + Requests           |
| **信息提取**   | 从非结构化文本提取结构化信息 | Prompts + LLMs              |
| **文档总结**   | 长文档自动摘要               | Indexes + Chains            |

------

## 4. 本章小结

本章系统介绍了 LangChain 框架的核心概念与六大组件：

1. **Models**：统一接口管理各类大模型
2. **Prompts**：提示词模板化与优化策略
3. **Memory**：上下文记忆能力
4. **Indexes**：文档处理全流程管道
5. **Chains**：组件编排与工作流
6. **Agents**：智能决策与工具调用

通过丰富的代码示例，展示了各组件的实际应用方法。LangChain 通过模块化设计，有效降低了大模型应用的开发门槛，是构建生产级 LLM 应用的理想框架。

**⚠️ 安全提示**：示例代码中的 API Key 为演示用途，实际使用时请妥善保管密钥，避免硬编码到源码中，建议使用环境变量或密钥管理服务。