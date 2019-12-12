<!--suppress HtmlUnknownAttribute -->
<template>
    <div ref="modalObject" v-if="display === true" class="modal" :style="modalStyle">
        <div class="modal-bar">
            <span class="title">{{title}}</span>
            <span
                    v-if="closeable"
                    class="modal-button"
                    v-on:click="setDisplayState(false)"
            >
                <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
            </span>
            <span
                    v-if="toggleable"
                    class="modal-button"
                    v-on:click="setExpandState(!expanded)"
            >
                <svg style="width:24px;height:24px" viewBox="0 0 24 24">
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                </svg>
            </span>
        </div>
        <div :class="{userslot: true, expanded: expanded, collapsed: !expanded}">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        name: "Modal",
        data() {
            return {
                supress: false,
                expanded: false,
                display: Boolean
            }
        },
        props: {
            closeable: Boolean,
            toggleable: Boolean,
            top: String,
            left: String,
            width: String,
            // height: String,
            defaultDisplay: Boolean,
            defaultExpand: Boolean,
            title: String
        },
        created: function() {
            this.expanded = this.defaultExpand
            this.display = this.defaultDisplay
        },
        computed: {
            modalStyle: function () {
                return {
                    top: this.top,
                    left: this.left,
                    position: 'absolute',
                    width: this.width
                    // height: this.height
                }
            }
        },
        methods: {
            setDisplayState: function (display) {
                if(display !== true && display !== false)
                    throw new Error(`display have to be boolean`)

                this.display = display
            },
            setExpandState: function (expand) {
                if(expand !== true && expand !== false)
                    throw new Error(`expand have to be boolean`)

                console.log(`expand: ${expand}`)
                this.expanded = expand
            }
        }
    }
</script>

<style scoped>
    .modal {
        border: #707070 0.15em solid;
        background-color: #F1F1F1;
        border-radius: 28px;
        padding: 0.3em 0.4em;
    }

    .userslot {
        /*position: absolute;*/
    }

    .collapsed.userslot {
        position: absolute;
        visibility: hidden;
        height: 0 !important;
    }

    .userslot.expanded {
        visibility: visible;
        height: auto;
    }

    .modal-bar {
        width: 100%;
        display: inline-block;
    }

    .modal-bar.title {
        float: left;
    }

    .modal-bar * {
        float: right;
    }

    .modal-button > svg {
        fill: #3D3D3D;
        transition: fill 0.3s ease-in-out;
    }

    .modal-button:hover > svg {
        fill: black;
    }
</style>