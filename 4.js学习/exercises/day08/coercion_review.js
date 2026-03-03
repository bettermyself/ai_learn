// 1. 0 == "0" 的推导过程
//第一步：首先string vs number,会将string转为number,所以"0"转化为0
//第二步：number vs number,0 == 0，结果为true

// 2. 判断 [] + {} 和 {} + [] 的结果（用 console.log 验证）
console.log([] + {})
console.log({} + [])

