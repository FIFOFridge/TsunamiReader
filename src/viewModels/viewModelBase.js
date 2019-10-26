import { IPCBridgeRenderer } from '@ipc/bridge-renderer'
import { log } from '@app/log'
import * as Promise from 'bluebird'
import ipcMainEvents from "@constants/ipcMainEvents";
import {isResponseSuccess} from "@ipc/bridge-shared";

export const viewModelBase = {
    data:
    {
        viewName: undefined,
        subscribedIPCEvents: []
    },
    created: function() {
        this.attachUnhandledPromiseHandler()
    },
    beforeDestroy: function() {
        this.unattchUnhandledPromiseHandler()
        this.unsubscribeIPCEvents()
    },
    methods: {
        synchronizeAppState: function(viewName) {
            return new Promise((resolve, reject) => {
                IPCBridgeRenderer.send(
                    ipcMainEvents.syncAppState,
                    (reply) => {
                        // noinspection RedundantIfStatementJS
                        if(isResponseSuccess(reply))
                        {
                            resolve()
                        } else {
                            reject()
                        }
                    },
                    0,
                    viewName
                )
            })
        },
        attachUnhandledPromiseHandler: function () {
            window.addEventListener('unhandledrejection', this.unhandledPromiseHandler.bind(this))
        },
        unattchUnhandledPromiseHandler: function () {
            window.removeEventListener('unhandledrejection', this.unhandledPromiseHandler.bind(this))
        },
        unhandledPromiseHandler: function(reason, promise) {
            log.error(`[${this.viewName}] unhandled promise: ${promise} \nexecutor: ${reason} `)
        },
        unsubscribeIPCEvents: function () {
            for(let event in this.subscribeAppEvents) {
                IPCBridgeRenderer.tryRemoveListner(event)
            }
        },
        addSubscribedIPCEvent(event) {
            this.subscribedIPCEvents.push(event)
        },
        tryCallBaseHook(hookName) {
            const baseHook = this['base_' + hookName]

            if(baseHook !== undefined)
                baseHook.call(this)
        },
        hasBaseHook(_this, hookName) {
            const baseHook = this['base_' + hookName]
            return baseHook !== undefined
        }
    }
}