<!--suppress CssUnknownTarget -->
<template>
    <div>
<!--        <app-titlebar class="dark" is-fixed="true"></app-titlebar>-->
<!--        <div class="window-content-container">-->
        <div id="left-panel">
            <div class="content-main">
                <panel-button
                    v-on:click="addBook"
                    ref="panelButtonAddBook"
                    class="pulse-more"
                    label="add book"
                    svg-path="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
                    svg-margin-left="0.10em"
                    label-margin-left="0.70em"
                    svg-width="32px"
                    svg-height="32px"
                >
                </panel-button>
                <panel-button
                        label="settings"
                        svg-path="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"
                        svg-margin-left="0.10em"
                        label-margin-left="0.70em"
                        svg-width="32px"
                        svg-height="32px"
                >
                </panel-button>
                <panel-button
                        label="themes"
                        svg-path="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"
                        svg-margin-left="0.10em"
                        label-margin-left="0.70em"
                        svg-width="32px"
                        svg-height="32px"
                >
                </panel-button>
                <panel-button class="pulse-more"
                        label="about"
                        svg-path="M13.5,4A1.5,1.5 0 0,0 12,5.5A1.5,1.5 0 0,0 13.5,7A1.5,1.5 0 0,0 15,5.5A1.5,1.5 0 0,0 13.5,4M13.14,8.77C11.95,8.87 8.7,11.46 8.7,11.46C8.5,11.61 8.56,11.6 8.72,11.88C8.88,12.15 8.86,12.17 9.05,12.04C9.25,11.91 9.58,11.7 10.13,11.36C12.25,10 10.47,13.14 9.56,18.43C9.2,21.05 11.56,19.7 12.17,19.3C12.77,18.91 14.38,17.8 14.54,17.69C14.76,17.54 14.6,17.42 14.43,17.17C14.31,17 14.19,17.12 14.19,17.12C13.54,17.55 12.35,18.45 12.19,17.88C12,17.31 13.22,13.4 13.89,10.71C14,10.07 14.3,8.67 13.14,8.77Z"
                        svg-margin-left="0.10em"
                        label-margin-left="0.70em"
                        svg-width="32px"
                        svg-height="32px"
                >
                </panel-button>
<!--                    <panel-button -->
<!--                        label="settings">-->
<!--                    </panel-button>-->
<!--                    <panel-button-->
<!--                            label="themes">-->
<!--                    </panel-button>-->
<!--                    <panel-button-->
<!--                            label="about">-->
<!--                    </panel-button>-->
            </div>
            <div class="content-second" style="position: absolute; bottom: 0.75em; width: 100%;">
                <panel-button
                        label="at github"
                        svg-path="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                        svg-margin-left="0.10em"
                        label-margin-left="0.70em"
                        svg-width="32px"
                        svg-height="32px"
                >
                </panel-button>
            </div>
        </div>

        <input
                id="book-search"
                type="text"
                placeholder="Search"
                v-model="bookSearchQuery"
        >

        <keep-alive>
            <modal v-show=""
                :closeable="false"
                :toggleable="true"
                :top="'10%'"
                :left="'75%'"
                :width="'20%'"
                :defaultDisplay="false"
                :defaultExpand="true"
            >
                <div class="modal-search-options">
                    <input id="smo-title" type="radio" v-model="searchBy" value="title">
                    <label for="smo-title" >Search by: Title</label>
                    <input id="smo-author" type="radio" v-model="searchBy" value="author">
                    <label for="smo-author">Search by: Author</label>
                    <input id="smo-tag" type="radio" v-model="searchBy" value="tag">
                    <label for="smo-tag">Search by: Tag</label>
                    <input id="smo-bookmark" type="radio" v-model="searchBy" value="bookmark">
                    <label for="smo-bookmark">Search in: Bookmarks</label>
                </div>
            </modal>
        </keep-alive>



<!--            <shelf-grid -->
<!--                id="app-tiles-grid"-->
<!--                style="width=100%; height: 100%;"-->
<!--                :sourceTiles="this.appTiles"-->
<!--                >-->
<!--            </shelf-grid>-->
<!--            <shelf-grid -->
<!--                id="books-tiles-grid"-->
<!--                style="width=100%;"-->
<!--                :tiles="this.bookTiles"-->
<!--            >-->
<!--            </shelf-grid>-->
<!--        </div>-->
    </div>
</template>

<style>
@import "/static/css/titlebar.css";
@import "/static/lib/lazygrid.css";
@import "/static/css/shelf.css";
@import "/static/css/shelfGrid.css";
</style>

<!--suppress JSUnfilteredForInLoop -->
<script>
import ShelfGrid from './ShelfView/ShelfGrid'
import appStateSynchronization from './appStateSynchronization'
import * as Promise from 'bluebird'
import paths from '@constants/paths'
import appTiles from '@constants/views/shelf/appTiles'
import { state } from './ShelfView/ShelfGridItemState'
import { MetadataFields } from '@constants/epubMetadataTags'
import { log } from '@app/log'
import { ShelfViewModel } from '@viewmodels/shelfViewModel'
import { IPCBridgeRenderer } from '@ipc/bridge-renderer'
import PanelButton from '@views/_shared/PanelButton.vue'
import Modal from '@views/_shared/Modal.vue'
// import CheckboxGroup from '@views/_shared/CheckboxGroup.vue'
import ipcMainEvents from '@constants/ipcMainEvents'
import { isResponseSuccess } from '@ipc/bridge-shared'

export default {
    mixins: [
        ShelfViewModel
    ],
    components: {
        ShelfGrid,
        PanelButton,
        Modal
    },
    created: function() {
        log.info(`created shelf view`)
        // this.appTiles = this.setupAppTiles()
        // this.bookHelper = new BookHelper(paths.booksCollectionFilePath)

        log.warn(`${this.viewName}`)

        // this.changeAppState(views.Shelf)
        //     .then(() => {
        //         log.verbose(`successfully updated app state`)
        //     })
        //     .catch(err => {
        //         log.error(`unable to synchornize app state: ${err}`)
        //     })
    },
    mounted: function() {
        this.$nextTick(function()
        {
            // this.setupAppTiles()
        })
    },
    data: function () {
        return {
            appTiles: [],
            bookTiles: [],
            bookHelper: null,
            searchBy: 'title',
            bookSearchQuery: '',
            isSearchOptionsVisible: false,
            isSearchFocusActive: false,
            isBookAddEnabled: true
        }
    },
    methods: {
        //FIXME: create method to toggle tile states, independent
        updateCanAddBook: function(value) {
            log.verbose(`recived: `, value)

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
        // addBook: function(value) {
        //     console.log(`addBook recived: `, value)
        //
        //     let md5 = value.get('md5')
        //     let bookObject = value.get('metadata')
        //     bookObject.cover = value.get('cover')
        //
        //     var bookTile = {}
        //     bookTile.link = `/epub-reader/${md5}`
        //     bookTile.id = md5
        //     bookTile.tileState = 'enabled'
        //     bookTile.isSVG = false
        //     bookTile.bookObject = bookObject
        //     bookTile.img = null // value.get('cover')
        //     // bookTile.urlProps = { id: value.md5 }
        //
        //     this.bookTiles.push(bookTile)
        // },
        //create app tiles
        setupAppTiles: function() {
            this.appTiles = appTiles
            // this.appTiles.slice()
        },
        bookGridItemFromFile: function() {

        },
        searchModeChanged(to) {

        },
        toggleSearchOptionsState() {
            if(this.isSearchOptionsVisible === true) { //hide
                this.$refs.searchOptionsContent.style.visibility = 'hidden'
                this.isSearchOptionsVisible = false
            } else { //show
                this.$refs.searchOptionsContent.style.visibility = 'visible'
                this.isSearchOptionsVisible = true
            }
        },
        addBook() {
            this.$refs.panelButtonAddBook.setState(false)

            IPCBridgeRenderer.send(
                ipcMainEvents.openBookBrowse,
                reply => {
                    if(!(isResponseSuccess(reply))) {
                        log.error(`error occured during: ${reply.get('reason')}`)
                    }

                    this.$refs.panelButtonAddBook.setState(true)
                },
                60000)
        }
    },
    watch: {
        searchBy: function(value) {
            log.verbose(`searchBy: ${value}`)
        },
        bookSearchQuery: function (value) {
            log.verbose(`search value changed to: ${value}`)
        },
        isBookAddEnabled: function (value) {
            this.$refs.panelButtonAddBook.setState(false)
        }
    }
}
</script>

