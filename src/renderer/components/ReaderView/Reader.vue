<template>
  <div>
    <div class="epub-container">
      <button id="prev-btn" @click="goToPrevPage">
        <svg viewBox="0 0 24 24">
            <path fill="#000000" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
        </svg>
        <!-- <div id="prev" class="arrow" @click="goToPrevPage">‹</div> -->
      </button>
      <slot name="book-content" :ready="ready">
        <div :id="bookArea"></div>
      </slot>
      <button id="next-btn" @click="goToNextPage">
        <svg viewBox="0 0 24 24">
            <path fill="#000000" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
        </svg>
        <!-- <div id="prev" class="arrow" @click="goToPrevPage">‹</div> -->
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
import Epub from 'epubjs'
global.ePub = Epub

export default {
  name: 'BookReader',
  props: {
    epubUrl: {
      type: String,
      required: true
    },
    fontSize: {
      type: Number,
      default: 100
    },
    themes: {
      type: Object,
      required: true
    },
    theme: {
      type: String,
      required: true
    },
    progress: {
      type: Number,
      default: 0
    },
    bookArea: {
      type: String,
      default: 'area'
    },
    contentBookModify: {
      type: Number,
      default: 20
    },
    flow: {
      type: String,
      default: 'paginated'
    }
  },
  data () {
    return {
      book: null,
      rendition: null,
      section: null,
      toc: [],
      progressValue: 0,
      slide: null,
      cfi: null,
      width: 0,
      height: 0,
      locations: null,
      ready: false
    }
  },
  methods: {
    initReader () {
      this.rendition = this.book.renderTo(this.bookArea, {
        contained: true,
        height: this.height
      })
      this.registerThemes()
      this.setTheme(this.theme)
      this.setFontSize(this.fontSize)
      this.rendition.display()
    },
    registerThemes () {
      this.rendition.themes.register(this.themes)
    },
    goToPrevPage () {
      this.rendition.prev()
    //   this.rendition.reportLocation().then((loc) => {
    //     console.log(`updated location: ${loc}`)
    //   })
    },
    goToNextPage () {
      this.rendition.next()
    //   this.rendition.reportLocation().then((loc) => {
    //     console.log(`updated location: ${loc}`)
    //   })
    },
    setTheme (theme) {
      this.rendition.themes.select(theme)
      document.body.style.background = this.themes[theme]['body'].background
    },
    setFontSize (size) {
      this.rendition.themes.fontSize(size + '%')
    },
    goToExcerpt (cfi) {
      if (cfi.toLowerCase().indexOf('xhtml') > 0) {
        this.rendition.display(cfi)
      } else {
        this.rendition.display('epubcfi(' + cfi + ')')
        this.rendition.annotations.highlight('epubcfi(' + cfi + ')')
      }
    },
    onChange (value) {
      console.log(`updated progress: ${value}`)
      const percentage = value / 100
      const target = percentage > 0 ? this.book.locations.cfiFromPercentage(percentage) : 0
      this.rendition.display(target)
      if (percentage === 1) this.goToNextPage()
    },
    updateScreenSizeInfo () {
      this.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      this.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - this.contentBookModify
    },
    resizeToScreenSize () {
      this.updateScreenSizeInfo()
      this.rendition.resize(this.width, this.height)
    },
    debounce (func, wait, immediate) {
      let timeout
      return () => {
        let context = this
        let args = arguments
        let later = () => {
          timeout = null
          if (!immediate) func.apply(context, args)
        }
        let callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) func.apply(context, args)
      }
    },
    keyListener (e) {
      if ((e.keyCode || e.which) === 37) {
        this.rendition.prev()
      }
      if ((e.keyCode || e.which) === 39) {
        this.rendition.next()
      }
    }
  },
  created () {
    window.addEventListener('keyup', this.keyListener)
  },
  mounted () {
    this.book = new Epub(this.epubUrl, {})

        this.$nextTick(function () 
        {
            this.book.loaded.navigation.then(({ toc }) => {
                this.toc = toc
                this.$emit('toc', this.toc)
                this.initReader()
                this.rendition.on('click', () => {
                    this.$emit('click')
                })
            })

            this.book.ready.then(() => {
                return this.book.locations.generate()
            }).then(() => {
                this.locations = JSON.parse(this.book.locations.save())
                this.ready = true
                this.$emit('ready')
                this.rendition.on('relocated', (location) => {
                    const percent = this.book.locations.percentageFromCfi(location.start.cfi)
                    const percentage = Math.floor(percent * 100)
                    this.progressValue = percentage
                    this.$emit('relocated')
                })
            })

            this.$root.$on('showPage', (cfi) => {
                this.cfi = cfi
                this.goToExcerpt(cfi)
            })

            this.$root.$on('clearHighlight', () => {
                this.rendition.annotations.remove('epubcfi(' + this.cfi + ')')
            })

            window.addEventListener('resize', this.debounce(() => {
                this.resizeToScreenSize()
            }, 250))

            this.updateScreenSizeInfo()
        })
  },
  watch: {
    theme (val) {
      this.setTheme(val)
    },
    fontSize (val) {
      this.setFontSize(val)
    },
    progressValue (val) {
      this.$emit('update:progress', val)
    }
  },
  beforeDestroy () {
    window.removeEventListener('keyup', this.keyListener)
  }
}
</script>