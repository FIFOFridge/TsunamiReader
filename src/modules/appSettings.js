import fs from 'fs';
import { app } from 'electron'
import path from 'path'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import paths from './../constants/paths'

class Settings {
    constructor(settingsStorage) {
        this.storage = settingsStorage
    }

    _isSettingsFileExists() {
        return fs.existsSync(paths.settingsFilePath)
    }
    // setAppState(state) {
    //     return new Promise((resolve, reject) => {
    //         this.storage.set('appState', state)
    //
    //         this.save()
    //         .then(resolve())
    //         .catch(err => reject(err))
    //     })
    // }

    load() {
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