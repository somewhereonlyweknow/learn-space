define(['module1'], function(m1) {
  function getMsg(msg) {
    return `${m1.toUpper(msg)}_m2`;
  }

  let counter = 3;

  function add() {
    this.counter++;
  }

  return { getMsg, add, counter }
})