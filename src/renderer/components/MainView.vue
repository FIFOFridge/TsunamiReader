<template>
    <div>
        <app-titlebar></app-titlebar>
        <full-page>
            <div class="section">
                <div class="slide">
                    
                </div>

                <div class="slide">

                </div>
            </div>
        </full-page>
    </div>
</template>

<script>
import FullPage from './../../../node_modules/vue-fullpage.js/src/fullpage.vue'

export default {
    name: 'main-view',
    props: {
    },
    components: {
        FullPage
    }
}
</script>
