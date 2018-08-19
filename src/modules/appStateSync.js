import events from 'events'
import stateSync from './../constants/stateSync'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'

let con = exconsole(logger, console)

if (global.appStateSync === null || global.appStateSync === undefined) {
    class AppStateSync extends events.EventEmitter {
        constructor() {
            super() //execute base class ctr
            this.appSyncPoints = {}
        }

        createSyncPoint(name, ignoreExisting = true) {
            if(this.hasSyncPoint(name) && !(ignoreExisting)) {
                con.error(`${name} already exists`)
                throw TypeError(`${name} already exists`)
            } else if(this.hasSyncPoint(name)) {
                return false
            }

            this.appSyncPoints[name] = {
                state: stateSync.created,
                value: undefined
            }

            return true
        }

        hasSyncPoint(name) {
            return this.appSyncPoints.hasOwnProperty(name) ? true : false
        }

        setPointValue(name, value) {
            this._invalidPointExists(name)

            this.appSyncPoints[name]['value'] = value
        }

        getPointValue(name) {
            this._invalidPointExists(name)

            return this._getSyncPoint(name)
        }
        //
        getPointState(name) {
            this._invalidPointExists(name)

            return this.appSyncPoints[name]['state']
        }

        reset(name) {
            this._invalidPointExists(name)

            this.appSyncPoints[name]['state'] = stateSync.created
        }

        _invalidPointExists(name) {
            if(!(this.hasSyncPoint(name))) {
                con.error(`${name} doesn't exists`)
                throw TypeError(`${name} doesn't exists`)
            }
        }

        _notifyPointStateChanged(point, state) {
            this.emit(point, state)
        }

        _getSyncPoint(name) {
            return this.appSyncPoints[name]
        }
    }

    global.appStateSync = new AppStateSync()
}

export default global.appStateSync