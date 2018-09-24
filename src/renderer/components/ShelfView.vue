<template>
    <div>
        <app-titlebar class="dark" is-fixed="true"></app-titlebar>
        <div class="window-content-container">
            <shelf-grid 
                id="app-tiles-grid"
                style="width=100%; height: 100%;"
                :tiles="this.appTiles"
                >
            </shelf-grid>
            <shelf-grid 
                id="books-tiles-grid"
                style="width=100%;"
                :tiles="this.bookTiles"
            >
            </shelf-grid>
        </div>
    </div>
</template>

<style>
@import "/static/css/titlebar.css";
@import "/static/lib/lazygrid.css";
@import "/static/css/shelf.css";
@import "/static/css/shelfGrid.css";
</style>

<script>
import ShelfGrid from './ShelfView/ShelfGrid'
import AppTitlebar from './_shared/TitleBar.vue'
import { remote } from "electron"
import sharedAppStates from './../../constants/sharedAppStates'

//let bookManager = remote.getGlobal("bookManager")
//let dataModelLoader = remote.getGlobal("dataModelLoader")

export default {
    components: {
        ShelfGrid,
        AppTitlebar
    },
    created: function() {
        this.appTiles = this.loadAppTiles()

        remote.getGlobal('appStateSync').on(sharedAppStates.canAddBook, this.updateCanAddBook)
        remote.getGlobal('appStateSync').on(sharedAppStates.registredBook, this.addBook)
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
        updateCanAddBook: function(value) {
            console.log(`recived: `, value)

            var addToShelfTileIndex = this.appTiles.findIndex(tile => {
                return tile.link === "/action/book-add"
            })

            if(addToShelfTileIndex < 0)
                throw TypeError(`unable to find tile with link: /action/book-add`)

            var tile = this.appTiles[addToShelfTileIndex]

            var updatedClassName = 'enabled'

            if(value == false)
                updatedClassName = 'disabled'

            this.$set(this.appTiles[addToShelfTileIndex], 'tileState', updatedClassName)
        },
        addBook: function(value) {
            console.log(`addBook recived: `, value)

            var bookTile = {}
            bookTile.id = value.md5
            bookTile.tileState = 'enabled'
            bookTile.isSVG = false
            bookTile.bookObject = value
            bookTile.img = value.cover

            this.bookTiles.push(bookTile)
        },
        //create app tiles
        loadAppTiles: function() {
            return [
                {
                    id: "last-read", 
                    link: "/action/book-continue", 
                    descriptionShort: "Continue   reading", 
                    descriptionLong: "", 
                    bookObject: null, 
                    isSVG: true, 
                    tileState: 'enabled',
                    img: "M21,5C19.89,4.65 18.67,4.5 17.5,4.5C15.55,4.5 13.45,4.9 12,6C10.55,4.9 8.45,4.5 6.5,4.5C4.55,4.5 2.45,4.9 1,6V20.65C1,20.9 1.25,21.15 1.5,21.15C1.6,21.15 1.65,21.1 1.75,21.1C3.1,20.45 5.05,20 6.5,20C8.45,20 10.55,20.4 12,21.5C13.35,20.65 15.8,20 17.5,20C19.15,20 20.85,20.3 22.25,21.05C22.35,21.1 22.4,21.1 22.5,21.1C22.75,21.1 23,20.85 23,20.6V6C22.4,5.55 21.75,5.25 21,5M21,18.5C19.9,18.15 18.7,18 17.5,18C15.8,18 13.35,18.65 12,19.5V8C13.35,7.15 15.8,6.5 17.5,6.5C18.7,6.5 19.9,6.65 21,7V18.5Z" 
                },
                {
                    id: "app-config", 
                    link: "/app/config", 
                    descriptionShort: "Settings",
                    descriptionLong: "", 
                    bookObject: null, 
                    isSVG: true, 
                    tileState: 'enabled',
                    img: "M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" 
                },
                {
                    id: "add-book-to-shelf", 
                    link: "/action/book-add", 
                    descriptionShort: "Add   book", 
                    descriptionLong: "", 
                    bookObject: null, 
                    isSVG: true, 
                    tileState: 'enabled',
                    img: "M19,20H4C2.89,20 2,19.1 2,18V6C2,4.89 2.89,4 4,4H10L12,6H19A2,2 0 0,1 21,8H21L4,8V18L6.14,10H23.21L20.93,18.5C20.7,19.37 19.92,20 19,20Z" 
                },
                {
                    id: "theme-select", 
                    img: null, 
                    link: "/app/theme", 
                    descriptionShort: "Theme", 
                    descriptionLong: "", 
                    bookObject: null, 
                    isSVG: true, 
                    tileState: 'enabled',
                    img: "M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A1.5,1.5 0 0,0 13.5,19.5C13.5,19.11 13.35,18.76 13.11,18.5C12.88,18.23 12.73,17.88 12.73,17.5A1.5,1.5 0 0,1 14.23,16H16A5,5 0 0,0 21,11C21,6.58 16.97,3 12,3Z" 
                }
            ]
        },
        loadBooksFromManager: function() {
            return [] //TODO: handle loading from books manager
        }
    }
}
</script>

