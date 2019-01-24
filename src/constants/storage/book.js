import storage from './../../modules/storage'

export default storage.create.predefined.typeRestricted(
    [
        {key: 'url', type: storage.dataTypes.String},
        {key: 'fontSize', type: storage.dataTypes.Number, default: 100},
        {key: 'flow', type: storage.dataTypes.String, default: 'paginated'},
        {key: 'currentCFI', type: storage.dataTypes.String},
        {key: 'progress', type: storage.dataTypes.Number, default: 0},
        {key: 'isLocal', type: storage.dataTypes.Boolean},
        {key: 'md5', type: storage.dataTypes.String},
        {key: 'cover', type: storage.dataTypes.String} //base64
    ]
)