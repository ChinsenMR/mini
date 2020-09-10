import $request from "../utils/tools/request";
export default {
    /**
     * 获取分销订单列表
     *  */
    getDistributorOrderList(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=DistributorOrderList',
            data
        }).then(res => res)
    },

    /**
     * 用户获取退货信息
     */
    getOrderReturn(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=GetOrderReturn',
            data
        }).then((res) => res);
    },
    /**
     * 退款详情
     */
    getOrderRefund(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=GetOrderRefund',
            data
        }).then((res) => res);
    },

    /**
     * 商家售后确认收货
     * */
    finishReturn(data) {
        return $request({
            method: 'POST',
            url: '/API/OrdersHandler.ashx?action=FinishReturn',
            data
        }).then(
            (res) => res
        );
    },
    /**
     * 代理审核退货
     * */
    auditSaleReturn(data) {
        return $request({
            url: '/api/Order/AuitSaleReturnDistributor',
            data,
            method: 'post'
        }).then((res) => res);
    },
    /**
     * 代理审核退款
     * */
    auditSaleRefund(data) {
        return $request({
            url: '/api/Order/AuitSaleRefundDistributor',
            data,
            method: 'post'
        }).then((res) => res);
    },
    /**
     * 用户发货
     */
    returnSendGoods(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=ReturnSendGoods',
            data
        }).then((res) => res);
    },

    /**
     * 用户获取退货进度
     */
    getReturnFlow(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=GetReturnFlow',
            data
        }).then((res) => res);
    },
    /**
     *  初始化退款页面
     */
    initAfterSaleInfo(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=InitApplyRefund',
            data
        }).then((res) => res);
    },

    /**
     * 查看物流详情
     * @param {*} data 
     */
    checkExpressDetail(data) {
        return $request({
            url: '/API/RequestHandler.ashx?action=GetOrderExpress',
            data
        }).then(
            (res) => res
        );
    },

    /**
     * 申请退货接口
     */
    applyReturn(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=ApplyReturn',
            data
        }).then((res) => res);
    },

    /** 
     *  申请退款接口
     */
    applyRefund(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=ApplyRefund',
            data
        }).then((res) => res)
    },
    /**
     * 快递信息
     */
    getKD100(data) {
        return $request({
            url: '/AppShop/AppShopHandler.ashx?action=GetKD100',
            data
        }).then((res) => res);
    },
    /**
     * 确认收货
     */
    handleFinishOrder(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=FinishOrder',
            data,

        }).then((res) => res);
    },
    /* 最新获取物流信息 */
    getExpressInfo(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=SearchExpressData',
            data
        }).then((res) => res)
    },
    /**
     * 订单详情
     * **/
    getOrderDetail(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=GetOrderDetail',
            data
        }).then((res) => res);
    },

    /**
     * 获取订单信息
     * **/
    getOrderInfo(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=GetShoppingCart',
            data
        }).then(res => res)
    },

    /**
     * 更新订单
     * **/
    submitOrderInfo(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=SubmitOrder',
            data
        }).then(res => res)
    },

    /**
     * 获取订单参数
     * **/
    confirmOrder(data) {
        return $request({
            url: '/API/PublicHandler.ashx?action=GetPayParam',
            data
        }).then(res => res)
    },
    /* 代理发货 */
    sendGoodsByAgent(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=KjSendGoods',
            data
        }).then(res => res)
    },
    /**
     * 我的订单列表
     * **/
    getOrderList(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=OrderList',
            data
        }).then(res => res)
    },
    /**
     * 取消订单
     * **/
    cancelOrder(data) {
        return $request({
            url: '/API/OrdersHandler.ashx?action=CloseOrder',
            data
        }).then(res => res)
    },
}