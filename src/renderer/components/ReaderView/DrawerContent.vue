<template>
    <div>
        <!-- https://youtu.be/64JTcZk8i8w?t=20 -->
        <div v-if="layout === 'settings'">
            <vue-slider ref="fontSlider" 
                :min="50"
                :max="200"
                :dot-size="32"
                :interval="25"
            v-model="fontSize"></vue-slider>

            <div>
                <button ref="flowPaginated">
                    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                        <path fill="#000000" d="M16,5V18H21V5M4,18H9V5H4M10,18H15V5H10V18Z" />
                    </svg>                    
                </button>
                <button ref="flowContinous">
                    <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                        <path fill="#000000" d="M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5V7H21V5H3Z" />
                    </svg>
                </button>
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
            layout: 'settings'
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

        }
    }
}
</script>
