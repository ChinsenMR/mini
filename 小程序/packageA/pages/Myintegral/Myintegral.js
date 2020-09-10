// packageA/pages/Myintegral/Myintegral.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    title: [{
      Name: '明细'
    }, {
      Name: '积分收入'
    }, {
      Name: '积分支出'
    }
   ],
    isShow:false,//
    alldata: {},//对象
    List: [],//数据列表
    pageIndex: 1
  },
  page:{
    index:1,
    size:10
  },
  total:1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.InitData(0)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
   
  },
  // 
  Selet(e) {
    this.page.index=1;
    this.setData({
      active: e.target.dataset.index,
      List: [],
    })
    let {active} = this.data
    if (active == 0) {
      this.InitData(0)
    }
    if (active == 1) {
      this.InitData(1)
    }
    if (active == 2) {
      this.InitData(2)
    }
  },
  
  /* 获取数据 */
  InitData(checkIndex) {
    app.$api.getPointDetail({
      pageIndex: this.page.index,
      pageSize: this.page.size,
      pointType: checkIndex,
    }).then((res) => {
      if(res.Code==1){
        let obj =res.Data;
        let arr = res.Data.Data;
        let all = obj.Total;
        if (all / this.page.size < this.page.index) {
          this.total = 1
        } else {
          this.total = Math.ceil(all / this.page.size);
        }
        let newArr = [...this.data.List, ...arr];
        this.setData({
          alldata: obj,
          List: newArr
        })
      }
    });
  },
  
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },


  /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
  onPullDownRefresh: function () {
    this.page.index = 1;
    let { active } = this.data
    this.setData({
      List: []
    });
    if (active == 0) {
      this.InitData(0)
    }
    if (active == 1) {
      this.InitData(1)
    }
    if (active == 2) {
      this.InitData(2)
    }
    //  结束下拉刷新组件的显示
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let { active } = this.data
    if (this.page.index >= this.total) {
      app.alert.toast('没有更多数据了!');
      this.setData({isShow:true})
    } else {
      this.page.index++
      if (active == 0) {
        this.InitData(0)
      }
      if (active == 1) {
        this.InitData(1)
      }
      if (active == 2) {
        this.InitData(2)
      }
    }
  },
 
})