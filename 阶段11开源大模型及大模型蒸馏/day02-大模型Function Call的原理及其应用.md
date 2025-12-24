## 1. 什么是Function Call

### 1.1 核心概念

Function Call（函数调用）是OpenAI于2023年6月13日公布的重要功能，它允许开发者向GPT-4和GPT-3.5-turbo模型描述自定义函数，模型能够智能判断何时需要调用这些函数，并生成符合函数参数规范的JSON对象。

🔑 **关键价值**：Function Call让大模型能够可靠地与外部工具、API和数据源进行连接，极大扩展了AI应用的能力边界。

### 1.2 解决的核心问题

表格

复制

| 问题类型       | 具体表现                             | Function Call解决方案       |
| :------------- | :----------------------------------- | :-------------------------- |
| **信息实时性** | 训练数据有截止时间，无法获取最新信息 | 实时调用外部API获取最新数据 |
| **数据局限性** | 知识覆盖有限，专业领域信息不足       | 连接专业数据库和知识库      |
| **功能扩展性** | 内置功能无法满足所有需求             | 灵活集成外部工具和计算能力  |

### 1.3 支持模型

目前支持Function Call的主流模型包括：

- OpenAI GPT系列（GPT-4、GPT-3.5-turbo）
- 百度文心一言
- 智谱ChatGLM3-6B / GLM-4
- 讯飞星火3.0及以上版本

------

## 2. Function Call 工作原理

### 2.1 无Function Call的传统模式

plaintext

复制

```plaintext
用户 → 应用服务 → GPT模型 → 应用服务 → 用户
```

💡 **特点**：单向交互，模型仅基于训练知识生成文本回复

### 2.2 有Function Call的增强模式

plaintext

复制

```plaintext
用户 → 应用服务 → GPT模型 → [判断是否需要调用函数]
   ↓
   [如需调用] → 返回函数名+参数 → 应用服务执行函数 → 返回结果给GPT
   ↓
GPT → 生成最终回复 → 应用服务 → 用户
```

⚠️ **重要提示**：大模型**不会直接执行任何函数**，仅返回调用函数所需的参数。开发者需要在应用中自行执行函数调用。

------

## 3. Function Call 实践应用：天气查询助手

### 3.1 项目概述

构建一个能够查询实时天气的智能助手，支持用户通过自然语言查询任意城市的天气信息。

### 3.2 实现步骤

#### 步骤1：定义外部函数

Python

复制

```python
# tools.py
import json
import requests

def get_current_weather(location: str) -> str:
    """
    查询指定城市的当前天气信息
    
    参数:
        location: 城市名称（如"北京"、"上海"）
        
    返回:
        JSON格式的天气信息字符串，包含城市名、温度、天气类型等
    """
    # 加载城市编码映射数据（天气API需要使用城市编码查询）
    with open('./cityCode_use.json', 'r', encoding='utf-8') as file:
        city_data = json.load(file)
    
    # 查找对应城市的编码
    city_code = ""
    for city_info in city_data:
        if location == city_info["市名"]:
            city_code = city_info["编码"]
            break
    
    # 如果找到城市编码，调用天气API获取数据
    if city_code:
        weather_url = f"http://t.weather.itboy.net/api/weather/city/{city_code}"
        response = requests.get(weather_url)
        result = response.json()
        
        # 提取今日天气预报信息
        forecast = result["data"]["forecast"][0]
        weather_info = {
            "location": location,
            "high_temperature": forecast["high"],  # 最高温度
            "low_temperature": forecast["low"],    # 最低温度
            "week": forecast["week"],              # 星期几
            "type": forecast["type"],              # 天气类型（晴、雨等）
        }
        return json.dumps(weather_info, ensure_ascii=False)
    
    return json.dumps({"error": "未找到该城市信息"}, ensure_ascii=False)
```

#### 步骤2：描述函数功能

Python

复制

```python
# tools.py
# 定义工具函数列表，用于向模型描述可调用的函数
tools = [
    {
        "type": "function",  # 固定值为function
        "function": {
            "name": "get_current_weather",  # 函数名称，必须唯一
            "description": "获取给定位置的当前天气",  # 函数功能描述，模型根据此决定是否调用
            "parameters": {  # 参数定义，使用JSON Schema格式
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",  # 参数类型
                        "description": "城市或区，例如北京、海淀",  # 参数说明
                    },
                },
                "required": ["location"],  # 必填参数列表
            },
        }
    }
]
```

#### 步骤3：模型应用实现

Python

复制

```python
# main.py
import os
from dotenv import load_dotenv, find_dotenv
from zhipuai import ZhipuAI
from tools import *  # 导入工具函数和tools定义

# 加载环境变量中的API密钥
_ = load_dotenv(find_dotenv())
ZHIPU_API_KEY = os.environ['zhupu_api']

# 创建智谱AI客户端实例
client = ZhipuAI(api_key=ZHIPU_API_KEY)

def chat_completion_request(messages, tools=None, tool_choice=None, model="glm-4"):
    """
    调用大模型生成回复
    
    参数:
        messages: 对话历史消息列表
        tools: 可用工具函数列表
        tool_choice: 工具选择策略（auto/none/指定函数）
        model: 模型名称
        
    返回:
        模型响应对象
    """
    try:
        response = client.chat.completions.create(
            model=model,
            messages=messages,  # 对话上下文
            tools=tools,        # 传入工具函数定义
            tool_choice=tool_choice,  # 工具选择策略
        )
        return response
    except Exception as e:
        print(f"生成回复失败: {e}")
        return None

def parse_function_call(response):
    """
    解析模型返回的函数调用请求，执行对应函数
    
    参数:
        response: 模型响应对象
        
    返回:
        函数执行结果
    """
    # 提取助手消息
    assistant_message = response.choices[0].message
    
    # 检查是否包含工具调用
    if assistant_message.tool_calls:
        # 定义可用的函数映射表
        available_functions = {
            "get_current_weather": get_current_weather,
        }
        
        # 获取要调用的函数信息
        function_call = assistant_message.tool_calls[0]
        function_name = function_call.function.name
        
        # 获取函数参数并执行
        function_args = json.loads(function_call.function.arguments)
        function_to_call = available_functions[function_name]
        function_response = function_to_call(**function_args)
        
        return function_response
    
    return None

def main():
    """
    主函数：实现完整的Function Call交互流程
    """
    # 初始化对话消息列表
    messages = [
        {
            "role": "system",
            "content": "你是一个天气播报小助手，需要根据用户提供的地址回答当地天气情况。如果用户输入不明确，请提示用户明确输入，不要编造信息。"
        },
        {
            "role": "user", 
            "content": "今天北京的天气如何？"
        }
    ]
    
    # 第一次调用模型：分析用户意图，决定是否需要调用函数
    print("第一次调用模型...")
    first_response = chat_completion_request(
        messages, 
        tools=tools, 
        tool_choice="auto"  # 让模型自动决定是否调用函数
    )
    
    # 检查模型是否要求调用函数
    if first_response.choices[0].message.tool_calls:
        # 提取函数调用信息
        tool_call = first_response.choices[0].message.tool_calls[0]
        function_name = tool_call.function.name
        function_id = tool_call.id
        
        print(f"模型决定调用函数: {function_name}")
        
        # 执行函数调用
        function_response = parse_function_call(first_response)
        print(f"函数返回结果: {function_response}")
        
        # 将模型回复加入对话历史
        messages.append(first_response.choices[0].message.model_dump())
        
        # 将函数执行结果作为工具消息加入对话
        messages.append({
            "role": "tool",
            "tool_call_id": function_id,
            "name": function_name,
            "content": function_response,
        })
        
        # 第二次调用模型：基于函数结果生成自然语言回复
        print("第二次调用模型...")
        final_response = chat_completion_request(
            messages, 
            tools=tools, 
            tool_choice="auto"
        )
        
        # 输出最终回复
        final_message = final_response.choices[0].message
        print(f"最终回复: {final_message.content}")

if __name__ == '__main__':
    main()
```

#### 步骤4：数据文件准备

JSON

复制

```json
// cityCode_use.json
// 城市名称到天气API编码的映射表
[
  {
    "市名": "北京",
    "编码": "101010100"
  },
  {
    "市名": "昌平",
    "编码": "101010700"
  }
  // ... 更多城市数据
]
```

------

## 4. 多函数协同应用：航班查询系统

### 4.1 应用场景

构建一个能够查询航班信息及票价的智能助手，需要**顺序调用**两个函数：

1. 先查询航班号
2. 再查询该航班的票价

### 4.2 完整实现

Python

复制

```python
# airplane_function_tools.py
# 定义航班查询相关的工具函数

# 工具函数列表
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_plane_number",  # 查询航班号函数
            "description": "根据始发地、目的地和日期，查询对应日期的航班号",
            "parameters": {
                "type": "object",
                "properties": {
                    "start": {"description": "出发地", "type": "string"},
                    "end": {"description": "目的地", "type": "string"},
                    "date": {"description": "日期", "type": "string"},
                },
                "required": ["start", "end", "date"]
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_ticket_price",  # 查询票价函数
            "description": "查询某航班在某日的价格",
            "parameters": {
                "type": "object",
                "properties": {
                    "number": {"description": "航班号", "type": "string"},
                    "date": {"description": "日期", "type": "string"},
                },
                "required": ["number", "date"]
            },
        }
    },
]
```

Python

复制

```python
# muti_utils.py
# 工具函数实现

def get_plane_number(date: str, start: str, end: str) -> dict:
    """
    模拟查询航班号
    实际应用中应调用真实航班API
    """
    # 模拟航班数据
    plane_number = {
        "北京": {"深圳": "126", "广州": "356"},
        "郑州": {"北京": "1123", "天津": "3661"},
    }
    return {"date": date, "number": plane_number[start][end]}


def get_ticket_price(date: str, number: str) -> dict:
    """
    模拟查询票价
    实际应用中应调用真实票价API
    """
    return {"ticket_price": "668"}  # 模拟固定票价


def parse_function_call(model_response) -> dict:
    """
    统一解析函数调用请求
    
    参数:
        model_response: 模型响应对象
        
    返回:
        函数执行结果
    """
    # 检查是否存在工具调用
    if model_response.choices[0].message.tool_calls:
        tool_call = model_response.choices[0].message.tool_calls[0]
        args = tool_call.function.arguments
        
        # 根据函数名分发到具体实现
        if tool_call.function.name == "get_plane_number":
            return get_plane_number(**json.loads(args))
        if tool_call.function.name == "get_ticket_price":
            return get_ticket_price(**json.loads(args))
    
    return {}
```

Python

复制

```python
# muti_function_zhipu.py
# 主程序：处理多步函数调用逻辑

def main():
    messages = [
        {
            "role": "system",
            "content": "你是一个航班查询助手，将根据用户问题提供答案。不要假设或猜测参数值，如信息不明确请要求用户补充。"
        },
        {
            "role": "user",
            "content": "帮我查询2024年4月2日，郑州到北京的航班票价"
        }
    ]
    
    # 第一步：查询航班号
    first_response = chat_completion_request(messages, tools=tools)
    messages.append(first_response.choices[0].message.model_dump())
    
    # 执行函数调用并添加结果
    first_function_result = parse_function_call(first_response)
    tool_call = first_response.choices[0].message.tool_calls[0]
    messages.append({
        "role": "tool",
        "tool_call_id": tool_call.id,
        "content": str(json.dumps(first_function_result))
    })
    
    # 第二步：查询票价
    second_response = chat_completion_request(messages, tools=tools)
    messages.append(second_response.choices[0].message.model_dump())
    
    # 执行票价查询
    second_function_result = parse_function_call(second_response)
    tool2_call = second_response.choices[0].message.tool_calls[0]
    messages.append({
        "role": "tool",
        "tool_call_id": tool2_call.id,
        "content": str(json.dumps(second_function_result))
    })
    
    # 第三步：生成最终回复
    final_response = chat_completion_request(messages, tools=tools)
    print(f"最终答案: {final_response.choices[0].message.content}")
```

------

## 5. 数据库查询应用：SQL智能助手

### 5.1 应用场景

通过自然语言查询数据库，实现"一句话查数据"的智能体验。

### 5.2 核心实现

Python

复制

```python
# sql_function_tools.py
# SQL查询工具定义

# 数据库表结构定义（多表关联）
database_schema_string = """
CREATE TABLE `emp` (
  `empno` int DEFAULT NULL COMMENT '员工编号',
  `ename` varchar(50) DEFAULT NULL COMMENT '员工姓名',
  `job` varchar(50) DEFAULT NULL COMMENT '员工工作',
  `mgr` int DEFAULT NULL COMMENT '员工领导',
  `hiredate` date DEFAULT NULL COMMENT '员工入职日期',
  `sal` int DEFAULT NULL COMMENT '员工月薪',
  `comm` int DEFAULT NULL COMMENT '员工年终奖',
  `deptno` int DEFAULT NULL COMMENT '员工部门编号'
);

CREATE TABLE `dept` (
  `deptno` int NOT NULL COMMENT '部门编码',
  `dname` varchar(14) DEFAULT NULL COMMENT '部门名称',
  `loc` varchar(13) DEFAULT NULL COMMENT '地点',
  PRIMARY KEY (`deptno`)
);
"""

# 工具定义
tools = [
    {
        "type": "function",
        "function": {
            "name": "ask_database",
            "description": "使用此函数回答业务问题，要求输出是一个SQL查询语句",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": f"SQL查询提取信息以回答用户的问题。SQL应基于以下数据库模式编写:{database_schema_string}。查询应以纯文本返回，使用MySQL语法。"
                    }
                },
                "required": ["query"]
            },
        }
    }
]

def ask_database(query: str):
    """
    连接MySQL数据库并执行查询
    
    参数:
        query: SQL查询语句
        
    返回:
        查询结果元组
    """
    # 连接数据库（需配置实际连接信息）
    conn = pymysql.connect(
        host='localhost',
        port=3306,
        user='your_username',
        password='your_password',
        database='your_database',
        charset='utf8mb4'
    )
    
    try:
        cursor = conn.cursor()
        cursor.execute(query)
        result = cursor.fetchall()
        return result
    finally:
        cursor.close()
        conn.close()
```

Python

复制

```python
# sql_zhipu.py
# SQL查询主程序

def main():
    messages = [
        {
            "role": "system",
            "content": "通过针对业务数据库生成SQL查询来回答用户的问题"
        },
        {
            "role": "user",
            "content": "查询一下最高工资的员工姓名及对应的工资"
        }
    ]
    
    # 模型生成SQL
    response = chat_completion_request(messages, tools=tools)
    sql_query = json.loads(response.choices[0].message.tool_calls[0].function.arguments)['query']
    print(f"生成的SQL: {sql_query}")
    
    # 执行SQL并返回结果
    db_result = ask_database(sql_query)
    
    # 将结果反馈给模型生成自然语言回复
    # ...（同前文模式）
```

------

## 6. 关键参数说明

### 6.1 `tool_choice` 控制策略

表格

复制

| 参数值                  | 行为描述                     | 适用场景       |
| :---------------------- | :--------------------------- | :------------- |
| `auto`（默认）          | 模型自动判断是否需要调用函数 | 大多数场景     |
| `none`                  | 强制不调用任何函数           | 纯文本对话场景 |
| `{"name": "func_name"}` | 强制调用指定函数             | 确定性任务流程 |

### 6.2 工具定义参数结构

表格

复制

| 参数                   | 类型   | 必填 | 说明                      |
| :--------------------- | :----- | :--- | :------------------------ |
| `type`                 | String | 是   | 固定值为 `"function"`     |
| `function.name`        | String | 是   | 函数名称，需唯一          |
| `function.description` | String | 是   | 功能描述，影响模型决策    |
| `function.parameters`  | Object | 是   | JSON Schema格式的参数定义 |
| `function.required`    | Array  | 否   | 必填参数名称列表          |

------

## 7. 最佳实践与注意事项

### 7.1 开发建议

💡 **函数设计原则**

- **原子性**：每个函数只做一件事，便于模型组合调用
- **描述清晰**：函数描述要准确、完整，包含使用场景
- **参数明确**：为每个参数提供详细说明和示例
- **错误处理**：函数内部要做好异常处理，返回统一格式

⚠️ **重要提醒**

- API调用有成本，合理设置`tool_choice`避免不必要的函数调用
- 函数执行超时需考虑，避免阻塞主流程
- 敏感操作（如支付、删除）需增加人工确认环节
- 生产环境需对函数参数做校验，防止SQL注入等安全问题

### 7.2 调试技巧

Python

复制

```python
# 打印完整消息链，便于调试
import pprint

def debug_messages(messages):
    """打印完整的对话消息链"""
    print("="*50)
    print("当前消息链:")
    pprint.pprint(messages, width=80)
    print("="*50)

# 在每次调用后加入调试
debug_messages(messages)
```

------

## 8. 章节总结

本章节系统介绍了Function Call技术的核心概念、工作原理和三种典型应用场景：

1. **基础概念**：Function Call是连接大模型与外部世界的桥梁，解决了信息实时性、数据局限性和功能扩展性三大问题
2. **技术原理**：通过"模型决策→返回参数→应用执行→结果反馈→模型整合"的闭环流程，实现安全可靠的功能扩展
3. **实战应用**：
   - **天气查询**：单函数调用，简单直接
   - **航班查询**：多函数顺序调用，展示复杂任务处理能力
   - **SQL查询**：自然语言转SQL，体现数据查询场景
4. **核心要点**：
   - 模型只负责"决策"和"参数生成"，不执行函数
   - 合理设计函数描述是项目成功的关键
   - 多轮对话管理是复杂应用的基础

掌握Function Call技术，能够让大模型应用突破训练数据的限制，真正连接业务系统，实现AI能力的无限扩展。