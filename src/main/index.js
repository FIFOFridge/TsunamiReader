import { app, BrowserWindow } from 'electron'
import Settings from '../modules/appSettings'
import WindowsManager from '../modules/windowsManager'
import BookManager from '../modules/bookManager'
import dataModels from '../modules/dataModels'
import windowRouter from '../modules/windowRouter'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
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

    if(!(settings.overrideTitleBar)) {
        options.frame = true
        options.titlebar = 'default'
    }

    mainWindow = new BrowserWindow(options)

    global.windowsManager.addWindow('main', mainWindow)

    mainWindow.setMenu(null)

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    windowRouter.fnBeforeEach = beforeRoute
}

//init
app.on('ready', function() {
    var settings = new Settings(app.platform)
    global.appSettings = settings;

    var windowsManager = new WindowsManager()
    global.windowsManager = windowsManager

    var bookManager = new BookManager(onBookChange())
    global.bookManager = bookManager

    global.dataModelLoader = dataModels

    createWindow()
})

function onBookChange(book)
{

}

function beforeRoute(to, from, next) {
    next()//allow 
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
