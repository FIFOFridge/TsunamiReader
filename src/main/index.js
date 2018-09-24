import { app, BrowserWindow, dialog } from 'electron'
import Settings from '../modules/appSettings'
import BookManager from '../modules/bookManager'
import dataModels from '../modules/dataModels'
import windowRouter from '../modules/windowRouter'
import appStateSync from '../modules/appStateSync'
import sharedAppStates from '../constants/sharedAppStates'
import appEventsHandler from './appEventsHandler'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

var mainWindow = global.mainWindow
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

function createWindow() {
    var settings = global.appSettings.settingsObject

    var options = {
        width: 1200,
        minWidth: 1200,
        height: 800,
        minHeight: 800,
        titlebar: 'hidden',
        frame: false
    }

    if (!(settings.overrideTitleBar)) {
        options.frame = true
        options.titlebar = 'default'
    }

    mainWindow = new BrowserWindow(options)

    //global.windowsManager.addWindow('main', mainWindow)

    appStateSync.createSyncPoint(sharedAppStates.canAddBook, true, false)
    appStateSync.createSyncPoint(sharedAppStates.registredBook, null, true)

    mainWindow.setMenu(null)

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

//init
app.on('ready', function () {
    var settings = new Settings(app.platform)
    global.appSettings = settings;

    var bookManager = new BookManager()
    global.bookManager = bookManager

    global.dataModelLoader = dataModels

    createWindow()
})

function processBook(params) {
    console.log(params)
}

function loadBook() {
    var template = dataModels.MakeModel('book', true)
    var owner = windowsManager.getWindow('main')

    console.log(dialog.showOpenDialog(owner, {
        filters: [
            { name: 'EPub', extensions: ['epub'] }
        ]
    }))
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
