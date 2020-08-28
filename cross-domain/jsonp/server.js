const express = require('express');

let app = new express();

app.get('/', (req, res) => {
  console.log('/');
})

app.get('/test', (req, res) => {
  let fn = req.query.fn;

  console.log('请求了');

  res.end(`${fn}('测试数据')`);
})

app.listen(3001, () => { console.log('启动了'); })