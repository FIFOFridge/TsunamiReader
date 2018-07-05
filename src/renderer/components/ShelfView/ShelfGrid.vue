<template>
    <div class="grid-container">
        <template v-for="(tile, index) in this.tiles">
            <shelf-grid-item :key="index"
                :img="tile.img"
                :book-object="tile.bookObject"
                :link="tile.link"
                :id="tile.id"
            >
            </shelf-grid-item>
        </template>
    </div>
</template>

<style>

/* 5 */
.grid-container {
    position: relative;
    
    display: grid;
    grid-template-columns: auto auto auto auto auto;
    grid-template-rows: 1em 1.25em;
    grid-auto-flow: dense;
    grid-gap: 0.5em;
    padding: 1em;
    
    padding-bottom: 4.5em;
    padding-top: 2em;
}
</style>

<script>
import { remote } from "electron"
import ShelfGridItem from "./ShelfGridItem.vue"

let bookManager = remote.getGlobal("bookManager")

export default {
    name: 'shelf-grid',
    components: {
        ShelfGridItem
    },
    props: {
        tiles: []
    },
    data: function() {
        return {
            lastIndex: 0,
            lastColumnEnd: 0,
            lastRowEnd: 0
        }
    },
    methods: {
        add: function(book) {
            bookManager.addBook(book)
        },
        remove: function(book) {
            bookManager.removeBook(book)
        },
        contains: function(book) {
            bookManager.hasBook(book)
        },
        init: function() {

        },
        // // c-s/e | r-s/e | img | img_placement | isBook | link | class/id = none
        // insertGridItem: function(c, r, img, imgPlacement, isBook, link, selector = null) {
        //     var el = document.createElement("div")

        //     el.style.gridColumn = c
        //     el.style.gridRow = r
        // }
    },
    mounted: function () {
        this.$nextTick(function () 
        {
            init();
        })
    }
}
</script>
