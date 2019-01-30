"use strict"
import fs from 'fs'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import util from "util"
import objectHelper from './helpers/objectHelper'
import events from 'events'
import paths from './../constants/paths'
//import bookStorage from './../constants/storage/book'
import bookManagerStorage from './../constants/storage/bookManager'
import eventForwarder from './helpers/eventForwarder'

let con = exconsole(logger, console)

class BookManager extends events.EventEmitter {
    constructor() {
        super()

        this.booksPath =  paths.booksCollectionFilePath //path.join(app.getPath('userData'), '/books.json')
        this.storage = bookManagerStorage

        this.currentBook = null

        this.bookCollection = []
        console.log(`book collection => ${this.bookCollection}`)

        eventForwarder(this.storage, this, false)//forward storage events
    }

    _getKeyFromBook(book) {
        if(!(objectHelper.isPropertyDefined(book, 'md5'))) {
            con.error(`Unable to find md5 property in: ${book}`)
            throw TypeError(`Unable to find md5 property in: ${book}`)
        }

        if(!(util.isString(book.md5))) {
            con.error(`MD5 has wrong format: ${book.md5}`)
            throw TypeError(`MD5 has wrong format: ${book.md5}`)
        }

        return book.md5
    }

    _getBookByKey(key) {
        let books = this.storage.get('books')

        let book = books.find(b => this._getKeyFromBook(b) == key)

        if(book === undefined)
            throw ReferenceError(`unable to find book with key: ${key}`)

        return book[0]
    }

    _invalidBookProps(book) {
        var isPropDefined = (o, p) => { o.hasOwnProperty(p) && (o[p] !== null && o[p] !== undefined) }

        if (!(isPropDefined(book, 'title') &&
            isPropDefined(book, 'path'))) {
            return true
        } else {
            return false
        }
    }

    addBook(book) {
        if (!(this._invalidBookProps(book))) {
            con.error('book.title or book.path is undefined')
            throw TypeError('book.title or book.path is undefined')
        }

        var key = this._getKeyFromBook(book)

        if (this.hasBook(key)) {
            con.error('unable to add book, its already exists: ' + book.path)
            throw TypeError('unable to add book, its already exists: ' + book.path)
        }

        this.bookCollection.push(book)
        this.emit('added', book)
    }

    removeBook(key) {
        if (!(this.hasBook(key))) {
            con.error('unable to remove book, its not exists: ' + book.path)
            throw TypeError('unable to remove book, its not exists: ' + book.path)
        }

        let found = this.bookCollection.findIndex(b => {
            return key === this._getKeyFromBook(b)
        })

        if(found < 0)
            throw ReferenceError(`unable to find book: ${book.key}`)

        this.storage.set('books', this.bookCollection.splice(found, 1))
        this.emit('removed', book)
    }

    hasBook(key) {
        var found = false

        Object.keys(this.bookCollection).forEach(ownedBook => {
            if(this.bookCollection[ownedBook]['md5'] == key) {
                found = true
            }
        })

        return found
    }

    /*
        return copy of books collection (if returned reference will
        be overriden, this not affect to bookManager.bookCollection reference)
        but object references defined in returned array could be overriden and
        affect to original collection change
    */
    getBooks() {
        return this.bookCollection.slice()
    }

    get CurrentBook() {
        return this.storage.get('currentBook')
    }

    set CurrentBook(book) {
        con.debug(`changing current book to ${book}`)
        this.storage.set('currentBook', book)

        this.emit('current', book)
    }

    save() {
        con.debug(`saving ${this.booksPath}`)

        return new Promise((resolve, reject) => {
            this.storage.set('books', this.bookCollection)
            this.storage.toFile(this.booksPath)
            .then(() => resolve())
            .catch((err) => reject(err))
        })
    }

    load() {
        con.debug(`loading ${this.booksPath}`)

        return new Promise((resolve, reject) => {
            this.storage.loadfromFile(this.booksPath)
            .then(() => {
                this.storage.isSet('books', false).then(() => {
                    this.bookCollection = this.storage.get('books').slice()
                    resolve()
                })
                .catch((err) => {
                    console.log(`unable to get isSet result: ${err}`)
                    resolve()
                })
            })
            .catch((err) => reject(err))
        })
    }



    getBook(key) {
        return this._getBookByKey(key)
    }
}

export default BookManager