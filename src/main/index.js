import { app, BrowserWindow, dialog } from 'electron'
import Settings from '../modules/appSettings'
import settingsStorage from '../constants/storage/settings'
import BookManager from '../modules/bookManager'
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
    var settings = global.appSettings.storage
    console.log(global.appSettings)

    var options = {
        width: 1200,
        minWidth: 1200,
        height: 800,
        minHeight: 800,
        titlebar: 'hidden',
        frame: true
    }

    //check is correction needed
    if(settings.get('overrideTitleBar') === false)
        options.titlebar = 'default'    
    if(settings.get('frame') === false)
        options.titlebar = false

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
    var settings = new Settings(settingsStorage)
    global.appSettings = settings;

    var bookManager = new BookManager()
    global.bookManager = bookManager

    createWindow()
})

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
