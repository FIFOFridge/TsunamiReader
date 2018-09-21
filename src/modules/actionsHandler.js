import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import objectHelper from './helpers/objectHelper'
import electron from 'electron'
import util from 'util'
import events from 'events'
import fs from 'fs'
import epubHelper from './helpers/epubHelper'
import path from 'path'
import sharedAppStates from './../constants/sharedAppStates'

let con = exconsole(logger, console)

class ActionsHandler {
    constructor(router) {
        // if (!(router.prototype instanceof events.EventEmitter)) {
        //     con.error(`'router' doesn't implement EventEmiter`)
        //     throw TypeError(`'router' doesn't implement EventEmiter`)
        // }
        console.log(router.prototype)

        router.on('book-continue', this.onBookAdd)
        router.on('book-add', this.onBookAdd)
    }

    onBookAdd(params) {
        var mainWindow = electron.remote.getCurrentWindow()
        console.log(mainWindow)

        var appStateSync = electron.remote.getGlobal('appStateSync')
        console.log(appStateSync)

        //somethings still processed
        if(appStateSync.getPointValue(sharedAppStates.canAddBook) === false)
            return

        con.debug('opening select dialog')
        var files = electron.remote.dialog.showOpenDialog(
            mainWindow,
            {
                title: 'select epub file to read',
                properties: [
                    'openFile',
                    // 'multiSelections'
                ],
                filters: [
                    { name: 'epub', extensions: ['epub'] }
                ]
            }
        )

        console.log(files)
        con.debug(`selected file(s): ${files}`)

        var extractionPath = path.join(electron.remote.app.getPath('userData'), '/extracted/')
        extractionPath = path.join(extractionPath, path.basename(files[0]));

        console.log(`extraction path: ${extractionPath}`)

        //disable browser until current book will be processed
        appStateSync.setPointValue(sharedAppStates.canAddBook, false)

        epubHelper.setupEpub(files[0], extractionPath).then((value) => {
            con.debug(`successfully extracted epub: ${files[0]}`)
            appStateSync.setPointValue(sharedAppStates.canAddBook, true)
            console.log(value)
        }, (rejected) => {
            con.error(`unable to extract epub: ${rejected}`)
            appStateSync.setPointValue(sharedAppStates.canAddBook, true)
        })

        // bookManager.extractEpubFromFile(files[0]).then(
        //     (data) => {
        //         con.debug(`successfully extracted: ${files}`)
        //         console(`book metada:`, data)
        //     },
        //     (rejected) => {
        //         con.error(`extraction failed: ${rejected}`)
        //     }
        // )
    }

    onBookContinue(params) {

    }
}

export default ActionsHandler