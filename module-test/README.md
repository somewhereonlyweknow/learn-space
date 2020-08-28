[TOC]

# 模块化规范

![](https://user-gold-cdn.xitu.io/2018/12/16/167b650e8d1fcc23?imageslim)

## 模块化理解

### 模块化历程

* 全局函数    
全局变量污染，容易引起命名冲突，看不出模块之间的依赖关系
```
function f1() {
    // some code
}

function f2() {
    // some code
}
```

* namespacem模式   
将函数放到一个对象内，具名空间不存在命名冲突，但是外部可以直接修改内部
```
const funcObj = {
    test() {
        console.log(this.data);
    },
    
    data: 1,
}

funcObj.data = 2; // 修改了内部值
```
* IIFE模式（闭包函数）    
闭包函数将变量封在内部，外部无法修改，无法访问，只能通过暴露的接口进行访问或者修改，如果模块依赖另一个模块怎么办
```
(function(window) {
    var data = 1;
    
    function getData() {
        return data;
    }
    
    function getDataAndOther(func) {
        var result = this.getData();
        
        func(result);
    }
    
    window.module = { getData, getDataAndOther };
})(window)

console.log(module.getData()); // 1
console.log(module.data); // 2
```
* IIFE增强模式（引入依赖）   
```
(function(window, $) {
    function test() {
       console.log($('html')); // 引入jq依赖
    }
    
    window.module = { test };
})(window, jQuery)
```

### 模块化好处
* 避免命名冲突
* 更好的分离，按需加载
* 高复用性
* 高可维护性


## 模块化规范
主要包含以下几种规范
| 规范 | 主要实现 |
| ---- | -------- |
| CommonJs | node |
| AMD | require.js |
| CMD | sea.js |
| ES6 Module |

### CommonJS
#### 概述
Node应用有模块组成，在服务端模块加载同步的，在浏览器里，需要提前编译打包。

#### 特点
* 作用域，避免变量污染
* 模块只在加载的时候运行一次，再次引入的时候从缓存里读    
解析路径获得文件名，cache查询，有则直接读cache，没有创建cache，然后去加载文件
* 模块加载顺序就是代码出现顺序，因为都是同步加载的，**因为都是同步加载，所以会造成阻塞，一般用于服务器，从本地读文件，不适用于浏览器**

#### 基础语法
* 导出      
```
// 两种方式都可
module.exports.name = '';
module.exports = {
    key: value
}
```
* 引入
```
const module = require('module');
console.log(module.name);
```

#### 加载机制
输入的是被输出的值的拷贝，一旦输出，内部变化将不再影响输出的值
```
// lib.js
var counter = 2;
function add() {
    counter++;
}

module.exports = {
    counter: counter,
    add: add
}

// a.js
const { counter, add } = require('./lib.js');
console.log(counter); // 2

add();

console.log(counter); // 2 未影响
```

### AMD (Asynchronous Module Definition)

#### 概述
因为CommonJS规范只能同步加载，适用于服务端，但不适用于浏览器，浏览器不能阻塞等待模块加载，所以出现了AMD规范，异步模块加载方案

#### 特点
最大的特点就是异步加载，支持require([modulename], _callback)，增加参数支持callback，模块加载过程中不会阻塞，而是顺序执行，当加载完成时再执行回调函数。

#### 基础语法
requirejs定义了两个函数，define和require，define用来定义模块，require用来调用模块，全局生效。    
define(id?, dependencies?, factory)    
**id** 名字，用来标识；**dependencies** 该模块的依赖；**factory**具体函数，用来定义模块内部方法等

require([dependencies], function)     
**dependencies** 依赖模块，数组传入， **function** 具体方法


require.config用来定义模块路径
```
require.config({
    paths: {
        name: 'path'
    }
})
```

```
// 定义普通模块 module1.js
define(function(){
    let a = 11;
    return { a };
})

// 定义依赖模块 module2.js
define(['module1'], function(m1) {
    // 可以应用m1导出的东西
    let b = m1.a;
})

// 入口文件 index.js
(function() {
    require.config({
        paths: {
            // 声明模块
            module1: './module1',
            module2: './module2'
        }
    })
    
    // 执行顺序不一定，加载好执行
    // 所以输出结果未定
    require(['module2'], (m2) => {
        console.log(m2.getMsg('amdyes'));
    
        console.log(m2.counter);
    
        m2.add();
    
        console.log(m2.counter);
    })    
    
    
    require(['module1'], (m1) => {
        console.log(m1.toUpper('amdyes'));
    })
    
    setTimeout(() => {
        console.log(111);
    }, 1)
      
})()

/*
 * 引用require.js
 * data-main声明入口
 * index包含自执行函数
*/
<script data-main="./index" src="utils/require.js"></script>
```

#### 加载机制
异步加载，可以同时异步多个module，reload完成之后直接执行callback，然后得到的也是值的拷贝。
```
// module2.js
define(['module1'], function(m1) {
  function getMsg(msg) {
    return `${m1.toUpper(msg)}_m2`;
  }

  let counter = 3;

  function add() {
    this.counter++;
  }

  return { getMsg, add, counter }
})

// index.js
require(['module2'], (m2) => {
    let counter = m2.counter;
    console.log(`pre${counter}`); // 3
    
    m2.add();
    
    console.log(`after${counter}`); // 3
})
```

### CMD
#### 概述
和AMD差不多，只是在模块定义和模块加载上有些不同，AMD模块加载前置，提前加载+延迟执行，CMD lazy load，依赖就近，用到的时候再去加载。

#### 特点
CMD推崇就近依赖，只有在用到某个模块的时候再去require，延迟执行，执行顺序和代码顺序一样，AMD加载完即执行回调函数。

#### 基础语法
```define(function(require, exports, module))``` require用来引用依赖模块，exports用于导出模块，module，定义模块统一用define，然后引用在内部用require，执行时```seajs.use('./index')```入口文件就ok了。

```
// 模块定义
define(function(require, exports, module) {
  const m1 = require('./module1'); // 加载m1

  function test(msg = 'test') {
    console.log(`m3_${m1.test(msg)}`);
  }

  // 异步加载m2
  require.async('./module2', (m2) => {
    console.log(m2.api_base);
  })

  module.exports.test = test;
})

// index.js 入口
define((require) => {
  const m1 = require('./module/module1'); // 引入m1
  const m3 = require('./module/module3'); // 引入m3
  
  // 代码执行顺序和代码顺序一致
  // 先执行m3输出，然后m1输出，然后是m3的异步部分
  m3.test();
  console.log(m1.test());
})
```

#### 加载机制
懒加载，用到的时候再去加载，可同步可异步，代码执行顺序和书写顺序一直


### ES6 Module
#### 特点
ES6 模块的设计思想是尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。CommonJS 和 AMD模块，都只能在运行时确定这些东西。比如，CommonJS 模块就是对象，输入时必须查找对象属性。
#### 基础语法
```
// module.js
let counter = 1;
function add() {
  counter++;
}

export {
 counter,
 add
}

// index.js
import { counter, add } from './module1';

console.log(`pre_${counter}`); // 1 

add();

console.log(`after_${counter}`); // 2
```

使用Babel将ES6编译为ES5代码，使用Browserify编译打包js
```
bable 源文件 -d 目标
browserify lib/index.js -o output/index.js
```

然后页面引用即可
#### 加载机制
ES6 module 是动态引用，在编译时就确定了引用关系，不用等到运行时，并且不会缓存值，模块值改变，引用也改变。

### 测试代码
git地址：[模块化学习代码](https://gitlab.com/Sisi--Love/module-test/-/tree/master)


### 总结
| 规范 | 主要实现 | 加载及执行方式 | 主要应用
| ---- | -------- |-------- |-------- |
| CommonJs | node | 同步加载，阻塞顺序执行 | 服务端，Node服务器
| AMD | require.js | 异步加载，延迟执行，依赖先执行，顺序不一定 | 浏览器
| CMD | sea.js | 异步加载，延迟执行，顺序和代码顺序一致 | 浏览器
| ES6 Module |  |动态引用，在编译时就确定了引用关系 | 浏览器和服务端

### Q&A
#### 模块加载机制
![](https://cbshowhot.cdn.changbaimg.com/!/baofang/steps.png)

大体上都是这样的，AMD/CMD衍生自CommonJS，主要分为以下几步。
1. 由程序入口进入程序
2. 创建Module仓库，防止重复加载模块，key表示模块ID，value代表模块功能
3. 向仓库注册模块，id标识，deps依赖模块，factory工厂函数，status状态（未加载，加载未执行，已执行等）
4. 模块就是JS文件，通过动态创建script标签引入
5. 解析模块依赖，requirejs还好，在入口处声明了模块的依赖模块，seajs不声明依赖，需要特殊处理，判断工厂函数然后通过正则判断找到例如require()等，加载所需模块，CMD保证顺序执行还需要一些特殊处理
6. 模块加载完成后（requirejs需要执行后，seajs只加载完成后，当时用require该模块时，才会执行工厂函数），若没加载完依赖，继续步骤3

#### AMD及CMD执行区别
CMD 依赖就近，可以看到AMD规范 a和b都在开始时就执行了1次，而在CMD规范中，a和b都被加载了，但是开始时都没执行，最终也只有一个被执行了。
```
// AMD 定义时就执行了
define([a, b], (a, b) => {
  const flag = true;
  
  if (flag) {
    a.test();
  } else {
    b.test();
  }
})

// CMD
define((require, exports, module) => {
  const flag = true;

  // 只有一个被执行了
  if (flag) {
    require('a').test();
  } else {
    require('b').test();
  }
})
```
