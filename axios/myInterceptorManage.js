function InterceptorManage() {
  this.handlers = [];
}


/**
 * use方法在实例上使用的，所以定义在原型上
 * @param {Function} resolved
 * @param {Function} rejected 
 */
InterceptorManage.prototype.use = function(fullfilled, rejected) {
  this.handlers.push({
    fullfilled: fullfilled,
    rejected: rejected
  })
}


/**
 * this.interceptors.requset.forEach 转化为 this.interceptors.request.handlers.forEach
 */
InterceptorManage.prototype.forEach = function(fn) {
  this.handlers.forEach(interceptor => {
    fn(interceptor);
  })
}


module.exports = InterceptorManage;