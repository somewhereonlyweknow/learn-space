[TOC]


# Promise具体实现

## 简易版Promise代码
只考虑成功情况，不考虑rejected。面试的时候如果手写Promise，可以直接写个简易版的，毕竟主要考的链式调用，如果写完整的Promise，面试就不用干别的了

来一个网上的20行代码实现链式调用
```
function SimplePromise(excutor) {
  this.callbacks = [];
  
  const resolve = (value) => {
    setTimeout(() => {
      this.data = value;
    
      callbacks.forEach(callback => {
        callback(value);
      })
    })
  }
  
  excutor(resolve); // 不考虑rejected
}

Simple.prototype.then = function(onResolved) {
  return new SimplePromise((resolve) => {
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
```

解释下简易版只重于实现Promise的链式调用，所以不考虑rejected。   


### 如何实现链式
**Promise的then函数返回一个新的Promise**,震央就可以实现链式调用了

then的onResolved返回值不同，处理不同   

1.返回是一个正常值，例如return 5，直接将该值传给promise2就好了，再次调用then方法时，也能拿到这个返回值，当promise1 resolved的时候，直接返回一个resolved的promise，例```get(url).then(JSON.parse).then()``` 当get方法的promise resolved，直接经过JSON.parse处理，返回一个新的promise，resolve经过处理的参数给下一个then函数。
```
new SimplePromise((resolve) => {
  setTimeout(() => {
    resolve(1);
  }, 500);
})
// then1
.then(res => {
  return 4 + res;
})


promise2 = new SimplePromise(resolve => { 
  this.callbacks.push(() => {
    const x = then1(); // 5
    resolve(5) 
  })
})
```

2.返回一个promise对象，则要等待这个promise resolved，才能调用下一then方法

所以x是一个promise，调用x的then方法，x.then(resolve), 等待内部的promise resolved后，才去resolved then方法返回的promise，实现链式

当返回一个Promise时，then1被放倒了promise1的callbacks, 500ms后resolve，执行then1，返回了一个Promise，生成的代码见解析，相当于返回的promise2状态由内部的promise3来决定，promise3 resolved后promise2才会resolved，然后执行then2
```
new SimplePromise(resolve => {
  setTimeout(() => {
    resolve(2);
  }, 500)
})
// then1
.then(res => {
  console.log(res);
  retrun new SimplePromise(resolve => {
    setTimeout(() => {
      resolve(3)
    })
  })
})
// then2
.then(console.log);


// then1内代码解析
promise2 = new Promise((resolve) => {
  // p1 callbacks
  this.callbacks.push(() => {
    new SimplePromise(r => {
      setTimeout(() => {
        r(3)
      }, 500)
    }).then(resolve)
  })
})
```

### resolve为啥异步执行(setTimeout)
考虑了很久终于想明白了，上代码
```
new SimplePromise((resolve) => {
  resolve(1);
}).then(res => {
 // some code
})
```
很简单明了，但新建Promise是直接resolve，没有异步操作，这时按照执行顺序就会先执行resolve函数，遍历callbacks去，但此时callback是空的，相当于白操作了，然后执行then方法，将回调放入了callbacks去，但此时resolve执行完了，然后Promise就卡住了，链断了。

通过setTimeout产生一个宏任务，让then方法先执行，然后执行resolve，直接resolve也就没问题了


## 真正Promise
有了上面的思路，咱们实现一个Promise
### 构造函数
包含状态，两个回调队列，然后执行传入的函数。
```
function MyPromise(excutor) {
  this.onResolvedCallback = [];
  this.onRejectedCallback = [];
  this.status = 'pending';
  
  
  excutor(resolve, rejected)
}
```

resolve和rejecte没有定义，然后excurot 直接throw Error怎么办呢，完善构造函数
```
function MyPromise(excutor) {
  this.onResolvedCallback = [];
  this.onRejectedCallback = [];
  this.status = 'pending';
  
  //resolve和reject，改变状态，执行对应回调
  const resolve = (value) => {
    setTimeout(() => {
      if (this.status == 'pending') {
        this.status = 'resolved';
        this.data = value;
        
        this.onResolvedCallback.forEach(callback => {
          callback(value);
        })
      }
    })
  }
  
  const reject = (reason) =>
    setTimeout(() => {
      if (this.status == 'pending') {
        this.status = 'rejected';
        this.data = reason;
        
        this.onRejectedCallback.forEach(callback => {
          callback(reason);
        })
      }
    })
  }
  
  // try catch包一下，防止在构造函数内直接throw Error
  try{
    excutor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}
```

### then方法
then方法定义在prototype，为啥？你猜呢。then方法是给MyPromise实例来调用，不能每一个实例上都部署一个吧，所以写到原型上。
```
MyPromise.prototype.then = function(onResolved, onRejected) {
  let promise2;

  onResolved = typeof onResolved === 'function' ? onResolved : function(){ };
  onRejected = typeof onRejected === 'function' ? onRejected : function(){ };

    // 根据当前promise status进行不同的操作，上述简易版只会从pending到resolved，所有没有只一步
    
  if (this.status === 'resolved') {
    return promise2 = new MyPromise((resolve, reject) => {
      // 防止throw
      try {
        const x = onResolved(this.data);
        if (x instanceof MyPromise) {
          x.then(resolve, reject);
        } else {
          resolve(x);
        }
      } catch (e) {
        reject(e);
      }
    });
  }
  
  if (this.status === 'rejected') {
    return promise2 = new MyPromise((resolve, reject) => {

      // 防止throw
      try {
        // onRejected未定义的话，会一直用默认函数throw，然后是的后续所有的promise rejected，知道被onRejected捕获
        const x = onRejected(this.data);
        
        有onRejected捕获
        if (x instanceof MyPromise) {
          x.then(resolve, reject);
        } else {
          resolve(x); // 若onRejected定义了，但是空函数，也相当于捕获了，后续的then会正常执行
        }
      } catch (e) {
        reject(e);
      }
    })
  }
  
  if (this.status === 'pending'){
    // 无法判断，把onResolved和onRejected放进callback
    return promise2 = new MyPromise((resolve, reject) => {
      this.onResolvedCallback.push((v) => {
        try {
          // 所以then的函数必须有return，否则的话就算Promise.reject(1) 也会让外层promise进入resolved状态
          // 不返回相当于x是undefined
          const x = onResolved(v);
        
          if (x instanceof Promise) {
            x.then(resolve, reject);
          }

          resolve(x);
        } catch(e) {
          reject(e);
        }
      })

      this.onRejectedCallback.push((r) => {
        try{
          const x = onRejected(r);
          if (x instanceof Promise) {
            x.then(resolve, reject);
          } else {
            resolve(x);
          }
        } catch(e) {
          reject(e);
        }
      })
    })
  }
}
```
```
// Promise rejected catch
/**
 * 当onRejected为空函数时，也相当于捕获了，会继续执行then
 */
let promise = Promise.reject(111).then(v => {
    console.log(v);
}, e => {
    
}).then(r => {
    console.log(111);
})

/**
 * onRejected未定义，下一个then不会执行，而是向下一直到catch
 */
let promise = Promise.reject(111).then(v => {
    console.log(v);
}).then(r => {
    console.log(111);
})
```


### 值穿透

Promise.resolve(1).then().then().then(console.log(r)); 当onResolved，onRejected不是函数时，会有值穿透现象，这个怎么解决呢，在判断onResolved和onRejected是进行操作，上代码
```
onResolved = typeof onResolved === 'function' ? onResolved : function(v){ return v };

/**
 * 若onRejected初始化空函数，后续的then会继续执行，不会走catch.then(() => {}).then(() => {}).catch()，
 * 所以要throw r 然后虚的promise一直rejected，直到catch
 */
onRejected = typeof onRejected === 'function' ? onRejected : function(r){ throw r }; 
```

const x = onResolved(this.data) || onRejected(this.data);data在resolve，reject里定义的。


onResolved直接将参数返回， 返回后内部promise直接resolved将值向下继续传     
onRejected直接throw，后续的promise一直rejected，一直throw相同的reason，直到后续的catch捕获了，把reason抛出来

值穿透解决了,也解决了rejectd时，onRejeced为空函数时继续执行next then的问题。

### 更复杂的情况

#### thenable
我理解就是带有then方法的对象，不仅限于promise， ```var a = { then: () => {} }``` a就是一个thenable

#### 更复杂的返回值情况
实现[Promise/A+规范](https://juejin.im/post/5c4b0423e51d4525211c0fbc)。
```
function resolvePromise(promise, x, resolve, reject) {
  let thenCallOrThrow = false; // 用于2.3.3.3.3 ，保证resolve和reject优先第一次调用
  
  // 2.3.1
  if (promise === x) {
    throw new TypeError('循环引用');
  }
  
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 2.3.3
    // 2.3.3.2
    try {
      // 2.3.3.1
      let then = x.then; 
      
      if (typeof then === 'function') {
        then.call(x, y => {
          if (thenCallOrThrow) return;
          thenCallOrThrow = true;
          resolvePromise(promise, y, resolve, reject);
        }, r => {
          if (thenCallOrThrow) return;
          thenCallOrThrow = true;
          reject(r);
        });
      } 
      // 2.3.3.4
      else {
        resolve(x);
      }
    } catch(e) {
      // 2.3.3.4.1
      if (thenCallOrThrow) return;
      thenCallOrThrow = true;
      
      // 2.3.3.4.2
      reject(e);
    }
  } else {
    // 2.3.4
    resolve(x);
  }
}
```

### 完整代码
测试命令：  
```
$ npm install promises-aplus-tests
$ promises-aplus-tests your.js
```
```
function MyPromise(excutor) {
  this.onResolvedCallback = [];
  this.onRejectedCallback = [];
  this.status = 'pending';
  
  //resolve和reject，改变状态，执行对应回调
  const resolve = (value) => {
    setTimeout(() => {
      if (this.status == 'pending') {
        this.status = 'resolved';
        this.data = value;
        
        this.onResolvedCallback.forEach(callback => {
          callback(value);
        })
      }
    })
  }
    
  const reject = (reason) => {
    setTimeout(() => {
      if (this.status == 'pending') {
        this.status = 'rejected';
        this.data = reason;
        
        
        
        this.onRejectedCallback.forEach(callback => {
          callback(reason);
        })
      }
    })
  }
    
    
  // try catch包一下，防止在构造函数内直接throw Error
  try{
    excutor(resolve, reject);
  } catch (e) {
    reject(e);
  }
}



function resolvePromise(promise, x, resolve, reject) {
  let thenCallOrThrow = false; // 用于2.3.3.3.3 ，保证resolve和reject优先第一次调用
  
  // 2.3.1
  if (promise === x) {
    throw new TypeError('循环引用');
  }
  
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 2.3.3
    // 2.3.3.2
    try {
      // 2.3.3.1
      let then = x.then; 
      
      if (typeof then === 'function') {
        then.call(x, y => {
          if (thenCallOrThrow) return;
          thenCallOrThrow = true;
          resolvePromise(promise, y, resolve, reject);
        }, r => {
          if (thenCallOrThrow) return;
          thenCallOrThrow = true;
          reject(r);
        });
      } 
      // 2.3.3.4
      else {
        resolve(x);
      }
    } catch(e) {
      // 2.3.3.4.1
      if (thenCallOrThrow) return;
      thenCallOrThrow = true;
      
      // 2.3.3.4.2
      reject(e);
    }
  } else {
    // 2.3.4
    resolve(x);
  }
}
  
MyPromise.prototype.then = function(onResolved, onRejected) {
  let promise2;

  onResolved = typeof onResolved === 'function' ? onResolved : function(v){ return v };
  onRejected = typeof onRejected === 'function' ? onRejected : function(r){ throw r };

  // 根据当前promise status进行不同的操作，上述简易版只会从pending到resolved，所有没有只一步
    
  if (this.status === 'resolved') {
    // 防止throw
    return promise2 = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        try {
          const x = onResolved(this.data);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
    })
  };
  
  if (this.status === 'rejected') {
    return promise2 = new MyPromise((resolve, reject) => {
      setTimeout(() => {
        // 防止throw
        try {
          // onRejected未定义的话，会一直用默认函数throw，然后是的后续所有的promise rejected，知道被onRejected捕获
          const x = onRejected(this.data);
          resolvePromise(promise2, x, resolve, reject);
        } catch (e) {
          reject(e);
        }
      })
      
    })
  }

  if (this.status === 'pending'){
    // 无法判断，把onResolved和onRejected放进callback
    return promise2 = new MyPromise((resolve, reject) => {
      this.onResolvedCallback.push((v) => {
        try {
          // 所以then的函数必须有return，否则的话就算Promise.reject(1) 也会让外层promise进入resolved状态
          // 不返回相当于x是undefined
          const x = onResolved(v);
          resolvePromise(promise2, x, resolve, reject);
        } catch(e) {
          reject(e);
        }
      })
      

      this.onRejectedCallback.push((r) => {
        try{
          const x = onRejected(r);
          resolvePromise(promise2, x, resolve, reject);
        } catch(e) {
          reject(e);
        }
      })
    })
  }
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

module.exports = MyPromise;
```

### 其他函数
```
// catch函数
MyPromise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected);
}

/**
 * 停止Promise
 * stop
 * 给一个pending的Promise，直接卡住
 */
MyPromise.prototype.stop = function() {
  return new MyPromise(() => {});
}

/**
 * 错误处理
 * Q的做法，增加一个done方法
 * 保证错误捕获内一定不要有错误
 */
MyPromise.prototype.done = function() {
  return this.catch((e) => {
    console.error(e);
  })
}

/**
 * finally函数
 * 最后执行，不论前面的状态如何都会执行
 */
MyPromise.prototype.finally = function(fn) {
  return this.then(v => {
    setTimeout(fn);
    return v;
  }, r => {
    setTimeout(fn);
    throw r;
  })
}

/**
 * Promsie.all
 * 无论失败或者成功，所有的异步任务都会执行
 * 成功时，按顺序返回所有Promise的值
 * 失败时返回第一个失败的原因
 */
MyPromise.all = function(promises) {
  // 返回一个Promsie
  return new MyPromise((resolve, reject) => {
    let arr = [];
    
    function saveArr = function(value, i) {
      arr[i] = value;
      
      i + 1 === promises.length && resolve(arr); // 当所有都成功时，返回数组
    }
    
    promises.forEach((promise, index) => {
      promise.then(v => {
        saveArr(v, index)
      }, r => {
        reject(r); // 返回第一个失败的原因
      })
    })
  }) 
}

/**
 * Promise.race
 * 返回执行最快的结果
 */
MyPromise.race = function(promises) {
  return new MyPromise((resolve, reject) => {
    promises.forEach(promoise => {
      promise.then(v => {
        resolve(v);
      }, r => {
        reject(r);
      })
    })
  })
}

/**
 * Promise.resolve
 */
MyPromise.resolve = function(arg) {
  return new Promise(resolve => {
    resolve(arg);
  })
}

/**
 * Promise.reject
 */
MyPromise.reject = function(arg) {
  return new Promise((resolve, reject) => {
    reject(arg);
  })
}
```


## Promise面试题
### 使用Promise实现每隔1秒输出1,2,3
```
const arr = [1, 2, 3];

arr.reduce((queue, item) => {
  return queue.then(() =>{
    return new Promsie(r => {
      setTimeout(() => {
        r(console.log(item));
      }, 1000)
    })
  })
}, Promise.resolve())
```

### 使用Promise实现红绿灯交替重复亮
红灯3秒亮一次，黄灯2秒亮一次，绿灯1秒亮一次；如何让三个灯不断交替重复亮灯？（用Promise实现）三个亮灯函数已经存在：
```
function red() {
    console.log('red');
}
function green() {
    console.log('green');
}
function yellow() {
    console.log('yellow');
}
```
解法：
```
// 暴力解
const arr = [3, 2, 1]; // 时间

function arrReduce() {
  arr.reduce((queue, item) => {
    return new Promise((r) => {
      setTimeout(() => {
        if (item == 3) {
          r(red());
        } else if (item == 2) {
          r(yellow());
        } else if (item == 1) {
          r(green());
          arrReduce(); // 递归
        }
      }, item * 1000)
    })
  }, Promise.resove())
}

arrReduce();


// 好一点的办法
const light = function(timer, fn) {
  setTimeout(() => {
    fn();
  }, timer)
}
const step = function() {
  Promise.resolve().then(() => {
    return light(3000, red);
  }).then(() => {
    return light(2000, yellow);
  }).then(() => {
    return light(1000, green);
  }).then(() => {
    return step();
  })
}

step();
```

### 实现mergePromise函数
实现mergePromise函数，把传进去的数组按顺序先后执行，并且把返回的数据先后放到数组data中。
```
function mergePromise(promises) {
  let data = [];
  
  let p = Promise.resolve()
  
  promises.forEach(promise => {
    p.then(() => {
      return promise;
    }).then(res => {
      data.push(res);
      return data;
    })
  })
  
  return p;
}
```

### 封装一个请求的Promsie
```
function get(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();
  
    req.open('GET', url);
  
    req.onload(() => {
      if (req.status === 200) {
        resolve(req.response);
      } else {
        reject(Error(req.sttusText));
      }
    })
    
    req.onerror((e) => {
      reject(e);
    })
    
    req.send();
  })
}
```

### 限制异步操作的并发个数并尽可能快的完成全部
首先，肯定要同时跑最大并发数的请求，怎么保证尽快完成呢，其中又完成的了，立即替换。
```
var urls = [
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting1.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting2.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting3.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting4.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/AboutMe-painting5.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn6.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn7.png",
  "https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/bpmn8.png",
];
function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = function() {
      console.log("一张图片加载完成");
      resolve(img);
    };
    img.onerror = function() {
    	reject(new Error('Could not load image at' + url));
    };
    img.src = url;
  });
}
```

```
function limitLoad(urls, handler, limit) {
  const urls2 = [].concat(urls); // 拷贝一份url
  
  // 得到了一组初始化的promises, splice截掉数组
  let promises = urls2.splice(0, limit).map((item, index) => {
    return handle(url).then(() => {
      return index; // 返回下标，用于替换
    })
  })
  
  // 然后现在的urls2就只剩下length - limit了
  // 这里要return reduce的结果（promise.then()）， 为了后续调用
  return urls2.reduce((queue, url) => {
    return queue.then(() => {
      return Promise.race(promises); // 竞速执行,返回最快的下标
    }).then(index => {
      promises[index] = handler(url).then(() => {
        return index
      })
    }).catch(e => {
      console.log(e);
    })
  }, Promise.resolve()).then(() => {
    return Promise.all(promises);
  })
}

limitload(urls, loadImg, 3);
```

