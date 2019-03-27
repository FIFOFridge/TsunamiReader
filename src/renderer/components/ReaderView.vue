<template>
    <div>
        <Controls
        :is-drawer-open="isDrawerOpen"
        @ctrl-clicked="handleCtrlButtonClick"
        >
        </Controls>
      
      <DrawerLayout
        ref="drawer"
        :content-drawable="true"
        :drawer-width="300"
        @slide-end="drawerSlideEnd"
      >
        <div slot="content">
          <BookReader
            :book-storage="bookStorage"
            :is-drawer-open="isDrawerOpen"
            @chapters="handleChaptersChanged"
          >
          </BookReader>
        </div>
        <div slot="drawer">
          <DrawerContent
            ref="drawerContent"
            :bookFontSize="100"
            :bookFlowType="'paginated'"
            :bookChapters="chapters"
            :bookBookmarks="bookmarks"
            :is-visible="isDrawerOpen"
            @list-collection-change="handleCollectionChange"
            @list-item-click="handleCollectionElementClick"
          >
          </DrawerContent>
        </div>
      </DrawerLayout>
    </div>
</template>

<style>
@import "/static/css/reader.css";
/* background {
  position: initial !important;
} */
.controls-container {
  position: fixed;
  top: 0px;
  width: 100%;
  height: 5em;
}
</style>

<script>
import BookReader from './ReaderView/Reader.vue'
import Controls from './ReaderView/Controls.vue'
import DrawerContent from './ReaderView/DrawerContent.vue'
import DrawerLayout from 'vue-drawer-layout'
import electron from 'electron'
import appStateSynchronization from './appStateSynchronization'

import util from 'util'

export default {
  mixins: [appStateSynchronization],
  components: {
    BookReader,
    Controls,
    DrawerLayout:DrawerLayout.DrawerLayout,
    DrawerContent
  },
  // props: ['id'],
  props: {
    id: {
      required: true,
      type: String
    }
  },
  data: function() {
    return {
      //TODO: custom request to support guttenberg books
      url: '',
      serchQuery: '',
      readingProgress: 0,
      isDrawerOpen: false,
      bookmarks: [],
      chapters: [],
      bookManager: null,
      bookStorage: undefined
    }
  },
  created: function() {
    this.changeAppState('reader')
    .catch(err => console.error(`unable to synchronize app state (ReaderView): ${err}`))
    .finally(() => {
      this.bookManager = electron.remote.getGlobal('bookManager')
      
      console.log(`passed id (props): ${this.id}`)
      console.log(`passed route params:`, this.$route.params)

      if(!this.bookManager.hasBook(this.id))
        throw ReferenceError(`unable to find book with key: ${this.id}`)

      this.bookStorage = this.bookManager.getBook(this.id)
    })
  },
  mounted: function() {
    this.$nextTick(function() {
      document.querySelector('.drawer-wrap').style.visibility = 'hidden'//fixes alvays visible drawer content
    })
    /*
    this.$root.$on('toc', (toc) => {
      console.log(`[mounted] updated toc: ${this.toc}`)
      this.toc = toc
    })*/
  },
  methods: {
    //fixes alvays visible drawer content
    drawerSlideEnd(visible) {
      if(!visible) {
        this.isDrawerOpen = false
        document.querySelector('.drawer-wrap').style.visibility = 'hidden'
      }
      else {
        this.isDrawerOpen = true
        document.querySelector('.drawer-wrap').style.visibility = 'visible'
      }
        
    },
    handleCtrlButtonClick(name) {
      switch(name) {
        case 'hamburger':
          this.$refs.drawer.toggle(!(this.isDrawerOpen))
          break

        case 'shelf':
          //TODO: navigation
          break

        case 'bookmark':
          //TODO:  
          break

        case 'chapters':
          this.$refs.drawerContent.showChapters()
          this.$refs.drawer.toggle(true)
          break

        default:
          break
      }
    },
    handleChaptersChanged(chapters) {
      this.chapters = chapters.map(chapter => chapter.label)
    },
    handleCollectionChange() {
      //TODO:
    },
    handleCollectionElementClick() {
      //TODO: this -> Reader -> epubJsWrapper -> NavigateToCFI(cfi)
    },
    toggleSearchWidget () {
      this.openSearch = !this.openSearch
    },

    showContent () {
      this.openContent = !this.openContent
    },

    onSearchResults (value) {
      this.searchContent = value
    }
  }
}
</script>