<template>
        <div class="grid-container">
            <template v-for="(tile, index) in this.sourceTiles">
                <shelf-grid-item :key="index"
                    :icon="tile.icon"
                    :book-object="tile.bookObject"
                    :link="tile.link"
                    :id="tile.id"
                    :descriptionShort="tile.descriptionShort"
                    :tileState="tile.tileState"
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
import ShelfGridItem from "./ShelfGridItem";
import { state } from './ShelfGridItemState'

export default {
    name: 'shelf-grid',
    components: {
        ShelfGridItem
    },
    mounted: function() {
    },
    data: function() {
        return {
            tiles: []
        }
    },
    methods: {
        changeItemState: function (index, newState) {
            if(
                newState !== state.Disabled &&
                newState !== state.Enabled
            )
                throw new Error(`invalid state`)

            this.$set(this.sourceTiles[index], 'tileState', newState)
        }
    },
    props: {
        sourceTiles: Array
    },
    watch: {
        sourceTiles: function(val) {
            this.tiles = val
        },
    }
}
</script>
