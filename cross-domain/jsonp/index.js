const jsonp = (url, params, fn) => {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script');

    window[fn] = (data) => {
      resolve(data);

      script.remove();
    }

    params = { ...params, fn };

    let arr = [];

    for (let key in params) {
      arr.push(`${key}=${params[key]}`);
    }

    url += '?' + arr.join('&');

    script.src = url;
    console.log(script);
    document.body.appendChild(script);
  })
}

function test(msg) {
  console.log(msg);
}

jsonp('http://192.168.63.182:3001/test', {}, 'test').then(res => {
  console.log(res);
})