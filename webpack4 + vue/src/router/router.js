import Vue from 'vue'
import Router from 'vue-router'
import Home from '../pages/home/index.vue'
import Mine from '../pages/mine/index.vue'
Vue.use(Router);
export default new Router({
    routes: [{
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/mine',
            name: 'mine',
            component: Mine
        }
    ]
})