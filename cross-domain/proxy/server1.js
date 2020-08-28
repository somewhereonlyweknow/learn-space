const express = require('express');
const { createProxyMiddlewrae } = require('http-proxy-middleware');

const apiProxy = createProxyMiddlewrae('/test', {
  target: 'http://localhost:3005'
})

const app = express();
app.use(apiProxy);

app.list(3004, () => {
  console.log('启动了')
})