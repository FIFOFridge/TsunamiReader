import util from 'util'

export function hasNode(testObject, path, allowNull = true) {
    if(!(util.isObject(testObject)))
        throw new TypeError(`invalid testObject: ${testObject}`)

    if(!(util.isString(path)))
        throw new TypeError(`invalid path: ${path}`)

    const nodes = path.split('.')

    if(nodes.length < 2)
        throw new Error(`path is too short: ${path}`)

    let exists = true

    nodes.reduce((accumulator, current) => {
        if(exists === true) {
            if(allowNull === true) {
                exists = accumulator[current] !== undefined
            } else {
                exists =
                    accumulator[current] !== undefined &&
                    accumulator[current] !== null
            }

            return accumulator[current]
        } else {
            return accumulator
        }
    }, testObject)

    return exists
}