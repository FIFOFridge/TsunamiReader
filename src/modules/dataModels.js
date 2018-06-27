"use strict";
const fs = require('fs');
const path = require('path')
const appDir = path.dirname(require.main.filename);
const remote = require('electron').remote;

var Models = {
    modelDirectory: path.join(__static, `models`),
    makeModel: function(name) {
        if(name.contains("/") || name.contains("\\"))
            name = _path.join(Model.modelDirectory, name);

        var err;
        var data;

        //fs.readFile(name, {err: err, data: data});
    },
    makeModelSync: function(name) {
        if(name.contains("/") || name.contains("\\"))
            name = _path.join(Model.modelDirectory, name);

        var content = fs.readFileSync(name);

        return JSON.parse(content);
    }
};

module.exports = Models;