<template>
    <div :id="[id]" class="grid-item" :class="[priority]">
        <!-- book -->
        <div v-if="this.bookObject ==! null && this.bookObject ==! undefined"
            class="book" :style="[backgroundImage]"
        >
            <div class="book-title">{{ book.title }}</div>
        </div>
        <!-- app -->
        <div class="app" v-else><!-- for manual setup by external style sheet -->
            <img class="_img" :src="this.img">

            <img/> 
            <div class="action">
                <button class="_button">
                </button>
            </div>
        </div>
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

.grid-item .book {
    position: relative;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;

    grid-row: span 2;
    align-self: stretch;
}

.grid-item .book .book-title {
    position: relative;
    width: 100%;
    top: 0.15em;
    text-align: center;
    background-color: rgba(0,0,0,0.5);
}

.grid-container > .grid-item {
    height: 100%; /* globaly fixes custom height elements */
}
</style>

<script>
export default {
    props: {
        img: "", //encoded as base64
        // imgPosition: '',
        // isBook: true,
        bookObject: null,
        link: "",
        id: null
    },
    data: function() {
        return {
            title: "",
            isFavourite: false,
            priority: "",
            defaultActionLink: "",
            removeActionLink: "",//only for book
            backgroundImage: ""
        }
    },
    //exectue before mount
    created: function() {
        //update data
        if(this.bookObject ==! null && this.bookObject ==! undefined) {
            this.title = this.bookObject.title
            this.isFavourite = this.bookObject.isFavourite

            this.priority = this.isFavourite ? "priority-medium" : "priority-low"
        } else {
            this.priority = "priority-high"
        }

        this.makeActionLinks()
        
        //format for base64 src
        this.img = `data:image/png;base64, ${this.img}`
    },
    methods: {
        makeActionLinks: function() {
            if(this.bookObject ==! null && this.bookObject ==! undefined)
            {
                this.defaultActionLink = "/book/view/" + this.link
                this.removeActionLink = "/book/remove/" + this.link
            } else {
                this.defaultActionLink = this.link
            }
        }
    },
    computed: {

    }
}
</script>
