/*
 * 路由逻辑
 */

export default {
    data: {
        baseRoute: {},
        dynamicRoute: {},
        systemRoute: {},
        exampleRoute: {}
    },

    /* 定义路由 */
    routes: function () {
        var routes = [];
        var push;

        //加入系统路由
        for (var i in this.data.systemRoute) {
            push = {
                path: '/' + i,
                component: this.data.systemRoute[i]
            };
            routes.push(push);
        }

        //加入动态路由
        for (var i in this.data.dynamicRoute) {
            push = {
                path: '/' + i,
                component: this.data.dynamicRoute[i]
            };
            routes.push(push);
        }


        //加入基本路由
        for (var i in this.data.baseRoute) {
            var path;
            if (i == '/') {
                path = '';
            }
            else {
                path = i;
            }

            push = {
                path: '/' + path,
                component: this.data.baseRoute[i]
            };
            routes.push(push);
        }

        //加入示例路由
        for (var i in this.data.exampleRoute) {
            push = {
                path: '/' + i,
                component: this.data.exampleRoute[i]
            };
            routes.push(push);
        }

        //window.log.debug('定义的路由:', routes);
        return routes;
    }
}

