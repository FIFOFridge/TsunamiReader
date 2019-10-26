import fs from 'fs'
import paths from '@constants/paths'
import { log } from './appWrapper'
import { Storage } from '@modules/storage'
import * as Promise from 'bluebird'

class Settings {
    constructor(settingsStorage) {
        this.storage = settingsStorage
    }

    _isSettingsFileExists() {
        return fs.existsSync(paths.settingsFilePath)
    }

    setAppState(state) {
        return new Promise((resolve, reject) => {
            this.storage.set('appState', state)

            this.save()
            .then(resolve())
            .catch(err => reject(err))
        })
    }

    get(key) {
        // this._invalidStorage()

        return this.storage.get(key)
    }

    set(key, value) {
        // this._invalidStorage()

        return this.storage.set(key, value)
    }

    _invalidStorage() {
        if(!(this.storage instanceof Storage))
            throw new Error(`wrong storage type`)
    }

    load() {
        return new Promise((resolve, reject) => {
            if(!(this._isSettingsFileExists()))
                reject('unable to find settings file')

            this.storage.fromFile(paths.settingsFilePath)
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
                log.error(`unable to write settings file: ${err}`)
                reject(`unable to write settings file: ${err}`)
            })
        })
    }
}

export default Settings