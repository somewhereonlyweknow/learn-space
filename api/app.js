var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

//解析POST请求
var bodyparser = require("body-parser");

//mongDB通信中间件
var mongoose = require("mongoose");

//Cookies
var cookies = require('cookies');

var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// var multer = require('multer')().single();
// app.use(multer);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public'));

app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());

app.use('/api', apiRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
  // next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//connect mongodb
mongoose.connect("mongodb://localhost:27017/blog");
let db = mongoose.connection;
db.once("open", () => {
  console.log("connect success");
})
db.on("error", () => {
  console.log("connect error");
})

module.exports = app;
