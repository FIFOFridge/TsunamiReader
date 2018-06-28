import fs from 'fs';
import { app } from 'electron'
import path from 'path'
import { dataModels } from './dataModels'

class Settings {
    constructor(platformName) {
        this.settingsPath = path.join(app.getPath('userData'), '/config.json')
        this.tempExtension = ".old"
        this.settingsObject = null

        this.tempSettingsPath = path.join(app.getPath('userData'),
            ('/config.json' + this.tempExtension)
        )

        var template = null

        console.log(this.settingsPath)

        var fnIsOSX = (platform) => { platform === 'darwin' ? true : false }
        var readSettings = (filePath) => { return JSON.parse(fs.readFileSync(filePath, 'utf8')) }

        //handle config file
        //
        //tempConfig && !default 
        if (fs.existsSync(this.tempSettingsPath) && !fs.existsSync(this.settingsPath)) {
            console.log("[SETTINGS]" + " temp && !default")
            template = readSettings(this.tempSettingsPath)
            fs.renameSync(this.tempSettingsPath, this.settingsPath)

            template.isOSX = fnIsOSX(platformName)

            //tempConfig && default
        } else if (fs.existsSync(this.tempSettingsPath) && fs.existsSync(this.settingsPath)) {
            console.log("[SETTINGS]" + " temp && default")
            template = readSettings(this.settingsPath)
            fs.unlinkSync(this.tempSettingsPath)

            template.isOSX = fnIsOSX(platformName)

            //default
        } else if (fs.existsSync(this.settingsPath)) {//[correct]
            console.log("[SETTINGS]" + " default file found")
            //invalid os only
            template = readSettings(this.settingsPath)

            template.isOSX = fnIsOSX(platformName)

            //none
        } else {
            console.log("[SETTINGS]" + " no file found!")
            template = dataModels.makeModel('settings')//load data template
            template = this._initDefault(template, platformName)//init with default values

            fs.writeFileSync(this.settingsPath, JSON.stringify(template))
        }

        this.settingsObject = template;
    }

    _initDefault(settings, platformName) {
        //var settings = this.settingsObject

        settings.displayCustomScroll = true

        if (platformName == 'darwin') {
            settings.isOSX = true
            settings.overrideTitleBar = false
        } else {
            settings.isOSX = false
            settings.overrideTitleBar = true
        }

        return settings;
    }

    save() {
        var content = JSON.stringify(this.settingsObject)

        fs.writeFileSync(tempSettingsPath, content)//write new content
        fs.unlinkSync(this.settingsPath)//delete old one
        fs.renameSync(tempSettingsPath, this.settingsPath)//rename to new one
    }
}

export default Settings