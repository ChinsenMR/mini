const app = getApp();
import {
  orderDetail
} from '../../utils/requestApi.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    IS_ALLOW_USER_APPLY_AFTER_SALE: false, // 是否允许用户退款退货
    imgUrl: app.data.imgurl,
    data: null, //数据
    displayDialog: false,
    wechat: {
      id: '',
      qrcode: ''
    },
    params: {
      fromType: null
    },
    IS_SHIELDING_BUTTON: true, //用于控制从累计收益/类及佣金等进来屏蔽一些按钮
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opt) {

    this.initData(opt.id)
    this.setData({
      IS_SHIELDING_BUTTON: opt.boolState == 0 ? false : true,
      IS_ALLOW_USER_APPLY_AFTER_SALE: app.data.IS_ALLOW_USER_APPLY_AFTER_SALE
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  loadImage(e) {},
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

  /* 申请售后 */
  applyAfterSale(e) {
    const {
      currentTarget: {
        dataset: {
          params: {
            goods = {},
            type,
            orderId
          }

        }
      }
    } = e;

    /* 自动解析对象为参数并且跳转，支持直接传入事件获取到的event对象 */
    app.goPage({
      url: '/subPackageC/applyAfterSale/applyAfterSale',
      options: {
        orderId,
        type,
        skuId: goods.SkuId || ''
      }
    })


  },
  /* 展示联系卖家的弹窗 */
  showContactCode(e) {
    const {
      items,
      type
    } = e.currentTarget.dataset;
    console.log(e)
    this.setData({
      displayDialog: !this.data.displayDialog,
    });

    if (!type) {
      this.setData({
        wechat: {
          id: items.wechat,
          qrcode: items.WxQrCode,
        },
      });
    }
  },
  closeDialog() {
    this.setData({
      displayDialog: false
    });
  },
  /* 查看售后详情 */
  seeAfterSaleDetail(e) {
    debugger
    const {
      currentTarget: {
        dataset: {
          params: {
            type,
            returnId = '',
            refundId = '',
            orderId,
            skuId = ''
          },
        },
      },
    } = e;


    app.goPage({
      url: '/subPackageC/afterSaleDetail/afterSaleDetail',
      options: {
        type,
        returnId,
        refundId,
        orderId,
        skuId
      }
    })

  },

  /* 查看物流 */
  seeExpressStep(e) {
    console.log(e)
    const {
      currentTarget: {
        dataset: {
          orderid
        }
      }
    } = e;

    app.$api.checkExpressDetail({
      orderid
    }).then(res => {
      const {
        Data: {
          url = ''
        },
        Code
      } = res;


      if (Code !== 1) {
        return wx.showToast({
          title: '获取物流信息失败'
        })
      }

      wx.navigateTo({
        url: `/subPackageC/expressDetail/expressDetail?orderId=${orderid}`
      })

      // wx.setStorage({
      //   key: 'webViewUrl',
      //   data: url,
      //   success: (result) => {
      //     wx.navigateTo({
      //       url: `/packageB/pages/expressDetail/expressDetail?orderId=${orderid}`
      //     })
      //   },
      // });


    })

  },
  /* 确认收货 */
  handleFinishOrder(e) {
    let {
      id
    } = e.currentTarget.dataset;

    app.alert.confirm({
      content: '是否确认收货'
    }, conf => {
      if (conf) {
        app.$api.handleFinishOrder({
          orderId: id
        }).then(res => {
          app.alert.message(res.Message, () => {
            this.initData();
          })
        })
      }
    })


  },
  // 获取订单详情
  initData(id) {
    orderDetail({
      orderId: id
    }).then(res => {
      console.log("获取订单详情", res)
      if (res.data.Status == "Success") {
        const {
          Data: data
        } = res.data;
        if (data.Suppliers.length != 0) {
          const isCanComment = data.Suppliers[0].LineItems.find(v => v.ReviewId == 0);
          data.isCanComment = Boolean(isCanComment);
        }
        console.log("data.Gifts", data.Gifts);
        if (data.Gifts) {
          let arr = data.Gifts;
          arr.forEach(v => {
            if (v.ImageUrl.includes('http://')) {
              v.ImageUrl = v.ImageUrl.replace('http://', 'https://')
            }
          })
          data.Gifts = arr
        }

        this.setData({
          data: res.data.Data
        })
      } else {
        app.alert.message(res.data.Message)
      }
    })
  },

  // 设置系统剪贴板的内容
  _setClipboard(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.code,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // code 数据
          }
        })
      }
    })
  },

  //跳转商品详情
  // handleDetail(){
  //   wx.navigateTo({
  //     url: '/pages/goodsDetail/goodsDetail',
  //     success: (result) => {

  //     },
  //     fail: () => {},
  //     complete: () => {}
  //   });

  // },

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