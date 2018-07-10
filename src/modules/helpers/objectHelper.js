export default {
    isPropertyDefined(object, property) {
        if(object.hasOwnProperty(property) && 
           (object[property] !== null && object[property] !== undefined))
           return true
        else
            return false
    }
}