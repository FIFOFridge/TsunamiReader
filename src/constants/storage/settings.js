import storage from './../../modules/storage'
import { app } from 'electron'

var settingsStorage = storage.create.predefined.typeRestricted( 
    [
        {key: 'isOSX', type: storage.dataTypes.Boolean},
        {key: 'overrideTitleBar', type: storage.dataTypes.Boolean},
        {key: 'useImageCompressor', type: storage.dataTypes.Boolean},
        {key: 'frame', type: storage.dataTypes.Boolean}
    ]
)

settingsStorage.set('isOSX', (app.platform === 'darwin' ? true : false))

export default settingsStorage