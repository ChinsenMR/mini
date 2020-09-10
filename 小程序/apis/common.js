import $request from "../utils/tools/request";
export default {
    // 获取收货地址列表
    getAddressList(data) {
        return $request({
            url: '/API/MembersHandler.ashx?action=GetUserShippingAddress',
            data
        }).then(res => res)
    },

    // 设置默认地址
    setDefaultAddress(data) {
        return $request({
            url: '/API/MembersHandler.ashx?action=SetDefaultShippingAddress',
            data
        }).then(res => res)
    },
    /**
     *编辑个人信息
     */
    updateAgentInfo(data) {
        return $request({
            method: "POST",
            url: '/api/Member/UpdateAgentInfo',
            data
        }).then(res => res)
    },
    /** 
     *  用户签署协议
     */
    signAgreement(data) {
        return $request({
            url: '/API/PublicHandler.ashx?action=SignAgreement',
            data
        }).then((res) => res)
    },
    /** 
     *  获取特定协议内容
     */
    getAgreement(data) {
        return $request({
            url: '/API/PublicHandler.ashx?action=GetAgreementById',
            data
        }).then((res) => res)
    },
    /** 
     * 获取店铺资质信息
     */
    getAgentInfoByDistributorSystem(data) {
        return $request({
            url: '/api/Member/GetAgentInfoByDistributorSystem',
            data,
            method: 'POST'
        }).then((res) => res)
    },

    /**
     * 获取申请会员信息
     */
    getStatusMemberBalanceApplyAuitList(data) {
        return $request({
            url: '/api/Member/GetStatusMemberBalanceApplyAuitList',
            data,
            method: 'POST'
        }).then((res) => res)
    },
    /**
     * 提交认证信息
     */
    submitMemberInfo(data) {
        return $request({
            url: '/api/Member/SetMemberAuto',
            data,
            method: 'POST'
        }).then((res) => res)
    },
    /**
     * 初始化交易信息
     */
    initDraw(data) {
        return $request({
            url: '/API/MembersHandler.ashx?action=InitDraw',
            data,
            method: 'POST'
        }).then((res) => res)
    },

    /** 
     * 福利商城商品列表
     */
    getWelfareShopGoodsList(data) {
        return $request({
            url: '/api/ProductHandler.ashx?action=GetProducts',
            data
        }).then((res) => res)
    },
    /** 
     * 福利商城商品列表
     */
    getAgreeList(data) {
        return $request({
            url: '/api/Member/GetAgreeList',
            data,
            method: 'post'
        }).then((res) => res)
    },
    /** 
     * 获取满减详情列表
     */

    getFullReductionList(data) {
        return $request({
            url: '/api/FullReductionPromotion/FullReductionList',
            data,
            method: 'post'
        }).then((res) => res)
    },
    /** 
     * 获取满减商品列表
     */
    getFullAmountReduxcedProductAllList(data) {
        return $request({
            url: '/api/FullReductionPromotion/FullAmountReduxcedProductAllList',
            data,
            method: 'post'
        }).then((res) => res)
    },
    /** 
     * 获取满减商品列表
     */
    getProductsByCoupon(data) {
        return $request({
            url: '/api/ProductHandler.ashx?action=GetProducts',
            data,
        }).then((res) => res)
    },
    /* 领取优惠券 */
    receiveCoupon(data) {
        return $request({
            url: '/APIFH/CouponsHandler.ashx?action=UserGetCoupon',
            data
        }).then(res => res)
    },
    /* 直属上级信息 */
    getMyReferral(data) {
        return $request({
            url: '/API/MembersHandler.ashx?action=GetMyReferral',
            data
        }).then(res => res)
    },
    
    

}