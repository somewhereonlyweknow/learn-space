"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var counter = 1;
function add() {
  exports.counter = counter += 1;
}

exports.counter = counter;
exports.add = add;