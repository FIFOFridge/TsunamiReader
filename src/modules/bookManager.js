"use strict";
const fs = require('fs');
const remote = require('electron').remote;

var BookManager = {
    booksPath: path.join(remote.app.getPath('userData'), '/books.json'),
    books: [],
    currentBook: null,
    getCurrentBook: function() {
        return BookManager.currentBook;
    },
    setCurrentBook: function(book) {
        BookManager.currentBook = book;
    },
    saveBooks: function() {
        var booksContent = JSON.stringify(BookManager.books);
        fs.writeFileSync(BookManager.booksPath, booksContent);
    }
};

(function() {
    //load books
    var booksContent = fs.readFileSync(BooksManager.booksPath);
    BooksManager.books = JSON.parse(booksContent);
})

module.exports = BookManager;
