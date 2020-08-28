const mongoose = require('mongoose');
const todoSchema = require('../schemas/todo');
module.exports = mongoose.model('Todo', todoSchema);