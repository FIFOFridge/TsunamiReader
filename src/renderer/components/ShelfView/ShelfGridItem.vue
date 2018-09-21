<template>
        <div :id="[id]" class="grid-item" :class="[priority, type, tileStateClass]">
            <router-link :to="{path: this.defaultActionLink}">
                <!-- book -->
                <div v-if="this.bookObject ==! null && this.bookObject ==! undefined"
                    class="book" :style="[backgroundImage]"
                >
                    <div class="book-title">{{ book.title }}</div>
                </div>
                <!-- app -->
                <!-- <div class="app" v-else>for manual setup by external style sheet -->
                <div class="img-container">
                    <img v-if="!this.isSVG" class="_img" :src="this.img"/>
                    <svg v-else class="_img _svg" viewBox="0 0 24 24">
                        <path :fill="this.svgFill" :d="this.img"/>
                    </svg>
                </div>

                <div class="description-container">
                    <h2>
                        {{ this.descriptionShort }}
                    </h2>
                    <!-- TODO: long (interactive) description for books -->
                    <!-- <h5 class="description-long" >
                        {{ this.descriptionLong }}
                    </h5> -->
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
    descriptionLong: String,
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
      backgroundImage: "",
      type: "",
      descriptionShortVisibility: "",
      tileStateClass: "enabled"
    };
  },  
  //exectue before mount
  created: function() {
    //this.descriptionShortVisibility = (this.descriptionShort == "") ? "visible" : "hidden";
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

    if (this.bookObject == !null && this.bookObject == !undefined) {
      this.type = "book";
    } else {
      this.type = "app";
    }

    this.makeActionLinks();

    //format for base64 src
    if (!this.isSVG) {
      this.img = `data:image/png;base64, ${this.img}`;
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
  computed: {},
  watch: {
      tileState: function(_new, old) {
          this.tileStateClass = _new
      }
  }
};
</script>
