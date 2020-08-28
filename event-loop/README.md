[TOC]

# Event Loop

## 概述
### 什么是event loop 
> Event Loop是一个程序结构，用于等待和分派消息和事件

很官方的解释，我自己的理解呢，**就是一种协调JS这种单线程语言不会阻塞的机制** 。

### 为什么JS是单线程语言？？？
因为JS天生就是一门单线程语言？？？觉得对吗   
原因是不想让浏览器变得过于复杂，多线程之间需要线程通信，线程间共享资源，彼此之间修改结果，假如JS不是一门单线程语言，那么就可以执行多个JS代码，一个要删除DOM，一个要给DOM加样式，GG，也可以说JS引擎是单线程的。

但这里只是说JS是单线程的，仅仅是JS，浏览器是多线程的，每开一个tab页面，就相当于加了一个进程，


### 浏览器常驻线程
* GUI渲染线程
* JS引擎线程
* 事件触发线程
* 定时器处发线程
* HTTP请求线程


## 浏览器的Event Loop

### 宏任务和微任务
因为JS是单线程的，所以有同步任务和异步任务之分，异步任务有分为宏任务和微任务。任务队列分为宏任务队列和微任务队列

宏任务（task）：
* setTimeout, setInterval，setImmediate(node)
* script(整块script代码)
* I/O

微任务（job）：
* Promsie.then()
* process.nextTick() // node专属
* MutationObserver

简单理解下
* 为什么要有微任务   
主要是为了及时处理一些任务，防止程序处理完再处理，数据已经被污染了。如果没有微任务，所有异步任务都一样，按照顺序执行。
```
function get(url) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open('GET', url);

    req.onload(() => {
      if (req.status == 200) {
        resolve(req.response);
      } else {
        reject(Error(req.statusText));
      }
    })

    req.onerror(() => {
      reject(Error('Network error'));
    })

    req.send();
  })
}

function getJSON(url) {
  return get(url).then(JSON.parse).catch(err => {
    console.log(err);
    throw err;
  })
}

let res = getJSON('a.json'); // ajax获取一个json串

setTimeout(() => {
  res = Promise.resolve(1)
})

res.then(r => console.log(r));
```
运行顺序是先顺序执行，产生微任务job1(获取内容)，然后task1(改变res)，然后是job2(console)，如果没有微任务，所有异步任务一样，那最后打印出来的应该是1。所以微任务能将任务及时处理，防止数据被污染。   
微任务是运行宏任务或者同步任务产生的，属于当前任务，不需要浏览器支持，直接就被JS引擎执行了掉了。

### 执行顺序
1. 执行整块代码script，可以理解为先把整块代码放进宏任务队列。
2. 产生宏任务放进宏任务队列，微任务放进微任务队列。
3. 清空微任务队列，然后取出一个宏任务
4. 重复2-4

可以简单的理解执行一个宏任务，然后把产生的所有微任务全部执行，然后在执行下一个宏任务，然后loop（这就是Event Loop）


### 举个栗子
```
new Promise((resolve, reject) => {
  console.log(1);
  
  setTimeout(() => {
    console.log(2);
    resolve(3);
  }, 0)
  
  console.log(4)
}).then(r => {
  new Promise((re, rj) => {
    setTimeout(() => {
      console.log(5);
    })
    console.log(6);
  })
  console.log(r)
});

console.log(7);

setTimeout(() => {
  console.log(8);
})

// 1 4 7 2 6 3 8 5
```
解释下，Promise 的构造函数相当于同步代码，打印1，然后产生task1， 然后打印4，
这时Promise的状态为pending，可以理解为then暂不执行，然后打印7，然后产生task2（打印8），执行宏任务结束，没有微任务，执行task1，打印2，然后产生微任务1，执行微任务，然后产生task3（打印5），然后打印6， 3，然后执行task2， task3


## Node的Event Loop
### 和浏览器的不同
和浏览器不同的地方就是将宏任务队列分为了6个，所以事件循环也分为了6个阶段
1. timer(setTimeout, setInterval的回调)
2. IO
3. idel, prepare --- 闲置阶段
4. poll 轮询
5. check setImmediate回调
6. close回调

执行顺序相较浏览器略有不同，浏览器是一次执行一个宏任务，然后清空nextTick队列和微任务队列，node是一次执行一个宏任务队列，再去清空微任务队列。**nextTick 事件是一个单独的队列，它的优先级会高于微任务**

还是上述代码。

```
new Promise((resolve, reject) => {
  console.log(1);
  
  setTimeout(() => {
    console.log(2);
    resolve(3);
  }, 0)
  
  console.log(4)
}).then(r => {
  new Promise((re, rj) => {
    setTimeout(() => {
      console.log(5);
    })
    console.log(6);
  })
  console.log(r)
});

console.log(7);

setTimeout(() => {
  console.log(8);
})

// 1 4 7 2 8 6 3 5
```
结果的不同主要在于产生的task1(打印2),task2(打印8)在一个宏任务队列，所以打印8提前了。不多解释了

### setTimout和setImmediate
#### 执行顺序
先上代码
```
setTimeout(() => {
  console.log('setTimout');
})

setImmediate(() => {
  console.log('setImmediate');
})
```
正常理解的话，setTimeout在setImmediate之前，结果肯定是先打印setTimeout,然后再打印setImmediate，可是执行的时候发现顺序确实不一定的，为什么？？？？

>  Node 中 setTimeout 第二个时间参数的最小值是 1ms，小于 1ms 会被初始化为 1(浏览器中最小值是 4ms)，所以在这里 setTimeout(fn, 0) === setTimeout(fn, 1)

在代码开始运行一直到timers阶段(代码的启动、运行)会消耗一定的时间，所以会出现两种情况：
1. 消耗时间>=1ms，setTimeout周期到了，先打印setTimeout
2. < 1ms，times阶段没有回调，所以先打印setImmediate，然后setTimeout在下一个循环周期去打印。


#### 如何控制执行顺序
* 先执行setTimeout

```
setTimeout(() => {
  console.log('setTimout');
}, 0)

const start = new Date();
while (Date.now() - start < 10); // 先延时一段，保证setTimeour定时器时间已经到了


setImmediate(() => {
  console.log('setImmediate');
})
```

* 先执行setImmediate
在IO阶段的回调里调用就ok了，肯定先执行check阶段的immediate，然后在下一次循环执行timers的回调

```
const fs = require('fs')

fs.readFile(__dirname, () => {
  setTimeout(() => {
    console.log('setTimeout')
  }, 0)
  
  setImmediate(() => {
    console.log('setImmediate')
  })
})
```


## EventLoop遇上事件
```
<div class="outer">
  <div class="inner"></div>
</div>

var outer = document.querySelector('.outer');
var inner = document.querySelector('.inner');

function onClick() {
  console.log('inner');

  setTimeout(function () {
    console.log('inner-timeout');
  }, 0);

  Promise.resolve().then(function () {
    console.log('inner-promise');
  });

}
function onClick2() {
  console.log('outer');

  setTimeout(function () {
    console.log('outer-timeout');
  }, 0);

  Promise.resolve().then(function () {
    console.log('outer-promise');
  });
}

inner.addEventListener('click', onClick);
outer.addEventListener('click', onClick2);
```

这时触发click事件，发现输出 inner->inner-promise->outer->outer-promise->inner-timeout->outer-timeout

触发了inner click事件，由于事件冒泡产生了一个I/O宏任务，所以inner,然后执行微任务，产生setTimeout宏任务，顺序确认了。**事件冒泡触发宏任务先于其他**

当手动调用``` inner.click(); ```

执行顺序变为inner->outer->inner-promise->outer-promise->inner-timeout->outer-timeout

手动触发和真正的I/O事件不一样，大致执行过程类似于下面的过程，类似于同步执行

```
document.body.click()
document.body.dispatchEvent(new Event('click'))
console.log('done')
```
