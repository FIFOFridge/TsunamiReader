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
        
        if(!(this._isSettingsFileExists())) {
            this._initWithDefaultValues(settingsStorage)
            this.save()
        }

        fs.readFile(paths.settingsFilePath, {encoding: 'UTF-8'}, (err, data) => {
            if(err) {
                this._initWithDefaultValues()
                this.save()
            } else {
                settingsStorage.loadFromString(data)
            }
        })
    }

    _isSettingsFileExists() {
        return fs.existsSync(paths.settingsFilePath)
    }

    /**
     * 
     * @param {Storage} storage 
     */
    _initWithDefaultValues() {
        if(this.storage.get('isOSX') === false) {
            this.storage.set('frame', true) 
            this.storage.set('overrideTitleBar', false) 
        } else {
            this.storage.set('frame', false) 
            this.storage.set('overrideTitleBar', true) 
        }

        this.storage.set('useImageCompressor', true) 
    }

    save() {
        var jsonData = this.storage.copy()

        console.log(paths)
        console.log(jsonData)

        fs.writeFile(paths.settingsFilePath, jsonData, {encoding: 'UTF-8'}, (err) => {
            if(err)
                con.error(`unable to write settings file: ${err.message}`)
        }) 
    }
}

export default Settings