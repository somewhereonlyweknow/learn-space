const express = require('express');

let app = express();

const whiteList = ['http://192.168.63.182:3002'];

app.use((req, res, next) => {
  console.log(req.method);
  if (whiteList.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  }

  res.setHeader('Access-Control-Max-Age', 5)
  res.setHeader('Access-Control-Allow-Methods', 'PUT')
  res.setHeader('Access-Control-Allow-Headers', 'name')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Expose-Headers','name')
  next();
})

app.use((req, res, next) => {
  res.setHeader('test2', 'test2');
}, express.static(__dirname));



// app.get('/index.html', (req, res) => {
//   f
//   res.setHeader('test','test')
//   res.send('test');
// })

app.put('/test', (req, res) => {
  res.end('测试测试');
})

app.listen(3003, () => {
  console.log('启动了');
})