"use strict";
import fs from 'fs';

export class dataModels {
    constructor() {
        this.modelDirectory = path.join(__static, `models`);
    }

    get makeModel(path) {
        
        name = _path.join(Model.modelDirectory, name);
        var content = fs.readFileSync(name);

        return JSON.parse(content);
    }
}