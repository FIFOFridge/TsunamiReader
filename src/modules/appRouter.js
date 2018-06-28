import fs from 'fs';
import { remote } from 'electron';

export class appRouter {
    beforeEach(to, from, next) { //for global navigation processing
        console.log("[ROUTING] from: " + from + " next: " + next);
    }
}