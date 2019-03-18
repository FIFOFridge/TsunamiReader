import electron from 'electron'
import epubHelper from './../modules/helpers/epubHelper'
import path from 'path'
import sharedAppStates from './../constants/sharedAppStates'
import exconsole from './../modules/helpers/loggerConsole'
import logger from './../modules/helpers/logger'
import storage from './../modules/storage'
import util from 'util'
import fs from 'fs'

var con = exconsole(logger, console)

if (global.appEventsHandler === null || global.appEventsHandler === undefined) {
    /**
     * Handle app events 
     */
    class appEventsHandler {
        constructor() {
            let handlerConstructor = (handler, callback, onFail, onSuccess) => {
                let assertIsFunc = (f, fn) => { if(!util.isFunction(f) && f !== undefined) throw new TypeError(`${fn} is not a function`) }
                
                if(!(util.isFunction(handler)))
                    throw TypeError(`each event handler have to define "handler" function`)

                assertIsFunc(callback, 'callback')
                assertIsFunc(onFail, 'onFail')
                assertIsFunc(onSuccess, 'onSuccess')

                return {handler: handler, callback: callback, onFail: onFail, onSuccess: onSuccess, isRunning: false}
            }

            let events = [
                { name: 'book-add', value: handlerConstructor(this.addBook) },
                { name: 'book-open', value: handlerConstructor(this.openBook) },
                // { name: 'book-close', value: handlerConstructor(this.closeBook) }
                // { name: 'book-remove', value: handlerConstructor(this.bookRemove, undefine d) },
                // { name: 'app-settings-edit', value: handlerConstructor(this.appSettingsEdit, undefined) },
                // { name: 'reader-settings-edit', value: handlerConstructor(this.readerSettingsEdit, undefined) }
                // { name: 'send-logs', value: handlerConstructor(this.readerSettingsEdit, undefined) }
            ]
            
            //subscribe events
            events.forEach(_event => {
                electron.ipcMain.on(_event.name, async (event, args) => { 
                    this.executeEventHandler(event, args, _event.value, _event.name) 
                })
            })
        }

        async executeEventHandler(event, args, fns, eventName) {
            fns.isRunning = true
            let fn = fns.handler.apply(this, args)
            let isSuccessed = undefined

            if(!(fn instanceof Promise)) {
                throw TypeError(`handler isn't returning Promise`)
            }

            fn
            .then(value => {
                isSuccessed = true

                if(value !== undefined)
                    event.sender.send(eventName + '-reply', value)

                if(fns.onSuccess !== undefined)
                    fns.onSuccess(value)
            })
            .catch(err => {
                isSuccessed = false

                con.error(`event: ${eventName} error: ${err}`)

                if(fns.onFail !== undefined)
                    fns.onFail(err)
            })
            .finally(() => {
                if(fns.callback !== undefined)
                    fns.callback(isSuccessed)
            })
        }

        addBook() {
            return new Promise((resolve, reject) => {
                let mainWindow = global.mainWindow

                let files = electron.dialog.showOpenDialog(
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
                
                let extractionPath = path.join(electron.app.getPath('userData'), '/extracted/')
        
                if(files === undefined)
                    reject(`no file selected`)

                epubHelper.extractAndParse(files[0], extractionPath, true)
                .then(value => {
                    //copy and remove non metadata props
                    let metadata = Object.assign({}, value)

                    delete metadata["md5"]
                    delete metadata["unpackedPath"]
                    delete metadata["cover"]
                    
                    global.bookManager.addBook(
                        files[0],
                        // value.unpackedPath,
                        value.cover,
                        value.md5,
                        true,
                        metadata
                    )
                    con.debug(`successfully extracted and parsed epub: ${files[0]}`)
                    resolve()
                })
                .catch(err => {
                    reject(`unable to extract or parse epub: ${files[0]} error: ${err}`)
                    con.error(`unable to extract or parse epub: ${files[0]} error: ${err}`)
                })
            })
        }

        removeBook(key) {
            return new Promise(resolve => {
                let book = global.bookManager.getBook(key)
                global.bookManager.removeBook(book)
                resolve()
            })
        }
    }

    global.appEventsHandler = new appEventsHandler()
}

export default global.appEventsHandler