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
import ShelfGridItem from "./ShelfGridItem";

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
    }
}
</script>
