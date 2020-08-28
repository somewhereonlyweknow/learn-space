/**
 * 只考虑成功情况，实现链式调用，不考虑异常情况处理
 * 20行代码搞定promise链式调用
 * @param {fn} excutor 
 */

function SimplePromise(excutor) {
  this.callbacks = [];

  const resolve = (value) => {
    /**
     * 为什么要异步执行呢
     * promisse.then 是个微任务
     * 防止excutor是个同步任务
     * 如果这里不异步执行 new Promsie(resolve => { resolve(1)}).then(fn) 会导致先执行resolve函数，这时this.callbacks为空什么也没执行
     * 通过setTimeout异步执行，会先执行then方法，改变callbacks，这时流程才会通
     * 
     * 如果用self不用箭头函数，可能更好理解
     */
    setTimeout(() => {
      this.data = value; // 实例的data
      
      // 实例的callbacks
      this.callbacks.forEach((callback) => {
        callback(value);
      })
    })
  }

  excutor(resolve);
}

SimplePromise.prototype.then = function(onResolved) {
  return promsie2 = new SimplePromise((resolve) => {
    // 将回调推到promise1的callbacks
    this.callbacks.push(() => {
      const x = onResolved(this.data);

      if (x instanceof SimplePromise) {
        x.then(resolve);
      } else {
        resolve(x);
      }
    })
  })
}


/**
 * 链式调用处理过程要点
 * 如果then返回promise
 * then1被放倒promise1的callbacks，500s后resolve，然后执行then1，因为返回了一个promise，相当于
 * new Promise(resolve => { new Promise((r) => { setTimeout(() => {r(2)}) }).then(resolve) })
 * 相当于then1内return的Promise resolved之后 then函数返回的promise才会resolved，然后才会执行then2
 */
// new SimplePromise(
//   // excutor
//   (resolve) => {
//   // setTimeout(() => {
//     resolve(1);
//   // }, 500);
// })
//   // then1
//   .then((res) => {
//     console.log(res);
//     return new SimplePromise((resolve) => {
//       setTimeout(() => {
//         resolve(2);
//       }, 500);
//     });
//   })
//   // then2
//   .then(console.log);

/**
 * 链式调用处理过程要点
 * 如果then里面是同步函数,then1函数直接被放到promise1的，这样500ms后，resolve调用然后执行callbacks，也就是then1执行了
 */
// promise1
new SimplePromise((resolve) => {
  // setTimeout(() => {
    resolve(1);
  // }, 500);
})
// then1
.then(res => {
  // console.log(res);
})
