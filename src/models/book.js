import storage from '../modules/storage'
import { epubMetadataTags } from '@constants/index'
import { log } from '@app/log'

let model = storage.create.predefined.typeRestricted(
    [
            //general / reader related data
            {key: 'path', type: storage.dataTypes.String}, //path or remote
            {key: 'fontSize', type: storage.dataTypes.Number, default: 100},
            {key: 'flow', type: storage.dataTypes.String, default: 'paginated'},
            {key: 'progress', type: storage.dataTypes.Number, default: 0},
            // {key: 'isLocal', type: storage.dataTypes.Boolean},
            {key: 'hash', type: storage.dataTypes.String},
            //metadata
            {key: 'author', type: storage.dataTypes.String, default: 'unknown'},
            {key: 'rights', type: storage.dataTypes.String, default: 'unknown'},
            {key: 'identifier', type: storage.dataTypes.String, default: 'unknown'},
            {key: 'contributor', type: storage.dataTypes.String, default: 'unknown'},
            {key: 'title', type: storage.dataTypes.String, default: 'unknown'},
            {key: 'language', type: storage.dataTypes.String, default: 'unknown'},
            {key: 'subject', type: storage.dataTypes.String, default: 'unknown'},
            {key: 'date', type: storage.dataTypes.String, default: 'unknown'},
            {key: 'source', type: storage.dataTypes.String, default: 'unknown'},
            // {key: 'cover', type: storage.dataTypes.String, default: ''},
            // Cover is available by: BookManager.getCoverPath(this.get('hash'))
            {key: 'publisher', type: storage.dataTypes.String, default: 'unknown'},
            //reader data
            {key: 'bookmarks', type: storage.dataTypes.Object, default: []},
            {key: 'currentCFI', type: storage.dataTypes.String, default: ''},
    ]
)

export function prefillWithMetadata(metadataObject) {
    applyMetadata(model, metadataObject)

    return model
}

export function applyMetadata(model, metadataObject) {
    for(let metadataPropIndex in epubMetadataTags) {
        const metadataProp = epubMetadataTags[metadataPropIndex].toLowerCase()

        if(metadataObject.hasOwnProperty(metadataProp)) {

            if(model.has(metadataProp)) {
                model.set(metadataProp, metadataObject[metadataProp])
            } else {
                log.warn(`metadata property parsed, but not found in model: ${metadataProp}`)
            }
        }
    }
}

export default model