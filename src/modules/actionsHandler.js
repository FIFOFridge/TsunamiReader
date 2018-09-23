import exconsole from './helpers/loggerConsole'
import logger from './helpers/logger'
import objectHelper from './helpers/objectHelper'
import electron from 'electron'
import util from 'util'
import events from 'events'
import fs from 'fs'
import epubHelper from './helpers/epubHelper'
import path from 'path'
import sharedAppStates from './../constants/sharedAppStates'

let con = exconsole(logger, console)

class ActionsHandler {
    constructor(router) {
        // if (!(router.prototype instanceof events.EventEmitter)) {
        //     con.error(`'router' doesn't implement EventEmiter`)
        //     throw TypeError(`'router' doesn't implement EventEmiter`)
        // }
        console.log(router.prototype)

        // router.on('book-continue', this.onBookAdd)
        // router.on('book-add', this.onBookAdd)
    }

    onBookAdd(params) {
        
    }

    onBookContinue(params) {

    }
}

export default ActionsHandler