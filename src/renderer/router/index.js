import Vue from 'vue'
import Router from 'vue-router'
import windowRouter from '../../modules/windowRouter'

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
        },
        {
            path: '/epub-reader/:filePath/:opt?',
            name: 'reader',
            component: require('@/components/ReaderView').default
        },
        {
            path: '/action/:name/:params?'
        }
    ]
})


router.beforeEach((to, from, next) => {
    windowRouter.beforeEach(to, from, next)
})

router.push({path: '/epub-reader/test'})

export default router;