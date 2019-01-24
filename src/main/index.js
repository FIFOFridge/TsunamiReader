import { app, BrowserWindow, dialog } from 'electron'
import Settings from '../modules/appSettings'
import settingsStorage from '../constants/storage/settings'
import readerStorage from '../constants/storage/reader'
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
    //if(settings.get('overrideTitleBar') === false)
        options.titlebar = 'default'    
    //if(settings.get('frame') === false)
        options.titlebar = false

    mainWindow = new BrowserWindow(options)

    //global.windowsManager.addWindow('main', mainWindow)

    appStateSync.createSyncPoint(sharedAppStates.canAddBook, true, false)
    appStateSync.createSyncPoint(sharedAppStates.registredBook, null, true)

    mainWindow.setMenu(null)
    mainWindow.loadURL(winURL)

    mainWindow.on('closed', () => {
        mainWindow = null
        console.log(`closing main window`)

        let dataSaveSyncPromises = [
            global.appSettings.save(),
            global.bookManager.save()
        ]

        Promise.all(dataSaveSyncPromises)
        .then(() => {
            app.quit()
        })
        .catch((err) => {
            console.error(err)
            app.quit()
        })
    })
}

//init
app.on('ready', function () {
    let debugAttachDelay = true
    let initDelay = 0
    
    //allow to (re)attach debugger to main process at app startup
    //change debugAttachDelay to false to skip it
    if(process.env.NODE_ENV === 'development' && debugAttachDelay) 
        initDelay = 0

    console.log(`[Init delay: ${initDelay}]`)
    setTimeout(onReady, initDelay)
})

function onReady() {
    let settings = global.appSettings = new Settings(settingsStorage)
    let bookmanager = global.bookManager = new BookManager()
    global.readerStorage = readerStorage

    setupThemes()

    bookmanager.load()
    .catch(err => {
        console.log(`unable to read bookmanager data, creating new one, err: ${err}`)

        bookmanager.save()
        .catch(err => {
            console.log(`unable to save default bookmanager data: ${err}`)
        })
    })

    settings.tryLoad()
    .catch((err) => {
        console.log(`unable to load settings from file, creating new one, err: ${err}`)
        settings.initWithDefaultValues()
        
        settings.save()
        .catch((err) => {
            console.error(`unable to create new settings file: ${err}`)
        })
    })
    .finally(() => {
        createWindow()
    })
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

function setupThemes()
{
    //default themes
    global.readerStorage.set('themes', 
        {
            light: {
                body: {
                    color: '#333333',
                    background: '#fafafa'
                },
                name: 'light'
            },
            lightsea: {
                body: {
                    color: '#313a40',
                    background: '#bdd9f5'
                },
                name: 'lightsea'
            },
            dark: {
                body: {
                    color: '#ede8e5',
                    dark: '#1f1f1f'
                },
                name: 'dark'
            },
            darksea: {
                body: {
                    color: '#cbdaec',
                    background: '#1f262d'
                },
                name: 'darksea'
            }
        }
    )
    
    global.readerStorage.set('currentTheme', 'darksea')

    //todo:
    //Add custom themes loading
}

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
