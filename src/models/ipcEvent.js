import storage from '../modules/storage'

let settingsStorage = storage.create.predefined.typeRestricted(
    [
        {key: 'event', type: storage.dataTypes.String}, //target event name
        {key: 'caller', type: storage.dataTypes.String}, //renderer or main
        {key: 'arguments', type: storage.dataTypes.Object}, //any parameters to be passed to event
        {key: 'track', type: storage.dataTypes.Boolean, default: false},
        {key: 'trackId', type: storage.dataTypes.String, default: null}
    ]
)

export default settingsStorage