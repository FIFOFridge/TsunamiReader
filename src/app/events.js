import {IPCBridgeMain} from '@ipc/bridge-main'
import ipcMainEvents from '@constants/ipcMainEvents'
import {log, messageBox, setAppState} from '@src/app/appWrapper'
import {dialog} from 'electron'
import util from 'util'

export function subscribeAppEvents() {
    IPCBridgeMain.on(ipcMainEvents.syncAppState,  async(eventObject, state) => {
        setAppState(state)

        return undefined // === promise.resolve() (when function is async)
    }, this)

    IPCBridgeMain.on(ipcMainEvents.openBookBrowse, eventObject => {
        return new Promise(((resolve, reject) => {
            // try {
                log.info(`opened local book browser`)

                let xd = dialog.showOpenDialog( //<-- docs for (electron) 2.0.18 are incorrect for this function
                    // getMainWindow(),
                    {
                        title: 'choose a book to add',
                        filters: [
                            {name: 'eBooks', extensions: ['epub']}
                        ],
                        properties: ['openFile']
                    },
                    (fileNames) => {
                        if(!(util.isArray(fileNames))) {
                            reject('no file selected')
                        } else {
                            log.verbose(`selected book to open: ${fileNames[0]}`)
                            resolve(fileNames[0])
                        }
                    }
                )
        }))
    }, this)

    IPCBridgeMain.on(ipcMainEvents.displayMessageBox, async (eventObject, message, title, type = 'info', buttons = ['OK']) => {
        return await messageBox(message, title, type, buttons) //returns selected button
    })
}

export function unsubscribeAppEvents() {
    //TODO: export function to allow for single event unsubscription

    IPCBridgeMain.removeListner(ipcMainEvents.syncAppState)
    IPCBridgeMain.removeListner(ipcMainEvents.openBookBrowse)
}