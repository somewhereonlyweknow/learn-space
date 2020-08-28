const InterceptorManage = require('./myInterceptorManage');

function Axios(config) {
  this.default = config; // 默认配置

  this.interceptors = {
    // request: [],
    // response: []
    request: new InterceptorManage(), // InterceptorManage肯定含有一个use方法定义
    response: new InterceptorManage()
  }
}

Axios.prototype.request = function(config) {
  const chain = [dispatchRequest, undefined]; // undefined为了补位，{ resolved, rejectd } 相当于rejected: undefined

  let promise = Promise.resolve(config);


  /**
   * 请求拦截器先注册后执行
   * 响应拦截器先注册限制性
   * 不太明比啊为什么这么设计
   */

  // 将所有请求拦截器推到队首
  this.interceptors.request.forEach(interceptor => {
    chain.unshift(interceptor.fullfilled, interceptors.rejected);
  })

  // 将所有响应拦截器放到队尾
  this.interceptors.response.forEach(interceptor => {
    chain.push(interceptor.fullfilled, interceptors.rejected);
  })
  
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
}


module.exports = Axios;