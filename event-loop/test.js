/**
 * setTimeout & setImmediate执行顺序问题
 */
// setTimeout(() => {
//   console.log('setTimout');
// })
// setImmediate(() => {
//   console.log('setImmediate');
// })







// setTimeout(() => {
//   console.log('setTimout');
// }, 0)

// const start = new Date();
// while (Date.now() - start < 10); // 先延时一段，保证setTimeour定时器时间已经到了


// setImmediate(() => {
//   console.log('setImmediate');
// })



// const fs = require('fs')

// fs.readFile(__dirname, () => {
// setTimeout(() => {
//   setTimeout(() => {
//     console.log('setTimeout')
//   }, 0)
// })
  
// setTimeout(() => {
//   setImmediate(() => {
//     console.log('setImmediate')
//   })
// })


// function get(url) {
//   return new Promise((resolve, reject) => {
//     const req = new XMLHttpRequest();

//     req.open('GET', url);

//     req.onload(() => {
//       if (req.status == 200) {
//         resolve(req.response);
//       } else {
//         reject(Error(req.statusText));
//       }
//     })

//     req.onerror(() => {
//       reject(Error('Network error'));
//     })

//     req.send();
//   })
// }

// function getJSON(url) {
//   return get(url).then(JSON.parse).catch(err => {
//     console.log(err);
//     throw err;
//   })
// }

// let res = getJSON('a.json'); // ajax获取一个json串

// setTimeout(() => {
//   res = Promise.resolve(1)
// })

// res.then(r => console.log(r));

