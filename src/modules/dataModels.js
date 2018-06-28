"use strict"
import fs from 'fs'
import path from 'path'

class DataModels {
    constructor() {
        this.modelDirectory = path.join(__static, `models`)
    }

    makeModel(pathModel) {
        pathModel = path.join(this.modelDirectory, pathModel + '.json')
        var content = fs.readFileSync(pathModel, "utf8")

        return JSON.parse(content)
    }

    fromFile(pathModel) {
        pathModel = path.join(this.modelDirectory, pathModel + '.json')
        var content = fs.readFileSync(pathModel, "utf8")

        return JSON.parse(content)
    }
}

export let dataModels = new DataModels()