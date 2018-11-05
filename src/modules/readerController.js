import { remote } from 'electron'
import events from 'events'
import epubjs from 'epubjs'
import fs from 'fs'
import util from 'util'

if(global.ePub === undefined)
    global.ePub = epubjs

class ReaderController extends events.EventEmitter {
    constructor(
            bookUrl, 
            document, 
            renderToId,
            // bookSettingsFilePath,
            flow = 'paginated',
            contentBottomMargin = 25
        )
    {
        super()

        this._this = this

        this.initialized = false
        this.rendention = undefined
        this.url = bookUrl
        this.document = document
        this.storage = remote.getGlobal('readerStorage')

        this.width = 0
        this.height = 0
        this.contentBottomMargin = contentBottomMargin
        this.renderId = renderToId
        this.flow = flow
        this.isLocal = undefined
        
        this.chapters = []
        this.currentChapterIndex = undefined

        this.bookSettings = undefined
        this.bookProgress = 0
        this.currentCFI = undefined//todo assign

        this.themes = {}
        this.currentTheme = undefined
        this.fontSize = '100%'
        
        //init
        this._processBookUrl(this.url)
        this.adjustRendentionSize()
        // this._invalidHTMLElementExists(renderToId)

        this.book = new epubjs(this.url, {})

        //process chapters 
        this.book.loaded.navigation.then((navi) => {
            navi.toc.forEach(chapter => {
                this.chapters.push(chapter)
            })
        })

        this.book.ready.then(() => {
            this.book.locations.generate();
            
            this.rendention = this.book.renderTo(
                this.renderId, 
                { 
                    flow: this.flow, 
                    width: this.width, 
                    height: this.height
                }
            )
            
            //register hooks
            this.rendention.on('relocated', this._handleRelocated.bind(this))
            // this.rendention.on('layout', this._handleLayoutChange)
            // this.rendention.on('render', this._handleRendered)

            //setup themes
            this.rendention.themes.register(this.storage.get('themes'))
            this.Theme = this.storage.get('currentTheme')

            this.initialized = true
            this.emit('initialized')
        })
    }

    // ------------------------------------------------
    //  public
    // ------------------------------------------------
    // get IsLocal() {
    //     return this.isLocal
    // }

    get BookProgress() {
        return this.bookProgress
    }

    set BookProgress(value) {
        if(value < 0 || !util.isString(value))
            throw TypeError(`incorrect progress value`)
        
        this.bookProgress

        let cfi = this.book.locations.cfiFromPercentage(value)
        this._navigateToCfi(cfi)
    }

    get Page() {
        if(this.flow !== 'paginated')
            return undefined //?

        return this.book.pagelist.pageFromCfi(this.cfi)
    }

    set Page(value) {
        if(this.flow !== 'paginated')
            return undefined //?

        let cfi = this.book.pagelist.cfiFromPage(value)
        this._navigateToCfi(cfi)
    }

    get Theme() {
        return this.currentTheme
    }

    set Theme(value) {
        this.rendention.themes.select(value)
    }

    // get Themes() {
    //     return this.themes
    // }

    // get Page() {
    //
    // }

    // set Page() {
    //
    // }

    // get Chapters() {
    //     return this.chapters
    // }

    get Chapter() {
        if(this.chapters !== undefined && this.chapters !== null && this.chapters.length > 0)
            return this.chapters[this.currentChapterIndex]
    }

    set Chapter(url) {
        this.rendention.display(url)
    }

    set Flow(value) {
        if(value !== 'paginated' && vaue !== 'scrolled-continuous')
            throw TypeError('invalud flow value')

        this.flow = value
        this.rendention.flow = this.flow
    }

    get Flow() {
        return this.flow
    }

    get FontSize() {
        return this.fontSize
    }

    set FontSize(value) {
        if(value < 50 || value > 300)
            throw TypeError(`invalid font size value`)

        this.fontSize = value + '%'
        this.rendition.themes.fontSize(this.fontSize + '%')
    }

    increaseFontSize() {
        var newValue = parseInt(this.fontSize) + 25

        if(newValue < 50 || newValue > 300)
            return

        this.FontSize = newValue
    }

    decreaseFontSize() {
        var newValue = this.FontSize = parseInt(this.fontSize) - 25

        if(newValue < 50 || newValue > 300)
            return

        this.FontSize = newValue
    }

    // TODO:
    // get BackgroundImage() {
    //
    // }

    // set BackgroundImage() {
    //
    // }

    // get BackgroundImageOpacity() {
    //
    // }

    // set BackgroundImageOpacity() {
    //
    // }
    adjustRendentionSize() {
        var widthFix = this.document.querySelector('#next-btn').clientWidth * 2 //calc buttons size

        this.width = Math.max(this.document.documentElement.clientWidth, window.innerWidth || 0) - widthFix
        this.height = Math.max(this.document.documentElement.clientHeight, window.innerHeight || 0) - this.contentBottomMargin
    }

    updateRendentionSize() {
        this.adjustRendentionSize()
        this.rendention.resize(this.width, this.height)
    }

    get RendentionSize() {
        return { width: this.width, height: this.height }
    }

    set RendentionSize(size) {
        if(!util.isObject(size) || !util.isNumber(size.width) || !util.isNumber(size.height))
            throw TypeError('invalid size value, size have to containe .width and .height with number values')

        this.width = size.width
        this.height = size.height

        this.rendention.resize(this.width, this.height)
    }
    
    nextPage() {
        this.rendention.next()
    }

    previousPage() {
        this.rendention.prev()
    }

    // nextChapter() {
    //
    // }

    // previousChapter() {
    //
    // }

    // isMathJaxEnabled() {
    //  
    // }

    // ------------------------------------------------
    //  public state managment
    // ------------------------------------------------
    display() {
        if(this.initialized === false)
            throw TypeError(`unable to display before reader initialization, wait for: 'initialized' event`) 

        //display
        // this.updateRendentionSize()
        this.rendention.display()
    }

    // syncBookSettings() {
    //
    // }
    
    syncStorage() {
        this.storage.set('lastUrl', this.url)
        this.storage.set('lastCfi', this.currentCFI)
        this.storage.set('lastProgress', this.progress)
    }

    release() {
        this.book.destroy()
    }

    // ------------------------------------------------
    //  private
    // ------------------------------------------------
    _processBookUrl(url) {
        var urlCheck = new RegExp(/(https|http):\/\//ig)

        if(urlCheck.test(url)) {
            //is web url
            //TODO, also need to create specifiited web reuest for specifited services
            // throw TypeError(`unable to load url from web: ${url}, not implemented yet`)

            this.isLocal = false
        } else {
            if(!fs.existsSync(url))
                throw TypeError(`unable to locate path: ${url}`)

            this.isLocal = true
        }

        Object.freeze(this.isLocal)//make it immutable
    }

    // hooks
    _handleRelocated(location) {
        var relocatedDetails = {
            atEnd: false,
            atStart: false,
            progress: 0,
            cfi: undefined
        }

        if(location.start === undefined)
            return //ignore when start isn't defined 

        //update internal
        this.progress = Math.floor(this.book.locations.percentageFromCfi(location.start.cfi) * 100)
        this.cfi = location.start.cfi

        //setup data to emit
        relocatedDetails.cfi = this.cfi
        relocatedDetails.progress = this.progress

        relocatedDetails.atEnd = location.atEnd
        relocatedDetails.atStart = (location.atStart === undefined) ? false : location.atStart  

        this.emit('relocated', relocatedDetails)

        // this.updateRendentionSize()

        //debug
        console.log('_handleRelocated()   ===> ', location)
        console.log(' / "relocationDetails" => ', relocatedDetails)
    }

    _navigateToCfi(cfi) {
        this.cfi = cfi
        this.rendention.display(cfi)
    }

    // _handleLayoutChange(layout) {
    //
    // }

    // _handleRendered(section) {
    //
    // }
}

export default ReaderController