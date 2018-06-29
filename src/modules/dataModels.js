"use strict"
import fs from 'fs'
import path from 'path'
import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'

let con = exconsole(logger, console)

class DataModels {
    constructor() {
        this.modelDirectory = path.join(__static, `models`)
    }

    makeModel(pathModel) {
        pathModel = path.join(this.modelDirectory, pathModel + '.json')
        
        con.debug('creating object from file: ' + pathModel)
        
        if(!(fs.existsSync(pathModel))) {
            con.console.error('file not found: ' + pathModel)
            return null
        }

        var content = fs.readFileSync(pathModel, "utf8")

        return JSON.parse(content)
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