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
            <img v-if="!this.isSVG" class="_img" :src="this.img"/>
            <svg v-else class="_img _svg" :d="this.img" :fill="this.svgFill"/>
            <!-- <router-link :to="this.defaultActionLink" tag="button">{{this.label}}</router-link> -->
            <router-link :to="{path: this.defaultActionLink}">
                <button class="app-button">{{this.label}}</button>
            </router-link>
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
        img: "", //encoded as base64 || svg,
        isSVG: false,
        svgFill: "#000000",
        // imgPosition: '',
        // isBook: true,
        bookObject: null,
        link: "",
        label: "click meh!",
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
        if(!(this.isSVG)) {
            this.img = `data:image/png;base64, ${this.img}`
        }
        
    },
    methods: {
        makeActionLinks: function() {
            if(this.bookObject ==! null && this.bookObject ==! undefined)
            {
                this.defaultActionLink = "/action/book/view/" + this.link
                this.removeActionLink = "/action/book/remove/" + this.link
            } else {
                this.defaultActionLink = this.link
            }
        }
    },
    computed: {

    }
}
</script>
