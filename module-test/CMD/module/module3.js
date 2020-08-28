define(function(require, exports, module) {
  const m1 = require('./module1');

  function test(msg = 'test') {
    setTimeout(() => {
      console.log(`m3_${m1.test(msg)}`);
    }, 1000)
  }

  require.async('./module2', (m2) => {
    console.log(m2.api_base);
  })

  module.exports.test = test;
})