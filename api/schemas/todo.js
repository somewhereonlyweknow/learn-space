let mongoose = require('mongoose');
module.exports = new mongoose.Schema({
  title: String,
  desc: String,
  isUrgent: Boolean,
  endTime: Number,
  imgUrl: String,
  openid: String,
  isDel: Number
})