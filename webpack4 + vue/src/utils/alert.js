export default {

    /* 提示信息 (需要按确认键) */
    confirm (title,msg,confirmFun) {
        this.ui.messageBox.alert(msg, title).then(action=>{
            if(typeof confirmFun == 'function' ){
                confirmFun();
            }
        });
    },

    /* 提示消息 */
    message: function (msg,time) {
        this.ui.toast({
            message: msg,
            position: 'bottom',
            duration: time || 3000
        });
    },

    /* 成功提示框 */
    success: function (msg, time, icon) {
        this.ui.toast({
            message: msg,
            iconClass: icon || 'ion-android-done',
            duration: time || 3000
        });
    },

    /* 错误提示框 */
    error: function (msg, time, icon) {
        this.ui.toast({
            message: msg,
            iconClass: icon || 'ion-alert-circled',
            duration: time || 3000
        });
    },

    /* 确认提示框 */
    confirm: function (msg,confirmFun,cancelFun) {
        this.ui.messageBox.confirm(msg).then(action => {
            if(typeof confirmFun == 'function' ){
                confirmFun();
            }
        }).catch(action =>{
            //取消后操作
            if(typeof cancelFun == 'function' ){
                cancelFun();
            }
        });
    },

    prompt: function (title, msg) {
        return this.ui.messageBox.prompt(msg, title);
    },

    /* 弹出加载中框 */
    loading: function (msg) {
        var data = msg || '加载中...';

        this.ui.indicator.open({
            text: data,
            spinnerType: 'fading-circle',
        });
    },

    /* 关闭加载中框 */
    closeLoading: function () {
        this.ui.indicator.close();
    }
}
