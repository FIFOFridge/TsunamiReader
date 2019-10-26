import { BrowserWindow, dialog } from 'electron'
import { log, getAppSetting } from './appWrapper'
import { EventEmitter } from 'events'
import * as Promie from 'bluebird'
import util from 'util'

class Window extends EventEmitter {
    constructor(url, windowName, options = null, show = false, disableContextMenu = true) {
        super()

        if(!(options instanceof Object))
            options = {}


        this.window = undefined
        this.windowName = windowName
        this.loadRetryCounter = 0
        this.instantShow = show

        // this.url = url

        this._initWindow(url, options, show, disableContextMenu)
    }

    _initWindow(url, options, show = false, disableContextMenu = true) {
        options['show'] = true //TODO: = show

        this.instantShow = true //TODO: = show

        // noinspection JSValidateTypes
        let window = this.window = new BrowserWindow(options)

        window.once('ready-to-show', this._ready_to_show.bind(this))

        window.setMenu(null)
        log.info(`window loadURL: ${window.loadURL(url)}`)
            //TODO: apply after updating electron to v6
            //
            // .then(() => {
            //     log.verbose(`successfully loaded window url: ${url}`)
            // })
            // .catch(err => {
            //     this._onWindowError(false, 'initial loadUrl failed', err)
            // })

        this._setupErrorHandling()

        this.window.on('did-finish-load', () => {
            this.loadRetryCounter = 0 //reset retry counter
        })

        //
        // this.window.on('did-start-loading', () => {
        //
        // })

        //   windows events handlers
        this.window.on('unresponsive', () => {
            log.warn(`window become unresponsive`)
            //TODO: handle it by some timer and terminate if needed
        })

        this.window.on('responsive', () => {
            log.window(`window become responsive again`)
            //TODO: reset unresponsive timer
        })

        this.window.on('context-menu', (event) => {
            if(disableContextMenu) {
                event.preventDefault()
            }
        })

        //only while dev
        if(process.env.NODE_ENV === 'development') {
            this.window.on('ipc-message', (event, channel) => {
                log.verbose(`renderer sent message for channel: ${channel}`)
            })
        }
    }

    show() {
        this.window.show()
    }

    close() {
        this.window.close()
    }

    minimaize() {
        this.window.minimize()
    }

    maximize() {
        this.window.maximize()
    }

    _setupErrorHandling() {
        //did-fail-load
        this.window.on(
            'did-fail-load',
            (event, errCode, errDesc, validatedUrl, isMainFrame, frameProcessId, frameRoutingId) => {
              if((this.loadRetryCounter + 1) > getAppSetting('loadRetryMax'))
                  this._onWindowError(false, `reached max load retry`, 'max window load retry count was reached')
              else
                  this.loadRetryCounter++

              this._onWindowError(
                  true,
                  'did-fail-load',
                  {
                      errCode: errCode,
                      errDesc: errDesc,
                      validatedUrl: validatedUrl,
                      isMainFrame: isMainFrame,
                      frameProcessId: frameProcessId,
                      frameRoutingId: frameRoutingId
                  })
            })
    }

    _onWindowError(couldContinue, event, errorData) {
        //TODO: send logs before terminating app, if !couldContinue
        let errorLog = `renderrer error occured: ${event}, 
            ${couldContinue === false ? 'unable to continue' : ''}`

        const dataDumper = data => {
            if(data instanceof Array) {
                for(let element in data) {
                    errorLog = errorLog.concat(`${data[element].toString()} \n`)
                }
            } else if(data instanceof Object) {
                for (let label in data) {
                    errorLog = errorLog.concat(`${label}: ${data[label].toString()} \n`)
                }
            } else if(data instanceof String) {
                errorLog = errorLog.concat(data)
            } else {
                console.warn(`uanble to determinate error data type, skipping log`)
            }
        }

        if(errorData !== null || errorData !== undefined)
            dataDumper(errorData)

        log.error(errorLog)
    }

    // electron window events
    _ready_to_show() {
        this._emit('initialized')

        if(this.instantShow)
        {
            this.show()
        }
    }

    _closing() {
        this._emit('closing')
    }

    _closed() {
        this._emit('closed')
    }

    _minimazing() {
        this._emit('minizamzing')
    }

    _maximizing() {
        this._emit('maximizing')
    }

    _unfocused() {
        this._emit('uncofused')
    }

    _focused() {
        this._emit('focused')
    }

    _emit(eventName) {
        log.verbose(`window: ${this.windowName} emitted: "${eventName}"`)
        this.emit(eventName)
    }

    openDialog(options, timeout = 0) {
        //TODO: change callback when electron will be updated
        let promise = new Promise(resolve => {
            dialog.showOpenDialog(this.window, options, (value) => {
                if(value === undefined || value === null) {
                    throw new Error(`callback value is empty: ${value}`)
                }

                if(!util.isString(value) && !util.isArray(value)) {
                    throw new TypeError(`wrong callback value: ${value}`)
                }

                resolve(value)
            })
        })

        if(timeout > 0) //apply timeout if needed
            promise.timeout(timeout)

        return promise
    }

    //FIXME: update function to return promise same as openFileDialog
    saveDialog(options, callback = undefined) {
        dialog.showSaveDialog(this.window, options, callback)
    }

    messageBox(options, callback = undefined) {
        dialog.showMessageBox(this.window, options, callback)
    }

    get Frame() {
        return this.frame
    }

    // set Frame(value) {
    //     if(value !== true && value !== false)
    //         throw TypeError("wrong value type")
    //
    //     this.frame = value
    // }

    get DisplayTitlebar() {
        return this.titlebar
    }

    // set DisplayTitlebar(value) {
    //     if(value !== true && value !== false)
    //         throw TypeError("wrong value type")
    //
    //     this.frame = value
    // }

    get Url() {

    }
}

export default Window