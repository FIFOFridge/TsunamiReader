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
import bookStorage from './../constants/storage/book'

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
        return book.get('md5')
    }

    _getBookByKey(key) {
        // let books = this.storage.get('books')
        let books = this.bookCollection

        let book = books.find(b => this._getKeyFromBook(b) === key)

        if(book === undefined)
            throw ReferenceError(`unable to find book with key: ${key}`)

        return book
    }

    addBook(url, cover, md5, isLocal, metadata) {
        let book = bookStorage //get new bookStorage

        book.set('url', url)
        book.set('isLocal', isLocal)
        book.set('md5', md5)
        book.set('cover', cover)
        book.set('metadata', metadata)

        let key = this._getKeyFromBook(book)

        if (this.hasBook(key)) {
            con.error('unable to add book, its already exists: ' + book.get('url'))
            throw TypeError('unable to add book, its already exists: ' + book.get('url'))
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
            let bookKey = this._getKeyFromBook(this.bookCollection[ownedBook])

            if(bookKey == key) {
                found = true
            }
        })

        return found
    }

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
                    let books = this.storage.get('books').slice()
                    let processedBooks = []

                    for(let i = 0; i < books.length; i++) {
                        let book = bookStorage
                        //console.log(`book: ${book}`)
                        let bookProps = JSON.stringify(books[i]._props)
                        book.loadFromString(bookProps) //re-create embedded storage model @TODO: implement feture for storage.js to auto re-create embedded storages

                        processedBooks.push(book)
                    }

                    this.bookCollection = processedBooks
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