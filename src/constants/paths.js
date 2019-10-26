import electron from 'electron'
import path from 'path'
import fs from 'fs'
import { isRunningMain } from '@helpers/electronHelper'

let userDataPath

if(isRunningMain()) {
    userDataPath = electron.app.getPath('userData')
} else {
    userDataPath = electron.remote.app.getPath('userData')
}

const appStorageDirectory = userDataPath
const thumbnailsDirectory = path.join(appStorageDirectory, '/thumbnails/')
const settingsDirectory = path.join(appStorageDirectory, '/settings/')
const settingsFilePath = path.join(settingsDirectory, '/app.json')
const booksDirectory = path.join(appStorageDirectory, '/books/')
const downloadedBooksDirectory = path.join(appStorageDirectory, '/books/')

const ensureDirExists = _path => {
    if (!(fs.existsSync(_path))) {
        // log.info(`creating directory: ${_path}`)
        fs.mkdirSync(_path)
    }
}

ensureDirExists(appStorageDirectory)
ensureDirExists(settingsDirectory)
ensureDirExists(booksDirectory)
ensureDirExists(thumbnailsDirectory)
ensureDirExists(downloadedBooksDirectory)

export default {
    appStorageDirectory,
    settingsDirectory,
    settingsFilePath,
    booksDirectory,
    thumbnailsDirectory
}