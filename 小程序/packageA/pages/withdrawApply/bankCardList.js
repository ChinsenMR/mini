const app =  getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    delete: false,
    startX: 0,
    list: [],
    fromType: "",
    showBtn: false,
    isShow:true,//显示没有更多数据
    BankStatus:null,//用于判断从那个页面过来的
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
    this.setData({
      BankStatus: options.BankStatus
    })
    this.getList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (opt) {
    
  },
  //获取银行看列表
  getList() {
    app.$api.getUserAccountList({
      pageIndex:this.page.index,
      pageSize:this.page.size
    }).then((res) => {
      if(res.Code==1){
        let arr = res.Data.Data;
        let all = res.Data.TotalRecords;
        if (all / this.page.size < this.page.index) {
          this.total = 1
        } else {
          this.total = Math.ceil(all / this.page.size);
        }
        arr.sort(function (a, b) {//排序
          return b.IsDefault - a.IsDefault;
        })
        arr.forEach(v=>{
          if (v.IsDefault){
            wx.setStorageSync('bankDefault', v);
          }
        })
        let newArr = [...this.data.list, ...arr];
        this.setData({
          list: newArr
        })
      }
    });
  },
  //显示绑定按钮
  showRemoveBtn() {
    this.setData({ showBtn: !this.data.showBtn });
  },
  //删除银行卡
  bindDelete(e) {
    let that = this;
    wx.showModal({
      title: "提示",
      content: "确定解绑该卡",
      confirmColor: "#0081CC",
      success(res) {
        if (res.confirm) {
          const {
            currentTarget: {
              dataset: { id },
            },
          } = e;
          app.$api.deleteUserAccount({ 
            Id:id,//银行卡id
          }).then((res) => {
            if (res.Code == 1) {
                app.alert.toast(res.Msg);
                that.setData({
                  list:[]
                })
                that.getList();
              }
            }
          );
        } else {
        }
      },
    });
  },
  //添加银行卡
  goAddBank() {
    app.goTo('/packageA/pages/withdrawApply/bankCardAdd');
    this.setData({list:[]});
  },
  //设置默认银行卡
  selectBankCardItem(e){
    const { item } = e.currentTarget.dataset;
    if (item.IsDefault){//已经是默认就不需要显示弹窗
      this.banckDefault(item)
    }else{
      wx.showModal({
        title: '设置默认',
        content: '是否设置为默认？',
        showCancel: true,
        cancelText: '取消',
        cancelColor: '#000000',
        confirmText: '确定',
        confirmColor: '#3CC51F',
        success: (result) => {
          if (result.confirm) {
            this.banckDefault(item)
          }
        },
        fail: () => { },
        complete: () => { }
      });
    }
  },
  //设置默认银行的方法
  banckDefault(item){
    const { BankStatus } = this.data;
    app.$api.setUserDefaultAccount({
      id: item.Id
    }).then(res => {
      if (res.Code == 1) {
        app.alert.toast(res.Msg);
        if (BankStatus != 'bancks') {//设置默认银行卡返回上一页
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 500);
        } else {
          if (item.IsDefault){//如果点击默认的银行卡，就是提示
            app.alert.toast('已是默认银行卡')
            
          }else{
            this.setData({
              list: []
            })
            this.getList();
          }
        }
        wx.setStorageSync('bankDefault', item);
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
    this.getList();
    //  结束下拉刷新组件的显示
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.page.index >= this.total) {
      this.setData({isShow:false})
    } else {
      this.page.index++
      this.getList();
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  

});
