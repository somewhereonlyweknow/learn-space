const express = require('express');

let app = express();

app.get('/index1.js', (req, res) => {
  setTimeout(() => {
    res.send('/index.js')
  }, 2000)
})

app.get('/index2.css', (req, res) => {
    setTimeout(() => {
      res.send('/index2.css')
    }, 1000)
  })
  

app.use(express.static(__dirname));

app.listen(3008, () => {
  console.log('启动了');
})