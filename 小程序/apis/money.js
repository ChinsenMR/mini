import $request from "../utils/tools/request"
export default {
  /**
   * 获取佣金提现初始化数据
   */
  getInitSplittinDraw(data){
    return $request({
      url:'/API/MembersHandler.ashx?action=InitSplittinDraw',
      data
    }).then(res=>res)
  },
  /**
   * 获取提现记录
   */
  getSplittinDrawRecords(data){
    return $request({
      url: '/API/MembersHandler.ashx?action=GetSplittinDrawRecords',
      data
    }).then(res=>res)
  },

   /**
   * 提交佣金提现信息--佣金提现(奖励金)
   */
   setSplittinDraws(data){
     return $request({
       url:'/API/MembersHandler.ashx?action=SplittinDraw',
       data
     }).then(res=>res)
   },
  /**
  * 获取拼团列表
  */
    groupList(data) {
      return $request({
        url: '/API/ProductHandler.ashx?action=GetFightGroupActivityInfos',
        data,
        hideToast: true
      }).then(res => res)
    },
  /**
  * 获取拼团详情
  */
  groupDetails(data) {
    return $request({
      url: '/API/OrdersHandler.ashx?action=FightGroupDetailsById',
      data
    }).then(res => res)
  },
   /**
  * 获得用户的账号金额
  */
  getAcccountMoney(data) {
    return $request({
      url: '/API/AccountDetailHandler.ashx?action=GetAcccountMoney',
      data
    }).then(res => res)
  },
  /**
  * 获得明细
  */
  getBalanceDetails(data) {
    return $request({
      url: '/API/AccountDetailHandler.ashx?action=GetBalanceDetails',
      data
    }).then(res => res)
  },
  /**
  * 获得提现的配置
  */
  getDrawSetting(data) {
    return $request({
      url: '/API/AccountDetailHandler.ashx?action=GetDrawSetting',
      data
    }).then(res => res)
  },

  
  /**
  * 获得可选银行
  */
  getBankList(data) {
    return $request({
      url: '/api/UserBank/GetBankList',
      data
    }).then(res => res)
  },
  
  /**
  * 获取银行列表 //
  */
  getUserAccountList(data) {
    return $request({
      url: '/api/UserBank/GetUserAccountList',
      data
    }).then(res => res)
  },
  //设置默认值
  setUserDefaultAccount(data) {
    return $request({
      url: '/api/UserBank/SetUserDefaultAccount',
      data,
      method: 'POST'
    }).then(res => res)
  },
   /**
  * 添加银行卡 
  */
  addUserAccount(data) {
    return $request({
      url: '/api/UserBank/AddUserAccount',
      data,
      method: 'POST'
    }).then(res => res)
  },

  /**
  * 删除银行卡 
  */
  deleteUserAccount(data) {
    return $request({
      url: '/api/UserBank/DeleteUserAccount',
      data,
      method: 'POST'
    }).then(res => res)
  },
  

  /**
  * 余额提现初始化(零售)
  */
  getInitDraw(data) { //
    return $request({
      url: '/API/MembersHandler.ashx?action=InitDraw',
      data
    }).then(res => res)
  }, 
  /**
  * 余额提现(零售)
  */
  requestBalanceDraw(data) { 
    return $request({
      url: '/api/VshopProcess.ashx?action=RequestBalanceDraw',
      data,
      // method: 'POST'
    }).then(res => res)
  }, 
  /**
  * 提现记录(提现申请记录)
  */
  drawRequestList(data) { 
    return $request({
      url: '/api/Member/GetDrawRequestList',
      data
    }).then(res => res)
  }, 
  
  /**
  * 会员权益 
  */
  userGradeInfo(data) { 
    return $request({
      url: '/api/Member/GetUserGradeInfo',
      data
    }).then(res => res)
  }, 
  /** 
 *  获取 预计收益
 */
  splittinDetails(data) {
    return $request({
      url: '/API/AccountDetailHandler.ashx?action=GetSplittinDetails',
      data
    }).then(res => res)
  },


  /**
  * 拼团规则 
  * */
  fightRule(data) {
    return $request({
      url: '/api/FightPromotion/GetFightRule',
      data
    }).then(res => res)
  }, 
  /**
  * 获取限时抢购活动列表 
  */
  countDownInfos(data) {
    return $request({
      url: '/API/ProductHandler.ashx?action=GetCountDownInfos',
      data
    }).then(res => res)
  }, 
  /**
  * 获取限时抢购商品 
  */
  countDonwInfoSkuList(data) {
    return $request({
      url: '/API/ProductHandler.ashx?action=GetCountDonwInfoSkuList',
      data
    }).then(res => res)
  }, 
  /**
  * 引导加群活动
  */
  checkIsShowAddGroup(data) {
    return $request({
      url: '/API/PublicHandler.ashx?action=CheckIsShowAddGroup',
      data,
      hideToast: true
    }).then(res => res)
  }, 

  /**
  * 素材库分类
  */
  shareSelfTags(data) {
    return $request({
      url: '/API/RequestHandler.ashx?action=GetShareSelfTags',
      data
    }).then(res => res)
  }, 

  /**
  * 素材库列表 
  */
  shareSelf(data) {
    return $request({
      url: '/API/RequestHandler.ashx?action=GetShareSelf',
      data
    }).then(res => res)
  }, 

  /**
  * 获取代理级别列表（导航栏）
  */
  referralGrades(data) {
    return $request({
      url: '/API/MembersHandler.ashx?action=GetReferralGrades',
      data
    }).then(res => res)
  }, 
  /**
  * 获取分销下属（）
  */
  mySubMembers(data) {
    return $request({
      url: '/API/MembersHandler.ashx?action=MySubMembers',
      data
    }).then(res => res)
  }, 
  /**
  * 默认会员升级商品等级数组
  */
  memberGradesProduct(data) {
    return $request({
      url: '/API/MembersHandler.ashx?action=GetMemberGradesProduct',
      data
    }).then(res => res)
  }, 
/**
 * 升级商品和猜你喜欢接口
 */
  gradeProducts(data) {
    return $request({
      url: '/api/ProductHandler.ashx?action=GetGradeProducts',
      data
    }).then((res) => res)
  },
  /**
  * 升级商品和猜你喜欢接口 
  */
  productsLive(data) {
    return $request({
      url: '/api/ProductHandler.ashx?action=GetProducts',
      data
    }).then((res) => res)
  },
  /**
  * 省市区获取地址id
  */
  regionIdByArea(data) {
    return $request({
      url: '/API/MembersHandler.ashx?action=GetRegionIdByArea',
      data
    }).then((res) => res)
  },
   /**
  * 新增地址 
  */
  addShipping(data) {
    return $request({
      url: '/API/MembersHandler.ashx?action=AddShippingAddress',
      data
    }).then((res) => res)
  },

}