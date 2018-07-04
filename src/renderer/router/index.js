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
            path: '/intro',
            name: 'intro-view',
            component: require('@/components/IntroView').default
        },
        {
            path: "/shelf",
            name: "shelf-view",
            component: require("@/components/ShelfView").default
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