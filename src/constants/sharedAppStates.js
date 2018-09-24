var states = {
    canAddBook: 'canAddBook',
    registredBook: 'registredBook'
}

Object.keys(states).forEach(object => {
    Object.freeze(object)
})

Object.freeze(states)

export default states