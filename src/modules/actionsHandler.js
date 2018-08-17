import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import objectHelper from './helpers/objectHelper'
import electron from 'electron'
import util from 'util'
import events from 'events'

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

        if (util.isArray(files) && files.length > 0)
            return files
        else
            return undefined

    }

    onBookContinue(params) {

    }
}

export default ActionsHandler