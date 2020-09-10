const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log("home页面跳转数据",options);
    wx.getSystemInfo({
      success(res) {
        app.data.statusBarHeight = res.statusBarHeight;
        app.data.navHeight = res.screenHeight - res.windowHeight;
      }
    })

    // if (app.data.system.env == 'trial'  app.data.system.env == 'develop') {

    //   if (wx.getStorageSync('using_domain')) {
    //     app.data.url = wx.getStorageSync('using_domain')
    //     app.data.appId = wx.getStorageSync('using_appId')
    //     return this.handleChangeRoute(options)
    //   }
    //   // app.alert.message('sadsa')
    //   app.alert.confirm({
    //     cancelText: '标准版',
    //     confirmText: '研芙',
    //     content: '请选择测试项目',
    //   }, conf => {
    //     if (conf) {
    //       app.data.url = 'https://yanfu.hmeshop.cn';
    //       app.data.appId = 'wx31a7e86c1839437b';
    //     }
        
    //     wx.setStorageSync('using_domain', app.data.url)
    //     wx.setStorageSync('using_appId', app.data.appId)
    //     this.handleChangeRoute(options)
    //   })
    // } else {

      this.handleChangeRoute(options)
    // }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },
  handleChangeRoute(options) {
    app.alert.loading()
    if (options.pageType) {
      wx.reLaunch({
        url: `/pages/goodsDetail/goodsDetail?p=${options.p}&pagetype=${options.pageType || ''}&d=${options.d}&f=${options.f}`
      })
    } else {
      if (app.data.PROJECT_THEME != 'fruit') {
        wx.reLaunch({
          url: '/pages/moduleHome/moduleHome'
        })
      } else wx.reLaunch({
        url: '/pages/index/index'
      })

      app.alert.closeLoading()
    }
    if (options.rid) {
      app.data.referralUserId = options.rid
    } else {
      var scene = decodeURIComponent(options.scene).split('=')[1]
      wx.setStorageSync("scene", scene);
      wx.setStorageSync("KjCustomId", scene);
      app.data.referralUserId = scene
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },


})