<template>
    <div>
        <div>
            <button id="prev-btn" @click="handlePreviousButton()" :class="{'drawer-mode': isDrawerOpen}">
                <svg viewBox="0 0 24 24">
                        <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                </svg>
            </button>
            <div id="view"></div>
            <button id="next-btn" @click="wrapper.nextPage()">
                <svg viewBox="0 0 24 24">
                        <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
            </button>
        </div>
        <!-- <slot name="progress-bar" :onChange="onChange" :ready="ready">
            <div class="epub-reading-progress-bar">
                <input size="3" type="range" max="100" min="0" step="1"
                 @change="onChange($event.target.value)"
                 :value="progress"
                /> %
                <input type="text"
                 :value="progress"
                 @change="onChange($event.target.value)"
                >
            </div>
        </slot> -->
    </div>
</template>

<script>
import fs from 'fs'
// import readerController from './../../../modules/readerController.js'
import { ipcRenderer } from 'electron'
import readerController from '@modules/readerWrapper.js'
// import debounce from 'debounce'

export default {
    name: 'BookReader',
    props: {
        bookStorage: {
            type: Object,
            required: true
        },
        isDrawerOpen: {
            type: Boolean,
            required: true
        }
    },
    data () {
        return {
            bookData: undefined,
            wrapper: undefined,
            progress: undefined,
            chapters: undefined,
            currentChapter: undefined,
            flow: 'paginated',
            fontSize: 100,
            loaded: false,
            areHooksInitialized: false
        }
    },
    created: () => {
    },
    mounted: function() {
        this.$nextTick(function () 
        {
            if(this.bookStorage.get('isLocal')) {
                fs.readFile(this.bookStorage.get('url'), {encoding: null}, (err, data) => {
                    if(err)
                        console.error(`unable to read: ${this.bookStorage.get('url')}`)

                    let arrayBuffer = new ArrayBuffer(data.length)
                    let view = new Uint8Array(arrayBuffer)

                    for(let i = 0; i < data.length; ++i) {
                        view[i] = data[i]
                    }

                    this.bookData = arrayBuffer
                    this.initWrapper(arrayBuffer)
                })
            } else {
                this.bookData = this.bookStorage.get('url')
                this.initWrapper()
            }
        })

        // ipcRenderer.send('book-open', [this.bookStorage.get('md5')])
        // ipcRenderer.on('book-open-reply', (event, value) => {
        //     this.initWrapper(value)
        // })

        // this.initWrapper()
    },
    methods: {
        initWrapper(bookAsBinary) {
            try {
                this.wrapper = new readerController(
                    bookAsBinary/*this.bookStorage.get('url')*/,
                    document,
                    'view',
                    'binary'
                )

                this.wrapper.on('initialized', this.display.bind(this))
                this.initHooks()
            } catch(err) {
                console.log(`errur`)
            }
        },
        initHooks() {
            if(!(this.areHooksInitialized)) {
                window.addEventListener('resize', this.onWindowResize)
                window.addEventListener('keypress', this.onWindowKeyPress)

                this.areHooksInitialized = true
            }
        },
        releaseHooks() {
            if(this.areHooksInitialized) {
                window.removeEventListener('resize', this.onWindowResize)
                window.removeEventListener('keypress', this.onWindowKeyPress)

                this.areHooksInitialized = false
            }
        },
        display() {
            this.loaded = true
            this.wrapper.display()

            this.$emit('chapters', this.wrapper.getChapters())
        },
        // ------------------
        //  window hooks
        // ------------------
        onWindowKeyPress (e) {
            if ((e.keyCode || e.which) === 37) {
                //this.rendition.prev()
            }
            if ((e.keyCode || e.which) === 39) {
                //this.rendition.next()
            }
        },
        onWindowResize() {
            console.log('window resized')
            console.log('rendention size', this.wrapper.RendentionSize)

            if(this.wrapper !== undefined) {
                this.wrapper.calcRendentionSize(true)
                this.wrapper.updateRendentionSize(true)
            }
        },
        handlePreviousButton() {
            if(!this.isDrawerOpen && this.loaded)
                this.wrapper.previousPage()
            else if(this.isDrawerOpen) {
                //TODO: emit drawer close
            }
        }
    },
    watch: {
    },
    beforeDestroy () {
        if(this.areHooksInitialized)
            this.releaseHooks()
        
        if(this.wrapper !== undefined)
            this.wrapper.release()
    }
}
</script>