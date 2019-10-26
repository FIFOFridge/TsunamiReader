var types = {
    Windows: 'win32',
    Linux: 'linux',
    OSX: 'darwin'
}

Object.keys(types).forEach(object => {
    Object.freeze(types)
})

Object.freeze(types)

export default types