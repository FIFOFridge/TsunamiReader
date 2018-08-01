import { app } from electron
import fs from 'fs'

const userDataPath = app.getPath('userData')

export default {
    appStorage: fs.join(userDataPath, '/TsunamiReader'),
    extractedEpubs: fs.join(appStorage, '/extracted'),
    settingsDirectory: fs.join(appStorage, '/settings'),
    settingsPath: fs.join(settingsDirectory, 'appSettings.json')
}