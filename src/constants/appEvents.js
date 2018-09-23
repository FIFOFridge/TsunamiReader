var events = {
    canAddBookChanged: 'canAddBookChanged',
    addBook: 'addBook'
}

Object.keys(events).forEach(object => {
    Object.freeze(object)
})

Object.freeze(events)

export default events