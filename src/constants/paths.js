import { app } from 'electron'
import path from 'path'
import { fs } from 'file-system';
import { mkdir } from 'fs';

const userDataPath = app.getPath('userData')

const appStorageDirectory = userDataPath /*path.join(userDataPath, '/TsunamiReader/')*/
const extractedEpubsDirectory = path.join(appStorageDirectory, '/extracted/')
const settingsDirectory = path.join(appStorageDirectory, '/settings/')
const settingsFilePath = path.join(settingsDirectory, '/appSettings.json')
const booksCollectionFilePath = path.join(appStorageDirectory, '/booksCollectionPath.json')


var ensureDirExists = _path => {
    if(!(fs.existsSync(_path)))
        fs.mkdirSync(_path)
}

ensureDirExists(appStorageDirectory)
ensureDirExists(extractedEpubsDirectory)
ensureDirExists(settingsDirectory)

export default {
    appStorageDirectory,
    extractedEpubsDirectory,
    settingsDirectory,
    settingsFilePath,
    booksCollectionFilePath
}