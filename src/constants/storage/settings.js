import storage from './../../modules/storage'
import { app } from 'electron'

var settingsStorage = storage(true, 
    [
        'isOSX',
        'overrideTitleBar',
        'useImageCompressor',
        'frame'
    ]
)

settingsStorage.set('isOSX', (app.platform === 'darwin' ? true : false))
//Object.freeze(settingsStorage._props.isOSX)

export default settingsStorage