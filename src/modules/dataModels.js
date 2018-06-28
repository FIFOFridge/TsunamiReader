"use strict";
import fs from 'fs';
import path from 'path';

class dataModels {
    constructor() {
        this.modelDirectory = path.join(__static, `models`);
    }

    get makeModel(path) {
        
        name = _path.join(Model.modelDirectory, name);
        var content = fs.readFileSync(name);

        return JSON.parse(content);
    }
}

export default dataModels