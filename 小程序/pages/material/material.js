let app = getApp();
import { writePhotosAlbum } from '../../utils/myutil'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    navList:[],//分类数组
    list: [],//素材库数据
    isWin: false,
    obj: {},//商品详情数据,为了获取分享图片
    isShare: false,
    img1: "http://hmqy.oss-cn-hangzhou.aliyuncs.com/kamijieImg/share_mf.png",
    img2: "http://hmqy.oss-cn-hangzhou.aliyuncs.com/kamijieImg/xiaZai.png",
    img3: "http://hmqy.oss-cn-hangzhou.aliyuncs.com/kamijieImg/wenAn.png",
  },
  page: {
    index: 1,
    size: 10
  },
  total: 1,//总页码
  tagid: '',//分类id
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.tagid = options.tagid;
    this.getShare(options.tagid);
    // this.getShare();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  //获取米粉圈数据 
  getShare(id) {
    app.$api.shareSelf({
      tagId:id,//	是	string	分类Id 可传1级或者2级分类
      pageIndex: this.page.index,//	是	string	页码
      pageSize: this.page.size,//	是	string	每页多少条记录
    }).then(res=>{
      if(res.Code==1){
        let arr = res.Data.data;
        let all = res.Data.Total;
        if (all / this.page.size < this.page.index) {
          this.total = 1
        } else {
          this.total = Math.ceil(all / this.page.size);
        }
        arr.forEach(v=>{
          v.result = this.getDateDiff(v.UpdateTime)
        })
        let newArr = [...this.data.list, ...arr];
        console.log('新数组',arr);
        this.setData({
          list: newArr
        })
      }
    })
  },
  // 点击分享按钮
  handleShare(e) {
    const { productid } = e.currentTarget.dataset;
    if (productid) {
      this.getProduct(productid);
    } else {
      app.alert.toast('商品不存在或被删除');
      return
    }
  },
  //获取商品详情数据
  getProduct(pid) {
    app.loadding();
    app.Get({
      url: 'api/AppShopHandler.ashx',
      data: {
        action: 'getProductDetail',//	是	string	
        productId: pid,//	是	int	商品Id
      }
    }).then(res => {
      if (res.data.status == 0) {
        let obj = res.data.data;
        console.log("输出商品详情", obj);
        // 用于修改富文本的图片宽度
        let result = obj.Description;
        this.setData({
          obj,
          isWin: true,//打开分享弹窗
        })
        app.hideLoading();
      } else {
        app.hideLoading();
        console.log("获取商品详情数据报错");
      }
    })
  },
  //时间
  getDateDiff(dateTimeStamp) {
    var result = ''
    var minute = 1000 * 60
    var hour = minute * 60
    var day = hour * 24
    var month = day * 30
    var now = new Date().getTime()
    var diffValue = now - new Date(dateTimeStamp)
    if (diffValue < 0) return
    var monthC = diffValue / month
    var weekC = diffValue / (7 * day)
    var dayC = diffValue / day
    var hourC = diffValue / hour
    var minC = diffValue / minute
    if (monthC >= 1) {
      result = "" + parseInt(monthC) + "月前"
    }
    else if (weekC >= 1) {
      result = "" + parseInt(weekC) + "周前"
    }
    else if (dayC >= 1) {
      result = "" + parseInt(dayC) + "天前"
    }
    else if (hourC >= 1) {
      result = "" + parseInt(hourC) + "小时前"
    }
    else if (minC >= 1) {
      result = "" + parseInt(minC) + "分钟前"
    } else {
      result = "刚刚"
    }
    return result
  },


  //点击按钮
  handleSave(e) {
    const { type, imgs, span, productid } = e.currentTarget.dataset;
    if (type == 1) {
      if (imgs.length != 0) {
        this.downloadImgs(imgs)
      } else {
        app.alert.toast('无美图可以分享!')
      }

    } else if (type == 2) {
      app.copy(span)
    } else if (type == 3) {
      wx.navigateTo({
        url: '/packageA/goodsDetail/goodsDetail?productid=' + productid,
      });
    }
  },
  //保存选中的图片
  downloadImgs(data) {//data必须是一个图片数据,不能是数组对象,必须是纯图片数组
    var _this = this;
    // 获取保存到相册权限
    writePhotosAlbum(
      function success() {
        wx.showLoading({
          title: '加载中',
          mask: true
        })
        // 调用保存图片promise队列
        _this.queue(data).then(res => {
          wx.hideLoading()
          wx.showToast({
            title: '下载完成'
          })
          _this.setData({
            isShare: true
          })
        }).catch(err => {
          wx.hideLoading()
          console.log(err)
        })
      },
      function fail() {
        wx.showToast({
          title: '您拒绝了保存到相册'
        })
      }
    )
  },
  queue(urls) {
    let promise = Promise.resolve()
    urls.forEach((url, index) => {
      promise = promise.then(() => {
        return this.download(url)
      })
    })
    return promise
  },
  // 下载
  download(url) {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: url,
        success: function (res) {
          var temp = res.tempFilePath
          wx.saveImageToPhotosAlbum({
            filePath: temp,
            success: function (res) {
              resolve(res)
            },
            fail: function (err) {
              reject(res)
            }
          })
        },
        fail: function (err) {
          reject(err)
        }
      })
    })
  },
  //保存图片
  saveImg() {
    let { obj } = this.data;
    let fileName = new Date().valueOf();
    let filePath = wx.env.USER_DATA_PATH + '/' + fileName + '.jpg'
    console.log("fileName", fileName);
    let url = obj.SharePicUrl;
    console.log("二维码路径", url);
    wx.downloadFile({
      url: url,     //仅为示例，并非真实的资源
      // filePath: filePath,
      success: function (res) {
        console.log("下载图片", res);
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode == 200) {
          app.loadding('正在保存图片！')
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(data) {
              console.log("成功", data);
              app.hideLoading();
              app.alert.toast('保存图片成功！')
            },
            fail(res) {
              console.log(res, 222222);
              wx.showModal({
                title: '提示',
                content: '请打开相册授权',
                success(res) {
                  if (res.confirm) {
                    wx.openSetting({})
                    wx.hideLoading();
                  } else if (res.cancel) {
                    console.log('用户点击取消')
                    wx.hideLoading();
                  }
                }
              })
            }
          })
        } else {
          app.hideLoading();
        }
      }
    })
  },
  //关闭弹窗
  handleOffWin() {
    this.setData({
      isWin: false
    })
  },
  handleOffimg() {
    this.setData({
      isShare: false
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.page.index = 1;
    this.setData({
      list: []
    });
    this.getShare(this.tagid)
    //  结束下拉刷新组件的显示
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.page.index >= this.total) {
      app.alert.toast('没有更多数据了!')
    } else {
      this.page.index++
      this.getShare(this.tagid);
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let { obj } = this.data;
    return {
      title: obj.ProductName,
      imageUrl: obj.SharePicUrl,
      path: `/packageA/goodsDetail/goodsDetail?t=1&productid=${obj.ProductId}`
    }
  }
})