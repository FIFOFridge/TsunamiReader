import path from 'path'
import fs from 'fs'
import util from 'util'
import paths from '@constants/paths'
import bookModel from '@models/book'
import * as fileHelper from '@helpers/fileHelper'
import { specialFileExtensions } from '@constants/index'
import { log } from '@app/log'

export class BookManager {
    static async put(bookModel) {
        const hash = bookModel.get('hash')

        if(BookManager.has(hash))
            throw new Error(`book with hash: ${hash} already exists`)

        if(hash.length < 1)
            throw new Error(`book model has incorrect hash: ${hash}`)

        const bookModelPath = fileHelper.appendLockExtension(
            BookManager._getPath(id)
        )

        await bookModel.toFile(bookModelPath)
        fileHelper.trimSpecialExtension(bookModelPath)

        return undefined // resolve()
    }

    static async get(hash) {
        if(!(BookManager.has(hash)))
            throw new Error(`unable to get book data path: ${hash}`)

        return bookModel.fromFile(BookManager._getPath(hash))
    }

    static getThumbnailPath(hash) {
        if(!(BookManager.hasThumbnail(hash)))
            throw new Error(`unable to get thumbnail path: ${hash}`)

        return BookManager._getThumbnailPath(hash)
    }

    static has(hash) {
        const path = BookManager._getPath(hash)
        return fs.existsSync(path)
    }

    static hasThumbnail(hash) {
        const path = BookManager._getThumbnailPath(hash)
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

    static _getPath(hash) {
        return path.join(paths.booksDirectory, hash)
    }

    static _getThumbnailPath(hash) {
        return path.join(paths.thumbnailsDirectory, hash)
    }

    static async _hasAnyDamagedBooks() {
        let has = false

        fs.readdir(paths.booksDirectory, (err, files) => {
            if(err)
                throw `unable to check for damaged books: ${err}`

            for(let file in files) {
                // noinspection EqualityComparisonWithCoercionJS
                if(
                    path.extname(file) == specialFileExtensions.Backup ||
                    path.extname(file) == specialFileExtensions.Lock
                ) {
                    has = true
                    break
                }

            }
        })

        return has
    }
}