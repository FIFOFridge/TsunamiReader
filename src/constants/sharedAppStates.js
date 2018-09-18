var states = {
    canReadBook: 'canReadBook'
}

Object.keys(states).forEach(object => {
    Object.freeze(object)
})

Object.freeze(states)

export default states