import $request from "../utils/tools/request";

export default {
    /**
     * 获取购物车列表 
     * **/
    getCartList(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=getShoppingCartList',
            data,
            ignoreLogin: true
        }).then(res => res)
    },

    /* 删除购物车商品 */
    removeGoods(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=delCartItem',
            data,
        }).then(res => res)
    },

    /* 修改购物车商品数量 */
    editGoodsCount(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=ChageCartQuantity',
            data,
            hideLoading: true
        }).then(res => res)
    },
    

}