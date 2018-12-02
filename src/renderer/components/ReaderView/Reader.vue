<template>
    <div>
        <div class="epub-container">
            <button id="prev-btn" @click="goToPrevPage">
                <svg viewBox="0 0 24 24">
                        <path fill="#000000" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                </svg>
            </button>
            <div id="view"></div>
            <button id="next-btn" @click="goToNextPage">
                <svg viewBox="0 0 24 24">
                        <path fill="#000000" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
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
import readerController from './../../../modules/readerController.js'
// import debounce from 'debounce'

export default {
    name: 'BookReader',
    props: {
        epubUrl: {
            type: String,
            required: true
        }
    },
    data () {
        return {
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
    mounted () {
        this.$nextTick(function () 
        {
            this.wrapper = new readerController(
                this.epubUrl,
                document,
                'view'
            )

            this.wrapper.on('initialized', this.display.bind(this))

            this.initHooks()
        })
    },
    methods: {
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

            if(this.wrapper !== undefined)
                this.wrapper.updateRendentionSize()
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