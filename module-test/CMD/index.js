define((require) => {
  const m1 = require('./module/module1');
  const m3 = require('./module/module3');

  m3.test();
  console.log(m1.test());
})