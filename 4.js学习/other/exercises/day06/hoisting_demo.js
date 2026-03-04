try{
    console.log('var函数声明前：', a);
    var a = 10;
    console.log('var函数声明后：', a);
    console.log('let函数声明前：', b);
    let b = 20;
} catch (error) {
    console.log('错误信息：', error.message);
}