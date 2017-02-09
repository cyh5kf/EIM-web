export function queuedPromises(promiseGenerators = []) {
    let resultPromise = Promise.resolve();
    promiseGenerators.forEach(promiseGen => {
        //resultPromise = resultPromise.then(() => new Promise((resolve, reject) => {
        //    setTimeout(() => promiseGen().then(resolve, reject), 2000);
        //}));
        resultPromise = resultPromise.then(promiseGen);
    });
    return resultPromise;
}

export function timeoutPromise(timeout = 200) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}
