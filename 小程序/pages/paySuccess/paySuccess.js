const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    codeObj:{},//弹窗数据
    total: null, //订单总额
    sta:null,
    dikou:null,
    guideShow:false,//弹窗
    isShow:false,//防止加载中点击
    imgSrc: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2225612955,2263330271&fm=26&gp=0.jpg',
    nums:120,
  },
  timeName:null,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opt) {
    this.getCheckIsShowAddGroup(opt.orderId);
    let dk = opt.dikou;//抵扣价格
    let sta =opt.status;//用于判断是不是抵扣商品
    if(sta==1){
      this.setData({
        sta,
        dikou:dk,
        total: opt.total
      })
    }
    this.setData({ total: opt.total})

    // let nums = this.data.nums;
    // this.timeName = setInterval(() => {
    //   nums--;
    //   this.setData({nums})
    //   if(nums==0){
    //     this.setData({
    //       guideShow: false
    //     })
    //     clearInterval(this.timeName)
    //   }
    // }, 1000);
  },
  //获取弹窗数据
  getCheckIsShowAddGroup(id){
    app.$api.checkIsShowAddGroup({
      OrderId: id,//	是	string	订单Id
    }).then(res=>{
      if(res.Code==1){
        let obj = res.Data;
        this.setData({
          guideShow:true,
          codeObj:obj
        })
      }
    })
  },
  
  //跳转订单页
  checkOrder:function(){
    wx.navigateTo({
      url: '../myOrder/myOrder?type=2',
    })
  },

  toIndex:function(){
    wx.navigateTo({
      url: '/pages/moduleHome/moduleHome', 
    })
  },
  //下载图片
  saveToPhone(){
    let _this = this;
    let imgSrc = this.data.codeObj.QrcodeImg;
    wx.showLoading({
      title: '保存中...'
    })
    _this.setData({ isShow:true })
    wx.downloadFile({	//下载文件资源到本地
      url: imgSrc,
      success: function (res) {
        console.log(res);
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            console.log(data)
            _this.setData({ isShow: false })
            wx.hideLoading()
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function (err) {
            console.log(err);
            _this.setData({ isShow: false })
            // $yjpToast.show({
            //   text: `保存失败`
            // })
            if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail:auth denied") {
              console.log("当初用户拒绝，再次发起授权")
              wx.showModal({
                title: '提示',
                content: '需要您授权保存相册',
                showCancel: false,
                success: modalSuccess => {
                  wx.openSetting({
                    success(settingdata) {
                      console.log("settingdata", settingdata)
                      if (settingdata.authSetting['scope.writePhotosAlbum']) {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限成功,再次点击图片即可保存',
                          showCancel: false,
                        })
                      } else {
                        wx.showModal({
                          title: '提示',
                          content: '获取权限失败，将无法保存到相册哦~',
                          showCancel: false,
                        })
                      }
                    },
                    fail(failData) {
                      console.log("failData", failData)
                    },
                    complete(finishData) {
                      console.log("finishData", finishData)
                    }
                  })
                }
              })
            }
          },
          complete(res) {
            console.log(res);
            wx.hideLoading()
          }
        })
      }
    })
  },

  //防止点击穿透
  handlePierce(){
    return
  },






  
  //关闭弹窗
  handleOff(){
    this.setData({
      guideShow:false
    })
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