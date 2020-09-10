import $request from "../utils/tools/request";
export default {
    /**
     * 获取二维码 
     * **/
    getProductQrcode(data) {
        return $request({
            url: '/API/QrcodeHandler.ashx?action=GetProductQrcode',
            data,
            loadingText: '二维码生成中...',
        }).then(res => res)
    },

    /**
     * 获得商品详情根据商品id
     * **/
    getGoodsDetail(data) {
        return $request({
            url: '/AppShop/AppShopHandler.ashx?action=getProductDetail',
            data,
        }).then(res => res)
    },
    /* 获取购买的用户 */
    getBuyUserData(data) {
        return $request({
            url: '/api/VshopProcess.ashx?action=GetCustomOrderData',
            data,
        }).then(res => res)
    },
    /*收藏商品 */
    collect(data) {
        return $request({
            url: '/API/MembersHandler.ashx?action=AddFavorite',
            data,
        }).then(res => res)
    },
    /*商品评论列表 */
    loadReview(data) {
        return $request({
            url: '/API/ReviewHandler.ashx?action=LoadReviewYinLiu',
            data,
        }).then(res => res)
    },
    /**
     * 获取商品分享码的图片列表
     * **/
    producQrcodeList(data) {
        return $request({
            url: '/API/QrcodeHandler.ashx?action=GetProducQrcodeList',
            data,
            loadingText: '二维码生成中...',
        }).then(res => res)
    },
    /* 获取兑换码的商品 */
    getSkuByExchangeCode(data) {
        return $request({
            url: '/api/PublicHandler.ashx?action=GetSkuByExchangeCode',
            data
        }).then(res => res)
    },
    /* 生成兑换码订单 */
    exchangeCodeToOrder(data) {
        return $request({
            url: '/api/PublicHandler.ashx?action=ExchangeCodeToOrder',
            data
        }).then(res => res)
    },
     /* 获取兑换记录 */
     getMyExchangeCodeList(data) {
        return $request({
            url: '/api/PublicHandler.ashx?action=GetMyExchangeCodeList',
            data
        }).then(res => res)
    },
    
    
}