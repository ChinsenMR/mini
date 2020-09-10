import $request from "../utils/tools/request";
export default {
    /**
     * 获取首页自定义模板 
     * **/
    getCustomTemplate(data) {
        return $request({
            url: '/api/MiniPublic/GetShoptemplate',
            data,
            method: 'post',
            ignoreLogin: true
        }).then(res => res)
    },
    /**
     * 获取首页type=5的时候商品直播提示
     * **/
    getGradeProducts(data) {
        return $request({
            url: '/api/ProductHandler.ashx?action=GetGradeProducts',
            data,
            header: {},
            method: 'get',
            hideToast: true,
        }).then(res => res)
    },

    /**
     * 支付
     * **/
    getPaymentParams(data) {
        return $request({
            url: '/API/PublicHandler.ashx?action=GetPayParam',
            data
        }).then(res => res)
    },

}