// const a = [0, "", [], {}, null, undefined, NaN, "0", "false"]
//
// console.log("===== 布尔转换测试 =====")
// for (let i of a) {
//     console.log(`Boolean(${JSON.stringify(i)}) = ${Boolean(i)}`)
// }
//
// console.log("\n===== == vs === 对比 =====")
// for (let i of a) {
//     for (let j of a) {
//         if (i != j || i !== j) {
//             console.log(`${JSON.stringify(i)} == ${JSON.stringify(j)} : ${i == j}`)
//             console.log(`${JSON.stringify(i)} === ${JSON.stringify(j)} : ${i === j}`)
//             console.log("---")
//         }
//     }
// }

const a = [0, "", [], {}, null, undefined, NaN, "0", "false"]
for (let i of a){
    console.log(`Boolean(${JSON.stringify(i)})=`, Boolean(i))
}