import util from 'util'
import { randomBytes } from 'crypto'
import fs from 'fs'
import { EventEmitter } from 'events'

const freezer = o => {
    if(util.isArray(o))
        o.forEach(e => {
            Object.freeze(e)
        })
    else
        Object.freeze(o)
}

let dataTypes = {
    Boolean: 'boolean',
    Function: 'function',
    Null: 'null',
    Number: 'number',
    String: 'string',
    Symbol: 'symbol',
    Object: 'object'
}

let tmpCtrKey = randomBytes(1024) 

class Storage extends EventEmitter {
    /**
     * 
     * @param {*} __ctrKey
     * @param {int} mode - storage value contains modes: 
     * 0 = default no value restricted types
     * 1 = values has restricted types and they have to be checked during add/set
     * @param {*} forcedType - ONLY if "strict" is false, specify type for all contained values
     * @param {*} strict - can storage be expended/modifited (true) or not (false)
     * @param {*} strictList - depending on "mode" argument:
     * 0 = key list (ex: ["sampleKey", "sampleKey2"])
     * 1 = object list with format: {key: <string_key>, type: <type>, [[OPTIONAL]default: <typeValue>] }
     */
    constructor(__ctrKey, mode, forcedType, strict, strictList, overrideEmptyValue = null) {
        super()

        if(__ctrKey !== tmpCtrKey) { //prevent extending
            throw TypeError(`Storage could be only created by exported method`)
        }

        if(overrideEmptyValue === undefined)
            throw TypeError(`overrideEmptyValue can not be "undefined"`)

        this.underConstruction = true //helper for internal class/factory function usage
        this.mode = mode
        this.forcedType = forcedType !== undefined ? forcedType : null

        this.defaultEmptyValue = this.overrideEmptyValue !== undefined ? this.overrideEmptyValue : null

        this._overrides = []

        let _createOverride = (name, _default, returnType) => {
            this._overrides.push({name: name, set: false, fn: null, default: _default, returnType: returnType})
        } 

        _createOverride('isSet', (v) => { v !== defaultEmptyValue }, dataTypes.String)
        _createOverride('serializeFormatter', (d) => { return JSON.stringify(d) }, dataTypes.String)
        _createOverride('deserializeFormatter', (d) => { return JSON.parse(d) }, dataTypes.String)
        _createOverride('copyFormatter', (d) => { return JSON.parse(JSON.stringify(d)) }, dataTypes.Object) 

        if(strict === true) {
            this.strict = true
            this.forcedType = null
        }

        this._props = []

        if(strict) {
            this._loadItems(strictList)
        }
        /*
        if(util.isArray(strictList)) {
            strictList.forEach(key => {
                if(!(util.isString(key)))
                    throw TypeError(`unable to import strictList key: ${key}, key have to be string`)

                this._props[key] = null
            })

            Object.preventExtensions(this._props)
        }*/
    }

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    // :::                  internal helpers                     :::
    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    _executeOverrideFunction(name, data) {
        let names = this._overrides.map(o => o.name)

        if(!(names.includes(name)))
            throw ReferenceError(`unable to override find: ${name}`)
        
        let overrideObj = this._overrides.find(i => i.name == name)
        
        let value = overrideObj.set ? overrideObj.fn(data) : overrideObj.default(data)

        if(typeof(value) !== overrideObj.returnType)
            throw TypeError(`override function returned wrong type of data: ${typeof(value)}, expected: ${overrideObj.returnType}`)

        return value
    }

    _createItem(_key, type, _default) {
        if(!(util.isString(_key)))
            throw TypeError(`internal storage error during creating item, _key have to be string value`)

        if((this.mode === 1) && (!util.isString(type)))
            throw TypeError(`item (with key: ${key}) "type" has to be string`)

        let item = {
            key: _key, 
            value: this.defaultEmptyValue, 
            default: _default !== undefined ? _default : null, 
            type: this.mode === 0 ? this.forcedType : type
        }

        Object.preventExtensions(item)
        freezer(item.key)
        freezer(item.type)
        freezer(item.default)

        return item
    }

    _getItemByKey(key) {
        let keys = this._props.map(i => i.key)
        let index = -1

        for(let i = 0; i < keys.length; i++) {
            if(keys[i] === key) {
                index = i
                break
            }
        }

        return this._props[index]
    }

    _loadItems(items) {
        if(!(this.underConstruction))
            throw TypeError('unable to load items after storage initialization')

        if(this.mode === 0) {
            if(!(util.isArray(items))) {
                throw TypeError(`wrong items format, has to be array of strings(keys names)`)
            }

            for(let i = 0; i < items.length; i++) {
                if(!(util.isString(items[i]))) {
                    throw TypeError(`wrong items: ${items[i]} value, has to be string (key name)`)
                }

                let newItem = this._createItem(items[i])
                this._setItem(newItem)
            }
        } else if(this.mode === 1) {
            if(!(util.isArray(items))) {
                throw TypeError(`wrong items format, has to be array of objects(items) [{key: <string_key>, type: <string_type>[,[OPTIONAL] default: <default_value>]}]`)
            }

            for(let i = 0; i < items.length; i++) {
                if(!(util.isObject(items[i]))) {
                    throw TypeError(`wrong item: ${items[i]} object should be string which contains: {key: <string_key>, type: <string_type>[,[OPTIONAL] default: <default_value>]}`)
                }

                let newItem = this._createItem(items[i].key, items[i].type, items[i].default)
                this._setItem(newItem)
            }
        } else {
            throw TypeError(`wrong mode type: ${this.mode} has to be int`)
        }
    }

    _keyExists(key) {
        return this._props.map(i => i.key).includes(key) && util.isString(key)
    }

    _setItem(object) {
        if(this._keyExists(object.key)) {
            let keys = this._props.map(i => i.key)
            let index = -1

            for(let i = 0; i < keys.length; i++) {
                if(keys[i] === object.key) {
                    index = i
                    break
                }
            }

            let item = this._props[index]

            if(!(_areTypesEqual(item.value, object.value))) {
                throw TypeError(`incorrect type ${item.key}, expected is: ${item.type}`)
            } 

            item.value = object.value
        } else {
            this._props.push(object)
        }
    }

    _areTypesEqual(value, value2) {
        return typeof(value) === typeof(value2) || value === null || value2 === null
    }
    
    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    // :::                        public                         :::
    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    /**
     * 
     * @param {string} key 
     * @param {*} _value 
     */
    set(key, value) {
        if(!(this._keyExists(key)))
            throw ReferenceError(`unabled to find: ${key}`)

        if(value === undefined)
            throw TypeError(`cannot assign "undefined" to: ${key}, becouse "undefined" isnt supported value`)

        let currentItem = this._getItemByKey(key)

        if(!(this._areTypesEqual(typeof(value), currentItem.type)))
            throw TypeError(`current value type: ${typeof(value)} isn't same as declarated: ${currentItem.type} `)

        currentItem.value = value

        this._emitKeyStateChange(key, 'set')
    }

    /**
     * 
     * @param {string} key
     */
    get(key) {
        if(!this._keyExists(key))
            throw ReferenceError(`unabled to find: ${key}`)

        return this._getItemByKey(key).value
    }

    /**
     * 
     * @param {string} key 
     */
    add(key, type, _default) {
        if(!Object.isExtensible(this._props))
            throw TypeError(`props are locked becouse they were loaded from 'strictList'`)

        if(this._keyExists(key))
            throw TypeError(`prop already exists: ${key}`)

        this._setItem(this._createItem(key, type, _default))

        this._emitKeyStateChange(key, 'added')
    }

    /**
     * 
     * @param {string} key 
     */
    remove(key) {
        if(Object.isExtensible(this.strict))
            throw TypeError(`props are locked becouse they were loaded from 'strictList'`)

        if(!this._keyExists(key))
            throw ReferenceError(`unabled to find: ${key}`)

        delete this._getItemByKey(key)

        this._emitKeyStateChange(key, 'removed')
    }

    /**
     * 
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        return this._keyExists(key)
    }

    /**
     * 
     * @param {string} key 
     * @returns {boolean}
     */
    isSet(key) {
        return new Promise((resolve, reject) => {
            if(!this._keyExists(key))
                reject(`unabled to find: ${key}`)

            try {
                let value = this._executeOverrideFunction('copyFormatter', this._props)
                resolve(value)
            } catch(err) {
                reject(err)
            }
            this.overrideIsSet === undefined ? this._getItemByKey(key).value !== null : this.overrideIsSet(this._getItemByKey(key).value)
        })
    }

    _emitKeyStateChange(key, action) {
        this.emit(key, 'changed', action)
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

        this.loadFromString(buffer.toString())
    }

    /**
     * 
     * @returns {Promise}
     */
    copy() {
        return new Promise((resolve, reject) => {
            try {
                let value = this._executeOverrideFunction('copyFormatter', this._props)
                resolve(value)
            } catch(err) {
                reject(err)
            }
        })
    }

    toFile(path) {
        return new Promise((resolve, reject) => {
            try {
                let formatedData = this._executeOverrideFunction('serializeFormatter', this._props)

                fs.writeFile(path, formatedData, {encoding: 'UTF-8'}, (err) => {
                    if(err)
                        reject(`error during writing file: ${path}, error: ${err}`)
                    else
                        resolve()
                })
            } catch(err) {
                reject(err)
            }
        })
    }

    loadfromFile(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, {encoding: 'UTF-8'}, (err, data) => {
                if(err)
                    reject(`error during reading file: ${path}, error: ${err}`)
                else {
                    try {
                        let parsedData = this._executeOverrideFunction('serializeFormatter', data)

                        if(this.strict) {
                            if(parsedData.length != this._props.length)
                                throw TypeError(`keys aren't matching`)

                            for(let i = 0; i < this._props.length; i++) {
                                if(this._props[i].key !== parsedData[i].key)
                                    throw TypeError(`keys aren't matching`)

                                if(this._areTypesEqual(this._props[i].type, parsedData[i].type))
                                    throw TypeError(`key: ${this._props[i].key} type isn't match, expected: ${this._props[i].type} got: ${parsedData[i].type}`)

                                if(this._areTypesEqual(typeof(parsedData[i].value), parsedData[i].type)) {
                                    throw TypeError(`key value isn't maching to type: ${parsedData[i].key}, expected: ${parsedData[i].type} got: ${typeof(parsedData[i].value)}`)
                                }
                            }
                        }

                        if(this.mode === 0) {
                            for(let i = 0; i < this.parsedData.length; i++) {
                                if(this.parsedData[i].type !== this.forcedType) {}
                                    throw TypeError(`key type isn't correct for this storage: ${this.parsedData[i].type}, expected: ${this.forcedType}`)
                            }
                        }

                        this._props = parsedData

                        resolve()
                    } catch(erro) {
                        reject(`unable to parse data: ${data}, error: ${erro}`)
                    }
                }
            })
        })
    }

    override(name, _function) {
        let names = this._overrides.map(o => o.name)

        if(!(names.includes(name)))
            throw ReferenceError(`unable to find: ${name}`)

        if(!(typeof(_function) != dataTypes.Function))
            throw TypeError(`function has incorrect type: ${typeof(_function)}, expected: ${dataTypes.Function}`)

        let overrideObj = this._overrides.find(i => i.name == name)
        
        overrideObj.set = true
        overrideObj.fn = _function
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

let _factory = function(_strict = false, _strictList = null, mode = 0, forcedType = null) {
    let storage = new Storage(tmpCtrKey, mode, forcedType, _strict, _strictList)

    storage.underConstruction = false//update construction state

    freezer([
        storage.strict,
        storage.mode,
        storage.underConstruction,
        storage.defaultEmptyValue
    ])

    if(_strict) {
        freezer(
            [
                storage._createItem,
                storage._executeOverrideFunction,
                storage._getItemByKey,
                storage._loadItems,
                storage._keyExists,
                storage._setItem,
                storage._createOverride,
                storage.override,
                storage.isSet,
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
    }

    Object.preventExtensions(storage)

    return storage
}

export default {
    dataTypes: dataTypes,
    create: {
        predefined: {
            typeRestricted: (list, defaultEmptyValue = null) => {
                return _factory(true, list, 1, null, defaultEmptyValue)
            },
            listOfKeys: (list, defaultEmptyValue = null) => {
                return _factory(true, list, 0, null, defaultEmptyValue)
            }
        },
        empty: {
            typeRestricted: (allowedType, defaultEmptyValue = null) => {
                return _factory(false, null, 1, allowedType, defaultEmptyValue)
            },
            any: (defaultEmptyValue = null) => {
                return _factory(false, null, 0, null, defaultEmptyValue)
            }
        }
    },
    factory: _factory
}