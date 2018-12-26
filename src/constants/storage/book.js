import storage from './../../modules/storage'

export default storage.create.predefined.typeRestricted(
    [
        {key: 'url', type: storage.dataTypes.String},
        {key: 'fontSize', type: storage.dataTypes.Number, default: 100},
        {key: 'backgroundImage', type: storage.dataTypes.String},
        {key: 'flow', type: storage.dataTypes.String, default: 'paginated'},
        {key: 'currentCFI', type: storage.dataTypes.String},
        {key: 'progress', type: storage.dataTypes.Number, default: 0}
    ]
)