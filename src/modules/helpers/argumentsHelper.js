export function sliceArguments(_arguments, from, to) {
    let sliced = []

    for(let i = 0; i < _arguments.length; i++) {
        if(i >= from && i <= to) {
            sliced.push(_arguments[i])
        }
    }

    return sliced
}