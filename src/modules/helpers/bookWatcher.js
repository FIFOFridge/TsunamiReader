// import chokidar from 'chokidar' <-- crashes whole vue instance
import fs from 'fs'
import { log } from '@app/log'
import { EventEmitter } from 'events'
import XXHash from 'xxhashjs'
import path from 'path'
import * as Promise from 'bluebird'
import { throttle } from '@helpers/functionHelper'
import util from 'util'
import { isDownloading, isLocked } from '@helpers/fileHelper'

export class BookWatcher extends EventEmitter {
    constructor(directory) {
        super()
        this.directory = directory
        this.colletion = []
        this.isWatching = false
        this.watchObject = null
    }

    async beginWatch(/*_skipInitial = false*/) {
        if(this.isWatching)
            return

        this.watchObject = fs.watch(
            this.directory,
            {
                persistent: false,
                recursive: false,
                encoding: 'utf-8'
            },
            this._listner.bind(this)
        )

        this.isWatching = true

        // this.watchObject = chokidar.watch(this.directory,
        //     {
        //         ignoreInitial: _skipInitial,
        //         persistent: true,
        //         followSymlinks: false,
        //         depth: 1
        //     }
        // )

        // //process and forward events
        // this.watchObject.on('ready', () => {
        //
        //     this.watchObject.on('add', path => {
        //         this.colletion[path] = true
        //         this._emit('added', path)
        //     })
        //
        //     this.watchObject.on('unlink', path => {
        //         delete this.colletion[path]
        //         this._emit('removed', path)
        //     })
        //
        //     this.watchObject.on('change', async path => {
        //          //"await" will be ignored anyway, this is how event emmiter work, pheh
        //          //TODO: setup some lock object to prevent collection changes during this
        //          //TODO: operation will be compiled
        //          await this._updateCollection.call(this, path)
        //         this._emit('new', this.colletion)
        //     })
        // })

        return undefined
    }

    has(_path) {
        return this.colletion.hasOwnProperty(_path)
    }

    get collection() {
        //deep clone
        return JSON.parse(JSON.stringify(this.colletion))
    }

    _hasStored(_path) {
        path.join(this.directory, _path + '.js')
    }

    static _getFileHash(filePath) {
        return new Promise((resolve, reject) => {
            if(!(fs.existsSync(filePath)))
                throw new Error(`unable to find file path: ${filePath}`)

            fs.readFile(filePath, {encoding: 'utf-8'}, (err, buffer) => {
                if(err)
                    reject(`unable to read file: ${err}`)

                try {
                    resolve(hash = XXHash.h32(0).update(buffer).digest())
                } catch(e) {
                    reject(`unable to generate file hash: ${e}`)
                }
            })
        })
    }

    _listner(eventType, fileName) {
        log.verbose(`watcher recived: ${eventType} for ${fileName}`)
        throttle(this._updateCollection(this.directory), 300, undefined)
    }

    _updateCollection(path) {
        let changes = []

        fs.readdir(
            path,
            { encoding: 'utf-8', withFileTypes: false },
            (err, files) =>
            {
                if(err) {
                    log.error(`unable to update file collection`)
                    return
                }

                for(let fileIndex in files) {
                    const file = files[fileIndex]

                    if(isLocked(file) || isDownloading(file))
                        continue

                    if(this._isBookFileMatching(file) !== true)
                        continue //ignore non metadata file

                    if(!(this.collection.hasOwnProperty(file))) {
                        // this.collection[file] = true
                        changes.push({event: 'added', path: file})
                    }
                }

                //check if something was removed
                for(let oldFile in this.collection) {
                    if(!(files.contains(oldFile))) {
                        // delete this.collection[oldFile]
                        changes.push({event: 'removed', path: oldFile})
                    }
                }

                for(let changeIndex in changes) {
                    const change = changes[changeIndex]

                    //apply change to collection
                    if(change.event === 'added') {
                        this.collection[change.path] = true
                    } else { //removed
                        delete this.collection[change.path]
                    }

                    //emit change
                    this._emit(change.event, change.path)
                }
            })
    }

    _isBookFileMatching(fileName) {
        if(!(util.isString(fileName)))
            return false

        const extensionDotIndex = fileName.lastIndexOf('.')

        if(extensionDotIndex < 0)
            return false

        const extension = fileName.substring(extensionDotIndex, fileName.length)

        return extension === 'json'
    }

    _emit(event, arg) {
        log.verbose(`emiting: ${event}`)
        this.emit(event, arg)
    }

    dispose() {
        if(this.watchObject !== null) {
            this.watchObject.close()
        }
    }
}
