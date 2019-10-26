import { IPCBridgeMain } from '@ipc/bridge-main'
import { createStatusResponse, createTypeResponse, responseStatus } from '@ipc/bridge-shared'
import ipcMainEvents from '@constants/ipcMainEvents'
import {log, setAppState, getMainWindow, getAppState} from '@src/app/appWrapper'
import views from '@constants/views'
import { hasValue } from '@constants/constantsHelper'
import { EpubArchiveHelper } from '@helpers/epubArchiveHelper'

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
    }, this)

    IPCBridgeMain.on(ipcMainEvents.openBookBrowse, async (eventObject) => {
        try {
            getMainWindow().openDialog(
                {
                    filters: {extensions: ['.epub']},
                    title: 'choose a book to add',
                    properties: ['openFile']
                }
            )
                .then(filePaths => {
                    // if (canceled)
                    //     throw new Error(`action was cancelled by user`)
                    //     // IPCBridgeMain.reply(
                    //     //     ipcMainEvents.openBookBrowse,
                    //     //     createTypeResponse(responseStatus.Fail, 'action was canceled')
                    //     // )

                    //TODO: move processing logic to external worker (new renderer process)
                    log.verbose(`selected paths: ${filePaths}`)

                    const epubArchiveProcessor = new EpubArchiveHelper(filePaths[0])

                    epubArchiveProcessor.getBookMetadata()
                })
                .catch(err => {
                    throw new Error(`unable to get file path: ${err}`)
                })
        } catch (e) {
            // IPCBridgeMain.reply(
            //     ipcMainEvents.openBookBrowse,
            //     createTypeResponse(responseStatus.Fail, `unable to select file: ${err}`)
            // )
            log.error(`unable to select file: ${e}`)
            throw new Error(`unable to select file: ${e}`)
        }
    }, this)
}

export function unsubscribeAppEvents() {
    //TODO: export function to allow for single event unsubscription

    IPCBridgeMain.removeListner(ipcMainEvents.syncAppState)
    IPCBridgeMain.removeListner(ipcMainEvents.openBookBrowse)
}