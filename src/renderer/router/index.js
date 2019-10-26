import Vue from 'vue'
import Router from 'vue-router'
import { RouteController } from '@modules/routeController'

Vue.use(Router)

let router = new Router({
    routes: [
        {
            path: '*',
            redirect: '/shelf'
        },
        {
            path: '/intro',
            name: 'intro-view',
            component: require('@views/IntroView').default
        },
        {
            path: "/shelf",
            name: "shelf-view",
            component: require("@views/ShelfView").default
        },
        // {
        //     path: '/',
        //     name: 'landing-page',
        //     component: require('@views/LandingPage').default
        // },
        {
            path: '/epub-reader/:id',
            name: 'reader',
            component: require('@views/ReaderView').default,
            props: true
        }
        // ,
        // {
        //     path: '/action/:name/:params?'
        // }
    ]
})

const Controller = new RouteController()

router.beforeEach(Controller.beforeEach.bind(Controller))
router.onError(Controller.onRouteError.bind(Controller))

router.push({path: '/shelf'})

export default router