/**
 *
 * @param object Constant object
 * @return {Array} array of values
 */
export function getAllValues(object) {
    let arr = []

    if(!(object instanceof Object))
        throw new Error(`invalid object`)

    if(object.keys().length < 1)
        throw new Error(`constants object don't have any keys`)

    for(let k in object) {
        // noinspection JSUnfilteredForInLoop
        arr.push(object[k])
    }

    return arr
}

/**
 *
 * @param {Object} object Constant object
 * @return {Array} array of keys
 */
export function getAllKeys(object) {
    let arr = []

    if(!(object instanceof Object))
        throw new Error(`invalid object`)

    if(object.keys().length < 1)
        throw new Error(`constants object don't have any keys`)

    for(let k in object) {
        arr.push(k)
    }

    return arr
}

/**
 *
 * @param object
 * @param value
 * @return {boolean}
 */
export function hasValue(object, value) {
    if(!(object instanceof Object))
        throw TypeError(`invalid object type`)

    for(let key in object) {
        if(object[key] === value)
            return true
    }

    return false
}