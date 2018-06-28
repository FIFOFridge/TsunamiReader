import fs from 'fs';
import { app } from 'electron'
import path from 'path'

class Settings {
    constructor() {
        this.settingsPath = path.join(app.getPath('userData'), '/config.json')
        this.tempExtension = ".new"

        
    }

    save() {
        var newSettingsPath = path.join(app.getPath('userData'), 
            ('/config.json' + this.tempExtension) 
        );

        var content = JSON.stringify(this.settingsObject)

        fs.writeFileSync(newSettingsPath, content)//write new content
        fs.unlinkSync(this.settingsPath)//delete old one
        fs.renameSync(newSettingsPath, this.settingsPath)//rename to new one
    }

    get settingsObject() {
        return this.settings
    }

    set settingsObject(object) {
        this.settingsObject = object
    }
}

export default Settings