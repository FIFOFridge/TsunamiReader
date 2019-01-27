import electron from 'electron'
import epubHelper from './../modules/helpers/epubHelper'
import path from 'path'
import sharedAppStates from './../constants/sharedAppStates'
import exconsole from './../modules/helpers/loggerConsole'
import logger from './../modules/helpers/logger'

var con = exconsole(logger, console)

if (global.appEventsHandler === null || global.appEventsHandler === undefined) {
    /**
     * Handle app events 
     */
    class appEventsHandler {
        constructor() {
            //app events
            electron.ipcMain.on('book-add', this.addBook)
        }

        async addBook(event, args) {
            var mainWindow = global.mainWindow

            var appStateSync = global.appStateSync
    
            //somethings still processed
            if(appStateSync.getPointValue(sharedAppStates.canAddBook) === false)
                return
    
            var files = electron.dialog.showOpenDialog(
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
    
            var extractionPath = path.join(electron.app.getPath('userData'), '/extracted/')
    
            //disable browser until current book will be processed
            appStateSync.setPointValue(sharedAppStates.canAddBook, false)
    
            epubHelper.extractAndParse(files[0], extractionPath, true).then((value) => {
                con.debug(`successfully extracted epub: ${files[0]}`)
                appStateSync.setPointValue(sharedAppStates.canAddBook, true)
                appStateSync.setPointValue(sharedAppStates.registredBook, value)
                // console.log(value)
            }, (rejected) => {
                con.error(`unable to extract epub: ${rejected}`)
                appStateSync.setPointValue(sharedAppStates.canAddBook, true)
            })
        }
    }

    global.appEventsHandler = new appEventsHandler()
}

export default global.appEventsHandler