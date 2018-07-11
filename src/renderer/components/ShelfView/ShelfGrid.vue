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
.grid-container {
    display: grid;
}
</style>

<script>
import { remote } from "electron"
import ShelfGridItem from "./ShelfGridItem.vue"

let bookManager = remote.getGlobal("bookManager")
let dataModelLoader = remote.getGlobal("dataModelLoader")

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
        loadBooksFromManager: function() {

        },
        loadAppTiles: function() {
            var appTiles = []
            
            appTiles.push({id: "last-read", img: null, link: "/book/last", bookObject: null })
            appTiles.push({id: "app-config", img: null, link: "/app/config", bookObject: null })
            appTiles.push({id: "add-book-to-shelf", img: null, link: "/book/add", bookObject: null })
            appTiles.push({id: "theme-select", img: null, link: "/app/config/themes", bookObject: null })

            return appTiles
        }
    },
    mounted: function () {
        this.$nextTick(function () 
        {
            this.loadBooksFromManager();
        })
    },
    created: function() {
        this.tiles = this.loadAppTiles()
    }
}
</script>
