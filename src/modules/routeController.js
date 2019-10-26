// import { log } from '@app/appWrapper'
import { Routes } from '@constants/routes'
import log from 'electron-log'

export class RouteController {
    constructor() {
        this.lastAllowed = null
        this.lastRequested = null
    }

    beforeEach(to, from, next) {
        log.verbose(`request route to: ${to.path}`)

        this.lastRequested = to.path

        if(this._isRouteValid(to.path))
            this._passRoute(to, next)
        else
            this._abortRoute(to, next)
    }

    onRouteError(err) {
        log.error(`routing error occured: ${err}\n
        > last requested: ${this.lastRequested} \n
        > last allowed: ${this.lastAllowed}`)
    }

    //route actions
    _passRoute(to, next) {
        log.verbose(`passing route: ${to.path}`)
        this.lastAllowed = to.path
        next()
    }

    _abortRoute(to, next) {
        log.warn(`aborting route: ${to.path}`)
        next(false)
    }

    _redirectRoute(from, target, next) {
        log.verbose(`redirecting route: ${from} --> ${target}`)
        this.lastAllowed = `|REDIRECTED| ${from} --> ${target}`
        next(next)
    }

    //helpers
    _isRouteValid(routePath) {
        const result = routePath.match(/\/(\w+)/)

        if(!(result instanceof Array))
            return false

        //check if local routes contains routePath
        // return Routes.hasValue(result[0]) //FIXME <----
        return true // FIXME <----
    }
}