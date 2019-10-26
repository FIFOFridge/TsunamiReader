var events = {
    Opening: 'windowEvent-opening',
    Opened: 'windowEvent-opened',
    Closing: 'windowEvent-closing',
    Closed: 'windowEvent-closed',
    Minimazing: 'windowEvent-minimazing',
    Minimazed: 'windowEvent-minimaized',
    Maximizing: 'windowEvent-maximizing',
    Maximized: 'windowEvent-maximized'
}

Object.keys(events).forEach(object => {
    Object.freeze(events)
})

Object.freeze(events)

export default events