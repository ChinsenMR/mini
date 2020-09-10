import Vue from 'vue';
import wx from 'weixin-js-sdk';

Vue.mixin({
    /* 全局方法 */
    methods: {
        /* 默认图片过滤 */
        thumbnail: function(val, size) {
            let img_size = '?x-oss-process=image/resize,w_' + size;
            return !val ? app.defaultImg() : val + (!size ? '' : img_size);
        },

        /* 跳转 */
        toUrl: function(url, val) {
            tools.router.push({ path: url, query: val });
        },

        toReplace(url, val) {
            tools.router.replace({ path: url, query: val });
        },

        /* 查看大图 */
        seeImg: function(imgUrl, arr) {
            let imgArr = arr;
            if (arr === undefined) {
                imgArr = [imgUrl];
            }
            app.seeImg(imgUrl, imgArr);
        },
    },
    /* 全局过滤 */
    filters: {
        /* 默认图片过滤 */
        thumbnail: function(val, size) {
            let img_size = '?x-oss-process=image/resize,w_' + size;
            return !val ? app.defaultImg() : val + (!size ? '' : img_size);
        },

        /* 时间转换 */
        timeTran: function(value) {
            return parseInt(value) === 0 ? '-' : tools.date('Y-m-d H:i:s', value);
        },

        /* 自定时间格式转换 */
        setTimeTran: function(value, type) {
            return parseInt(value) === 0 ? '-' : tools.date(type, value);
        },

        /* 价格转换--保留两位小数 */
        toFixedPrice: function(value) {
            return value ? (parseInt(value) / 100).toFixed(2) : '0';
        },

        /* 价格转换 */
        toPrice: function(value) {
            return value ? (parseInt(value) / 100) : '0';
        },

        /* 时间转换 */
        dayTimeTran: function(value) {
            let dayTime = new Date().getTime();
            let t = parseInt((dayTime - value) / 1000);

            if (t > 3600) {
                return parseInt(value) === 0 ? '-' : tools.date('Y-m-d H:i:s', value);
            } else if (t < 60) {
                return '刚刚';
            } else {
                return parseInt(t / 60) + '分钟前';
            }

        },

    }
});

// 编辑器下载附件的方法
window.attach_download = function(e) {
    e = e || window.event;
    // console.log(e.target.getAttribute('src'))
    if (app.isWeChat() && app.device().ios) {
        tools.alert.error('请在浏览器中打开下载');
        return;
    }
    window.location.href = e.target.getAttribute('src');
}

Vue.prototype.wxShare = function(obj) {
    let data = {
        ajax_data: {},
        api_type: 'POST',
        api_list: [],
        hide_menu_items: [],
        show_menu_items: [],
        debug: false
    }

    Object.assign(data, obj);

    data.api_list.push('hideMenuItems');
    data.api_list.push('showMenuItems');

    //默认为分享朋友圈和好友
    data.api_list.push('onMenuShareTimeline');
    data.api_list.push('onMenuShareAppMessage');

    tools.request.GetWechatSignPackage(data.ajax_data, res => {
        let _config = res.signPackage,
            //全局配置
            config = {
                debug: data.debug,
                appId: _config.appId,
                timestamp: _config.timestamp,
                nonceStr: _config.nonceStr,
                signature: _config.signature,
                jsApiList: data.api_list
            };
        wx.config(config);

        wx.ready(function() {

            // 分享到朋友圈
            wx.onMenuShareTimeline({
                title: data.title, // 分享标题
                link: data.url, // 分享链接
                imgUrl: data.img, // 分享图标
                success: function() {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function() {
                    // 用户取消分享后执行的回调函数
                }
            });

            // 分享给朋友
            wx.onMenuShareAppMessage({
                title: data.title, // 分享标题
                desc: data.desc, // 分享描述
                link: data.url, // 分享链接
                imgUrl: data.img, // 分享图标
                type: 'link', // 分享类型,music、video或link，不填默认为link
                dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
                success: function() {
                    // 用户确认分享后执行的回调函数
                },
                cancel: function() {
                    // 用户取消分享后执行的回调函数
                }
            });

            wx.hideMenuItems({
                menuList: data.hide_menu_items // 要隐藏的菜单项，只能隐藏“传播类”和“保护类”按钮
            });

            wx.showMenuItems({
                menuList: data.show_menu_items // 要显示的菜单项
            });

            //注册微信播放录音结束事件
            // wx.onVoicePlayEnd({
            //     success: function (res) {
            //         stopWave();
            //     }
            // });
        })

    })


}