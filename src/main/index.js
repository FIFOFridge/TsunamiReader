import { app } from 'electron'
import { AppWrapper, getOS, log } from '../app/appWrapper'
import Window from '../app/window'
import * as Promise from 'bluebird'
import paths from '@constants/paths'
// import { EpubArchiveHelper } from '@helpers/epubArchiveHelper'
import { EpubProcessor } from '@modules/epubProcessor'

Promise.config({
    warnings: true,
    longStackTraces: false,
    cancellation: true,
    monitoring: true
})

if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const App = AppWrapper

console.log(App.settings)
log.info(`data storage: ${paths.appStorageDirectory}`)

const mainWindowURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`

app.on('ready', () => {
    App.loadSettings()
        // .timeout(3000)
        .finally(async () => {
            log.info('app settings handled, launching')
            log.info(`OS: ${getOS()}`)
            log.info(`arch: ${App.arch}`)
            log.info(`home path: ${App.home}`)

            //create main window
            // const mainWindow = App.mainWindow = new Window(mainWindowUrl, 'Tsunami Reader')

            //E:\kasiazki\bron-matematycznej-zaglady-cathy-o-Ebookpoint.pl.epub
            // try {
            //     const epubProcessor = new EpubProcessor('C:\\Users\\Mateusz\\WebstormProjects\\TsunamiReader\\test\\files\\pg1661-images.epub')
            //     // noinspection ES6AwaitOutsideAsyncFunction
            //     await epubProcessor.parseMetadata()
            //
            //     await epubProcessor.updateCoverInfo()
            //     await epubProcessor.tryExtractCover()
            //         // .then(v => {
            //         //     log.verbose(`successfully processed metadata: ${epubProcessor.metadata}`)
            //         //
            //         //     epubProcessor.updateCoverInfo()
            //         //         .then()
            //         // })
            //         // .catch(err => {
            //         //     log.error(`unable to get metadata: ${err}`)
            //         // })
            //
            // } catch (e) {
            //     log.error(`error druing archive processing: ${e}`)
            // }

            //FIXME:
            initWindow(mainWindowURL)
            App.mainWindow.once('initialized', showMainWindow.bind(this))
            App.mainWindow.once('closed', closedMainWindow.bind(this))
        })
})

// app.on('activate', () => {
//     if(App.mainWindow === null || App.mainWindow === undefined) {
//         initWindow()
//
//         mainWindow.once('initialized', showMainWindow.bind(this))
//         mainWindow.once('closed', closedMainWindow.bind(this))
//     }
// })

function initWindow(url) {
    if(App.mainWindow === null || App.mainWindow === undefined) {
        const options = {}

        options['titleBarStyle'] = (!(App.settings.get('overrideTitleBar'))) ?
            'default' : 'hidden'
        // noinspection EqualityComparisonWithCoercionJS
        options['frame'] = App.settings.get('frame')
        options['movable'] = true
        options['fullscreenable'] = false

        App.mainWindow = new Window(url, 'tsMainWindow', options, false)
        App.mainWindow.on('initialized', showMainWindow.bind(this))
    }
}

function showMainWindow()
{
    const window = App.mainWindow

    window.show()
    window.maximize()
}

function closedMainWindow( ) {
    log.info('closing main window')
    App.saveSettings()
        .then(() => {
            app.quit(0)
        })
        .catch(() => {
            log.info('unable to save on exit')
            app.quit(1)
        })
}