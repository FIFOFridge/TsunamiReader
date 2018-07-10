"use strict"
import fs from 'fs'
import { app } from 'electron'
import path from 'path'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import util from "util";

let con = exconsole(logger, console)

class BookManager {
    constructor() {
        this.booksPath = path.join(app.getPath('userData'), '/books.json')
        this.currentBook = null
        this.bookCollection = {}
        this.hooks = []

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
        return book.path.toLowerCase()
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

    addHook(fn) {
        if(!(util.isFunction(fnOnBookChange))) {
            con.error(`onBookChange has to be function`)
            TypeError(`onBookChange has to be function`)
        }

        this.hooks.push(fn)
    }

    _callHooks(book, eventName) {
        this.hooks.forEach(fn => {
            fn(book, eventName)
        });
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
        this._callHooks(book, 'added')
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
        this._callHooks(book, 'removed')
    }

    hasBook(book) {
        if (!(_invalidBookProps(book))) {
            con.error('book.tile or book.path is undefined')
            throw TypeError('book.tile or book.path is undefined')
        }

        var key = this._getKeyFromBook(book)

        if (this.bookCollection.hasOwnProperty(key)) {
            return this.bookCollection[key] !== null ? true : false
        } else {
            return false
        }
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

    get getCurrentBook() {
        return this.currentBook
    }

    set setCurrentBook(book) {
        con.debug(`changing current book to ${book}`)
        this.currentBook = book
        this._callHooks(book, 'current')
    }

    save() {
        con.debug(`saving ${tihs.booksPath}`)
        fs.writeFileSync(this.booksPath, JSON.stringify(this.bookCollection))
    }
}

export default BookManager