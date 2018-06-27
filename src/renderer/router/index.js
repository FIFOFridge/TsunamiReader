import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '*',
            redirect: '/'
        },
        {   
            path: '/main-view',
            name: 'main-view',
            component: require('@/components/MainView').default
        },
        {
            path: '/intro',
            name: 'intro',
            component: require('@/components/IntroView').default
        },
        {
            path: '/',
            name: 'landing-page',
            component: require('@/components/LandingPage').default
        }
    ]
})
