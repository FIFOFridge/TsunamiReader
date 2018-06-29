import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'

let con = exconsole(logger, console)

class WindowsManager {
    constructor() {
        this.windows = {}

        this.isString = (s) => {
            typeof s === 'string' ? true : false

            if(typeof s !== 'string')
                con.warn(s + "'isn't sting")
        }

        this.invalidIsString = (a, pn) => {
            if(!(this.isString))
                con.error(a + 'have to be string ==> ' + pn + '(arg)')

            if(!(this.isString)) 
                throw TypeError(pn + " have to be a string") 
        }
    }

    addWindow(name, window) {
        this.invalidIsString(name, "name")

        con.debug("adding window with id[key]: " + name)

        if(this.hasWindow(name)) {
            throw TypeError('windows with id: ' + name + ' already exists')
        }

        this.windows[name] = window
    }

    removeWindow(name, close = true) {
        this.invalidIsString(name, "name")

        con.debug("removing window with id[key]: " + name)

        if(!(this.hasWindow(name))) {
            throw TypeError('windows with id: ' + name + ' not exists')
        }

        this.windows[name].close()
        this.windows[name] = null
    }

    hasWindow(name) {
        this.invalidIsString(name, "name")

        return this.windows.hasOwnProperty(name) ? true : false
    }

    getWindow(name) {
        this.invalidIsString(name, "name")

        if(!(this.hasWindow(name)))
            throw TypeError('unable to find window: ' + name)

        return this.windows[name]
    }

    fireEvent(name, event) {
        con.debug("executing event: " + event + " on window(key): " + name)

        this.invalidIsString(name, "name")

        if(!(this.hasWindow(name)))
            throw TypeError('unable to find window: ' + name)

        let window = this.getWindow(name)

        switch(event) {
            case 'minimize':
                window.minimize()
                break
            case 'maximize':
                window.maximize()
                break
            case 'close':
                window.close()
                break
            default:
            {
                con.error('unable to process event: ' + event + ' for window(key): ' + window)
                throw TypeError('unable to process event: ' + event)
            }
        }

        con.debug("successfully executed event: " + event + " on window(key): " + name)
    }
    
    tryExecuteCustom(name, fn) {
        this.invalidIsString(name, "name")

        con.debug('executing custom function on window: ' + name)

        if(!(this.hasWindow(name)))
            throw TypeError('unable to find window: ' + name)

        let window = this.getWindow(name)

        try {
            fn(window)
        } catch(error) {
            con.debug('custom function execution failed on: ' + name)
            return [ false, error ]
        }

        con.debug('custom function executed successfully on: ' + name)
        return [ true ]
    }
}

export default WindowsManager