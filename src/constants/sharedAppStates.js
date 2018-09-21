var states = {
    canAddBook: 'canAddBook'
}

Object.keys(states).forEach(object => {
    Object.freeze(object)
})

Object.freeze(states)

export default states