'use strict';

var _module = require('./module1');

var _module2 = require('./module2');

var m2 = _interopRequireWildcard(_module2);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

console.log('pre_' + _module.counter);

(0, _module.add)();

console.log('after_' + _module.counter);