import fs from 'fs';
import { app } from 'electron'
import path from 'path'
import { dataModels } from './dataModels'

class Settings {
    constructor(platformName) {
        this.settingsPath = path.join(app.getPath('userData'), '/config.json')
        this.tempExtension = ".new"

        this.tempSettingsPath = path.join(app.getPath('userData'), 
            ('/config.json' + this.tempExtension) 
        )

        //tempConfig && !default 
        if(fs.existsSync(this.tempSettingsPath) && !fs.existsSync(this.settingsPath)) {

        //tempConfig && default
        } else if(fs.existsSync(this.tempSettingsPath) && fs.existsSync(this.settingsPath)) {

        //default
        } else if(fs.existsSync(this.settingsPath)) {

        //none
        } else {

        }
    }

    save() {


        var content = JSON.stringify(this.settingsObject)

        fs.writeFileSync(tempSettingsPath, content)//write new content
        fs.unlinkSync(this.settingsPath)//delete old one
        fs.renameSync(tempSettingsPath, this.settingsPath)//rename to new one
    }

    get settingsObject() {
        return this.settings
    }

    set settingsObject(object) {
        this.settingsObject = object
    }
}

export let instance = new Settings()