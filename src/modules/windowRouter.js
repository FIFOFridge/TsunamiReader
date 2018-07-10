import util from 'util'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'

if(global.windowRouter === null || global.windowRouter === undefined) {
    let con = exconsole(logger, console)

    class WindowRouter {
        constructor() {
            // this.beforeEach = null
        }
    
        beforeEach(to, from, next) {
            con.info(`routing from: ${from.path} to: ${to.path}`)

            if(this.beforeEach === null) {
                con.error("fnBeforeEach isn't defined")
                throw TypeError("fnBeforeEach isn't defined")
            }

            next()
        }
    }

    global.windowRouter = new WindowRouter()
}

export default global.windowRouter