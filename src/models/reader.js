import storage from '../modules/storage'

export default storage.create.predefined.typeRestricted(
    [
        {key: 'lastUrl', type: storage.dataTypes.String},
        {key: 'lastCFI', type: storage.dataTypes.String},
        {key: 'lastProgress', type: storage.dataTypes.Number},
        {key: 'themes', type: storage.dataTypes.Object},
        {key: 'currentTheme', type: storage.dataTypes.String},
        {key: 'lastBook', type: storage.dataTypes.String}
    ]
)