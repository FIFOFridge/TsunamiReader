<template>
    <ul :class="[instance]" class="list-component" >
        <li v-bind:key="index" v-for="(item, index) in this.renderItems" :class="['eid-' + instance + '-' + index]">
            <button @click="_emitItemClick(index)" class="content-button">
                {{ item }}
            </button>
            <button v-if="removable" @click="removeItem(index)" class="interactive-button-hidden remove">
                <svg style="width:1.75em;height:1.75em" viewBox="0 0 24 24">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                </svg>
            </button>
        </li>
    </ul>
</template>

<style>
@import "/static/css/list.css";
</style>

<script>
export default {
    props: {
        items: {
            type: Array,
            required: true
        },
        id: {
            type: String,
            required: false,
            default: ''
        },
        removable: {
            type: Boolean,
            required: false,
            default: true
        }
    },
    data: function() {
        return {
            instance: '',
            renderItems: []
        }
    },
    created: function() {
        this.renderItems = this.items
        this.instance = Math.random().toString(20).substring(5);
    },
    methods: {
        removeItem(index) {
            if(!(this.removable))
                return
            
            let element = this.getElementAt(index)

            // element.classList.add('hide-me') TODO: fix hiding animation

            setTimeout(() => {
                this.renderItems.splice(index, 1)
            }, 120)

            // setTimeout(500, function() { this.renderItems.splice(index, 1) })
            this._emitCollectionChange()
        },
        getElementAt(index) {
            let el = '.eid-' + this.instance + '-' + index
            return document.querySelector(el)
        },
        _emitItemClick(index) {
            this.$emit('item-click', this.index)
        },
        _emitCollectionChange() {
            this.$emit('items-changed', this.renderItems)
        }
    }
}
</script>
