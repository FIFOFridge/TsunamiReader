import { app } from 'electron'
import path from 'path'

const userDataPath = app.getPath('userData')

export default {
    appStorage: path.join(userDataPath, '/TsunamiReader/'),
    extractedEpubs: path.join(appStorage, '/extracted/'),
    settingsDirectory: path.join(appStorage, '/settings/'),
    settingsPath: path.join(settingsDirectory, '/appSettings.json')
}