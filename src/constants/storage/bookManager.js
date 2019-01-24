import storage from './../../modules/storage'

export default storage.create.predefined.typeRestricted(
    [
        {key: 'currentBook', type: storage.dataTypes.String},
        {key: 'currentBookProgress', type: storage.dataTypes.Number, default: 0},
        {key: 'books', type: storage.dataTypes.Object, default: []},
        {key: 'asyncMetadataProcessingTimeout', type: storage.dataTypes.Number, default: '5000'}
    ]
)