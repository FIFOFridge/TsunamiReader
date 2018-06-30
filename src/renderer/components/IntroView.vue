<template>
        <div>
            <div id="background"></div>
            <app-titlebar></app-titlebar>
            <full-page :options="options" id="fullpage" ref="fullpage">
                <div class="section">
                    <h3>vue-fullpage.js</h3>
                </div>
                <div class="section">
                    <div class="slide">
                        <h3>Slide 2.1</h3>
                    </div>
                    <div class="slide">
                        <h3>Slide 2.2</h3>
                    </div>
                    <div class="slide">
                        <h3>Slide 2.3</h3>
                    </div>
                </div>
                <div class="section">
                    <h3>Section 3</h3>
                </div>
            </full-page>
        </div>
</template>

<style>
/*@import url("static/css/titlebar.css");*/
#background {
    position: fixed;
    width: 100%;
    height: 100%;
    top: 0px;
    left: 0px;
    background-image:url('/static/assets/wave.jpg');
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    z-index: -1;
    -webkit-filter: contrast(55%) grayscale(85%);  /* Safari 6.0 - 9.0 */
    filter: contrast(55%) grayscale(85%);
}


</style>

<script>
import FullPage from './../../../node_modules/vue-fullpage.js/src/fullpage.vue'
import AppTitlebar from './_shared/TitleBar.vue'

export default {
    name: 'intro-view',
    components: {
        FullPage,
        AppTitlebar
    },
    props: {
        displayTitleBar: true,
        pageOptions: {
            navigation: true
        }
    },
    data: {

    }
}
</script>
