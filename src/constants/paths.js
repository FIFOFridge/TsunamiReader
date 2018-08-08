import { app } from 'electron'
import path from 'path'

const userDataPath = app.getPath('userData')

export default function() {
    this.appStorage = path.join(userDataPath, '/TsunamiReader/')
    this.extractedEpubs = path.join(appStorage, '/extracted/')
    this.settingsDirectory = path.join(appStorage, '/settings/')
    this.settingsPath = path.join(settingsDirectory, '/appSettings.json')
}