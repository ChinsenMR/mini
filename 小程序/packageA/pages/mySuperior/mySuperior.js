// packageA/pages/Directsuperiors/Directsuperiors.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    referralInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMyReferral();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  getMyReferral() {
    app.$api.getMyReferral().then(res => {
      if (res.success) {
        const {
          Data: referralInfo
        } = res;

        wx.setStorageSync('directlyImg', referralInfo.picture)

        referralInfo.CreateDate = !referralInfo.CreateDate ? '' : referralInfo.CreateDate.split("T")[0]

        this.setData({
          referralInfo
        })
      } else {
        app.alert.confirm({
          content: '您没有直属上级',
          showCancel: false
        }, conf => {
          app.goBack();
        })
      }
    })
  },
  seeQrCode() {
    app.previewImage(this.data.referralInfo.WxImage, [this.data.referralInfo.WxImage])
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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


})