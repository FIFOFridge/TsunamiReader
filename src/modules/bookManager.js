"use strict"
import fs from 'fs'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import util from "util"
import objectHelper from './helpers/objectHelper'
import events from 'events'
import paths from './../constants/paths'
import bookStorage from './../constants/storage/book'

let con = exconsole(logger, console)

class BookManager extends events.EventEmitter {
    constructor() {
        super()

        this.booksPath =  paths.booksCollectionFilePath //path.join(app.getPath('userData'), '/books.json')
        this.currentBook = null
        this.bookCollection = {}
        
        this.settings = {
            readEpubAsyncTimeout: 20000 //20seconds
        }

        if (fs.existsSync(this.booksPath)) {
            con.debug(`reading ${this.booksPath}`)
            var booksContent = fs.readFileSync(this.booksPath, 'UTF8')
            this.bookCollection = JSON.parse(booksContent)
        } else {
            con.warn(`unable to find: ${this.booksPath}, writing new one`)
            fs.writeFileSync(this.booksPath, JSON.stringify(this.bookCollection))
        }
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

    _invalidBookProps(book) {
        var isPropDefined = (o, p) => { o.hasOwnProperty(p) && (o[p] !== null && o[p] !== undefined) }

        if (isPropDefined(book, 'title') &&
            isPropDefined(book, 'path')) {
            return true
        } else {
            return false
        }
    }

    addBook(book) {
        if (!(_invalidBookProps(book))) {
            con.error('book.tile or book.path is undefined')
            throw TypeError('book.tile or book.path is undefined')
        }

        var key = this._getKeyFromBook(book)

        con.debug('adding book: ' + book.title + ' (' + book.path + ')')

        if (this.hasBook) {
            con.error('unable to add book, its already exists: ' + book.path)
            throw TypeError('unable to add book, its already exists: ' + book.path)
        }

        this.bookCollection[key] = book
        this.bookCollection[key]['settings'] = bookStorage
        this.emit('added', book)
    }

    removeBook(book) {
        if (!(_invalidBookProps(book))) {
            con.error('book.tile or book.path is undefined')
            throw TypeError('book.tile or book.path is undefined')
        }

        var key = this._getKeyFromBook(book)

        con.debug('removing book: ' + book.title + ' (' + book.path + ')')

        if (!(this.hasBook)) {
            con.error('unable to remove book, its not exists: ' + book.path)
            throw TypeError('unable to remove book, its not exists: ' + book.path)
        }

        this.bookCollection[key] = null
        this.emit('removed', book)
    }

    hasBook(book) {
        if (!(_invalidBookProps(book))) {
            con.error('book.tile or book.path is undefined')
            throw TypeError('book.tile or book.path is undefined')
        }

        var key = this._getKeyFromBook(book)
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
        return this.currentBook
    }

    set CurrentBook(book) {
        con.debug(`changing current book to ${book}`)
        this.currentBook = book

        this.emit('current', book)
    }

    save() {
        con.debug(`saving ${tihs.booksPath}`)

        return new Promise((resolve, reject) => {
            fs.writeFile(this.booksPath, JSON.stringify(this.bookCollection), (err) => {
                if (err) {
                    con.error(`error occured while saving: ${this.booksPath}, error: ${err}`)
                    reject(err)
                } else {
                    con.debug(`successfully saved: ${this.booksPath}`)
                    resolve()
                }
            })
        })
    }

    getBookSettings(book) {
        var key = this._getKeyFromBook(book)

        return this.bookCollection[key]['settings']
    }
}

export default BookManager