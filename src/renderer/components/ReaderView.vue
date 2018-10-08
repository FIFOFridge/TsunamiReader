<template>
    <div>
        <Controls>
        </Controls>
      <BookReader
        :epub-url="url"
        :font-size="size"
        :themes="themes"
        :theme="currentTheme"
        :progress.sync="readingProgress"
        @toc="getContent"
        :contentBookModify="20"
      >
        <!-- <template slot="progress-bar" slot-scope="props">
          <input size="3" type="range" max="100" min="0" step="1"
            @change="props.onChange($event.target.value)"
            :value="readingProgress"
          /> %
          <input type="text"
            @change="props.onChange($event.target.value)"
            @mousedown="props.onMousedown"
            @mouseup="props.onMouseup"
            :value="readingProgress"
          >
        </template> -->
      </BookReader>
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
// import { BookReader, TreeMenu } from 'vue-epub-reader'
import BookReader from './ReaderView/Reader.vue'
import Controls from './ReaderView/Controls.vue'
import util from 'util'

export default {
  components: {
    BookReader,
    Controls
    // TreeMenu
  },
  props: {
    filePath: String,
    opt: Object
  },
  data: function() {
    return {
      //TODO: custom request to support guttenberg books
      url: 'https://s3.amazonaws.com/epubjs/books/alice.epub',
      size: 80,
      currentTheme: 'beige',
      themes: {
        white: {
          body: {
            color: '#000000',
            background: '#ffffff'
          },
          name: 'WHITE'
        },
        beige: {
          body: {
            color: '#000000',
            background: '#f3e8d2'
          },
          name: 'BEIGE'
        },
        night: {
          body: {
            color: '#ffffff',
            background: '#4a4a4a'
          },
          name: 'NIGHT'
        }
      },
      serchQuery: '',
      readingProgress: 0,
      openSearch: false,
      openContent: false,
      searchContent: [],
      toc: [],
      epubCtrMethod: 'default',
      flow: 'paginated'
    }
  },
  created: function() {
    //https://stackoverflow.com/a/14314836
    var urlCheck = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

    if(urlCheck.test(this.filePath)) { //url
      this.url = this.filePath 
    } else {
      //todo check is file exists
    }

    console.log(`reader recived url: ${this.url}`)
    console.log(`epubCtrMethod: ${this.epubCtrMethod}`)
    console.log(`flow: ${this.flow}`)
  },
  mounted: function() {
    this.$root.$on('toc', (toc) => {
      console.log(`[mounted] updated toc: ${this.toc}`)
      this.toc = toc
    })
  },
  methods: {
    toggleSearchWidget () {
      this.openSearch = !this.openSearch
    },

    showContent () {
      this.openContent = !this.openContent
    },

    onSearchResults (value) {
      this.searchContent = value
    },

    getContent (value) {
      console.log(`[getContent()] updated toc: ${this.toc}`)
      this.toc = value
    }
  }
}
</script>