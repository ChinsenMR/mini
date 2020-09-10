let app =  getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    list:[],
    showData:false,
  },
  page:{
    index:1,
    size:10
  },
  total:1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCurrUserAcceptPrize();
    this.getDefaultAddress();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  //获取中奖纪录
  getCurrUserAcceptPrize(){
    app.$api.currUserAcceptPrize({
      pageIndex: this.page.index,
      pageSize: this.page.size
    }).then(res=>{
      if(res.Code==1){
        let arr = res.Data.rows;
        let all = res.Data.total;
        if (all / this.page.size < this.page.index) {
          this.total = 1
        } else {
          this.total = Math.ceil(all / this.page.size);
        }
        let newArr = [...this.data.list, ...arr];
        this.setData({
          list: newArr
        })
      }
    })
  },
  //跳转
  handleGo(e){
    const { type, status, giftid,id,item} = e.currentTarget.dataset;
    console.log("跳转",item);
    if(type==1){//积分商城  
      app.goTo('/packageA/pages/Myintegral/Myintegral')
    }else if(type==2){
      app.goTo('/packageA/pages/MyCoupon/MyCoupon')
    }else if(type==3){
      if (status==1){//去兑换礼品
        app.goTo(`/packageB/giftExchange/giftExchange?giftid=${giftid}&id=${id}`)
      }else{//已领取 不做操作

      }
    }
    
  },
  /* 获取默认地址 在兑换页面使用*/
  getDefaultAddress() {
    app.$api.getAddressList().then(res => {
      if (res.success) {
        let arr = res.Data;
        if(arr.length!=0){
          arr.forEach(v => {
            if (v.IsDefault) {
              wx.setStorageSync('addressDefault', v);
            }
          })
        }
      }
    })
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
    this.page.index = 1;
    this.setData({
      list: []
    });
    this.getCurrUserAcceptPrize();
    //  结束下拉刷新组件的显示
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.page.index >= this.total) {
      app.fa('没有更多数据了!');
      this.setData({ showData:true })
    } else {
      this.page.index++
      this.getCurrUserAcceptPrize();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})