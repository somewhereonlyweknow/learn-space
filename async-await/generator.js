const timeOut = (time = 0) => new Promise((resolve, reject) => {
  setTimeout(() => {
      resolve(time + 200)
  }, time)
})

async function main() {
  const result1 = await timeOut(200)
  console.log(result1) // 400
  const result2 = await timeOut(result1)
  console.log(result2) // 600
  const result3 = await timeOut(result2)
  console.log(result3) // 800
}



function* main() {
  const result1 = yield timeOut(200);
  console.log(result1) // 400
  const result2 = yield timeOut(result1)
  console.log(result2) // 600
  const result3 = yield timeOut(result2)
  console.log(result3) // 800
}

function step(generator) {
  const gen = generator();

  let lastValue;

  return () => {
    // gen.next把上一次的结果传进去
    return Promise.resolve(gen.next(lastValue).value).then(value => {
      lastValue = value;
      return lastValue;
    })
  }
}

const run = step(main); // 得到了一个函数,执行run函数，得到了一个promise


// 递归调用，直到结束value为undefined
// 一直的then
// Promise.resolve(gen.next(lastValue).value).then(v => {
//   lastValue = v;
//   return v
// }).then(v => {
//   Promise.resolve(gen.next(v).value)
// })
function recursion(promise) {
  promise().then(res => {
    if (res) {
      recursion(promise);
    }
  })
}

recursion(run);



/**
 * 自执行函数
 * 在外层用一个Promise控制串行状态
 */
function asyncToGen(generator) {
  const gen = generator();

  return () => {
    // 用一个Promise控制整个流程
    return new Promise((resolve, reject) => {
      /**
       * 递归函数
       * @param {String} key 对应generator的操作next/throw
       * @param {*} arg 
       */
      function step(key, arg) {
        let genResult;

        try {
          genResult = gen(key, arg);
        } catch(e) {
          reject(e);
        }

        const { value, done } = genResult;

        // 结束
        if (done) {
          resolve(value);
        } else {
          /**
           * 最后递归调用生成的代码就是这样
           * new Promise((rs, rj) =>{
           *   Promise.resolve(value).then(v => {
           *     v2 = gen.next(v)
           *     Promise.resolve(v2).then()
           *   })
           * })
           */
          return Promise.resolve(value).then(v => {
            step('next', v);
          }, r => {
            step('throw', r)
          })
        }
      }
    })
  }
}