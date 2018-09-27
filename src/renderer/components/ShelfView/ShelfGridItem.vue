<template>
        <div :id="[id]" class="grid-item" :class="[priority, type, tileStateClass]">
            <router-link :to="{path: this.defaultActionLink}">
                <!-- book -->
                <div v-if="this.bookObject != undefined"
                    :style="backgroundImageFix"
                >
                    <!-- <div class="book-details">{{ bookDetails }}</div> -->
                </div>

                <div v-if="this.bookObject != undefined" class="book-title">
                  <p>
                    {{ bookTitle }}
                  </p>
                </div>
                <!-- app -->
                <div v-if="this.bookObject == undefined" class="img-container">
                    <img v-if="!this.isSVG" class="_img" :src="this.img"/>
                    <svg v-else class="_img _svg" viewBox="0 0 24 24">
                        <path :fill="this.svgFill" :d="this.img"/>
                    </svg>
                </div>

                <div v-if="this.bookObject == undefined" class="description-container">
                    <h2>
                        {{ this.descriptionShort }}
                    </h2>
                </div>
            </router-link>
        </div>
</template>

<style>
/* app */
.grid-item.priority-high {
  order: -2;
}

/* fav books */
.grid-item.priority-medium {
  order: -1;
}

/* casual books */
.grid-item.priority-low {
  order: 0;
}
</style>

<script>
import util from 'util'

export default {
  props: {
    img: String, //encoded as base64 || svg,
    isSVG: Boolean,
    svgFill: String,
    // imgPosition: '',
    // isBook: true,
    bookObject: null,
    link: String,
    descriptionShort: String,
    id: null,
    tileState: String
  },
  data: function() {
    return {
      title: "",
      isFavourite: false,
      priority: "",
      defaultActionLink: "",
      removeActionLink: "", //only for book
      backgroundImageFix: {},
      type: "",
      tileStateClass: "enabled"
    };
  },  
  //exectue before mount
  created: function() {
    if(this.tileState === undefined) {
        this.tileStateClass = 'enabled'//as default
    }

    //update data
    if (this.bookObject == !null && this.bookObject == !undefined) {
      this.title = this.bookObject.title;
      this.isFavourite = this.bookObject.isFavourite;

      this.priority = this.isFavourite ? "priority-medium" : "priority-low";
    } else {
      this.priority = "priority-high";
    }

    if (this.bookObject !== null && this.bookObject !== undefined) {
      this.type = "book";
    } else {
      this.type = "app";
    }

    this.makeActionLinks();

    //format for base64 src
    // if (!this.isSVG) {
    //   this.img = `data:image/png;base64, ${this.img}`;
    // }
  },
  mounted: function() {
    if(this.bookObject !== null && this.bookObject !== undefined) {
      var bgUrl = `url(${this.bookObject.cover})`

      this.$el.style.backgroundImage = bgUrl
      this.$el.style.backgroundSize = 'cover'
      this.$el.style.backgroundRepeat = 'no-repeat'
      this.$el.style.backgroundPosition = 'center center'

      console.log(this.$el.style)
      // console.log(bgUrl.length)
      //console.log(this.$el.backgroundImage)
    }
  },
  methods: {
    makeActionLinks: function() {
      if (this.bookObject == !null && this.bookObject == !undefined) {
        this.defaultActionLink = "/action/book/view/" + this.link;
        this.removeActionLink = "/action/book/remove/" + this.link;
      } else {
        this.defaultActionLink = this.link;
      }
    }
  },
  computed: {
    bookTitle: function() {
      if(this.bookObject === null || this.bookObject === undefined)
        return ''

      return this.bookObject.title[0]
    },
    bookDetails: function() {
      if(this.bookObject === null || this.bookObject === undefined)
        return ''

      var dataExtractor = (arg, label, str, deep = true) => {
        if(arg === undefined || arg === null)
          return

        if(util.isArray(arg)) {
          if(arg.lenght > 1) {
            if(deep) {
              str = str + label + ': ' + arg.join(' ,') + '\n'
            } else {
              str = str + label + ': ' + arg[0] + '\n'
            }
          } else {
            str = str + label + ': ' + arg[0] + '\n'
          }
        }
      }

      var details = ''
      dataExtractor(this.bookObject.creator, 'author(s): ', details)
      dataExtractor(this.bookObject.author, 'author(s): ', details)
      dataExtractor(this.bookObject.contributor, 'contributor(s): ', details)
      dataExtractor(this.bookObject.date, 'released: ', details, false)
      dataExtractor(this.bookObject.publisher, 'publisher: ', details, false)
      dataExtractor(this.bookObject.rights, 'rights: ', details, false)
      dataExtractor(this.bookObject.identifier, 'identifier: ', details, false)
      dataExtractor(this.bookObject.id, 'identifier: ', details, false)

      return details
    }
  },
  watch: {
      tileState: function(_new, old) {
          this.tileStateClass = _new
      }
  }
};
</script>
