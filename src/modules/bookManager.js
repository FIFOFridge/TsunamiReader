"use strict";
import fs from 'fs';
import { remote } from 'electron';

export class BookManager {
    booksPath;
    books;
    currentBook;
    fnOnBookChange;

    constructor(fnOnBookChange) {
        this.booksPath = path.join(remote.app.getPath('userData'), '/books.json');
        this.books = [];
        this.fnOnBookChange = fnOnBookChange;

        if (fs.existsSync(this.booksPath)) {
            var booksContent = fs.readFileSync(BooksManager.booksPath);
            this.books = JSON.parse(booksContent);
        } else {
            fs.writeFileSync(JSON.stringify(this.books)); 
        }
    }

    get getBooks() {
        return this.books;
    }

    get getCurrentBook() {
        return this.currentBook;
    }

    set setCurrentBook(book) {
        this.currentBook = book;
    }
}
