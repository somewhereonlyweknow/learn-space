let mongoose = require('mongoose');
module.exports = new mongoose.Schema({
  nickName: String,
  gender: Number,
  language: String,
  city: String,
  province: String,
  country: String,
  avatarUrl: String,
  openid: String,
})