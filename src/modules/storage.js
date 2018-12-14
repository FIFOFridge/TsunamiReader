import util from 'util'
import { randomBytes } from 'crypto'
import fs from 'fs'

const freezer = o => {
    if(util.isArray(o))
        o.forEach(e => {
            Object.freeze(e)
        })
    else
        Object.freeze(o)
}

let tmpCtrKey = randomBytes(1024) 

class Storage {
    constructor(__ctrKey, strict, strictList) {
        if(__ctrKey !== tmpCtrKey) { //prevent extending
            throw TypeError(`Storage could be only created by exported method`)
        }

        this._props = {}

        if(util.isArray(strictList)) {
            strictList.forEach(key => {
                if(!(util.isString(key)))
                    throw TypeError(`unable to import strictList key: ${key}, key have to be string`)

                this._props[key] = null
            })

            Object.preventExtensions(this._props)
        }

        if(strict === true)
            this.strict = true
    }

    _keyExists(key) {
        return this._props.hasOwnProperty(key) && util.isString(key)
    }

    //https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
    _hashKey(key) {
        var hash = 0
        
        if (key.length == 0) return hash
            for (i = 0; i < key.length; i++) {
                char = key.charCodeAt(i)
                hash = ((hash<<5)-hash)+char
                hash = hash & hash
            }

        return hash
    }

    /**
     * 
     * @param {string} key 
     * @param {*} value 
     */
    set(key, value) {
        if(this.strict && !(this._keyExists(key)))
            throw ReferenceError(`unabled to find: ${key}`)

        if(value === undefined)
            throw TypeError(`cannot assign "undefined" to: ${key}, becouse "undefined" isnt supported value`)

        this._props[key] = value
    }

    /**
     * 
     * @param {string} key
     */
    get(key) {
        if(!this._keyExists(key))
            throw ReferenceError(`unabled to find: ${key}`)

        return this._props[key]
    }

    /**
     * 
     * @param {string} key 
     */
    add(key) {
        if(!Object.isExtensible(this._props))
            throw TypeError(`props are locked becouse they were loaded from 'strictList'`)

        if(this._keyExists(key))
            throw TypeError(`prop already exists: ${key}`)
    }

    /**
     * 
     * @param {string} key 
     */
    remove(key) {
        if(!Object.isExtensible(this._props))
            throw TypeError(`props are locked becouse they were loaded from 'strictList'`)

        if(!this._keyExists(key))
            throw ReferenceError(`unabled to find: ${key}`)

        delete this._props[key]
    }

    /**
     * 
     * @param {string | Array} key
     */
    has(key) {
        if(util.isString(key))
            return this._keyExists(key)
        if(util.isArray(key)) {
            var has = true

            try {
                key.forEach(element => {
                    if(!has) {
                        let hasElement = this._keyExists(element)
                        
                        if(!hasElement)
                            has = false
                    }
                })
            } catch(err) {
                throw TypeError(`error while checking existing keys: ${err.message}`)
            }

            return has
        }
    }

    /**
     * 
     * @param {string} data 
     */
    loadFromString(data) {
        if(!(util.isString(data)))
            throw TypeError(`data isn't String`)

        this._props = JSON.parse(data)
    }

    /**
     * 
     * @param {Buffer} buffer 
     */
    loadFromBuffer(buffer) {
        if(!(util.isBuffer(buffer)))
            throw TypeError(`buffer isn't Buffer`)

        this.load(buffer.toString())
    }

    /**
     * 
     * @param {Buffer} buffer 
     */
    copy() {
        return JSON.stringify(this._props)
    }

    toFile(path) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, this.copy(), {encoding: 'UTF-8'}, (err) => {
                if(err)
                    reject(`error during writing file: ${path}, error: ${err}`)
                else
                    resolve()
            })
        })
    }

    fromFile(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, {encoding: 'UTF-8'}, (err, data) => {
                if(err)
                    reject(`error during reading file: ${path}, error: ${err}`)
                else
                    resolve(data)
            })
        })
    }

    toLocaleString() {
        return undefined
    }

    toString() {
        return undefined
    }

    valueOf() {
        return undefined
    }
}

let _factory = function(_strict = true, _strictList = null) {
    let storage = new Storage(tmpCtrKey, _strict, _strictList)

    freezer(storage.strict)

    if(_strict) {
        freezer(
            [
                storage._keyExists,
                storage._hashKey,
                storage.set,
                storage.get,
                storage.add,
                storage.remove,
                storage.has,
                storage.loadFromBuffer,
                storage.loadFromString,
                storage.copy,
                storage.toLocaleString,
                storage.toString,
                storage.valueOf
            ]
        )

        Object.preventExtensions(storage)
    }

    return storage
}

export default _factory