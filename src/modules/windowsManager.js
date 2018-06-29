class WindowsManager {
    constructor() {
        this.windows = {}
        this.isString = (s) => { typeof s === 'string' ? true : false }
        this.invalidIsString = (a, pn) => { if(!(this.isString)) throw TypeError(pn + " have to be a string") }
    }

    addWindow(name, window) {
        this.invalidIsString(name)

        if(this.hasWindow(name))
            throw TypeError('windows with id: ' + name + ' already exists')

        this.windows[name] = window
    }

    hasWindow(name) {
        this.invalidIsString(name)

        return this.windows.hasOwnProperty(name) ? true : false
    }

    getWindow(name) {
        this.invalidIsString(name)

        if(!(this.hasWindow(name)))
            throw TypeError('unable to find window: ' + name)

        return this.windows[name]
    }

    fireEvent(name, event) {
        this.invalidIsString(name)

        if(!(this.hasWindow(name)))
            throw TypeError('unable to find window: ' + name)

        let window = this.getWindow(name)

        switch(event) {
            case 'minimize':
                window.minimize()
            case 'maximize':
                window.maximize()
            case 'close':
                window.close()
        }
    }
    
    tryExecuteCustom(name, fn) {
        this.invalidIsString(name)

        if(!(this.hasWindow(name)))
            throw TypeError('unable to find window: ' + name)

        let window = this.getWindow(name)

        try {
            fn(window)
        } catch(error) {
            return [ false, error ]
        }

        return [ true ]
    }
}

export default WindowsManager