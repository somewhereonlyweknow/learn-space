const express = require('express');

let app = express();

app.get('/test', (req, res) => {
  res.end('测试测试');
})

app.listen(3005, () => {
  console.log('启动了');
})