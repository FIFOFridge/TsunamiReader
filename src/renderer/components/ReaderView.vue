<template>
    <div>
        <Controls
        :is-drawer-open="isDrawerOpen"
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
            :epub-url="url"
            :is-drawer-open="isDrawerOpen"
          >
          </BookReader>
        </div>
        <div slot="drawer">
          <DrawerContent
            :bookFontSize="100"
            :bookFlowType="'paginated'"
            :bookChapters="[]"
            :bookBookmarks="[]"
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

import util from 'util'

export default {
  components: {
    BookReader,
    Controls,
    DrawerLayout:DrawerLayout.DrawerLayout,
    DrawerContent
  },
  props: {
    filePath: String
  },
  data: function() {
    return {
      //TODO: custom request to support guttenberg books
      url: 'https://s3.amazonaws.com/epubjs/books/alice.epub',
      serchQuery: '',
      readingProgress: 0,
      isDrawerOpen: false
    }
  },
  created: function() {
    this.$refs.drawer.style

    //https://stackoverflow.com/a/14314836
    var urlCheck = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

    if(urlCheck.test(this.filePath)) { //url
      this.url = this.filePath 
    } else {
      //todo check is file exists
    }

    console.log(DrawerLayout)
    console.log(Controls)
    console.log(`reader recived url: ${this.url}`)
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