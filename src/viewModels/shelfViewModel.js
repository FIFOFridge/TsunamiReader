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
import { IPCBridgeRenderer } from "@ipc/bridge-renderer";
import ipcMainEvents from "@constants/ipcMainEvents";
import { isResponseSuccess } from "@ipc/bridge-shared";

const _ShelfViewModel = {
    //IMPORTANT: this data isn't compatible with vue format but its
    //         : needed for objects merging, and this will be handled by viewmodel builder
    data: {
        viewName: 'Shelf',
        bookModels: [],
        bookHelper: undefined,
        isBookWatcherAttached: false
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
        initBookFilesWatch: function () {
            this.bookHelper = new BookWatcher(paths.booksDirectory, false)

            this.bookHelper.beginWatch()
                .then(() => {
                    this.bookHelper.addListener('added', this.addBook.bind(this))
                    this.bookHelper.addListener('removed', this.removeBook.bind(this))
                })
                .catch(err => {
                    log.error(`unable to attach book watcher: ${err}`)
                    //TODO: mabey some walkaround?
                })
        },
        processBook: async function(path) {
            try {
                const hash = await getXXFileHash(path)

                if(BookManager.has(hash))
                    // noinspection ExceptionCaughtLocallyJS
                    throw new Error(`current book already exists `)

                const processor = new EpubProcessor(path)

                await processor.parseMetadata()
                await processor.processCover()

                await processor.dispose()

                const model = processor.toBookModel()

                await BookManager.put(model)
            } catch(e) {
                log.error(`unable to parse process book: ${e}`)
                throw e
            }

            return undefined
        },
        addLocalBook() {
            this.$refs.panelButtonAddBook.setState(false)

            IPCBridgeRenderer.send(
                ipcMainEvents.openBookBrowse,
                async reply => {
                    try {
                        if (!(isResponseSuccess(reply)))
                            // noinspection ExceptionCaughtLocallyJS
                            throw new Error(`unable to open book: ${reply.get('reason')}`)

                        await this.processBook(reply.get('value'))
                    } catch(ex) {
                        log.error(`unable to open book: ${reply.get('reason')}`)

                        //display messagebox
                        IPCBridgeRenderer.send(
                            ipcMainEvents.displayMessageBox,
                            null,
                            0,
                            `Error occurend when selecting book to open: ${ex.message}`,
                            `Unable to select book to open`,
                            'error',
                            ['Ok']
                        )
                    }

                    this.$refs.panelButtonAddBook.setState(true)
                },
                60000)
        }
    }
}

export const ShelfViewModel = build(viewModelBase, _ShelfViewModel)