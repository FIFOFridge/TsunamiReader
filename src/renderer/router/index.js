import Vue from 'vue'
import Router from 'vue-router'
//import appRouter from '../../modules/appRouter'

Vue.use(Router)

var router = new Router({
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

router.push({path: '/intro'})
//router.beforeEach = appRouter.beforeEach;

export default router;