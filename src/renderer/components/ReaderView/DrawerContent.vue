<template>
    <div class="drawer-content-container">
        <!-- https://youtu.be/64JTcZk8i8w?t=20 -->
        <div v-if="canShowSettings">
            <div class="config-option">
                <p style="padding-bottom: 1.5em;">Font size in %:</p>
                <vue-slider ref="fontSlider" 
                    :min="50"
                    :max="200"
                    :dot-size="32"
                    :interval="25"
                v-model="fontSize">
                </vue-slider>
            </div>

            <div class="config-option">
                <p>Book content format:</p>
                <div class="toggle-group-flowType">
                    <button @click="handleToggleGroup(toggles, 0)" :class="{'toggled': this.toggles[0]}">
                        <svg style="width:2em;height:2em" viewBox="0 0 24 24">
                            <path d="M16,5V18H21V5M4,18H9V5H4M10,18H15V5H10V18Z" />
                        </svg>
                    </button>
                    <button @click="handleToggleGroup(toggles, 1)" :class="{'toggled': this.toggles[1]}">
                        <svg style="width:2em;height:2em" viewBox="0 0 24 24">
                            <path d="M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5V7H21V5H3Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <!-- Navigation table --> 
        <div v-if="listItemsType === 'chapters' || listItemsType === 'bookmarks'">
            <list
                :items="listItems"
                :removable="listItemsCanRemove"
                @items-changed="_handleListCollectionChange"
                @item-click="_handleListItemClick" 
            >
            </list>
        </div>
    </div>
</template>

<style>
</style>

<script>
import vueSlider from 'vue-slider-component'
import List from './../_shared/List.vue'

export default {
    components: {
        vueSlider,
        List
    },
    props: {
        bookFontSize: {
            type: Number,
            required: true
        },
        bookFlowType: {
            type: String,
            required: true
        },
        bookChapters: {
            type: Array,
            required: true
        },
        bookBookmarks: {
            type: Array,
            required: true
        },
        isVisible: {
            type: Boolean,
            required: true
        }
    },
    data: function() {
        return {
            fontSize: 100,
            flow: undefined,
            toggles: [false, false],
            canShowSettings: true,
            listItems: [],
            listItemsType: '',
            listItemsCanRemove: false
        }
    },
    methods: {
        getListItemsType: function() {
            return this.listItemsType
        },
        showSettings: function() {
            this.listItemsType = '' 
            this.canShowSettings = true
        },
        showChapters: function() {
            this._setupListCollection('chapters')
        },
        showBookmarks: function() {
            this._setupListCollection('bookmarks')
        },
        _updateFontSize: function() {
            this.$emit('set:fontSize', this.fontSize)
        },
        _setupListCollection(type) {
            if(type == 'bookmarks') {
                this.listItemsType = 'bookmarks'
                this.listItems = this.bookBookmarks
                this.listItemsCanRemove = true
                this.canShowSettings = false
            }
            else if(type == 'chapters') {
                this.listItemsType = 'chapters'
                this.listItems = this.bookChapters
                this.listItemsCanRemove = false
                this.canShowSettings = false
            } else {
                throw TypeError('unknown data')
            }
        },
        _handleListCollectionChange(newCollection) {
            this.$emit('list-collection-change', this.listItemsType, newCollection)
        },
        _handleListItemClick(index) {
            if(this.listItemsType == 'chapters' || this.listItemsType == 'bookmarks') {
                this.$emit('list-item-click', this.listItemsType, index)
            }
        },
        handleToggleGroup(obj, i) { 
            for(let j = 0; j < obj.length; j++) {
                if(i == j) {
                    this.$set(obj, j, true)
                } else {
                    this.$set(obj, j, false)
                }
            }
        }
    },
    watch: {
        isVisible(newValue) {
            //on hide:
            //clear list visibility (if set)
            //and display settings
            if(!(newValue)) { 
                this.listItemsType = ''
                this.listItems = []
                this.listItemsCanRemove = false
                this.canShowSettings = true
            }
        }
    }
}
</script>
