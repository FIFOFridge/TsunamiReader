import path from 'path'
import fs from 'fs'
import util from 'util'
import paths from '@constants/paths'
import bookModel from '@models/book'
import * as fileHelper from '@helpers/fileHelper'

export class BookManager {
    static async put(bookModel) {
        const key = bookModel.get('hash')

        if(BookManager.has(id))
            throw new Error(`book with id: ${id} already exists`)

        if(hash.length < 1)
            throw new Error(`book model has incorrect hash: ${key}`)

        const bookModelPath = fileHelper.appendLockExtension(
            BookManager._getPath(id)
        )

        await bookModel.toFile(bookModelPath)
        fileHelper.trimSpecialExtension(bookModelPath)

        return undefined // resolve()
    }

    static async get(id) {
        if(!(BookManager.has(id)))
            throw new Error(`unable to get book data path: ${id}`)

        return bookModel.fromFile(BookManager._getPath(id))
    }

    static getThumbnailPath(id) {
        if(!(BookManager.hasThumbnail(id)))
            throw new Error(`unable to get thumbnail path: ${id}`)

        return BookManager._getThumbnailPath(id)
    }

    static has(id) {
        const path = BookManager._getPath(id)
        return fs.existsSync(path)
    }

    static hasThumbnail(id) {
        const path = BookManager._getThumbnailPath(id)
        return fs.existsSync(path)
    }

    static async update(bookModel) {
        const key = bookModel.get('hash')
        const filePath = BookManager._getPath(key)

        if(!(BookManager.has(id)))
            throw new Error(`book with id: ${id} don't exists`)

        await fileHelper.backup(filePath)
        await BookManager.delete(filePath)
        await BookManager.put(filePath)
        await fileHelper.cleanBackup(filePath)

        return undefined // resolve()
    }

    static async delete(bookModelOrId) {
        let key = ''

        if(util.isString(bookModelOrId)) {
            key = bookModelOrId
        } else {
            key = bookModelOrId.get('hash')
        }

        if(key.length < 1)
            throw new Error(`wrong book model hash/id: ${key}`)

        const path = BookManager._getPath(key)
        fs.unlink(path, err => {
            if(err)
                throw new Error(`unable to delete file: ${path}, error: ${err}`)

            return undefined
        })
    }

    static _getPath(id) {
        return path.join(paths.booksDirectory, id)
    }

    static _getThumbnailPath(id) {
        return path.join(paths.thumbnailsDirectory, id)
    }
}