const app =  getApp();
let WxParse = require('../../wxParse/wxParse');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    earnings: {},//收益数据
    astrict:{},//权限对象
    richSpan:'',//富文本
    realShow:false,//控制认证弹窗
    showBalance:false,//隐藏余额,只有是代理的时候才开放
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
    let user = wx.getStorageSync('userInfo');
    if(user){
      if (user.KjCustomId > 0) this.setData({ showBalance: true });//隐藏余额,只有是代理的时候才开放
      this.getMoney();
    }
    let bankDefault = wx.getStorageSync('bankDefault');
    if (!bankDefault){//不存在默认银行卡才调用
      this.getList();//获取默认银行卡
    }
  },
  //获取累计佣金(奖励金)
  getMoney() {
    app.$api.getAcccountMoney({
      MemberBanlanceTypeStr: '0,1',//0表示余额，1表示佣金，如果只查余额，就传0，如果佣金和余额都查，就传0，1
    }).then(res => {
      if (res.Status == "Success") {
        let arr = res.Data;
        let sum = 0, //总累计收益
          balance = 0, //余额(奖励)
          commission = 0;//佣金(零售)
        arr.map((v, i) => {
          sum += v.NowMoney;
          if (i == 0) {
            balance = v.NowMoney;
          } else {
            commission = v.NowMoney;
          }
        })
        let obj = {
          sum,
          balance,
          commission
        }
        this.setData({
          earnings: obj
        })
        this.allocation();
      }
    })
  },
  //获取提现配置,用于'是否开放提现和用户是否认证过了'的判断
  allocation(){
    app.$api.getDrawSetting({
      MemberBanlanceTypeStr:'0,1',//0表示余额，1表示佣金，如果只查余额，就传0，如果佣金和余额都查，就传0，1
    }).then(res=>{
      if (res.Status == "Success") {
        let arr = res.Data.DrawConfig;
        let balanceObj, commissionObj = {}
        arr.forEach((v,i)=>{
          if (i==0){
            balanceObj=v
          }else{
            commissionObj=v
          }
        })
        let obj = {
          balanceObj,
          commissionObj
        }
        let tip = res.Data.Tip;//富文本
        this.setData({
          astrict:obj,//用判断是否需要认证
          richSpan: tip
        })
      }
    })
  },
  //跳转提现
  handleClick(e){
    const { astrict } = this.data;
    const {type} = e.currentTarget.dataset;
    if(type==1){//零售收入
      let obj = astrict.balanceObj;
      if (!obj.IsCertification){//打开实名认证弹窗
        this.setData({
          realShow:true
        })
      } else if (!obj.IsOpenBalance){
        app.alert.toast('暂未开启提现功能,请到后台设置权限!');
      }else{
        app.goTo('/packageA/pages/withdrawApply/index?type=commission');//佣金
      }
    }else{//奖励收入
      let obj = astrict.commissionObj;
      if (!obj.IsCertification) {//打开实名认证弹窗
        this.setData({
          realShow: true
        })
      } else if (!obj.IsOpenBalance) {
        app.alert.toast('暂未开启提现功能,请到后台设置权限!');
      }else{
        app.goTo('/packageA/pages/withdrawApply/index?type=balance');//余额
      }
    }
  },
  //实名认证弹窗按钮
  handleChange(e){
    const { type } = e.currentTarget.dataset;
    if(type==1){//关闭
      this.setData({realShow: false})
    }else{
      app.goTo('/subPackageD/pages/authentication/realName')
    }
  },
  //获取银行看列表
  getList() {
    app.$api.getUserAccountList({
      pageIndex: 1,
      pageSize: 100
    }).then((res) => {
      if (res.Code == 1) {
        let arr = res.Data.Data;
        arr.sort(function (a, b) {//排序
          return b.IsDefault - a.IsDefault;
        })
        arr.forEach(v => {
          if (v.IsDefault) {
            wx.setStorageSync('bankDefault', v);
            v = v.AccountNo.substring(v.AccountNo.length - 4)
            this.setData({
              bankDefault: v
            })
          }
        })
      }
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({ realShow: false })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.setData({ realShow: false })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})