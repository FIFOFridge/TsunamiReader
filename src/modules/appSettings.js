"use strict";

import fs from 'fs';
import { remote } from 'electron';

export class Settings {
    constructor() {
        this.settingsPath = path.join(remote.app.getPath('userData'), '/books.json');
        this.tempExtension = ".new";
    }

    get save() {
        var newSettingsPath = path.join(remote.app.getPath('userData'), 
            ('/books.json' + this.tempExtension) 
        );

        var content = JSON.stringify(this.settingsObject);

        fs.writeFileSync(newSettingsPath, content);//write new content
        fs.unlinkSync(this.settingsPath);//delete old one
        fs.renameSync(newSettingsPath, this.settingsPath);//rename to new one
    }

    get settings() {
        return this.settings;
    }
}