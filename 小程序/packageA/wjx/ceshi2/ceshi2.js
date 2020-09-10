// packageA/wjx/ceshi2/ceshi2.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgStr:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let result = '<p><img src="http://img.hmeshop.cn/hmeshop/html/20200831/ae65d766-0086-4f71-b342-2a31c8a28a94.png" style="" title="detail1.png"/></p><p><img src="http://img.hmeshop.cn/hmeshop/html/20200831/14986929-cd9c-4af6-a2fc-10ea6fab159c.png" style="" title="detail2.png"/></p><p><br/></p>'
    const regex = new RegExp('<img', 'gi');
    result = result.replace(regex, `<img class="rich-img"`);
    this.setData({
      imgStr: result
    })
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