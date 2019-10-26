import { ipcRenderer } from 'electron'
import log from 'electron-log'
import { responseStatus, createStatusResponse, createTypeResponse, InternalIPCExecutorProcessingError, isIPCResponse, isResponseSuccess } from './bridge-shared'
import * as Promise from 'bluebird'
import { Storage } from '@modules/storage'
import { isRecivedIPCResponse } from '@ipc/bridge-shared'
import ipcResponse from '@models/ipcResponse'
import { sliceArguments } from '@helpers/argumentsHelper'
import { isRunningRenderer } from '@helpers/electronHelper'

if(!isRunningRenderer()) {
    log.error(`unable to use bridge-renderer in main process: \n ${console.trace('usage trace: ')}`)
    throw new Error(`unable to use bridge-renderer in main process`)
}

if(global.ipcBridgeRendererSubscribedEvents === null || global.ipcBridgeRendererSubscribedEvents === undefined)
    global.ipcBridgeRendererSubscribedEvents = {}

//ipcRendererBridgeSubscribedEvents
// sent --> ipcRenderer.send(event, args[0]) //FIXME

export class IPCBridgeRenderer {
    static addListner(event, handler, context, timeout = 0, deleteWhenDone = false, hardTimeout = 100000/*, hardTimeout = 100000*/) {
        if(event instanceof String === false && typeof event !== 'string') {
            log.error(`event have to be string`)
            throw new Error(`event have to be string`)
        }

        if(IPCBridgeRenderer._hasHandler(event) === true) {
            if(process.env.NODE_ENV !== 'development') {
                log.error(`event has already assigned handler`)
                throw new Error(`event has already assigned handler`)
            } else { //clear duplicates for dev, to prevent hot reload errors

                //also clear hard timeout running in background
                if(global.ipcBridgeRendererSubscribedEvents[event].hardTimeoutInstance !== undefined)
                    clearTimeout(global.ipcBridgeRendererSubscribedEvents[event].hardTimeoutInstance)

                delete global.ipcBridgeRendererSubscribedEvents[event]
            }
        }

        global.ipcBridgeRendererSubscribedEvents[event] = {
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
            hardTimeoutInstance: undefined,
            // isRunning: false,
            deleteWhenDone: deleteWhenDone
        }

        ipcRenderer.on(event, (eventObject, args) => {
            const eventDetails = IPCBridgeRenderer._getEventDetailsById(event)

            if(isRecivedIPCResponse(event))
            {
                //handle by simple reply handler
                this._executeReplyHandler(event, eventDetails.handler, args)
                return
            }

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
                eventDetails.hardTimeoutInstance = setTimeout(() => {
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
                    IPCBridgeRenderer.reply(eventObject, event, r)
                })
                .catch(r => {
                    IPCBridgeRenderer.reply(eventObject, event, r)
                })
        })
    }

    static _hasHandler(id) {
        return global.ipcBridgeRendererSubscribedEvents.hasOwnProperty(id)
    }

    static removeListner(event, _throw = true) {
        if(this._hasHandler(event) === false) {
            if(_throw)
                throw new Error(`unable to find listner for event: ${event}`)
            else
                return false
        }

        if(global.ipcBridgeRendererSubscribedEvents[event].handler.isRunning) {
            try {
                log.verbose(`terminating running handler for event: ${event}`)
                ipcRendererBridgeSubscribedEvents[event].executorInstance.cancel()
            } catch (e) {
                console.warn(`error occured during promise cancellation for event: ${event}, err: ${e}`)
            }
        }

        delete ipcRendererBridgeSubscribedEvents[event]
        return true
    }

    static tryRemoveListner(event) {
        return IPCBridgeRenderer.removeListner(event, false)
    }

    static _getEventDetailsById(id) {
        if(global.ipcBridgeRendererSubscribedEvents.hasOwnProperty(id) === false)
            throw new Error(`unable to find id: ${id}`)

        return global.ipcBridgeRendererSubscribedEvents[id]
    }

    static _executeReplyHandler(event, handler, reply) {
        let response = ipcResponse //get model
        response.fromString(reply) //update with reply data

        try {
            handler.executor.call(null, response)
        } catch(err) {
            log.error(`error during exsuction of reply handler: ${event}, handler: \n${handler.toString()}`)
        }

        //auto delete reply handler
        delete global.ipcBridgeRendererSubscribedEvents[event]
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

            if (args instanceof Array) {
                _args = _args.concat(args)
            } else if (args !== null && args !== undefined) {
                _args.push(args)
            }

            try {
                let executorPromise =
                    handler.executorInstance =
                        handler.executor.apply(handler.context, _args)

                //TODO: find a better way to check is value a promise
                //    : both Bluebird and native Promise have to be supported
                if(
                    !(
                        executorPromise.then instanceof Function &&
                        executorPromise.catch instanceof Function
                    )
                )
                    {
                        log.error(`executor didin't returned promise`)
                        reject(new InternalIPCExecutorProcessingError(`executor didin't returned promise`))
                    }

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
                    isMain = ${!isRunningRenderer()}
                    status = ${status}
                    returned = ${returned}
                    successed = ${successed}
                    response = ${response}
                    reason = ${reason}
                    isRecivedIPCResponse = ${isRecivedIPCResponse(event)}
                ----------------------------------------
                trace:
                ${e.stack}
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

    static reply(eventName, response) {
        if(!(isIPCResponse(response))) {
            log.error(`response isn't instance of IPCResponse`)
            throw new TypeError(`response isn't instance of IPCResponse`)
        }

        IPCBridgeRenderer.send(eventName + '-reply', undefined, 0, response.toString())
    }

    //send to renderer
    static send(event, replyHandler, timeout/*, ...args  <-- spread operator don't work with vue, don't ask me why */) {
        if(replyHandler instanceof Function) {
            IPCBridgeRenderer.addListner(`${event}-reply`, replyHandler, null, timeout, false)
        } else if(replyHandler !== undefined && replyHandler !== null) {
            log.error(`unable to register reply handler for event: ${event}, replyHandler is not a function`)
        }

        let __args = [event]

        if(arguments.length > 3) {
            __args = __args.concat(
                sliceArguments(arguments, 3, arguments.length)
            )
        }

        ipcRenderer.send.apply(null, __args)
    }

    static on(event, listner, context = null, timeout = 0) { //redirect to --> _registerHandler
        IPCBridgeRenderer.addListner(event, listner, context, timeout)
    }

    static off(event) {
        IPCBridgeRenderer.removeListner(event)
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