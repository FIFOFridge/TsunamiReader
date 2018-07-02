<template>
        <div>
            <div id="background"></div>
            <app-titlebar is-fixed="true"></app-titlebar>
            <full-page :options="pageOptions" id="fullpage" ref="fullpage">
                <div class="section">
                    <div class="window-content-container">
                        <div class="lazy-grid no-space">
                            <div class="row center-content">
                                <div class="row-8">
                                    <img id="logo" src="/static/assets/TRLogo.svg"/>
                                </div>
                            </div>
                        </div>
                    </div>
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
                <div class="section">
                    <h1>about</h1>
                </div>
            </full-page>
            <!--
            <div id="fp-nav" class="right">
                <ul>
                    <li>
                        <a class="active" href="intro"><span></span></a>
                    </li>
                    <li>
                        <a class="" href="shelf"><span></span></a>
                    </li>
                    <li>
                        <a class="" href="about"><span></span></a>
                    </li>
                </ul>
            </div>-->
        </div>
</template>

<style>
@import url("/static/css/titlebar.css");
@import url("/static/css/intro.css");
@import url('/static/lib/lazygrid.css');

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
}


</style>

<script>
//components
import FullPage from './../../../node_modules/vue-fullpage.js/src/fullpage.vue'
import AppTitlebar from './_shared/TitleBar.vue'

//logs
import exconsole from './../../modules/helpers/loggerConsole'
import logger from './../../modules/helpers/logger'

let con = exconsole(logger, console)

export default {
    name: 'intro-view',
    components: {
        FullPage,
        AppTitlebar
    },
    props: {
        displayTitleBar: true
    },
    data() {
        return {
            pageOptions: {
                anchors: ['intro','shelf', 'reader', 'about'],

                navigation: true,
                navigationPosition: 'right',
                fixedElements: '#background,.titlebar',
                afterLoad: this.onSectionLoad,
                onLeave: this.onSectionLeave
            }
        } 
    },
    computed: {
        getBackgroundElement: function() {
            return document.getElementById('background')
        }
    },
    methods: {
        onSectionLoad: function(origin, destination, direction) {
            con.debug('IntroView loaded section: ' + destination + ' from ' + origin)

            if(destination == '1' || destination == 'intro')
                this.getBackgroundElement.classList.add('intro')
            else if(destination == '2' || destination == 'shelf')
                this.getBackgroundElement.classList.add('shelf')
            else if(destination == '3' || destination == 'reader')
                this.getBackgroundElement.classList.add('reader')
            else if(destination == '4' || destination == 'about')
                this.getBackgroundElement.classList.add('about')
        },
        onSectionLeave: function(origin, destination, direction) {
            con.debug('IntroView leaving section: ' + origin + ' to ' + destination)
            if(origin == '1' || origin == 'intro')
                this.getBackgroundElement.classList.remove('intro')
            else if(origin == '2' || origin == 'shelf')
                this.getBackgroundElement.classList.remove('shelf')
            else if(origin == '3' || origin == 'reader')
                this.getBackgroundElement.classList.remove('reader')
            else if(origin == '4' || origin == 'about')
                this.getBackgroundElement.classList.remove('about')
        }
    }
}
</script>
