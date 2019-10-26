import logger from 'electron-log'
import { isRunningMain, getRunnerType } from '@helpers/electronHelper'
import logLevel from '@constants/logLevel'
import path from 'path'
import paths from '@constants/paths'
import util from 'util'

let instance = undefined

applyConfig() //setup config if needed

if(isRunningMain())
    instance = global._electronLogMainInstance
else
    instance = global._electronLogRendererInstance

function applyConfig() {
    if(isRunningMain()) { //Main
        //apply config
        if(global._electronLogMainInstance === undefined)
        {
            global._electronLogMainInstance = logger

            //setup transports
            if(process.env.NODE_ENV !== 'development') {
                logger.transports.file.level = logLevel.Debug
                logger.transports.console.level = logLevel.Debug
            } else {
                logger.transports.file.level = logLevel.Verbose
                // noinspection JSValidateTypes
                logger.transports.console.level = logLevel.Disabled
            }

            logger.transports.file.file = path.join(paths.appStorageDirectory, '/app.log')
            logger.transports.console.format = '[{level}] {h}:{i}:{s} : {text}'
            logger.transports.file.format = '[{level}] {y}-{m}-{d} {h}:{i}:{s} : {text}'

            logger.transports.console = (msg) => {
                let date
                let caller

                if(msg.date instanceof Date) //called from main
                {
                    date = msg.date.toLocaleDateString()
                    caller = 'main'
                } else { //called from renderer, msg.date is string not a Date, propably becouse of ipc limitations
                    date = new Date(msg.date).toLocaleDateString()
                    caller = 'renderer'
                }

                const text = util.format.apply(util, msg.data)
                // const date = (msg.date instanceof Date) ? msg.date.toLocaleDateString() : new Date(msg.date).toLocaleDateString()
                console.log(`@${caller} [${msg.level}] ${date}: ${text}`)
            }
        }
    } else { //Renderer
        //apply config
        if(global._electronLogRendererInstance === undefined)
        {
            global._electronLogRendererInstance = logger

            //setup transports
            if(process.env.NODE_ENV !== 'development') {
                // noinspection JSValidateTypes
                logger.transports.file.level = logLevel.Disabled
                // noinspection JSValidateTypes
                logger.transports.console.level = logLevel.Disabled
            } else {
                // noinspection JSValidateTypes
                logger.transports.file.level = logLevel.Disabled
                // noinspection JSValidateTypes
                logger.transports.console.level = logLevel.Disabled
            }

            logger.transports.file.file = path.join(paths.appStorageDirectory, '/app_renderer.log')
            logger.transports.console.format = '[{level}] {h}:{i}:{s} : {text}'
            logger.transports.file.format = '[{level}] {y}-{m}-{d} {h}:{i}:{s} : {text}'

            logger.transports.console = (msg) => {
                let date
                let caller

                if(msg.date instanceof Date) //called from main
                {
                    date = msg.date.toLocaleDateString()
                    caller = 'renderer'
                } else { //called from renderer, msg.date is string not a Date, propably becouse of ipc limitations
                    date = new Date(msg.date).toLocaleDateString()
                    caller = 'main'
                }

                const text = util.format.apply(util, msg.data)
                // const date = (msg.date instanceof Date) ? msg.date.toLocaleDateString() : new Date(msg.date).toLocaleDateString()
                console.log(`@${caller} [${msg.level}] ${date}: ${text}`)
            }
        }
    }
}

//export log instance for main or renderer
export const log = instance