import request from 'request'
import * as Promise from 'bluebird'

const apiUrl = `https://openlibrary.org/dev/docs/api/books?`

export function getInformation(isbn, timeout = 3000) {
    let promise = Promise((resolve, reject) => {

        let requestUrl = apiUrl + '?bibkeys=ISBN:' + isbn + '&format=json' + '&jscmd=data'

        request.get(requestUrl, (err, response, body) => {

        })
    })
}

//    "babel-core": "^6.26.3",