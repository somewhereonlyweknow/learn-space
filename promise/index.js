// 封装一个简单的promise
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

// 顺序执行
getJSON('aabb').then(story => {
  addHtmlToPage(story.heading);

  // 获取章节内容
  // first 生成promise序列,顺序执行 
  // let queue = Promise.resolve();

  // story.chapterUrls.forEach((url) => {
  //   queue = queue.then(() => {
  //     return getJSON(url)
  //   }).then((v) => {
  //     addHtmlToPage(v);
  //   })
  // })

  // or
  return story.chapterUrls.reduce((queue, url) => {
    return queue.then(() => {
      return getJSON(url)
    }).then((v) => {
      addHtmlToPage(v);
    })
  }, Promise.resolve());


}).then(() => {
  addTextToPge('All done');
}).catch(err => {
  addTextToPge(err.message);
}).then(() => {
  this.showLoading = false;
})


/**
 * 并行
 * 同时加载，都加载结束后添加到页面
 */
getJSON('aabb').then(story => {
  addHtmlToPage(story.heading);

  return Promise.all(
    story.chapterUrls.map(getJSON)
  )
}).then((chapters) => {
  chapters.forEach((v) => {
    addHtmlToPage(v);
  })
  addTextToPge('All done');
}).catch(err => {
  addTextToPge(err.message);
}).then(() => {
  this.showLoading = false;
})

/**
 * 并行
 * 同事加载，按照一定顺序加到页面
 */
getJSON('aabb').then(story => {
  addHtmlToPage(story.heading);

  // 最后生成的须留 Promise.resolve().then(() => { return chapterPromise }).then((v) => { addHtmlToPage(v) })
  // 后一章节加载完成也要等待上一章节
  story.chapterUrls.map(getJSON).reduce((queue, chapterPromise) => {
    return queue.then(() => {
      return chapterPromise
    }).then(chapter => {
      addHtmlToPage(chapter);
    })
  }, Promise.resolve())
}).then((chapters) => {
  chapters.forEach((v) => {
    addHtmlToPage(v);
  })
  addTextToPge('All done');
}).catch(err => {
  addTextToPge(err.message);
}).then(() => {
  this.showLoading = false;
})




// 执行顺序是啥 你猜猜
// asyncThing1().then(function() {
//   return asyncThing2();
// }).then(function() {
//   return asyncThing3();
// }).catch(function(err) {
//   return asyncRecovery1();
// }).then(function() {
//   return asyncThing4();
// }, function(err) {
//   return asyncRecovery2();
// }).catch(function(err) {
//   console.log("Don't worry about it");
// }).then(function() {
//   console.log("All done!");
// })


/**
 * 用Promise实现每隔1s输出1，2，3
 */
function consoleTime() {
  const arr = [1, 2, 3];

  arr.reduce((queue, item) => {
    // return queue.then(() => {
    //   return new Promise(r => {
    //     setTimeout(() => {
    //       r(console.log(item));
    //     }, 1000)
    //   })
    // })

    // return queue.then(() => {
    //   setTimeout(() => {
    //     console.log(item);
    //   }, 1000)
    // })

    /**
     * then里面不是函数
     * 会发生值穿透，但是代码还是会执行，会在1s后同时打印1，2，3
     * 内部相当于同步代码，生成了3个task
     */ 
    return queue.then(new Promise(r => {
      setTimeout(() => {
        r(console.log(item))
      }, 1000)
    }))
  }, Promise.resolve());
}

/**
 * 实现红黄绿灯交替亮
 * 红灯3s一次 黄灯2s一次 绿灯1s一次
 */
function red() {
  console.log('red');
}
function green() {
  console.log('green');
}
function yellow() {
  console.log('yellow');
}

function traficLight() {
  const arr = [3, 2, 1];

  const queues = Promise.resolve();

  function arrReduce() {
    arr.reduce((queue, item) => {
      return queue.then(() => {
        return new Promise((r) => {
          setTimeout(() => {
            // 用判断来写的 不是很好
            if (item === 3) {
              r(red());
            } else if (item == 2) {
              r(yellow());
            } else if (item == 1) {
              // 原本想用while true去实现无限，发现比较浪费，每次到最后一个在调用一次给queues增加then就好了
              arrReduce();
              r(green());
            }
          }, item * 1000)
        })
      })
    }, queues)
  }

  arrReduce();
}

const light = (timer, cb) => {
  return new Promise(r => {
    setTimeout(() => {
      cb();
      r();
    }, timer)
  })
}

function step() {
  Promise.resolve().then(() => {
    return light(3000, red);
  }).then(() => {
    return light(2000, yellow);
  }).then(() => {
    return light(1000, green);
  }).then(() => {
    // 实现不断重复
    return step();
  })
}


/**
 * 实现mergePromise函数
 * 将传入的promise数组按顺序执行，返回结果数组
 * 和Promise.all不同的是要按照顺序执行，一个结束才能下一个
 */
const time = (timer) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, timer)
  })
}
const ajax1 = () => time(2000).then(() => {
  console.log(1);
  return 1
})
const ajax2 = () => time(1000).then(() => {
  console.log(2);
  return 2
})
const ajax3 = () => time(1000).then(() => {
  console.log(3);
  return 3
})

// 要返回一个promise
function mergePromise (ajaxArray) {
  // 存放每个ajax的结果
  const data = [];
  let promise = Promise.resolve();
  // ajaxArray.forEach(ajax => {
  // 	// 第一次的then为了用来调用ajax
  // 	// 第二次的then是为了获取ajax的结果
  //   promise = promise.then(ajax).then(res => {
  //     data.push(res);
  //     return data; // 把每次的结果返回
  //   })
  // })

  // 用reduce一定要返回reduce的结果，而不是promise
  let res = ajaxArray.reduce((queue, ajax) => {
    return queue.then(ajax).then((v) => {
      data.push(v);
      return data;
    })
  }, promise)


  // 最后得到的promise它的值就是data
  return res;
}

mergePromise([ajax1, ajax2, ajax3]).then(data => {
  console.log("done");
  console.log(data);
});


/**
 * 封装一个加载图片的Promise
 * @param {String} url 
 */
function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve(img);
    }

    img.onerror = (e) => {
      reject(e)
    }

    img.src = url;
  })
}

/**
 * 限制并发 同事尽快完成
 */
function limitload(urls, handler, limit) {
  const queue = [].concat(urls);

  // 取前几个，生成一个Promise数组
  let promises = queue.splice(0, limit).map((url, index) => {
    handler(url).then(() => {
      // 拿到处理完的下标，作为替换用
      return index;
    })
  })

  queue.reduce((p, url) => {
    return p.then(() => {
      return Promise.race(promises)
    }).then((index) => {
      promises[index] = handler(url).then(() => {
        return index;
      }).catch(e => {
        console.log(e);
      })
    })
  }, Promise.resolve()).then(() => {
    // 剩下最后3个 一起执行
    return Promise.all(promises);
  })
}

/**
 * 异常捕获
 */
Promise.resolve().then(() => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // resolve(11);
      // reject(11);

      // 无法捕获 就相当于try-catch 无法捕获setTimeout的异常， 如果这么做 Promise就一直卡在这里pending
      // 最后的代码相当于调用try{ x = new Promise((resolve, reject) = { setTimeout() => { throw Error(11) } }) } catch(e => { reject(e) })
      // try-catch无法捕获setTimeout的异常 所以Promise一直pending， 错误会显示在控制台
      // throw Error('1');

      reject(1); // 这样返回错误，会被catch
    })
  })
}).then(v => {
  console.log(v);
}).catch(e => {
  console.log('异常', e);
})