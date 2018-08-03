"use strict"
import fs from 'fs'
import { app, dialog, EventEmitter } from 'electron'
import path from 'path'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import util from "util";
import epubParser from 'epub-metadata-parser'
import objectHelper from './helpers/objectHelper'
import { EventEmitter } from 'events'
import { resolve } from 'dns';

let con = exconsole(logger, console)

class BookManager extends EventEmitter {
    constructor() {
        this.booksPath = path.join(app.getPath('userData'), '/books.json')
        this.currentBook = null
        this.bookCollection = {}
        
        this.settings = {
            readEpubAsyncThreshold: 10, //mb
            readEpubAsyncTimeout: 10000 //in ms
        }
        // this.hooks = []

        if (fs.existsSync(this.booksPath)) {
            con.debug(`reading ${this.booksPath}`)
            var booksContent = fs.readFileSync(this.booksPath, 'UTF8')
            this.bookCollection = JSON.parse(booksContent)
        } else {
            con.warn(`unable to find: ${this.booksPath}, writing new one`)
            fs.writeFileSync(this.booksPath, JSON.stringify(this.bookCollection))
        }
    }

    // _getKeyFromBook(book) {
    //     return book.path.toLowerCase()
    // }

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

    // addHook(fn) {
    //     if (!(util.isFunction(fnOnBookChange))) {
    //         con.error(`onBookChange has to be function`)
    //         TypeError(`onBookChange has to be function`)
    //     }

    //     this.hooks.push(fn)
    // }

    // _callHooks(book, eventName) {
    //     this.hooks.forEach(fn => {
    //         fn(book, eventName)
    //     });
    // }

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
        //this._callHooks(book, 'added')
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
        //this._callHooks(book, 'removed')
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
                break
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

    get getCurrentBook() {
        return this.currentBook
    }

    set setCurrentBook(book) {
        con.debug(`changing current book to ${book}`)
        this.currentBook = book
        //this._callHooks(book, 'current')
        this.emit('current', book)
    }

    browseEPUBs() {
        con.debug('opening select dialog')
        var files = dialog.showOpenDialog(
            {
                options: {
                    title: 'select epub file to read',
                    properties: [
                        'openFile',
                        'multiSelections'
                    ],
                    filters: [
                        { name: 'epubs', extensions: 'epub' }
                    ]
                }
            }
        )

        if(util.isArray(files) && files.length > 0)
            return files
        else
            return null
    }

    parseEPUB(filePath) {
        if(!(util.isString(filePath) && fs.existsSync(filePath))) {
            con.error('Wrong file path')
            throw TypeError('Wrong file path')
        }
        
        epubParser.parse(filePath, '@TODO', book => {
            if(objectHelper.isPropertyDefined(book, 'title'))//successfully parsed
            {
                book[path] = filePath
                return book
            }

            return null//error during parse
        })
    }

    save() {
        con.debug(`saving ${tihs.booksPath}`)
    //     fs.writeFileSync(this.booksPath, JSON.stringify(this.bookCollection))

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
}

export default BookManager