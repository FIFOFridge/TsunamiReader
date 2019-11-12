import path from 'path'
import ZipStream from 'node-stream-zip'
import fs from 'fs'
import xml2js from 'xml2js'
import util from "util";
import base64img from "base64-img";
import { viewModelBase } from '@viewmodels/viewModelBase'
import { build } from '@viewmodels/viewModelBuilder'
import { BookWatcher } from '@helpers/bookWatcher'
import { log } from '@app/log'
import paths from '@constants/paths'
import bookModel from '@models/book'
import metadataFields from '@constants/epubMetadataTags'
import views from '@constants/views'
import * as Promise from 'bluebird'
import { EpubProcessor } from '@modules/epubProcessor'
import { BookManager } from '@modules/bookManager'
import { getXXFileHash } from '@helpers/hashHelper'

const _ShelfViewModel = {
    //IMPORTANT: this data isn't compatible with vue format but its
    //         : needed for objects merging, and this will be handled by viewmodel builder
    data: {
        viewName: 'Shelf',
        bookModels: [],
        bookHelper: undefined,
        // isBookAddEnabled: true (view)
    },
    created: function () {
        this.tryCallBaseHook('created')
        this.synchronizeAppState(views.Shelf)
            .catch(err => {
                log.error(`unable to synchronize app state: ${err}`)
            })
            .then(() => {
                log.verbose(`successfully synchronized app state`)
            })
    },
    mounted: function () {
        this.tryCallBaseHook('mounted')

        // this.initBookFilesWatch()
    },
    beforeDestroy: function () {
        this.tryCallBaseHook('beforeDestroy')

        if(this.bookHelper !== undefined) {
            this.bookHelper.removeListener('added')
            this.bookHelper.removeListener('removed')
            this.bookHelper.dispose()
        }
    },
    methods: {
        // initBookFilesWatch: function () {
        //     this.bookHelper = new BookWatcher(paths.booksDirectory, false)
        //
        //     this.bookHelper.beginWatch()
        //         .then(() => {
        //             this.bookHelper.addListener('added', this.addBook.bind(this))
        //             this.bookHelper.addListener('removed', this.removeBook.bind(this))
        //         })
        //         .catch(err => {
        //             log.error(`unable to attach book watcher: ${err}`)
        //             //TODO: mabey some walkaround?
        //         })
        // },
        processBook: async function(path) {
            this.isBookAddEnabled = false

            try {
                const hash = await getXXFileHash(path)

                if(BookManager.has(hash)) {
                    // throw new Error(`current book already exists `)
                    //TODO: display warning about already existing book
                    return undefined //resolve()
                }

                const processor = new EpubProcessor(path)

                await processor.parseMetadata()
                const model = processor.toBookModel()

                await BookManager.put(model)
            } catch(e) {
                log.error(`unable to parse process book: ${e}`)
            } finally {
                this.isBookAddEnabled = true
            }

            return undefined
        },
        //process book model and map it to grid item
        // addBook: function (path) {
        //         let model = bookModel
        //
        //         model.fromFile(path)
        //             .then(() => {
        //                 try {
        //                     let gridItem = {}
        //
        //                     const storageValueExtractor = (key, storage) => {
        //                         try {
        //                             if (storage.isSet(key, true)) {
        //                                 return storage.get(key)
        //                             } else {
        //                                 log.error(`key not found: ${key} --> check book data model`)
        //                                 return undefined
        //                             }
        //                         } catch (e) {
        //                             log.error(`unable to extract: ${key}`)
        //                             return undefined
        //                         }
        //                     }
        //
        //                     //map book model to grid item
        //                     for (let metaTag in metadataFields) {
        //                         let value = storageValueExtractor(metaTag, model)
        //
        //                         if (value !== undefined)
        //                             gridItem[metaTag] = value
        //                     }
        //
        //                     //hash will be used as id for object manipulation
        //                     gridItem.hash = model.get('hash')
        //
        //                     this.bookTiles.push(gridItem)
        //                     this.bookModels.push(model)
        //                 } catch(err) {
        //                     //TODO: display error by UI
        //                     let dump = undefined
        //
        //                     try {
        //                         //read sync should be fine to read
        //                         //metadata file only
        //                         const fileContent = fs.readSync(path)
        //                         const modelContent = model !== undefined ? model.toString() : 'unable to get model'
        //
        //                         dump = `raw metadata: ${fileContent}\nmodel: ${modelContent}`
        //                     } catch (e) {
        //                         dump = `unable to dump details: ${e}`
        //                     }
        //
        //                     log.error(`unable to add process book metadata: ${err}\ndump: ${dump}`)
        //                 }
        //             })
        //             .catch(err => {
        //                 //TODO: display error by UI
        //                 log.error(`unable to add process book metadata: ${err}`)
        //             })
        // },
        // removeBook: function (hash) {
        //     const tileIndex = this.bookTiles.findIndex(o => { return o.hash === hash })
        //
        //     if(tileIndex < 0)
        //         return
        //
        //     //remove from collection
        //     this.bookTiles.splice(tileIndex, 1)
        //
        //     const modelIndex = this.bookModels.findIndex(o => {
        //         return o.get('hash') === hash }
        //     )
        //
        //     if(modelIndex < 0) {
        //         log.error(`unable to remove book model with hash: ${hash}`)
        //         return
        //     }
        //
        //     let model = this.bookModels[modelIndex]
        //
        //     //have to remove local file
        //     if(model.get('isLocal') === true) {
        //         fs.unlink(model.get('url'), err => {
        //             if(err) {
        //                 log.error(`unable to delete local metadata file: ${model.get('url')}`)
        //                 return
        //             }
        //
        //             this.bookModels.splice(modelIndex, 1)
        //         })
        //     } else {
        //         //simply remove element from grid
        //         this.bookModels.splice(modelIndex, 1)
        //     }
        // }
        //
    }
}

export const ShelfViewModel = build(viewModelBase, _ShelfViewModel)