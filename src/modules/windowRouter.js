import fs from 'fs';
import { remote } from 'electron';

class WindowRouter {
    beforeEach(to, from, next) { //for global navigation processing
        console.log("[ROUTING] from: " + from + " next: " + next);
    }
}

export default WindowRouter