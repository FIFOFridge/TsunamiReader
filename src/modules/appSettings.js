import fs from 'fs';
import { app } from 'electron'
import path from 'path'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import paths from './../constants/paths'

let con = exconsole(logger, console)

class Settings {
    constructor(settingsStorage) {
        if(!(this._isSettingsFileExists())) {
            _initWithDefaultValues(settingsStorage)
            this.save()
        }

        fs.readFile(paths.settingsFilePath, {encoding: 'UTF-8'}, (err, data) => {
            if(err) {
                this._initWithDefaultValues()
                this.save()
            } else {
                settingsStorage.loadFromString('data')
            }
        })

        this.settingsStorage = settingsStorage
    }

    _isSettingsFileExists() {
        return fs.existsSync(paths.settingsFilePath)
    }

    /**
     * 
     * @param {Storage} storage 
     */
    _initWithDefaultValues(storage) {
        if(storage.get('isOSX') === false) {
            storage.set('frame', true) 
            storage.set('overrideTitleBar', false) 
        } else {
            storage.set('frame', false) 
            storage.set('overrideTitleBar', true) 
        }

        storage.set('useImageCompressor', true) 
    }

    save() {
        var jsonData = this.settingsStorage.copy()

        fs.writeFile(paths.settingsFilePath, jsonData, {encoding: 'UTF-8'}, (err) => {
            if(err)
                con.error(`unable to write settings file`)
        }) 
    }
}

export default Settings