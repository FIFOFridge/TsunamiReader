import { app } from 'electron'
import path from 'path'
import { fs } from 'file-system';
import { mkdir } from 'fs';

const userDataPath = app.getPath('userData')

const appStorageDirectory = userDataPath /*path.join(userDataPath, '/TsunamiReader/')*/
const extractedEpubsDirectory = path.join(appStorageDirectory, '/extracted/')
const settingsDirectory = path.join(appStorageDirectory, '/settings/')
const settingsFilePath = path.join(settingsDirectory, '/app.json')
const readSettingsFilePath = path.join(settingsDirectory, '/reader.json')
const booksCollectionFilePath = path.join(appStorageDirectory, '/books.json')


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
    readSettingsFilePath,
    booksCollectionFilePath
}