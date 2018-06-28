"use strict"
import fs from 'fs'
import { app } from 'electron'
import hashtable from './helpers/hastable'
import path from 'path'

class BookManager {
    constructor(fnOnBookChange) {
        this.booksPath = path.join(app.getPath('userData'), '/books.json')
        this.fnOnBookChange = fnOnBookChange
        this.currentBook = null
        this.bookCollection = new hashtable()

        if (fs.existsSync(this.booksPath)) {
            var booksContent = fs.readFileSync(BooksManager.booksPath)
            this.bookCollection = JSON.parse(booksContent)
        } else {
            fs.writeFileSync(JSON.stringify(this.bookCollection))
        }
    }

    get getBooks() {
        return this.bookCollection
    }

    get getCurrentBook() {
        return this.currentBook
    }

    set setCurrentBook(book) {
        this.currentBook = book
    }
}

export default BookManager