import { debounce } from "../../utils/myutil";
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgurl: app.data.imgurl,
    desvalue: 0,
    logisticsvalue: 0,
    atituvalue: 0,
    message: "",
    orderid: null,
    Produtinfo: [],//商品列表
    photoList: [],
    comment1: '',
    comment2: '',
    comment3: '',
    videoArr:[],//视频数组
    defaultId:'',//默认评论的商品的id
    changeIndex:0,//可以根据选择的商品改变,展示对应的商品
    popupShow:true,
    checkedid:'',
    videoStatus:false,//是否需显示视频上传
    amount:0,//字数
  },
  skuIndex:0,//默认0

  onChange1(event) {
    console.log("event", event);
    const levels = {
      1: '非常慢',
      2: '差',
      3: '一般',
      4: '好',
      5: '非常好'
    }
    console.log("levels[event.detail]", levels[event.detail]);
    this.setData({
      comment1: levels[event.detail],
      desvalue: event.detail
    });
  },
  onChange2(event) {
    const levels = {
      1: '非常慢',
      2: '慢',
      3: '一般',
      4: '快',
      5: '非常快'
    }

    this.setData({
      comment2: levels[event.detail],
      logisticsvalue: event.detail
    });


  },
  onChange3(event) {
    console.log("sadasds", event.detail);
    const levels = {
      1: '非常差',
      2: '差',
      3: '一般',
      4: '好',
      5: '非常好'
    }


    this.setData({
      comment3: levels[event.detail],
      atituvalue: event.detail
    });
  },

  //获取输入的长度
  handleInput: debounce(function(e){
    let amount = e.detail.length;
    this.setData({
      amount
    })
  },500),
  onChange(event) {
    this.setData({
      message: event.detail
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断是否开启视频相关的控件
    let status = app.data.IS_ARROW_USE_VIDEO;
    this.setData({
      videoStatus: status,
      orderid: options.id
    })
    this.InintData(options.id);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  //初始接口
  InintData(id) {
    app.alert.loading();
    app.fg({
      url: '/API/OrdersHandler.ashx?action=GetOrderDetail',
      data: {
        orderId:id || this.data.orderid
      }
    }).then(res => {
      console.log("====", res)
      if (res.data.Status == "Success") {
        app.alert.closeLoading();
        let obj = res.data.Data;
        let arr = obj.Suppliers[0].LineItems;
        arr.forEach((v,i)=>{
          v.isCheck = false
          if(i==0){//第一个默认选中
            v.isCheck = true
          }
        })
        let newArr = arr.filter(item => item.ReviewId == 0);
        let defaultId = newArr[0].Id;//默认评论id
        this.setData({
          defaultId,
          Produtinfo: newArr,
        })
      }else{
        app.alert.closeLoading()
      }
    })
  },
  //选择评论商品
  handleCheck(e){
    const { Produtinfo } = this.data;
    const { type, checkedid}= e.currentTarget.dataset;
    if(type==1){//确定按钮
      this.setData({
        changeIndex:this.skuIndex,
        popupShow:false,
        defaultId: checkedid || Produtinfo[0].Id,//将选中的重新赋值默认id
      })
      return
    }else if(type==2){//默认按钮
      this.setData({
        changeIndex: 0,
        popupShow:false,
        defaultId:Produtinfo[0].Id,//采用默认值
      })
      return
    }else{//手动打开弹窗
      this.setData({
        changeIndex: 0,
        popupShow: true,
        defaultId: Produtinfo[0].Id,//采用默认值
      })
    }
  },
  //选择要评论的商品
  handleChange(e){
    let { Produtinfo } = this.data;
    const { index, skuId } = e.currentTarget.dataset;
    this.skuIndex = index;
    Produtinfo.forEach((v,i)=>{
      if (index==i){
        v.isCheck = true
      }else{
        v.isCheck = false
      }
    })
    this.setData({ 
      Produtinfo,
      checkedid: skuId
     })
  },

  // 提交
  Submit() {
    let {
      desvalue,
      logisticsvalue,
      atituvalue,
      message,
      photoList, 
      videoArr,
      defaultId,
      Produtinfo
    } = this.data
    if ([desvalue, logisticsvalue, atituvalue].includes(0)) {
      return app.alert.message('星评不能为空')
    }
    if (!message) {
      return app.alert.message('评论不能为空')
    }

    // 评分的总和取评分
    let sumRate = Number((desvalue + logisticsvalue + atituvalue) / 3)
    let imgliststring = photoList.toString();
    // return
    app.fg({
      url: '/API/OrdersHandler.ashx?action=SubmitReview',
      data: {
        OrderId: this.data.orderid,
        SkuID: defaultId,
        ReviewText: message,
        Score: sumRate,
        ImageUrls: imgliststring || '',//上传的图片
        VideoUrl: videoArr[0] || '',//	否	string	视频路径
      }
    }).then(res => {
      console.log("提交",res);
      if (res.data.Status != "Success") {
        app.alert.message(res.data.Message)
        app.tools.goBackTimeOut();
        return
      }
      app.alert.message(res.data.Message);
      app.tools.goBackTimeOut();
    })
  },

  // 拍照、选图
  postImg(e) {
    var that = this;
    const { photoList } = this.data;
    if (photoList.length == 5) {
      wx.showModal({
        title: '最多5张图',
      })
      return
    }
    let num = 5;
    if(num ==0){
      num=1
    }else{
      num = 5 - photoList.length;
    }
    wx.chooseImage({
      count: num,
      sourceType: ['album', 'camera'],
      success: function (res) {
        that.upLoadImg(that, res.tempFilePaths)
      },
      fail: function (error) { }
    })
  },
  // 上传图片
  upLoadImg: function (page, path) {
    wx.showLoading({
      title: '图片上传中',
      mask: true
    })
    let _this = this
    const fs = wx.getFileSystemManager()
    path.forEach(img => {
      fs.readFile({
        filePath: img,
        encoding: 'base64',
        success(data) {
          wx.request({
            url: app.data.url + '/api/PublicHandler.ashx?action=uploadimgbybase64',
            data: {
              baseStr: data.data
            },
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST",
            success(res) {
              wx.hideLoading()
              if (res.data.Status == "Success") {
                _this.data.photoList.push(res.data.Message)
                _this.setData({
                  photoList: _this.data.photoList
                })
              } else {
                wx.showToast({
                  title: '图片上传失败',
                })
              }
            }
          })
        }
      })
    })
  },
  // 上传视频
  postVideo(e) {
    app.tools.upload({
      count: 9,
      url: app.data.api.upload,
      type: 'video',
      formData: {
        UploadType: 1,//	否	int	文件类型 0图片1视频
      }
    }).then(res => {
      this.setData({
        videoArr: res
      })
    })
  },
  // 删除图片
  Deleted(e) {
    let { photoList, videoArr } = this.data;
    let { index, type } = e.currentTarget.dataset;
    if (type == 1) {
      photoList.splice(index, 1)
      this.setData({ photoList })
    } else {
      videoArr.splice(index, 1)
      this.setData({ videoArr })
    }
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