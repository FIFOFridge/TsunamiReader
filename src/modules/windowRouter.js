import util from 'util'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'

let con = exconsole(logger, console)

class WindowRouter {
    constructor(fnBeforeEach, owner, ownerName) {
        if(!(util.isFunction(fnBeforeEach))) {
            con.error("fnBeforeEach isn't function")
            throw TypeError("fnBeforeEach isn't function")
        }

        if(!(util.isString(ownerName))) {
            con.error("ownerName isn't string")
            throw TypeError("ownerName isn't string")
        }

        this.owner = owner
        this.fnBeforeEach = fnBeforeEach
    }

    beforeEach(to, from, next) {
        con.info(`routing ${this.ownerName} from: ${from} to: ${to}`)
        this.fnBeforeEach(to, from, next, owner)
    }
}

export default WindowRouter