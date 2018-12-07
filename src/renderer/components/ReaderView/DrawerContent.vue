<template>
    <div class="drawer-content-container">
        <!-- https://youtu.be/64JTcZk8i8w?t=20 -->
        <div v-if="layout === 'settings'">
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
        <!--
        <div v-if="layout === 'chapters' || layout === 'bookmarks'">

        </div>
        -->
    </div>
</template>

<style>
</style>

<script>
import vueSlider from 'vue-slider-component'

export default {
    components: {
        vueSlider
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
        }
    },
    data: function() {
        return {
            isVisible: false,
            fontSize: 100,
            flow: undefined,
            layout: 'settings',
            toggles: [false, false]
        }
    },
    methods: {
        getLayout: function() {
            return this.layout
        },
        showSettings: function() {
            this.layout = 'settings'
        },
        showChapters: function() {
            this.layout = 'chapters'
        },
        showBookmarks: function() {
            this.layout = 'bookmarks'
        },
        _updateFontSize: function() {
            this.$emit('set:fontSize', this.fontSize)
        },
        _updateBookmarks: function(bookmarks) {

        },
        _setupContentList() {

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
    }
}
</script>
