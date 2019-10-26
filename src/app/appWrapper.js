import _log from 'electron-log'
import logLevel from '@constants/logLevel'
import paths from '@constants/paths'
import path from 'path'
import osType from '@constants/app/osType'
import os from 'os'
import settings from './settings'
import settingsStorage from '@models/settings'
import * as Promise from 'bluebird'
import {EventEmitter} from 'events'
import electronLog from 'electron-log'
import Window from './window'
import {ipcMain} from 'electron'
import mainEvents from '@constants/ipcMainEvents'
import { subscribeAppEvents } from './events'
import { log as logger } from './log'

class Wrapper extends EventEmitter {
    constructor() {
        super()
        this.mainEventHandler = undefined

        this.logger = undefined
        this.window = undefined

        // this._setupLogger()
        // this._setupOSInfo()

        this.settings = new settings(settingsStorage)

        subscribeAppEvents()
        this._setupUnhandledPropmisCatchers()

        //
        // ipcMain.on(mainEvents.syncAppState, () => {
        //     log.info(`recived syncAppState`)
        // })
    }

    loadSettings() {
        return new Promise((resolve, reject) => {
            this.settings.load()
                .then(() => {
                    resolve()
                })
                .catch((err) => {
                    this.logger.warn(`unable to load settings from file, creating new one with default configuration: ${err}`)
                    // this.settings.initWithDefaultValues()

                    this.settings.save()
                        .catch((err) => {
                            this.logger.error(`unable to create new settings file: ${err}`)
                            reject()
                        })
                })
        },)
    }

    saveSettings() {
        return this.settings.save()
    }

    set mainWindow(value) {
        this.window = value
    }

    get mainWindow() {
        return this.window
    }

    get IsDevelopment() {
        return process.env.NODE_ENV === 'development'
    }

    //only for main process
    _setupUnhandledPropmisCatchers() {
        process.on("unhandledRejection", (reason, promise) => {
            this.logger.error(`unhandle promise rejection at main process: ${reason} \nexecutor: \n${promise.toString()}`)
        })
    }

    //TODO before release
    _handleAppError(reson, critical) {

    }
}

let initialized = global.appWrapperHasBeenInitialized

//setup wrapper only once
if (initialized === null || initialized === undefined) {
    global.appWrapperInstance = new Wrapper()
    initialized = true
}

export const AppWrapper = global.appWrapperInstance

export function getOS() {
    return os.platform()
}

export function isDevelopment() {
    return global.appWrapperInstance.IsDevelopment
}

export function isWindows() {
    return os.platform() === osType.Windows
}

export function isOSX() {
    return os.platform() === osType.OSX
}

export function isLinux() {
    return os.platform() === osType.Linux
}

export function getAppSetting(key) {
    return global.appWrapperInstance.settings.get(key)
}

export function getAppState() {
    return global.appWrapperInstance.settings.get('appState')
}

export function setAppState(state) {
    return global.appWrapperInstance.settings.set('appState', state)
}

export function saveSettings(/*timeout = 0*/) {
    return global.appWrapperInstance.settings.save()
}

export function loadSettings(/*timeout = 0*/) {
    return global.appWrapperInstance.settings.load()
}

export function getMainWindow() {
    return global.appWrapperInstance.mainWindow
}

export function setMainWindow(window) {
    if (!(window instanceof Window))
        throw new Error(`window have to be instance of Window`)

    global.appWrapperInstance.mainWindow = Window
}

export const mainWindow = global.appWrapperInstance.mainWindow

// export const MainWindow = global.appWrapperInstance.mainWindow

export const log = logger