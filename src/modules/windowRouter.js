import fs from 'fs';
import { remote } from 'electron';

export class windowRouter {
    beforeEach(to, from, next) { //for global navigation processing
        console.log("[ROUTING] from: " + from + " next: " + next);
    }
}