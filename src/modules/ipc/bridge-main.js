import {ipcMain, ipcRenderer} from 'electron'
import log from 'electron-log'
import { responseStatus, createStatusResponse, createTypeResponse, InternalIPCExecutorProcessingError, isIPCResponse, isResponseSuccess } from './bridge-shared'
import * as Promise from 'bluebird'
import { Storage } from '@modules/storage'
import { isRecivedIPCResponse } from '@ipc/bridge-shared'
import ipcResponse from '@models/ipcResponse'
import { isRunningMain } from "@helpers/electronHelper";

if(!isRunningMain()) {
    log.error(`unable to use bridge-main in renderer process: \n ${console.trace('usage trace: ')}`)
    throw new Error(`unable to use bridge-main in renderer process`)
}

if(global.ipcBridgeMainSubscribedEvents === null || global.ipcBridgeMainSubscribedEvents === undefined)
    global.ipcBridgeMainSubscribedEvents = {}

//ipcRendererBridgeSubscribedEvents
// sent --> ipcRenderer.send(event, args[0]) //FIXME

export class IPCBridgeMain {
    static addListner(event, handler, context, timeout = 0, deleteWhenDone = false, hardTimeout = 100000/*, hardTimeout = 100000*/) {
        if(event instanceof String === false && typeof event !== 'string') {
            log.error(`event have to be string`)
            throw new Error(`event have to be string`)
        }

        if(IPCBridgeMain._hasHandler(event) === true) {
            log.error(`event has already assigned handler`)
            throw new Error(`event has already assigned handler`)
        }

        global.ipcBridgeMainSubscribedEvents[event] = {
            event: event,
            handler: {
                executor: handler,
                executorInstance: undefined,
                softTimeout: timeout,
                isRunning: false,
                context: context
            },
            // softTimeout: timeout,
            hardTimeout: hardTimeout,
            // isRunning: false,
            deleteWhenDone: deleteWhenDone
        }

        ipcMain.on(event, (eventObject, args) => {
            const eventDetails = IPCBridgeMain._getEventDetailsById(event)

            let promise = this._executeEventHandler(
                event,
                eventDetails.handler,
                eventObject,
                args
            )

            //update event info
            eventDetails.handler.isRunning = true
            eventDetails.handler.executorInstance = promise

            //make sure all promises will be completed or terminated
            //to avoid memory leaks during app state will be changed
            if(eventDetails.hardTimeout > 0) {
                setTimeout(() => {
                    // noinspection JSIncompatibleTypesComparison
                    if(promise !== null && promise !== undefined) {
                        if (promise.isPending()) {
                            log.warn(`hard timeout reached for: ${event}, forcing to cancel`)
                            promise.cancel()
                        }
                    }
                }, eventDetails.hardTimeout)
            }

            promise
                .then(r => {
                    IPCBridgeMain.reply(eventObject, event, r)
                })
                .catch(r => {
                    IPCBridgeMain.reply(eventObject, event, r)
                })
        })
    }

    static _hasHandler(id) {
        return global.ipcBridgeMainSubscribedEvents.hasOwnProperty(id)
    }

    static removeListner(event) {
        if(this._hasHandler(event) === false)
            throw new Error(`unable to find listner for event: ${event}`)

        if(global.ipcBridgeMainSubscribedEvents[event].handler.isRunning) {
            try {
                log.verbose(`terminating running handler for event: ${event}`)
                ipcRendererBridgeSubscribedEvents[event].executorInstance.cancel()
            } catch (e) {
                console.warn(`error occured during promise cancellation for event: ${event}, err: ${e}`)
            }
        }

        delete ipcRendererBridgeSubscribedEvents[event]
    }

    static _getEventDetailsById(id) {
        if(global.ipcBridgeMainSubscribedEvents.hasOwnProperty(id) === false)
            throw new Error(`unable to find id: ${id}`)

        return global.ipcBridgeMainSubscribedEvents[id]
    }

    static _executeEventHandler(event, handler, eventObject, args) {
        return new Promise((resolve, reject) => {
            // const executor = handler.executor
            let status = responseStatus.Undefined
            let returned = undefined
            let successed = undefined
            let response = undefined
            let reason = undefined
            let _args = [eventObject]
            let recivedResponse

            //parse response as args
            if(isRecivedIPCResponse(event)) {
                recivedResponse = ipcResponse
                recivedResponse.fromString(args)
            }

            if(args instanceof Array) {
                _args = _args.concat(args)
            }
            else if(args !== null && args !== undefined) {
                _args.push(args)
            }

            try {
                let executorPromise =
                handler.executorInstance =
                handler.executor.apply(handler.context, _args)

                //TODO before release:
                //
                // if(!(executorPromise instanceof Promise)) {
                //     log.error(`executor didin't returned promise`)
                //     reject(new InternalIPCPromiseProcessingError(`executor didin't returned promise`))
                // }

                // noinspection DuplicatedCode
                if(handler.softTimeout > 0)
                    executorPromise.timeout(handler.softTimeout)

                executorPromise
                    .then(value => {
                        successed = true
                        returned = value
                    })
                    .catch(err => {
                        reason = err
                        successed = false
                    })
                    .finally(() => {
                        if(successed) {
                            response =
                                returned !== undefined ?
                                    createTypeResponse(responseStatus.Success, returned) :
                                    createStatusResponse(responseStatus.Success)
                        } else { //failed
                            response = createTypeResponse(responseStatus.Fail, new Error(reason))
                        }

                        //release
                        handler.isRunning = false
                        handler.executorInstance = undefined

                        isResponseSuccess(response) ? resolve(response) : reject(response)
                    })

            } catch(e) {
                handler.isRunning = false


                //dump local variables to help find source of bug
                const dump = `
                ----------------------------------------
                    isMain = ${isRunningMain()}
                    status = ${status}
                    returned = ${returned}
                    successed = ${successed}
                    response = ${response}
                    reason = ${reason}
                    isRecivedIPCResponse = ${isRecivedIPCResponse(event)}
                ----------------------------------------
                executor:
                ${handler.executor.toString()}
                ----------------------------------------
                `

                log.error(`unhandled error during processing promise, event: ${event} : ${e}\n${dump}`)

                reject(
                    createTypeResponse(responseStatus.Fail),
                    new InternalIPCExecutorProcessingError(
                        `unhandled error during processing promise, event: ${event}`
                    )
                )
            }
        })
    }

    static reply(eventObject, eventName, response) {
        let _response

        if(!(isIPCResponse(response))) {
            log.error(`response isn't instance of IPCResponse`)
            throw new TypeError(`response isn't instance of IPCResponse`)
        }

        if(response instanceof Storage)
            _response = response.toString()

        eventObject.sender.send(eventName + '-reply', _response)
    }

    //send to renderer
    //FIXME: sending from main to any renderer require webContents!!!
    static send(event, replyHandler = undefined, timeout = 0, ...args) {
        if(replyHandler instanceof Function) {
            IPCBridgeMain.addListner(`${event}-reply`, replyHandler, 0, false)
        } else if(replyHandler !== undefined && replyHandler !== null) {
            log.error(`unable to register reply handler for event: ${event}, replyHandler is not a function`)
        }

        let __args = [event]

        if(args.length > 0)
            __args.concat(args)

        ipcMain.send.apply(null, __args)
    }

    static on(event, listner, context = null, timeout = 0) { //redirect to --> _registerHandler
        IPCBridgeMain.addListner(event, listner, context, timeout)
    }

    static off(event) {
        IPCBridgeMain.removeListner(event)
    }

    // sendSync(event, requestAnswer, _args) {
    //     let __args = args.slice(2, args.length)
    //
    //     if(requestAnswer) {
    //
    //     }
    //
    //     ipcRenderer.sendSync.apply(this, __args)
    // }
}

// export default { IPCBridgeRenderer, timeout }