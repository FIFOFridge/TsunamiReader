export default {
    isPropertyDefined(object, property) {
        if(object.hasOwnProperty(property) && 
           (object[property] !== null && object[property] !== undefined))
           return true
        else
            return false
    },
    //https://stackoverflow.com/a/43289971
    isVarTypeOf(_var, _type, looseCompare) {
        if (!looseCompare) {
            try {
                return _var.constructor === _type
            } catch(ex) {
                return _var == _type
            }
        } else {
            try{
                switch(_var.constructor) {
                    case Number:
                    case Function:
                    case Boolean:
                    case Symbol:
                    case Date:
                    case String:
                    case RegExp:
                        // add all standard objects you want to differentiate here
                        return _var.constructor === _type
                    case Error:
                    case EvalError:
                    case RangeError:
                    case ReferenceError:
                    case SyntaxError:
                    case TypeError:
                    case URIError:
                        // all errors are considered the same when compared to generic Error
                        return (_type === Error ? Error : _var.constructor) === _type
                    case Array:
                    case Int8Array:
                    case Uint8Array:
                    case Uint8ClampedArray:
                    case Int16Array:
                    case Uint16Array:
                    case Int32Array:
                    case Uint32Array:
                    case Float32Array:
                    case Float64Array:
                        // all types of array are considered the same when compared to generic Array
                        return (_type === Array ? Array : _var.constructor) === _type
                    case Object:
                    default:
                        // the remaining are considered as custom class/object, so treat it as object when compared to generic Object
                        return (_type === Object ? Object : _var.constructor) === _type
                }
            } catch(ex) {
                return _var == _type   //null and undefined are considered the same
                // or you can use === if you want to differentiate them
            }
        }
    }
}