import Vue from 'vue'
import app from './app.vue'
import router from './router/router'
import tools from './utils/tools'
window.app = {
    tools,
    router
};


new Vue({
    el: '#app',
    router,
    render: (h) => h(app)
})