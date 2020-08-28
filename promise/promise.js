function MyPromise(executor) {
  let self = this;

  self.status = 'pending';
  self.data = undefined;
  self.onResolvedCallback = [];
  self.onRejectedCallback = [];

  function resolve(v) {
    // if (v instanceof MyPromise) {
    //   return v.then(resolve, reject);
    // }

    setTimeout(function() {
      if (self.status == 'pending') {
        self.status = 'resolved';
        self.data = v;

        for (let i = 0; i < self.onResolvedCallback.length; i++) {
          self.onResolvedCallback[i](v);
        }
      }
    })
  }

  function reject(reason) {
    setTimeout(() => {
      if (self.status == 'pending') {
        self.status = 'rejected';
        self.data = reason;

        if (self.onRejectedCallback.length === 0) {
          // 没有错误处理
          console.error(reason);
        }

        for (let i = 0; i < self.onRejectedCallback.length; i++) {
          self.onRejectedCallback[i](reason);
        }
      }
    });
  }

  // 如果执行executor函数出错，需要catch下，并且如果出错了，要用这个值reject掉Promise
  // 例如 let p = new MyPromise((resolve, reject) => { throw Error('test'); })
  try {
    executor(resolve, reject);
  } catch(e) {
    reject(e);
  }
}


function resolvePromise(promise2, x, resolve, reject) {
  let then, thenCalledOrThrow = false;

  if (promise2 === x) {
    throw TypeError('Circle'); // 2.3.1 循环引用 测试必须是TypeError
    // return reject(new Error('Circle'));
  }
  

  // 2.3.2 返回值是Promise实例
  // if (x instanceof MyPromise) {
  //   // 如果x的状态还没有确定，那么它是有可能被一个thenable决定最终状态和值的
  //   // 所以这里需要做一下处理，而不能一概的以为它会被一个“正常”的值resolve
  //   // 2.3.2.1
  //   if (x.status === 'pending') {
  //     x.then((v) => {
  //       resolvePromise(promise2, x, resolve, reject);
  //     }, reject)
  //   } else {
  //     // 如果状态确定了，肯定是正常的，直接取它的状态就可以了
  //     x.then(resolve, reject);
  //   }

  //   return;
  // }


  // 2.3.3 如果是对象或者函数
  if (x !== null && (typeof x === 'function' || typeof x === 'object')) {

    // 2.3.3.2
    try {
      then = x.then; // 2.3.3.1
      // 2,3.3.3 多次调用优先第一次调用，并把之后的调用全部忽略
      if (typeof then === 'function') {
        // 2.3.3.3
        then.call(x, function rs(y) {
          if (thenCalledOrThrow) return;

          thenCalledOrThrow = true;

          return resolvePromise(promise2, y, resolve, reject);
        }, function rj(r) {
          // 2.3.3.3.4
          if (thenCalledOrThrow) return;

          thenCalledOrThrow = true;

          reject(r);
        })
      } else {
        // 2.3.3.4
        resolve(x);
      }
    } catch (r) {
      // 2.3.3.2
      if (thenCalledOrThrow) return;

      thenCalledOrThrow = true;

      reject(r);
    }
  } else {
    resolve(x); // 2.3.4
  }
}


// then 方法定义在原型链上
MyPromise.prototype.then = function(onResolved, onRejected) {
  let self = this,
      promise2;

  // 判断参数是否为function，不是function舍弃
  // 默认函数解决值穿透问题
  // 不够完善，当onResolved/onRejected不是函数时，会发生值穿透，但是代码还是会执行，所以直接舍弃感觉不太对
  onResolved = typeof onResolved === 'function' ? onResolved : function(v) { return v; };
  onRejected = typeof onRejected === 'function' ? onRejected : function(r) { throw r; };

  if (self.status === 'resolved') {
    return promise2 = new MyPromise((resolve, reject) => {
      // 有可能throw
      setTimeout(() => {
        try {
          const x = onResolved(self.data);
          
          // // 如果返回值是个Promise，直接用它的结果
          // if (x instanceof Promise) {
          //   x.then(resolve, reject);
          // }

          // resolve(x); // 不是的话，将返回值返回给promise2

          // 根据x判断返回的promise
          resolvePromise(promise2, x, resolve, reject);
        } catch(e) {
          reject(e);
        }
      })
     
    })
  }

  if (self.status === 'rejected') {
    return promise2 = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
        const x = onRejected(self.data);
          // 如果返回值是个Promise，直接用它的结果
          // if (x instanceof Promise) {
          //   x.then(resolve, reject);
          // }


          // 根据x判断返回的promise
          resolvePromise(promise2, x, resolve, reject)
        } catch(e) {
          reject(e);
        }
      });
      
    })
  }

  if (self.status === 'pending') {
    // 如果当前的Promise还处于pending状态，我们并不能确定调用onResolved还是onRejected，
    // 只能等到Promise的状态确定后，才能确实如何处理。
    // 所以我们需要把我们的onResolved两种情况onRejected的处理逻辑做为callback放入promise1(此处即this/self)的回调数组里
    return promise2 = new MyPromise((resolve, reject) => {
      self.onResolvedCallback.push(function(v) {
        try {
          // 所以then的函数必须有return，否则的话就算Promise.reject(1) 也会让外层promise进入resolved状态
          const x = onResolved(v);
          
          // if (x instanceof Promise) {
          //   x.then(resolve, reject);
          // }
  
          // resolve(x);

          resolvePromise(promise2, x, resolve, reject);
        } catch(e) {
          reject(e);
        }
      })

      self.onRejectedCallback.push(function(r) {
        try{
          const x = onRejected(r);
          // if (x instanceof Promise) {
          //   x.then(resolve, reject);
          // }

          resolvePromise(promise2, x, resolve, reject);
        } catch(e) {
          reject(e);
        }
      })
    })
  }
}

MyPromise.prototype.catch = function(onRejceted) {
  return this.then(null, onRejceted);
}

// promise test用例
MyPromise.deferred = MyPromise.defer = function() {
  var dfd = {}
  dfd.promise = new MyPromise(function(resolve, reject) {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

// 暂停链式调用，返回一个pending状态的promise
MyPromise.prototype.stop = function() {
  return new MyPromise(() => {});
}

// Q的方法
// 捕获最后一个promise的错误
// 解决方案差不多就是在最后加catch并保证catch内的代码一定要正确，不能出错
MyPromise.prototype.done = function() {
  return this.catch((e) => {
    console.error(e);
  })
}

/**
 * Promise.finally 方法
 * 最后调用 无论前面的状态
 */
MyPromise.prototype.finally = function(fn) {
  return this.then((v) => {
    setTimeout(fn);
    return v;
  }, (r) => {
    setTimeout(fn);
    throw r;
  })
}


/**
 * 实现Promsie.all方法
 * 无论失败或者成功，所有的异步任务都会执行
 * 成功时，按顺序返回所有Promise的返回值
 * 失败时，返回第一个失败的原因
 */
MyPromise.all = ((promises) => {
  return new Promise((resolve, reject) => {
    let arr = [];

    function saveArr(value, i) {
      arr[i] = value;

      if ((i+1) === promises.length) {
        resolve(arr);
      }
    }


    promises.forEach((promise, index) => {
      promise.then((value) => {
        saveArr(value, index);
      }, (err) => {
        reject(err);
      })
    });
  })
})

/**
 * 实现Promise.race方法
 * 返回最快的结果
 */
MyPromise.race = (promises) => {
  return new MyPromise((resove, reject) => {
    promises.forEach((promise) => {
      promise.then((v) => {
        resove(v);
      }, (err) => {
        reject(err);
      })
    });
  })
}

/**
 * Promise.resove()
 * 直接产生resolved的promise
 */
MyPromise.resovle = (arg) => {
  return new Promise((resolve) => {
    resolve(arg);
  })
}

/**
 * Promise.reject()
 * 直接产生rejected的promise
 */
MyPromise.reject = (arg) => {
  return new Promise((resolve, reject) => {
    reject(arg);
  })
}


// try {
module.exports = MyPromise;
// }

// Promise.all 测试
// let wake = (time) => {
//   return new MyPromise((resolve, reject) => {
//     setTimeout(() => {
//       resolve(`${time / 1000}s`)
//     }, time)
//   })
// }

// let p1 = wake(1000)
// let p2 = wake(2000)

// let p3 = new MyPromise((resolve, reject) => {
//   reject('11');
// });


// MyPromise.all([p1, p2, p3]).then((result) => {
//   console.log(result)       // [ '3秒后醒来', '2秒后醒来' ]
// }).catch((error) => {
//   console.log(error)
// })

// Promise.race 测试
// let p4 = wake(1000);
// let p5 = wake(500);


// let p6 = new MyPromise((resolve, reject) => {
//   setTimeout(() => {
//     reject('11');
//   }, 499)
// });

// MyPromise.race([p4, p6, p5]).then((r) => {
//   console.log(r);
// })