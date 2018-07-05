"use strict"
import fs from 'fs'
import path from 'path'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'

let con = exconsole(logger, console)

class DataModels {
    constructor() {
        this.modelDirectory = path.join(__static, `models`)
        this.cachedModels = {}
    }

    _containsCachedModel(path) {
        if(this.cachedModels.hasDefinedProperty(path) &&
            this.cachedModels.path !== null &&
            this.cachedModels.path !== undefined) {
            
            return true
        }

        return false
    }

    _cacheModel(path, value, override) {
        if(this._containsCachedModel(path) && !(override)) {
            con.error(path + " is already cached. If you want to update it set overrideCache to true")
            return
        }

        this.cachedModels.path = value
    }

    makeModel(pathModel, cache = false, overrideCache = false) {
        pathModel = path.join(this.modelDirectory, pathModel + '.json')
        
        if(cache && this._containsCachedModel(pathModel) && !(overrideCache))
            return this.cachedModels.pathModel 

        con.debug('creating object from file: ' + pathModel)
        
        if(!(fs.existsSync(pathModel))) {
            con.console.error('file not found: ' + pathModel)
            return null
        }

        var content = fs.readFileSync(pathModel, "utf8")
        var model = JSON.parse(content)

        if(cache) {
            this._cacheModel(pathModel, false, overrideCache)
        }

        return model
    }

    fromFile(pathModel) {
        pathModel = path.join(this.modelDirectory, pathModel + '.json')

        con.debug('creating object from file: ' + pathModel)
        
        if(!(fs.existsSync(pathModel))) {
            con.console.error('file not found: ' + pathModel)
            return null
        }

        var content = fs.readFileSync(pathModel, "utf8")

        return JSON.parse(content)
    }
}

export let dataModels = new DataModels()