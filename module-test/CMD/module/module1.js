define(function(require, exports, module) {
  module.exports = {
    name: 'liao',
    env: 'dev',
    id: '123',

    test: (msg = 'm1') => {
      return `m1_${msg}`;
    }
  }
}) 