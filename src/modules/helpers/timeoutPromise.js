//based on: https://gist.github.com/john-doherty/bcf35d39d8b30d01ae51ccdecf6c94f5
class PrmoiseTimeoutError extends Error {
    constructor(...args) {
        super(...args)
        Error.captureStackTrace(this, PrmoiseTimeoutError)
    }
}

export default function(ms, promise, message = ''){
    return new Promise((resolve, reject) => {
        let timer

        if(ms > 0) {
            timer = setTimeout(function(){
                reject(new PrmoiseTimeoutError(message))
            }, ms)
        }

        promise
        .then(function(res){
            if(ms > 0)
                clearTimeout(timer)

            resolve(res)
        })
        .catch(function(err){
            if(ms > 0)
                clearTimeout(timer)

            reject(err)
        })
    })
  }