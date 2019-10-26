import storage from '../modules/storage'

let settingsStorage = storage.create.predefined.typeRestricted(
    [
        {key: 'status', type: storage.dataTypes.Number},
        {key: 'type', type: storage.dataTypes.String},
        {key: 'value', type: storage.dataTypes.Null, default: null},
        {key: 'reason', type: storage.dataTypes.String, defult: null},
        {key: 'caller', type: storage.dataTypes.String},
        {key: 'track', type: storage.dataTypes.Boolean, default: false},
        {key: 'trackId', type: storage.dataTypes.String, default: null}
    ]
)

export default settingsStorage