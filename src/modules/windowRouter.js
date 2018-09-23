import util from 'util'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import objectHelper from "./helpers/objectHelper";
import events from 'events'
//import actionsHandler from './actionsHandler'
import { ipcRenderer } from 'electron'

if(global.windowRouter === null || global.windowRouter === undefined) {
    let con = exconsole(logger, console)

    class WindowRouter /*extends events.EventEmitter*/ {
        constructor() {
            //super()]
        }

        beforeEach(to, from, next) {
            // console.log(to)
            // console.log(from)
            con.info(`routing from: ${from.path} to: ${to.path}`)

            var params = to.path.split('/')
            console.log(params.length)
            con.debug(params[1])

            if((params.length > 1) && (params[1] === 'action')) {

                con.debug(`routing to action: ${params[2]}`)

                // if(this.listenerCount(params[2]) === 0) {
                //     con.error(`no listner(s) detected for: ${params[2]}`)
                //     throw ReferenceError(`no listner(s) detected for: ${params[2]}`)
                // }

                ipcRenderer.send(params[2], to)

                //this.emit(params[2], to)
                
                con.debug('preventing redirection')
                next(false)//prevent redirection
                return
            }

            next()
        }
    }

    global.windowRouter = new WindowRouter()
}

export default global.windowRouter