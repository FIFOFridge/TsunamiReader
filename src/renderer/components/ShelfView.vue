<template>
    <div>
        <app-titlebar></app-titlebar>
        <div class="window-content-container">
            <shelf-grid id="app-tiles-grid" style="width=100%; height: 100%;">
            </shelf-grid>
            <shelf-grid id="books-tiles-grid">
            </shelf-grid>
        </div>
    </div>
</template>

<style>
@import "/static/lib/lazygrid.css";
@import "/static/css/shelf.css";
@import "/static/css/shelfGrid.css";
</style>

<script>
import ShelfGrid from './ShelfView/ShelfGrid'
import AppTitlebar from './_shared/TitleBar.vue'

export default {
    components: {
        ShelfGrid,
        AppTitlebar
    }
}
</script>

