import { EventEmitter } from "events"

/**
 * 
 * @param {EventEmitter} original 
 * @param {EventEmitter} target 
 * @param {boolean} stopOriginalEmitter 
 */
let forward = (original, target, stopOriginalEmitter = true) => {
    if(!(original instanceof EventEmitter && target instanceof EventEmitter))
        throw TypeError('original or target does not extend EventEmitter')

    let oldEmitFunction = original.emit

    let newEmitFunction = () => {
        if(stopOriginalEmitter === false) {
            oldEmitFunction.apply(original, arguments)
        }

        target.emit.apply(target, arguments)
    }

    original.emit = newEmitFunction
}

export default forward