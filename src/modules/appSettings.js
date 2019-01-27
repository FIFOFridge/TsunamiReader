import fs from 'fs';
import { app } from 'electron'
import path from 'path'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import paths from './../constants/paths'

let con = exconsole(logger, console)

class Settings {
    constructor(settingsStorage) {
        this.storage = settingsStorage
    }

    _isSettingsFileExists() {
        return fs.existsSync(paths.settingsFilePath)
    }

    /**
     * 
     * @param {Storage} storage 
     */
    initWithDefaultValues() {
        let isOSX = this.storage.get('isOSX')

        if(this.storage.get('isOSX') === false) {
            this.storage.set('frame', false) 
            this.storage.set('overrideTitleBar', true) 
        } else {
            this.storage.set('frame', true)
            this.storage.set('overrideTitleBar', false)
        }

        this.storage.set('useImageCompressor', true) 
    }

    tryLoad() {
        return new Promise((resolve, reject) => {
            let _this = this

            if(!(this._isSettingsFileExists()))
                reject('unable to find settings file')

            this.storage.loadfromFile(paths.settingsFilePath)
                .then(() => {resolve()})
                .catch((err) => {reject(`unable to read settings file: ${err}`)})
        })
    }

    save() {
        return new Promise((resolve, reject) => {
            this.storage.toFile(paths.settingsFilePath)
            .then((result) => {
                resolve()
            }).catch((err) => {
                con.error(`unable to write settings file: ${err}`)
                reject(`unable to write settings file: ${err}`)
            })
        })
    }
}

export default Settings