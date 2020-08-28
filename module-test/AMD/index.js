(function(){
  require.config({
    paths: {
      module1: './module/module1',
      module2: './module/module2'
    }
  })

  require(['module2'], (m2) => {
    console.log(m2.getMsg('amdyes'));

    let counter = m2.counter;
    console.log(`pre${counter}`);

    m2.add();

    console.log(`after${counter}`);
  })

  require(['module1'], (m1) => {
    console.log(m1.toUpper('amdyes'));
  })

  setTimeout(() => {
    console.log(111);
  }, 1)
})()