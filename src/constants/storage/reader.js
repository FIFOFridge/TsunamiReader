import storage from './../../modules/storage'

var readerStorage = storage(true, 
    [
        'lastUrl',
        'lastCFI',
        'lastProgress',//%
        'currentTheme',
        'themes'
    ]
)

export default readerStorage