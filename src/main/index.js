import { app, BrowserWindow } from 'electron'
import Settings from '../modules/appSettings'
import WindowsManager from '../modules/windowsManager'
import BookManager from '../modules/bookManager'

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

    mainWindow = new BrowserWindow({
        width: 1200, 
        minWidth: 1200,
        height: 800, 
        minHeight: 800,
        titlebar: 'hidden',
        frame: false
    })

    global.windowsManager.addWindow('main', mainWindow)

    mainWindow.setMenu(null)

    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })
}

//init
app.on('ready', function() {
    var settings = new Settings(app.platform)
    global.appSettings = settings;

    var windowsManager = new WindowsManager()
    global.windowsManager = windowsManager

    var bookManager = new BookManager(onBookChange())
    global.bookManager = bookManager

    createWindow()
})

function onBookChange(book)
{

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
