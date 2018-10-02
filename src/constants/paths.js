import { app } from 'electron'
import path from 'path'

const userDataPath = app.getPath('userData')

export default {
    appStorageDirectory: path.join(userDataPath, '/TsunamiReader/'),
    extractedEpubsDirectory: path.join(appStorageDirectory, '/extracted/'),
    settingsDirectory: path.join(appStorageDirectory, '/settings/'),
    settingsFilePath: path.join(settingsDirectory, '/appSettings.json'),
    booksCollectionFilePath: path.join(appStorageDirectory, '/booksCollectionPath.json')
}