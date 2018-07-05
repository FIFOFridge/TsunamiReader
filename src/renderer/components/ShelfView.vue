<template>
    <div class="window-content-container">
        <shelf-grid style="width=100%; height: 100%;">
        </shelf-grid>
    </div>
</template>

<style>
@import "/static/lib/lazygrid.css";
@import "/static/css/shelf.css";
</style>

<script>
import ShelfGrid from './ShelfView/ShelfGrid'

export default {
    components: {
        ShelfGrid
    }
}
</script>

