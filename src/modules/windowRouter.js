import util from 'util'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import objectHelper from "./helpers/objectHelper";
import events from 'events'
//import actionsHandler from './actionsHandler'
import { ipcRenderer } from 'electron'

if(global.windowRouter === null || global.windowRouter === undefined) {
    let con = exconsole(logger, console)

    class WindowRouter {
        constructor() {
        }

        beforeEach(to, from, next) {
            con.info(`routing from: ${from.path} to: ${to.path}`)

            var params = to.path.split('/')
            
            if((params.length > 1) && (params[1] === 'action')) {
                con.debug(`routing to action: ${params[2]}`)
                ipcRenderer.send(params[2], to)

                next(false)//prevent redirection
                return
            }

            next()
        }
    }

    global.windowRouter = new WindowRouter()
}

export default global.windowRouter