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

Models 组件提供与各类模型的深度集成，并统一接口标准。目前支持 **三种模型类型**：LLMs、Chat Models、Embeddings Models。

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

| 消息类型        | 说明                           | 使用场景               |
| :-------------- | :----------------------------- | :--------------------- |
| `HumanMessage`  | 用户输入的消息                 | 用户提问、指令         |
| `AIMessage`     | AI 模型的回复                  | 模型回答、响应         |
| `SystemMessage` | 系统级提示，设定模型角色和环境 | 角色扮演、输出格式要求 |
| `ChatMessage`   | 通用消息类型（通常使用前三种） | 自定义场景             |

**💡 示例：生成唐诗**

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

#### 2.1.3 Prompt Templates（提示模板）

通过预定义模板，快速生成结构化提示词，确保输出格式符合预期。

**💡 示例：生成商品文案**

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

#### 2.1.4 Embeddings Models（嵌入模型）

将**文本**转换为**浮点数向量**，用于语义搜索、相似度计算等场景。

**💡 示例：文本向量化**

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

### 2.2 Prompts 组件

Prompts 组件用于管理和优化提示词，支持多种提示策略：

#### Zero-Shot 提示（零样本）

直接提问，不提供示例。

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
反义词: {antonym}\\n
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

### 2.3 Chains（链）

Chains 将多个组件（LLM、Prompt、工具等）组合成工作流，实现复杂任务编排。

**💡 示例：单链应用**

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

### 2.4 Agents（代理）

Agents 是 LangChain 最强大组件，能**自主决策**调用哪些工具，并观察执行结果，直到完成任务。

**核心概念**：

| 组件              | 功能                                     |
| :---------------- | :--------------------------------------- |
| **Agent**         | 制定计划，选择下一步行动，控制整体逻辑   |
| **Tool**          | 第三方工具集成（搜索、计算、代码执行等） |
| **Toolkit**       | 完成特定目标所需的工具组                 |
| **AgentExecutor** | 代理执行器，迭代运行代理直到满足停止条件 |

**支持的 Agent 类型**：

| Agent 类型                                    | 特点                               | 适用场景     |
| :-------------------------------------------- | :--------------------------------- | :----------- |
| `zero-shot-react-description`                 | 仅基于工具描述选择工具，无会话记忆 | 简单任务     |
| `structured-chat-zero-shot-react-description` | 支持多输入工具和结构化参数         | 复杂工具调用 |
| `conversational-react-description`            | 支持会话记忆，适合对话环境         | 聊天机器人   |

**⚠️ 示例：实时信息查询**

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

| 工具              | 描述               |
| :---------------- | :----------------- |
| Bing Search       | Bing搜索引擎       |
| Google Search     | Google搜索引擎     |
| Google Serper API | Google搜索数据提取 |
| Python REPL       | 执行Python代码     |
| Wikipedia         | 维基百科检索       |
| Wolfram Alpha     | 数学计算与知识引擎 |

### 2.5 Memory（记忆）

Memory 组件为 LangChain 提供**上下文记忆能力**，模拟人类对话中的历史记录功能。

**记忆类型**：

- **短期记忆**：单一会话上下文传递
- **长期记忆**：跨会话信息存储与检索

**💡 示例：基础记忆存储**

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

### 2.6 Indexes（索引）

Indexes 组件提供**文档处理全流程能力**，包括加载、分割、存储和检索文档。

#### 2.6.1 文档加载器

支持多种文件格式，基于 `Unstructured` 包实现文件解析。

**💡 示例：加载文本文件**

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

| 加载器                | 支持的文件类型  |
| :-------------------- | :-------------- |
| CSV Loader            | `.csv` 文件     |
| JSON Loader           | `.json` 文件    |
| PDF Loader            | `.pdf` 文件     |
| Markdown Loader       | `.md` 文件      |
| HTML Loader           | `.html` 文件    |
| Image Loader          | 图片文件（OCR） |
| File Directory Loader | 整个目录        |

#### 2.6.2 文档分割器

将长文本按语义分割为小块，避免超过模型上下文限制。

**💡 示例：按字符长度分割**

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
# [Document(page_content='a b c'), Document(page_content='d e f'), Document(page_content='e f g'), Document(page_content='h')]
```

**其他分割器类型**：

| 分割器                   | 适用场景     | 特点                   |
| :----------------------- | :----------- | :--------------------- |
| `LatexTextSplitter`      | LaTeX文档    | 按标题、枚举等结构分割 |
| `MarkdownTextSplitter`   | Markdown文档 | 按标题、代码块分割     |
| `PythonCodeTextSplitter` | Python代码   | 按类、函数定义分割     |
| `TokenTextSplitter`      | 通用文本     | 按OpenAI token数分割   |

#### 2.6.3 VectorStores（向量存储）

专门存储文本向量的数据库，支持相似度搜索。

**💡 示例：使用 Chroma 向量数据库**

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

| 向量数据库        | 特点                             |
| :---------------- | :------------------------------- |
| **Chroma**        | 开源嵌入式数据库，轻量级         |
| **FAISS**         | Facebook AI 相似性搜索，性能优异 |
| **Milvus**        | 企业级向量数据库，支持海量数据   |
| **Pinecone**      | 云原生向量数据库，功能丰富       |
| **ElasticSearch** | 传统搜索引擎扩展向量搜索         |

#### 2.6.4 Retrievers（检索器）

提供统一的检索接口，底层可对接不同向量数据库。

**💡 示例：基于 FAISS 的检索器**

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

| 检索器                | 描述               |
| :-------------------- | :----------------- |
| VectorStore Retriever | 通用向量存储检索器 |
| ElasticSearch BM25    | 基于BM25算法的检索 |
| TF-IDF Retriever      | 传统TF-IDF检索     |
| Wikipedia Retriever   | 维基百科内容检索   |
| Arxiv Retriever       | 学术论文检索       |



## 3. LangChain 典型使用场景

| 场景           | 说明                         | 涉及组件                    |
| :------------- | :--------------------------- | :-------------------------- |
| **个人助手**   | 智能任务规划与执行           | Agents + Tools + Memory     |
| **知识库问答** | 基于私域文档的精准问答       | Indexes + Retrievers + LLMs |
| **聊天机器人** | 多轮对话交互                 | Chat Models + Memory        |
| **数据分析**   | Tabular数据查询与分析        | Agents + Python REPL        |
| **API 交互**   | 与外部API智能交互            | Agents + Requests           |
| **信息提取**   | 从非结构化文本提取结构化信息 | Prompts + LLMs              |
| **文档总结**   | 长文档自动摘要               | Indexes + Chains            |



## 4 项目背景

### 4.1 问题现状

当前主流大语言模型存在两个核心痛点：

1. **知识时效性受限**：训练数据截止于特定时间点，无法获取最新信息
2. **企业知识隔离**：无法直接访问企业内部私有数据

### 4.2 解决方案对比

| 方案            | 优点                           | 缺点                   | 适用场景               |
| :-------------- | :----------------------------- | :--------------------- | :--------------------- |
| **模型微调**    | 知识深度融入模型               | 训练成本高、更新周期长 | 领域知识稳定且广泛     |
| **RAG检索增强** | 实时更新、成本低廉、可解释性强 | 依赖检索质量           | 动态知识库、私有化部署 |

**本项目采用RAG方案**，以电商服装商品知识为例，实现基于本地知识的智能问答。



## 5 核心架构

### 5.1 技术原理

```Mermaid
graph TD
    A[用户提问] --> B[问题向量化]
    B --> C[Faiss相似度检索]
    D[本地文档] --> E[文本分割]
    E --> F[文档向量化]
    F --> G[构建向量索引]
    C --> H[提取Top-K上下文]
    G --> C
    H --> I[Prompt模板拼接]
    I --> J[ChatGLM生成答案]
```



**流程说明**：

1. 加载并解析本地文档（如`.txt`文件）
2. 将文档分割为合适粒度的文本块
3. 使用Embedding模型将文本转为向量
4. 构建Faiss向量索引库
5. 用户提问时，将问题向量化并在索引中检索最相关的文本块
6. 将检索到的上下文与问题组合，通过Prompt模板提交给LLM生成最终答案

### 5.2 核心功能

| 功能模块       | 技术实现          | 关键特性               |
| :------------- | :---------------- | :--------------------- |
| **知识检索**   | LangChain + Faiss | 支持海量向量高效检索   |
| **大模型集成** | 自定义LLM封装类   | 兼容LangChain生态      |
| **私有化部署** | 本地模型加载      | 数据完全隔离，安全可靠 |



## 6 环境配置

### 6.1 依赖安装

⚠️ **环境要求**：Python 3.8 - 3.11

```bash
# 检查Python版本
python --version

# 安装核心依赖库
pip install faiss-cpu       # Facebook开源的高性能向量检索库
pip install langchain       # LLM应用开发框架
pip install qianfan         # 千帆大模型平台SDK（备用）
```

💡 **建议**：建议使用虚拟环境（venv或conda）隔离项目依赖

### 6.2 模型准备

本项目需下载两个核心模型：

| 模型类型          | 模型名称   | 下载地址                                                    | 用途       |
| :---------------- | :--------- | :---------------------------------------------------------- | :--------- |
| **LLM模型**       | ChatGLM-6B | [THUDM/chatglm-6b](https://huggingface.co/THUDM/chatglm-6b) | 答案生成   |
| **Embedding模型** | m3e-base   | [moka-ai/m3e-base](https://huggingface.co/moka-ai/m3e-base) | 文本向量化 |



## 7 代码实现

### 7.1 自定义LLM封装类

**文件路径**：`Knowledge_QA/model.py`

```python
# -*- coding: utf-8 -*-
"""
自定义LLM封装模块
本模块将本地ChatGLM模型封装为LangChain兼容的LLM接口，
便于与LangChain的Chain、Agent等组件无缝集成
"""

from langchain.llms.base import LLM                   # LangChain大模型基类
from langchain.llms.utils import enforce_stop_tokens  # 强制停止token工具
from transformers import AutoTokenizer, AutoModel     # HuggingFace transformers库
from typing import List, Optional                     # 类型注解

# ============================================================================
# 自定义ChatGLM2 LLM类
# 功能：封装本地ChatGLM-6B模型，实现LangChain LLM接口规范
# ============================================================================
class ChatGLM2(LLM):
    """自定义ChatGLM2 LLM封装类"""
    
    # 模型参数配置
    max_token: int = 4096          # 最大生成长度，防止输出过长
    temperature: float = 0.8       # 生成随机性，值越小确定性越高
    top_p: float = 0.9             # 核采样参数，控制生成多样性
    
    # 模型实例（延迟加载）
    tokenizer: object = None       # 分词器实例
    model: object = None           # 模型实例
    history: list = []             # 对话历史记录

    def __init__(self):
        """初始化方法，调用父类构造函数"""
        super().__init__()

    @property
    def _llm_type(self) -> str:
        """
        返回LLM类型标识符
        LangChain内部使用该属性识别模型类型
        """
        return "ChatGLM2"

    # ------------------------------------------------------------------------
    # 模型加载方法
    # 参数:
    #   model_path: str - 本地模型路径（如"./models/chatglm-6b"）
    # ------------------------------------------------------------------------
    def load_model(self, model_path: str = None):
        """
        加载本地ChatGLM模型
        包含分词器和模型权重，支持trust_remote_code以加载自定义模型结构
        """
        print(f"正在加载模型: {model_path}")
        
        # 加载分词器，trust_remote_code=True允许执行远程代码（ChatGLM需要）
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_path, 
            trust_remote_code=True
        )
        
        # 加载模型并转为float32精度，确保计算稳定性
        self.model = AutoModel.from_pretrained(
            model_path, 
            trust_remote_code=True
        ).float()
        
        # 设置为评估模式，关闭dropout等训练相关层
        self.model.eval()
        print("模型加载完成")

    # ------------------------------------------------------------------------
    # 模型推理方法（LangChain核心接口）
    # 参数:
    #   prompt: str - 输入文本
    #   stop: Optional[List[str]] - 停止词列表
    # 返回:
    #   str - 模型生成的答案
    # ------------------------------------------------------------------------
    def _call(self, prompt: str, stop: Optional[List[str]] = None) -> str:
        """
        执行模型推理，生成回答
        该方法被LangChain自动调用，需符合其接口规范
        """
        
        # 调用ChatGLM的chat方法进行对话生成
        # history参数传入对话历史，实现多轮对话能力
        response, _ = self.model.chat(
            self.tokenizer,           # 分词器实例
            prompt,                   # 输入提示
            history=self.history,     # 对话历史
            max_length=self.max_token, # 最大生成长度限制
            temperature=self.temperature,  # 随机性控制
            top_p=self.top_p          # 核采样参数
        )
        
        # 处理停止词，确保输出在指定位置终止
        if stop is not None:
            response = enforce_stop_tokens(response, stop)
        
        # 更新对话历史（None表示用户消息未知，仅记录助手回复）
        self.history = self.history + [[None, response]]
        
        return response

# ============================================================================
# 使用示例（在main.py中）
# ============================================================================
if __name__ == "__main__":
    # 实例化自定义LLM
    llm = ChatGLM2()
    
    # 加载本地模型（需先下载模型文件）
    llm.load_model("/path/to/chatglm-6b")
    
    # 直接调用生成
    result = llm("请介绍一下人工智能")
    print(result)
```



### 7.2 向量库构建模块

**文件路径**：`Knowledge_QA/get_vector.py`

```python
# -*- coding: utf-8 -*-
"""
向量库构建模块
功能：将本地文档转换为向量索引，持久化存储到FAISS
流程：加载文档 → 文本分割 → 向量化 → 构建索引
"""

from langchain.document_loaders import UnstructuredFileLoader      # 非结构化文件加载器
from langchain.text_splitter import RecursiveCharacterTextSplitter # 递归字符分割器
from langchain.embeddings.huggingface import HuggingFaceEmbeddings # HuggingFace Embedding
from langchain.vectorstores import FAISS                           # FAISS向量数据库


# ------------------------------------------------------------------------
# 主函数：构建向量索引全流程
# 输入: 本地文档文件（如"衣服属性.txt"）
# 输出: FAISS向量索引（存储在./faiss/product目录）
# ------------------------------------------------------------------------
def main():
    """构建FAISS向量索引的主流程函数"""
    
    # ==================== 第一步：定义Embedding模型 ====================
    # 使用m3e-base模型生成文本向量（768维）
    # 该模型在中文语义理解上表现优异，适合电商等垂直领域
    EMBEDDING_MODEL = "moka-ai/m3e-base"
    
    # ==================== 第二步：加载原始文档 ====================
    # UnstructuredFileLoader支持多种文件格式（txt, pdf, docx等）
    # 自动提取文本内容并封装为Document对象
    print("正在加载文档...")
    loader = UnstructuredFileLoader("衣服属性.txt")  # 本地知识文件路径
    
    # 执行加载，返回Document对象列表
    # 每个Document包含page_content（文本内容）和metadata（元数据）
    data = loader.load()
    print(f'文档加载完成，共 {len(data)} 个Document对象')
    
    # ==================== 第三步：文本分割处理 ====================
    # RecursiveCharacterTextSplitter按字符递归分割，确保语义完整性
    # chunk_size: 每个文本块的最大长度（100字符）
    # chunk_overlap: 块间重叠字符数（0表示不重叠）
    # 重叠设计可避免关键信息被截断
    print("正在分割文本...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=100,    # 块大小：约50个汉字，适合短文本检索
        chunk_overlap=0    # 无重叠，避免冗余信息
    )
    
    # 执行分割，得到更细粒度的Document列表
    split_docs = text_splitter.split_documents(data)
    print(f'文本分割完成，共 {len(split_docs)} 个文本块')
    
    # ==================== 第四步：初始化Embedding模型 ====================
    # HuggingFaceEmbeddings封装了模型的加载和向量化逻辑
    # model_name支持本地路径或HuggingFace Hub模型ID
    print("正在加载Embedding模型...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    print("Embedding模型加载完成")
    
    # ==================== 第五步：构建FAISS向量索引 ====================
    # FAISS.from_documents自动完成：
    # 1. 调用embeddings将每个文档块转为向量
    # 2. 构建高效的相似度检索索引（默认使用L2距离）
    # 3. 返回VectorStore对象
    print("正在构建FAISS索引...")
    db = FAISS.from_documents(split_docs, embeddings)
    
    # 持久化存储到本地磁盘
    # save_local会保存索引文件和对应的文档映射
    # 后续可直接加载，无需重复计算向量
    db.save_local("./faiss/product")
    print("FAISS索引已保存至 ./faiss/product")
    
    return split_docs


# ------------------------------------------------------------------------
# 模块入口：执行时自动运行
# ------------------------------------------------------------------------
if __name__ == '__main__':
    # 执行主流程
    result = main()
    
    # 打印分割后的文档示例（调试用）
    print("\n前3个文本块示例:")
    for i, doc in enumerate(result[:3]):
        print(f"\n--- 块{i+1} ---")
        print(doc.page_content[:50] + "...")
```



### 7.3 问答主逻辑

**文件路径**：`Knowledge_QA/main.py`

```python
# -*- coding: utf-8 -*-
"""
主问答模块
功能：接收用户问题，检索相关知识，调用LLM生成答案
流程：加载索引 → 检索相似文本 → 构建Prompt → LLM生成
"""

from langchain import PromptTemplate              # Prompt模板管理
from get_vector import *                          # 导入向量构建模块（获取embeddings和FAISS）
from model import ChatGLM2                        # 导入自定义LLM类


# ==================== 全局配置：加载FAISS向量库 ====================
# Embedding模型必须与构建索引时完全一致，否则向量空间不匹配
EMBEDDING_MODEL = "moka-ai/m3e-base"              # Embedding模型标识
embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)  # 实例化Embedding

# 从本地加载FAISS索引，需指定embeddings用于查询时的问题向量化
# 加载路径需与get_vector.py中的save_local路径一致
db = FAISS.load_local("./faiss/product", embeddings)


# ------------------------------------------------------------------------
# 辅助函数：提取相关文档内容
# 参数:
#   related_docs: List[Document] - 检索到的文档对象列表
# 返回:
#   str - 拼接后的纯文本内容
# ------------------------------------------------------------------------
def get_related_content(related_docs):
    """
    将检索到的Document对象列表转换为纯文本字符串
    用于后续Prompt模板填充
    """
    related_content = []
    for doc in related_docs:
        # 提取page_content并清理多余换行符
        # 将双换行符替换为单换行，使格式更紧凑
        clean_content = doc.page_content.replace("\n\n", "\n")
        related_content.append(clean_content)
    
    # 使用换行符连接各文本块，在Prompt中形成清晰段落
    return "\n".join(related_content)


# ------------------------------------------------------------------------
# 辅助函数：定义Prompt模板
# 参数: 无（内部使用全局db）
# 返回: str - 格式化后的Prompt字符串
# ------------------------------------------------------------------------
def define_prompt():
    """
    定义RAG Prompt模板并填充上下文
    包含检索逻辑，是RAG的核心环节
    """
    
    # ==================== 用户问题定义 ====================
    # 实际应用中，此处应接收外部输入（如API请求参数）
    question = '我身高170，体重140斤，买多大尺码？'
    
    # ==================== 向量相似度检索 ====================
    # similarity_search执行：
    # 1. 将question向量化
    # 2. 在FAISS索引中查找最相似的k个文档块
    # 3. 返回Document对象列表，按相似度排序
    # k=1表示只取最相关的一个文本块，控制上下文长度
    docs = db.similarity_search(question, k=1)
    print(f"检索到 {len(docs)} 个相关文本块")
    
    # ==================== 上下文提取 ====================
    # 将检索结果转换为纯文本格式
    related_content = get_related_content(docs)
    print(f"上下文内容:\n{related_content}\n")
    
    # ==================== Prompt模板定义 ====================
    # 模板设计原则：
    # 1. 明确角色定位（简洁专业的助手）
    # 2. 严格约束（禁止编造）
    # 3. 清晰结构（已知内容 vs 问题）
    # 4. 使用{context}和{question}作为动态占位符
    PROMPT_TEMPLATE = """
【角色】
你是一个基于已知信息的智能问答助手，回答必须简洁、专业。

【约束】
1. 严格基于提供的"已知内容"回答
2. 若信息不足，请明确说明"根据现有信息无法确定"
3. 禁止编造、推测或添加无关信息

【已知内容】
{context}

【问题】
{question}

【回答】
"""
    
    # ==================== Prompt实例化 ====================
    # PromptTemplate是LangChain的模板管理类
    # input_variables定义模板中的变量名，必须与模板中的{}占位符一致
    prompt = PromptTemplate(
        input_variables=["context", "question"],  # 模板变量列表
        template=PROMPT_TEMPLATE,                 # 模板字符串
    )
    
    # ==================== Prompt填充 ====================
    # format方法将变量值填充到模板中，生成最终Prompt
    # 这是LangChain的推荐用法，避免手动字符串拼接
    my_pmt = prompt.format(
        context=related_content,  # 检索到的上下文
        question=question           # 用户问题
    )
    
    print("="*50)
    print("最终Prompt:")
    print(my_pmt)
    print("="*50)
    
    return my_pmt


# ------------------------------------------------------------------------
# 主问答函数：执行端到端问答
# 返回: str - 模型生成的答案
# ------------------------------------------------------------------------
def qa():
    """
    端到端问答流程
    整合LLM加载、Prompt构建、模型推理全流程
    """
    
    # ==================== LLM初始化与加载 ====================
    # 实例化自定义的ChatGLM2类
    llm = ChatGLM2()
    
    # 加载本地模型权重（路径需替换为实际路径）
    # ⚠️ 注意：需确保模型文件已完整下载
    model_path = "/Users/your_name/PycharmProjects/llm/ChatGLM-6B/THUDM/chatglm-6b"
    print(f"从 {model_path} 加载模型...")
    llm.load_model(model_path)
    
    # ==================== Prompt构建 ====================
    # 调用define_prompt完成检索和模板填充
    my_pmt = define_prompt()
    
    # ==================== 模型推理 ====================
    # 调用llm实例的__call__方法执行推理
    # 返回生成的答案字符串
    print("正在生成答案...")
    result = llm(my_pmt)
    
    return result


# ------------------------------------------------------------------------
# 程序入口
# ------------------------------------------------------------------------
if __name__ == '__main__':
    try:
        # 执行问答流程
        answer = qa()
        
        # 打印最终答案
        print("\n" + "="*50)
        print("最终答案:")
        print(answer)
        print("="*50)
        
    except Exception as e:
        # 异常处理，提供友好错误提示
        print(f"执行出错: {str(e)}")
        print("请检查:")
        print("1. 模型路径是否正确")
        print("2. FAISS索引是否存在")
        print("3. 显存是否充足")
```



## 8 运行效果

### 8.1 测试结果示例

```bash
检索到 1 个相关文本块
上下文内容:
尺码表: S码-胸围88cm 衣长62cm, M码-胸围92cm 衣长64cm,
L码-胸围96cm 衣长66cm, XL码-胸围100cm 衣长68cm,
XXL码-胸围104cm 衣长70cm。建议身高170cm、体重140斤选择L码。

==================================================
最终Prompt:
【角色】
你是一个基于已知信息的智能问答助手，回答必须简洁、专业。

【约束】
1. 严格基于提供的"已知内容"回答
2. 若信息不足，请明确说明"根据现有信息无法确定"
3. 禁止编造、推测或添加无关信息

【已知内容】
尺码表: S码-胸围88cm 衣长62cm, M码-胸围92cm 衣长64cm,
L码-胸围96cm 衣长66cm, XL码-胸围100cm 衣长68cm,
XXL码-胸围104cm 衣长70cm。建议身高170cm、体重140斤选择L码。

【问题】
我身高170，体重140斤，买多大尺码？

【回答】
==================================================
最终答案:
根据尺码表信息，建议您选择L码。该尺码适合身高170cm、体重140斤的用户。
```

💡 **效果验证**：系统成功从本地知识库中提取尺码建议，并基于RAG原理生成准确回答，未出现幻觉现象。



## 9 总结与最佳实践

### 9.1 项目优势

| 特性         | 实现方式                 | 收益                   |
| :----------- | :----------------------- | :--------------------- |
| **数据私有** | 本地部署                 | 知识安全，满足合规要求 |
| **知识动态** | 更新文档重建索引即可     | 分钟级知识迭代         |
| **成本可控** | 开源模型+CPU/GPU混合部署 | 无需持续调用API        |
| **可解释性** | 返回引用来源             | 答案可追溯，可信度高   |

### 9.2 调优建议

1. **文档质量**：确保原始知识文档结构清晰、信息准确
2. **分块策略**：根据文档长度调整`chunk_size`（建议50-500字符）
3. **检索精度**：调整`k`值（1-5）平衡上下文完整性与噪音
4. **Prompt工程**：根据业务场景优化模板，强化角色约束
5. **模型选择**：可替换为ChatGLM-6B-int4量化版，降低显存占用