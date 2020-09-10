export default {
    /* 连接socket */
    connect: function(obj) {
        var that = this;

        obj = obj || {};
        var data = {
            path: obj.path || 'ws://127.0.0.1', //wesocket的地址
            message: obj.message || '', //收到信息时的回调函数
            close: obj.close || '', //连接关闭时回调函数
            error: obj.error || '', //连接失败时回调函数
            onopen: obj.onopen || '', //连接成功时回调函数
            loginApi: obj.loginApi || '/', //登录接口地址
            loginType: obj.loginType || 'login' //登录类型
        };

        var socket = new WebSocket(obj.path);

        //监听Socket的错误
        socket.onerror = function(event) {
            log.debug('socket连接失败!', event);
            if (typeof data.error == 'function') {
                data.error(event);
            }
        };

        // 监听Socket的关闭
        socket.onclose = function(event) {
            log.debug('socket已关闭!', event);
            if (typeof data.close == 'function') {
                data.close(event);
            }
        };

        // 监听Socket的收到信息
        socket.onmessage = function(event) {
            log.debug('收到socket信息!', event, JSON.parse(event.data));

            var getData = JSON.parse(event.data);

            if (getData.content.type === 'reply_init') { //收到初始化请求
                //登录
                that.login(data.loginApi, data.loginType, getData.content.msg.client_id);
            } else if (getData.content.type === 'login_success') { //收到成功登录提示
                log.debug('登录成功');
                //拉取未读消息
            }

            if (typeof data.message == 'function') {
                data.message(event, getData);
            }
        };

        //监听Socket的打开
        socket.onopen = function(event) {
            log.debug('socket连接成功!');

            //记录到变量中
            window.socket.obj = socket;

            // 发送一个初始化消息
            that.send('init', {});

            if (typeof data.onopen == 'function') {
                data.onopen(event);
            }
        };
    },

    /* 关闭连接 */
    close: function() {
        window.socket.obj.close();
        window.socket.obj = {};
    },

    /* 发送消息 */
    send: function(type, data) {
        var send_data = data || '';
        var guid = window.tools.get.guid();

        var result = this.filterContent(type, send_data, guid);
        window.socket.obj.send(result);

        return guid;
    },

    /* 修正内容格式 */
    filterContent: function(type, data, guid) {
        var content = {};
        content.content = {};
        var get_data = data || {};

        for (var item in get_data) {
            content.content[item] = get_data[item];
        }

        console.log(guid);
        content.guid = guid;
        content.content.type = type;

        console.log(content.content);

        return JSON.stringify(content);
    },

    /* 获取登录token */
    login: function(apiUrl, loginType, client_id) {
        var that = this;
        // console.log(666);
        tools.ajax({
            url: apiUrl,
            ajaxData: {
                client_id: client_id
            },
            successFun: function(res) {


            },
            errorFun: function() {
                tools.alert.loading('登录失败,尝试重新登录中..');
                setTimeout(function() {
                    that.login(apiUrl, loginType, client_id);
                }, 5000);
            },
            type: 'POST'
        });
    }


}