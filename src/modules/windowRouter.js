import { ipcRenderer } from 'electron'
import log from 'electron-log'

if(global.windowRouter === null || global.windowRouter === undefined) {
    // let con = exconsole(logger, console)

    class WindowRouter {
        constructor() {
        }

        beforeEach(to, from, next) {
            log.info(`routing from: ${from.path} to: ${to.path}`)

            const params = to.path.split('/')
            
            if((params.length > 1) && (params[1] === 'action')) {
                log.debug(`routing to action: ${params[2]}`)
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