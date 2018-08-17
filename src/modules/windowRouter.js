import util from 'util'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import objectHelper from "./helpers/objectHelper";
import events from 'events'
import actionsHandler from './actionsHandler'

if(global.windowRouter === null || global.windowRouter === undefined) {
    let con = exconsole(logger, console)

    class WindowRouter extends events.EventEmitter {
        constructor() {
            super()
            // this.actions = {}
            new actionsHandler(this)
        }
    
        // _hasAction(name) {
        //     return (objectHelper.isPropertyDefined(this.actions, name) ? true : false)
        // }

        // registerAction(name, func) {
        //     if(!(util.isString(name))) {
        //         con.error('name has to be string')
        //         throw TypeError('name has to be string')
        //     }

        //     if(!(util.isFunction(func))) {
        //         con.error('func has to be function')
        //         throw TypeError('func has to be function')
        //     }

        //     if(this._hasAction(name)) {
        //         con.error(`action: ${name} is already regisred`)
        //         throw TypeError(`action: ${name} is already regisred`)
        //     }
        // }

        beforeEach(to, from, next) {
            // console.log(to)
            // console.log(from)
            con.info(`routing from: ${from.path} to: ${to.path}`)

            // if(this.beforeEach === null) {
            //     con.error("fnBeforeEach isn't defined")
            //     throw TypeError("fnBeforeEach isn't defined")
            // }

            var params = to.path.split('/')
            console.log(params.length)
            con.debug(params[1])

            if((params.length > 1) && (params[1] === 'action')) {

                con.debug(`routing to action: ${params[2]}`)

                if(this.listenerCount(params[2]) === 0) {
                    con.error(`no listner(s) detected for: ${params[2]}`)
                    throw ReferenceError(`no listner(s) detected for: ${params[2]}`)
                }

                this.emit(params[2], to)
                // if(this._hasAction(params[1])) {
                //     this.actions[params[1]](to.query)//call function
                // } else {
                //     con.error(`action not defined: ${params[1]}, aborting`)
                // }
                
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