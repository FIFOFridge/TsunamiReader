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
        this.defaultEmptyValue = this.overrideEmptyValue !== undefined ? this.overrideEmptyValue : null

        this.forcedType = forcedType !== undefined ? forcedType : this.defaultEmptyValue

        this._overrides = []

        let _createOverride = (name, _default, returnType) => {
            this._overrides.push({name: name, set: false, fn: null, default: _default, returnType: returnType})
        } 

        _createOverride('isSet', (a) => { 
            if(a[1] === true) {
                if(a[0].default !== null)
                    return true
                else
                    return a[0].value !== this.defaultEmptyValue
            } else {
                return a[0].value !== this.defaultEmptyValue
            }
         }, dataTypes.Boolean)
        _createOverride('serializeFormatter', (d) => { return JSON.stringify(d) }, dataTypes.String)
        _createOverride('deserializeFormatter', (d) => { return JSON.parse(d) }, dataTypes.Object)
        _createOverride('copyFormatter', (d) => { return JSON.parse(JSON.stringify(d)) }, dataTypes.Object) 

        if(strict === true) {
            this.strict = true
            this.forcedType = this.defaultEmptyValue
        }

        this._props = {}

        if(strict) {
            this._loadItems(strictList)
        }
    }

    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    // :::                  internal helpers                     :::
    // :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
    _asyncTaskWrapper(index, task) {
        this._assertIsPromise(task)

        return new Promise((resolve) => {
            target.then(v => {
                resolve({index: index, value: v})
            }).catch(e => {
                if(_handlePromiseError !== undefined)
                    _handlePromiseError(this._props[index]._key, e).bind(thisArg)
                
                resolve({index: index, value: false})
            })
        })
    }

    _assertIsPromise(value) {
        if(!(value instanceof Promise))
            throw TypeError(`function did not returned Promise: ${value}`)
    }

    _assertLockFalse() {
        if(this.lock !== false)
            throw TypeError('unable to do operation until last asynchronous operation will be completed')
    }

    _setLock(value) {
        this.lock = value
    }

    static _dataFormatterAssertInputType(arg, type) {
        if(typeof(arg) !== type)
            throw TypeError(`unable to format data, wrong input type. expected: ${type}, got: ${typeof(arg)}`)
    }

    _executeDataFormatter( _function, input) {
        return _function.apply(null, [input])
    }

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

    _createItem(key, type, _default, dataFormatter) {
        if(!(util.isString(key)))
            throw TypeError(`internal storage error during creating item, key have to be string value`)

        if((this.mode === 1) && (!util.isString(type)))
            throw TypeError(`item key: ${key} "type" has to be string`)

        let item = {
            _key: key,
            value: this.defaultEmptyValue, 
            default: _default !== undefined ? _default : null, 
            type: this.mode === 0 ? this.forcedType : type,
            dataFormatter: dataFormatter
        }

        Object.preventExtensions(item)
        freezer(item._key)
        freezer(item.type)
        freezer(item.default)

        return item
    }

    _getItemByKey(key) {
        return this._props[key]
    }

    _loadItems(items) {
        if(!(this.underConstruction))
            throw TypeError('unable to load items after storage initialization')

        if(this.mode === 0) {
            if(!(util.isArray(items))) {
                throw TypeError(`wrong items format, has to be array of keys: [sampleKey, sampleKey2] )`)
            }

            for(let i = 0; i < items.length; i++) {
                if(!(util.isString(items[i]))) {
                    throw TypeError(`wrong items: ${items[i]} value, has to be string (key name)`)
                }

                this._props[_items[i]] = this._createItem(items[i])
            }
        } else if(this.mode === 1) {
            if(!(util.isArray(items))) {
                throw TypeError(`wrong items format, has to be array of objects(items) [{_key: <string_key>, type: <string_type>[,[OPTIONAL] default: <default_value>]}]`)
            }

            for(let i = 0; i < items.length; i++) {
                if(!(util.isObject(items[i]))) {
                    throw TypeError(`wrong item: ${items[i]} object should be string which contains: {key: <string_key>, type: <string_type>[,[OPTIONAL] default: <default_value>]}`)
                }

                this._props[items[i].key] = this._createItem(items[i].key, items[i].type, items[i].default)
            }
        } else {
            throw TypeError(`wrong mode type: ${this.mode} has to be int`)
        }
    }

    _keyExists(key) {
        return this._props.hasOwnProperty(key) && util.isString(key)
    }

    _areValueTypesEqual(value, value2) {
        return typeof(value) === typeof(value2) || value === this.defaultEmptyValue || value2 === this.defaultEmptyValue
    }

    _areTypesEqual(value, value2) {
        return value === value2 || value === this.defaultEmptyValue || value2 === this.defaultEmptyValue
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

        currentItem.value = currentItem.dataFormatter === undefined ? value : this._executeDataFormatter(currentItem.dataFormatter, value)

        this._emitKeyStateChange(key, 'set')
    }

    setDataFormatter(key, dataFormatter) {
        if(!(this._keyExists(key)))
            throw ReferenceError(`unabled to find: ${key}`)

        let currentItem = this._getItemByKey(key)

        currentItem.dataFormatter = dataFormatter
    }

    /**
     * 
     * @param {string} key
     */
    get(key) {
        if(!this._keyExists(key))
            throw ReferenceError(`unabled to find: ${key}`)

        let item = this._getItemByKey(key)

        if(item.value === this.defaultEmptyValue) {
            return item.default !== null ? item.default : this.defaultEmptyValue
        } else {
            return item.value
        }
    }

    /**
     * 
     * @param {string} key 
     */
    add(key, type, _default, dataFormatter) {
        if(!Object.isExtensible(this._props))
            throw TypeError(`props are locked becouse they were loaded from 'strictList'`)

        if(this._keyExists(key))
            throw TypeError(`prop already exists: ${key}`)

        this._props[key] = this._createItem(key, type, _default, dataFormatter)

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
     * @param {boolean} acceptDefault
     * @returns {Promise<boolean>}
     */
    isSet(key, acceptDefault) {
        return new Promise((resolve, reject) => {
            if(!this._keyExists(key))
                reject(`unabled to find: ${key}`)

            try {
                let value = this._executeOverrideFunction('isSet', [this._props[key], acceptDefault])
                resolve(value)
            } catch(err) {
                reject(err)
            }
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
                        let parsedData = this._executeOverrideFunction('deserializeFormatter', data)

                        if(this.strict) {
                            for(let i = 0; i < this._props.length; i++) {
                                if(this._props[i]._key !== parsedData[i]._key)
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
                storage._executeDataFormatter,
                storage._getItemByKey,
                storage._loadItems,
                storage._keyExists,
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

    //Object.preventExtensions(storage)

    return storage
}

export default {
    dataTypes: dataTypes,
    dataFormatters: {
        numberFormatAppendPercent: (n) => { Storage._dataFormatterAssertInputType(dataTypes.Number); return "" + n + "%" },
        numberToInt: (n) => { Storage._dataFormatterAssertInputType(dataTypes.Number); return Math.trunc(n) },
        numberFormatToFloat2: (n) => { Storage._dataFormatterAssertInputType(dataTypes.Number); return Math.toFixed(n, 2) },
        numberFormatToFloat4: (n) => { Storage._dataFormatterAssertInputType(dataTypes.Number); return Math.toFixed(n, 4) },
        numberFormatToFloat8: (n) => { Storage._dataFormatterAssertInputType(dataTypes.Number); return Math.toFixed(n, 8) },
        stringToLower: (s) => { Storage._dataFormatterAssertInputType(dataTypes.String); return s.toLowerCase() },
        stringToUpper: (s) => { Storage._dataFormatterAssertInputType(dataTypes.String); return s.toUpperCase() }
    },
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