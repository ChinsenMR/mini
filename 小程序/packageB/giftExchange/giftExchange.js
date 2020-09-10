let app =  getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    giftid:'',//礼品id
    id: '', //中奖纪录接口返回 Id
    imgList:[],//轮播图
    goods:{},//初始化对象
    show: false,//控制地址弹窗
    addresDefault:{},//默认地址
    shippingid:'',//地址id
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options", options);
    this.setData({
      giftid: options.giftid,
      id: options.id
    })
    this.getPointDetail(options.giftid);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let address = wx.getStorageSync('addressDefault');
    this.setData({
      shippingid: address.ShippingId,
      addresDefault: address
    })
  },
  //获取兑换详情
  getPointDetail(id){
    app.$api.getPointGoodsDetail({
      giftId:id,//	是	int	礼品id
    }).then(res=>{
      if(res.Code==1){
        let obj = res.Data;
        let arr = [];
        arr.push(obj.ImageUrl)
        const regex = new RegExp('<img', 'gi');
        obj.LongDescription = obj.LongDescription.replace(regex, `<img style="width: 100%;margin:0 auto;"`);
        this.setData({
          imgList:arr,
          goods:obj
        })
      }
    })
  },
  //立即兑换
  handleConvert(){
    const { giftid, id, shippingid, addresDefault } = this.data;
    if (!addresDefault.ShippingId || !shippingid  ){
      app.alert.toast('还没有选择默认的地址，请选择一个地址！');
      return
    }
    app.$api.submmitorder({
      from:'prize',//	是	string	传 prize
      giftId:giftid,//	是	int	礼品id（中奖纪录接口返回 PriceType=3的 PrizeValue）
      orderSource:8,//	是	int	6-app、8-小程序
      shippingId: shippingid || addresDefault.ShippingId,//	是	int	收货地址id
      RecordId:id,//	是	中奖纪录id	中奖纪录接口返回 Id
    }).then(res=>{
      if(res.Code==1){
        app.alert.toast('兑换成功!');
        setTimeout(() => {
          app.goTo('/pages/myOrder/myOrder?type=2', 2)
        }, 1500);
      }
    })
  },
  //确认地址获取地址id
  handleGetAddress(e){
    const { shippingid } = e.currentTarget.dataset;
    this.setData({
      shippingid,
      show: false
    })
  },


  //打开地址选择
  handleAdderss(){
    this.setData({ show: true })
  },
  //关闭
  handleOff(){
    this.setData({show:false})
  },
  //跳转选择地址
  handleSelect(){
    app.goTo('/pages/receivingAddress/receivingAddress')
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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