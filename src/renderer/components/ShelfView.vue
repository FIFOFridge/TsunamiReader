<template>
    <div>
        <app-titlebar></app-titlebar>
        <div class="window-content-container">
            <shelf-grid 
                id="app-tiles-grid"
                style="width=100%; height: 100%;"
                :tiles="this.appTiles"
                >
            </shelf-grid>
            <shelf-grid id="books-tiles-grid">
            </shelf-grid>
        </div>
    </div>
</template>

<style>
@import "/static/lib/lazygrid.css";
@import "/static/css/shelf.css";
@import "/static/css/shelfGrid.css";
</style>

<script>
import ShelfGrid from './ShelfView/ShelfGrid'
import AppTitlebar from './_shared/TitleBar.vue'
import { remote } from "electron"

let bookManager = remote.getGlobal("bookManager")
let dataModelLoader = remote.getGlobal("dataModelLoader")

export default {
    components: {
        ShelfGrid,
        AppTitlebar
    },
    created: function() {
        this.appTiles = this.loadAppTiles()
    },
    mounted: function() {
        this.$nextTick(function () 
        {
            this.bookTiles = this.loadBooksFromManager();
        })
    },
    data: function () {
        return {
            appTiles: [],
            bookTiles: []
        }
    },
    methods: {
        loadAppTiles: function() {
            return [
                {id: "last-read", img: null, link: "/book/last", bookObject: null },
                {id: "app-config", img: null, link: "/app/config", bookObject: null },
                {id: "add-book-to-shelf", img: null, link: "/book/add", bookObject: null },
                {id: "theme-select", img: null, link: "/app/config/themes", bookObject: null }
            ]
        },
        loadBooksFromManager: function() {
            return [] //TODO: handle loading from books manager
        }
    }
}
</script>

