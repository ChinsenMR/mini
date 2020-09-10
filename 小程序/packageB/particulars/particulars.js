const app =  getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    navList:['余额明细','提现记录'],
    nums:1,//初始默认选中
    list:[],//余额明细
    darwList:[],//提现申请记录
  },
  page:{
    index:1,
    size:10,
  },
  total:1,//总页码
  darw:{
    index:1,
    size:10
  },
  darwTotal:1,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      nums: options.type
    })
    this.getDetails();
    this.getDrawRequestList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  //获取提现记录getDrawRecords
  getDetails(){
    app.alert.loading();
    app.$api.getBalanceDetails({
      pageIndex: this.page.index,
      pageSize: this.page.size
    }).then(res=>{
      if(res.Status=="Success"){
        wx.hideLoading();
        let arr =res.Data;
        let all = res.TotalRecords;
        if (all / this.page.size < this.page.index) {
          this.total = 1
        } else {
          this.total = Math.ceil(all / this.page.size);
        }
        let newArr = [...this.data.list, ...arr];
        this.setData({
          list:newArr
        })
      }
    })
  },
  //获取提现申请记录
  getDrawRequestList(){
    app.$api.drawRequestList({
      pageIndex: this.darw.index,
      pageSize: this.darw.size
    }).then(res=>{
      if(res.Code==1){
        let arr = res.Data.Data;
        let all = res.Data.TotalRecords;
        if (all / this.darw.size < this.darw.index) {
          this.darwTotal = 1
        } else {
          this.darwTotal = Math.ceil(all / this.darw.size);
        }
        arr.forEach(v=>{
          if (v.Account){
            v.newAccount = v.Account.substring(v.Account.length - 4)
          }
        })
        let newArr = [...this.data.darwList, ...arr];
        this.setData({
          darwList: newArr
        })
      }
    })
  },

  //导航栏切换
  handleChange(e){
    const {index} = e.currentTarget.dataset;
    this.setData({
      nums:index
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
    const { nums } = this.data;
    if (nums == 0){
      this.page.index = 1;
      this.setData({
        list: []
      });
      this.getDetails();
    }else{
      this.draw.index = 1;
      this.setData({
        darwList: []
      });
      this.getDrawRequestList();
    }
    
    //  结束下拉刷新组件的显示
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const {nums} = this.data;
    if(nums==0){//余额明细
      if (this.page.index >= this.total) {
        app.fa('没有更多数据了!')
      } else {
        this.page.index++
        this.getDetails();
      }
    } else {//提现记录 
      if (this.draw.index >= this.drawTotal) {
        app.fa('没有更多数据了!')
      } else {
        this.draw.index++
        this.getDrawRequestList();
      }
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})