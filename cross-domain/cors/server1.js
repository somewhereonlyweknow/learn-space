const express = require('express');

let app = express();

app.use(express.static(__dirname));

app.listen(3002, () => {
  console.log('启动了');
})