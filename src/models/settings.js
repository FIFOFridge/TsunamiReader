import storage from '@modules/storage'
import views from '@constants/views'
import { isWindows } from "@src/app/appWrapper"

// noinspection RedundantConditionalExpressionJS
//TODO: fix titlebar and process:

// const overrideTitleBarDefaultValue = isWindows() ? true : false
// const frameDefaultValue = !isWindows()
const overrideTitleBarDefaultValue = false
const frameDefaultValue = false

let settingsStorage = storage.create.predefined.typeRestricted(
    [
        {key: 'overrideTitleBar', type: storage.dataTypes.Boolean, default: overrideTitleBarDefaultValue},
        {key: 'useImageCompressor', type: storage.dataTypes.Boolean, default: true},
        {key: 'frame', type: storage.dataTypes.Boolean, default: frameDefaultValue},
        {key: 'appState', type: storage.dataTypes.String, default: views.Shelf},
        {key: 'loadRetryMax', type: storage.dataTypes.Number, default: 3},
        {key: 'bookProcessedDataLoadingTimeout', type: storage.dataTypes.Number, default: 2000}
    ]
)

export default settingsStorage