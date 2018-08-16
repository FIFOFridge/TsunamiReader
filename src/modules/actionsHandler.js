import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import objectHelper from './helpers/objectHelper'
import { dialog } from 'electron'
import events from 'events'

let con = exconsole(logger, console)

class ActionsHandler {
    constructor(router) {
        if (!(router.prototype instanceof events.EventEmitter)) {
            con.error(`'router' doesn't implement EventEmiter`)
            throw TypeError(`'router' doesn't implement EventEmiter`)
        }

        router.on('book-continue', this.onBookAdd)
        router.on('book-add', this.onBookAdd)
    }

    onBookAdd(params) {
        con.debug('opening select dialog')
        var files = dialog.showOpenDialog(
            {
                options: {
                    title: 'select epub file to read',
                    properties: [
                        'openFile',
                        'multiSelections'
                    ],
                    filters: [
                        { name: 'epubs', extensions: 'epub' }
                    ]
                }
            }
        )

        if (util.isArray(files) && files.length > 0)
            return files
        else
            return null

    }

    onBookContinue(params) {

    }
}