var express = require('express');
var router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const User = require('../models/user');
const Todo = require('../models/todo');
const wechatCrypt = require('../util/wechatCrypt');
const appID = 'wx773b8d6997c6e561';
let multer = require('multer');
let sessionKey = '';
let openid = "";

// let filename = "";

var storage = multer.diskStorage({
  destination: function (req, file, cb){
    cb(null, 'public/upload')
  },
  filename: function (req, file, cb){
    // filename = file.originalname;
    cb(null, file.originalname)
  }
});
var upload = multer({
  storage: storage
});

const checkToken = (token) => {
  let hash_sha256 = crypto.createHash("sha256");
  hash_sha256.update(sessionKey + openid);
  let result = hash_sha256.digest("hex");
  if(result == token) {
    return true;
  }
  return false;
}

router.use(function(req, res, next){
  //请求拦截 设置返回值的统一格式
  resData = {data: {}, code: 0, msg: ""};
  // console.log(req.body);
  //校验token
  // if(!req.url.includes("/login") && !req.url.includes("addTodo")){
  //   //获得get和post请求的token
  //   let token = req.query.token || req.body.token;
  //   if(!checkToken(token)){
  //     resData.code = -2;
  //     resData.msg = "token不存在或者过期";
  //     res.send(resData);
  //   }else{
  //     console.log("token校验通过");
  //     next();
  //   } 
  // }else {
  //   delete req.body.token;
    next();
  // }
})

/* GET users listing. */
router.get('/', function(req, res, next) {
  let code = req.query.code;
  res.send('respond wiht a resource');
});

router.get('/test', function(req, res, next){
	resData.data = {msg: '11111'};
	res.send(resData);
});

//获取session_key和openid
router.get('/login', function(req, res, next) {
  const appSecret = '4bde47692ec26a012a1ee4bd4ba4e6ba';
  let code = req.query.code;
  let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appID}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
  axios.get(url)
    .then(response => {
      let hash_sha256 = crypto.createHash("sha256");
      hash_sha256.update(response.data.session_key + response.data.openid);
      let result = hash_sha256.digest("hex");
      openid = response.data.openid;
      sessionKey = response.data.session_key;
      //存储session_key
      resData.data = {token: result};
      res.send(resData);
    })
    .catch(err => {
      resData.code = -1;
      res.send(resData);
    })
});

//登陆后记录user
router.post('/todo/addUser', function(req, res) {
  //解密encryptedData,后来发现没啥用
  // let pc = new wechatCrypt(appID,sessionKey);
  // let data = pc.decryptData(req.body.encryptedData, req.body.iv);
  // let unionid = data.
  User.find({'openid': openid}, (err, user) => {
    if(user != "") {
      resData.msg = "用户已存在可直接登录";
    }else {
      let user = new User(Object.assign(req.body, {openid: openid}));
      user.save(function(err){
        if(!err) {
          resData.msg = "注册成功，即将登录";
        }
      });
    }
    res.send(resData);
  })
})


router.get('/todo/getTodoList', (req, res) => {
  let now = new Date().getTime();
  Todo.find({'openid': openid, isDel: 0}).sort({'isUrgent': -1, 'endTime': 1}).exec((err, todo) => {
    if(todo == "" || todo == []){
      res.send(resData);      
    }else {
      resData.data = todo;
      res.send(resData);      
    }
  })
})

router.post('/todo/addTodo', upload.single('image'), (req, res) => {
  console.log(req.file);
  let imgUrl = "";
  
  if(req.file != undefined) {
    imgUrl = "/upload/" + req.file.originalname;
  }
  delete req.body.token;
  let todo = new Todo(Object.assign(req.body, { imgUrl: imgUrl, openid: openid, isDel: 0}));
  todo.save(err => {
    if(!err) {
      resData.msg = "添加成功";
    }else {
      resData.code = -1;
      resData.msg = "添加失败";
    }
    res.send(resData);  
  })
})

router.post('/todo/delTodo', (req, res) => {
  let id = req.body.id;
  Todo.findByIdAndUpdate(id, {$set: {isDel: 1}}, function(err) {
    if(!err) {
      resData.msg = "删除成功";
      res.send(resData);
    }
  })
})

module.exports = router;
