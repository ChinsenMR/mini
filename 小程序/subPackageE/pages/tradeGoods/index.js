const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    iconUrl: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202008131954273369070.png',
    tradeCode: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  inputTradeCode(e) {
    const {
      detail: {
        value: tradeCode
      }
    } = e;

    this.setData({
      tradeCode
    })
  },

  /* 查看兑换记录 */
  seeTradeHistory() {
    app.goPage({
      url: '/subPackageE/pages/tradeGoods/history'
    })
  },
  /* 获取兑换商品 */
  getTradeProduct(tradeCode) {
    app.$api.getSkuByExchangeCode({
      CardCode: tradeCode
    }).then(res => {
      if (res.success) {

        app.goPage({
          url: '/subPackageE/pages/tradeGoods/goods',
          options: {
            code: tradeCode
          }
        })

      }
    })
  },
  /* 兑换 */
  handleTrade() {
    const {
      tradeCode
    } = this.data;

    if (!tradeCode) {
      return app.alert.message('请输入兑换码')
    }

    app.alert.confirm({
      content: '确认兑换'
    }, conf => {
      if (!conf) return

      this.getTradeProduct(tradeCode);
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