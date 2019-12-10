import { Storage } from '@modules/storage'
import ipcEvent from '@models/ipcEvent'
import ipcResponse from '@models/ipcResponse'
import { getRunnerType } from '@helpers/electronHelper'
import { EventEmitter } from 'events'
import log from 'electron-log'

export const responseStatus = {
    Undefined: 0,
    Success: 1,
    Fail: 2
}

export const responseType = {
    Status: 'bridge-reply-status',
    Value: 'bridge-reply-value',
    Storage: 'bridge-reply-storage'
}

export function getResponseType(response) {
    if(!(response instanceof Storage))
        throw new Error(`invalid response type`)

    return response.get('type')
}

export function getResponseValue(response) {
    if(!(response instanceof Storage))
        throw new Error(`invalid response type`)

    return response.get('value')
}

export function isResponseSuccess(response) {
    if(!(response instanceof Storage))
        throw new Error(`invalid response type`)

    // noinspection EqualityComparisonWithCoercionJS
    return response.get('status') == responseStatus.Success
}

export function isResponseFail(response) {
    if(!(response instanceof Storage))
        throw new Error(`invalid response type`)

    // noinspection EqualityComparisonWithCoercionJS
    return response.get('status') == responseStatus.Fail
}

export function getResponseStatus(response) {
    if(!(response instanceof Storage))
        throw new Error(`invalid response type`)

    return response.get('responseStatus')
}

export function createStatusResponse(status) {
    //TODO: invalid status && value
    let caller = getRunnerType()
    let response = ipcResponse

    response.set('caller', caller)
    response.set('type', responseType.Status)
    response.set('status', status)

    return response
}

export function createTypeResponse(status, value) {

    let caller = getRunnerType()
    let response = ipcResponse

    if(status === responseStatus.Fail) {
        response.set('reason', value)
    } else if(status === responseStatus.Success) {
        response.set('value', value)
    } else { //status === responseStatus.Undefined
        //TODO
    }

    response.set('caller', caller)
    response.set('type', responseType.Value)
    response.set('status', status)

    return response
}

export function createStorageResponse(status, storageId, storageData) {
    //storage state -> file path or serialized JSON

}

export function createAsyncEmitter() {

}

export function createIPCCall(event, ...args) {
    //TODO: check arguments type and ensure they all are primitives,
    //TODO: create reconstruction for storage objects

    let caller = getRunnerType()

    let ipcCall = ipcEvent
    ipcCall.set('caller', caller)
    ipcCall.set('event', event)
    ipcCall.set('arguments', arguments.slice(1, arguments.length))//pass all arguments
}

export function isIPCResponse(o) {
    if(!(o instanceof Storage))
        return false

    return o.has('status') &&
    o.has('type') &&
    o.has('value') &&
    o.has('reason') &&
    o.has('caller')
}

export class InternalIPCExecutorProcessingError extends Error {
    constructor(...args) {
        super(...args)
        Error.captureStackTrace(this, InternalIPCExecutorProcessingError)
    }
}

export function isRecivedIPCResponse(event) {
    return event.match(/.+-reply/i) !== null
}

// class IPCEmitter extends EventEmitter {
//     constructor(id, target, ensureIsReaded = true) {
//         super()
//         this.ensureIsReaded = ensureIsReaded
//         this.emitting = false
//         this.isListning = false
//         this.queue = []
//         this.id = id
//     }
//
//     get isProxyAttached() {
//         return this.isListning
//     }
//
//     emit(event, args) {
//         if(this.ensureIsReaded && !this.isProxyAttached()) {
//
//             this.queue.push(
//                 {
//                     name: event,
//                     args: args
//                 }
//             )
//
//         } else {
//             this._emit(event, args)
//         }
//     }
//
//     emitAllFromQueue() {
//         while(this.queue.length > 0) {
//             const event = this.queue.shift()
//
//             this._emit(event.name, event.args)
//         }
//     }
//
//     close() {
//         this.emit('end')
//         super.removeAllListeners()
//     }
//
//     _emit(event, args) {
//         log.verbose(`IPCEmitter emitting: ${event} args: ${args}`)
//         super.emit(event, args)
//     }
//
//     //close, start
//     _handleProxyCommand(command) {
//
//     }
//
//     _isPrimitive(value) {
//
//     }
// }
//
// class IPCEmitterProxy {
//
// }

// export default {
//     responseStatus,
//     responseType,
//     getResponseType,
//     getResponseValue,
//     createStatusResponse,
//     createTypeResponse
// }