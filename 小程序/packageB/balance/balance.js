let app =  getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    navList:[
      {
        icon: app.data.imgurl +'icon_jilv@2x.png',
        name:'提现记录',
        url:'/packageB/particulars/particulars?type=1'
      },
      {
        icon: app.data.imgurl + 'icon_yue@2x.png',
        name: '余额明细',
        url: '/packageB/particulars/particulars?type=0'
      },
      {
        icon: app.data.imgurl + 'icon_yujishouyi@2x.png',
        name: '收益明细',
        url: '/packageA/pages/commission/commission'
      },
      {
        icon: app.data.imgurl + 'icon_yinhangka@2x.png',
        name: '银行卡',
        url: '/packageA/pages/withdrawApply/bankCardList?BankStatus=bancks',
      },
    ],
    realShow: false,//控制认证弹窗
    astrict: {},//权限对象
    priceSum: {},//账户余额(是总余额,佣金和余额的总和)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMoney();
    this.allocation();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  //获取账户余额
  getMoney(){
    app.$api.getAcccountMoney({
      MemberBanlanceTypeStr: '0,1',//是一个 以，分隔的查询类型 ，0表示余额，1表示佣金，如果只查余额，就传0，如果佣金和余额都查，就传0，1
    }).then(res=>{
      if(res.Status=="Success"){
        let arr = res.Data;
        let sum = 0, //账户余额
          balance = 0, //余额(零售)
          commission = 0;//佣金(奖励金)
        arr.forEach((v,i)=>{
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
          priceSum: obj
        })
      }
    })
  },

  //获取提现配置,用于'是否开放提现和用户是否认证过了'的判断
  allocation() {
    app.$api.getDrawSetting({
      MemberBanlanceTypeStr: '0,1',//0表示余额，1表示佣金，如果只查余额，就传0，如果佣金和余额都查，就传0，1
    }).then(res => {
      if (res.Status == "Success") {
        let arr = res.Data.DrawConfig;
        let balanceObj, commissionObj = {}
        arr.forEach((v, i) => {
          if (i == 0) {
            balanceObj = v
          } else {
            commissionObj = v
          }
        })
        let obj = {
          balanceObj,
          commissionObj
        }
        let tip = res.Data.Tip;//富文本
        this.setData({
          astrict: obj,//用判断是否需要认证
        })
      }
    })
  },
  //实名认证弹窗按钮
  handleChange(e) {
    const { type } = e.currentTarget.dataset;
    if (type == 1) {//关闭
      this.setData({ realShow: false })
    } else {
      app.goTo('/subPackageD/pages/authentication/realName')
    }
  },
  //跳转
  handleGo(e){
    const { astrict } = this.data;
    let obj1 = astrict.balanceObj;
    let obj2 = astrict.commissionObj;
    const { type, url} = e.currentTarget.dataset;
    if(type==1){
      app.goTo('/packageB/canWithdraw/canWithdraw')
    }else{
      if (url.includes('bancks')){
        if (!obj1.IsCertification || !obj2.IsCertification) {//打开实名认证弹窗
          this.setData({realShow: true})
        }else{
          app.goTo(url)
        }
      }else{
        app.goTo(url)
      }
    }
    
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