const uniq = require('uniq');
const module1 = require('./module/module1');
const module2 = require('./module/module2');
const module3 = require('./module/module3');

module1.test();

module2.test();

// console.log(uniq(module3.arr));

let count = module3.count;

console.log(count);

module3.add();

console.log(count);
console.log(module3.count);
