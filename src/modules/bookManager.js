"use strict"
import fs from 'fs'
import { app } from 'electron'
import path from 'path'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'

let con = exconsole(logger, console)

class BookManager {
    constructor(fnOnBookChange) {
        this.booksPath = path.join(app.getPath('userData'), '/books.json')
        this.fnOnBookChange = fnOnBookChange
        this.currentBook = null
        this.bookCollection = {}

        if (fs.existsSync(this.booksPath)) {
            var booksContent = fs.readFileSync(this.booksPath, 'UTF8')
            this.bookCollection = JSON.parse(booksContent)
        } else {
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
        this.currentBook = book
    }
}

export default BookManager