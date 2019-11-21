import { IPCBridgeMain } from '@ipc/bridge-main'
import { createStatusResponse, createTypeResponse, responseStatus } from '@ipc/bridge-shared'
import ipcMainEvents from '@constants/ipcMainEvents'
import {log, setAppState, getMainWindow, getAppState} from '@src/app/appWrapper'
import views from '@constants/views'
import { hasValue } from '@constants/constantsHelper'
import { EpubArchiveHelper } from '@helpers/epubArchiveHelper'
import { dialog } from 'electron'

export function subscribeAppEvents() {
    IPCBridgeMain.on(ipcMainEvents.syncAppState,  async(eventObject, state) => {
        // if (!(hasValue(views, state))) {
        //     log.warn(`can not synchronize app state: ${state} is invalid`)
        //     throw new Error(`can not synchronize app state: ${state} is invalid`)
        // }

        setAppState(state)

        // IPCBridgeMain.reply(
        //     eventObject,
        //     ipcMainEvents.syncAppState,
        //     createStatusResponse(responseStatus.Success)
        // )
        return undefined
    }, this)

    IPCBridgeMain.on(ipcMainEvents.openBookBrowse, eventObject => {
        return new Promise(((resolve, reject) => {
            try {
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
                        log.info(`selected book to open: ${fileNames[0]}`)
                        resolve(fileNames[0])
                    }
                )

                resolve()
            } catch (e) {
                log.error(`unable to select file: ${e}`)
                reject(`unable to select file: ${e}`)
            }
        }))
    }, this)
}

export function unsubscribeAppEvents() {
    //TODO: export function to allow for single event unsubscription

    IPCBridgeMain.removeListner(ipcMainEvents.syncAppState)
    IPCBridgeMain.removeListner(ipcMainEvents.openBookBrowse)
}