/**
* 定义polyfill方法，来源  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
*/

// Promise
Promise.prototype.finally = (function () {
  return function promiseFinally(handler) {
    const execHandler = () => {
      try {
        handler();
      } catch (e) {
        setTimeout(() => {
          throw e;
        }, 0);
      }
    };
    return this.then((value) => {
      execHandler();
      return value;
    }, (reason) => {
      execHandler();
      return Promise.reject(reason);
    });
  }
})();


