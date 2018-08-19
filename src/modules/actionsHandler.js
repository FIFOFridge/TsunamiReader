import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import objectHelper from './helpers/objectHelper'
import electron from 'electron'
import util from 'util'
import events from 'events'
import bookManager from './bookManager'

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
        var mainWindow = null

        if (objectHelper.isPropertyDefined(global.windowsManager)) {
            con.debug(`global.windowManager is defined`)
            mainWindow = global.windowsManager.getWindow('main')
        } else {
            con.debug(`global.windowsManager isn't defined`)
        }

        con.debug('opening select dialog')
        var files = electron.remote.dialog.showOpenDialog(
            mainWindow,
            {
                title: 'select epub file to read',
                properties: [
                    'openFile',
                    'multiSelections'
                ],
                filters: [
                    { name: 'epubs', extensions: ['epub'] }
                ]
            }
        )

        // con.debug(`selected file(s): ${files}`)
        var promises = []

        if (!((util.isArray(files) && files.length > 0) || util.isString(files)))
            return //no files selected, so return

        if(util.isString(files)) { //single file selected
            bookManager.parseEpub()
        } else { //array of files paths
            //for(var i = 0; i < files; i++) {
            //
            //} 
        }

        //bookManager.parseEpub
    }

    onBookContinue(params) {

    }
}

export default ActionsHandler