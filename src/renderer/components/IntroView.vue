<template>
        <full-page :options="options" id="fullpage" ref="fullpage">
            <div class="section" style="background-color: red;">
                <h3>vue-fullpage.js</h3>
            </div>
            <div class="section" style="background-color: black;">
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
            <div class="section" style="background-color: orange;">
                <h3>Section 3</h3>
            </div>
        </full-page>
</template>

<style>
/*@import url("static/css/titlebar.css");*/
</style>

<script>
import FullPage from './../../../node_modules/vue-fullpage.js/src/fullpage.vue'

export default {
    name: 'intro-view',
    components: {
        FullPage
    },
    props: {
        displayTitleBar: true,
        pageOptions: {
            navigation: true,
            anchors: ['page1', 'page2', 'page3'],
            sectionsColor: ['#41b883', '#ff5f45', '#0798ec', '#fec401', '#1bcee6', '#ee1a59', '#2c3e4f', '#ba5be9', '#b4b8ab']
        }
    },
    data: {

    }
}
</script>
