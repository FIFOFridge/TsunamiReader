import util from 'util'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'

if(global.windowRouter === null || global.windowRouter === undefined) {
    let con = exconsole(logger, console)

    class WindowRouter {
        constructor() {
            this.fnBeforeEach = null
        }
    
        beforeEach(to, from, next) {
            con.info(`routing from: ${from} to: ${to}`)

            if(this.fnBeforeEach === null) {
                con.error("fnBeforeEach isn't defined")
            }

            this.fnBeforeEach(to, from, next)
        }

        set fnBeforeEach(val) {
            this.fnBeforeEach = val
        }

        get fnBeforeEach() {
            return this.fnBeforeEach
        }
    }

    global.windowRouter = new WindowRouter()
}

export default global.windowRouter