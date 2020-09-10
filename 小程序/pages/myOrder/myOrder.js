import {
  getOrderList,
  cancelOrder,
} from '../../utils/requestApi.js';
import {
  payment
} from '../../utils/util.js';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    IS_ALLOW_USER_APPLY_AFTER_SALE: false, // 是否允许用户退款退货
    OPEN_POINT_SHOP: false,
    imgUrl: app.data.imgurl,
    tabbar: ['全部订单', '待付款', '待发货', '待收货', '待评价', '售后', '已完成'],
    activeItem: 0, // tabbar激活项
    list: [], //数据列表
    page: 1, //页码
    isEmpty: false,
    searchVal: '', //搜索值
    displayDialog: false,
    wechat: {
      id: '',
      qrcode: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(opt) {
    this.setData({
      activeItem: opt.type || opt.status || 0,
      IS_ALLOW_USER_APPLY_AFTER_SALE: app.data.IS_ALLOW_USER_APPLY_AFTER_SALE,
      OPEN_POINT_SHOP: app.data.OPEN_POINT_SHOP,
      // activeItem: opt.status || 0
    });

  },

  onShow() {
    this.initData();
  },


  // 选择tab
  selectTabbar(e) {
    console.log('输出点tab索引值', e);
    this.setData({
      activeItem: e.detail.index,
      isEmpty: false,
    });
    this.initData();
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
    if (type === 1) {
      app.goPage({
        url: '/subPackageD/pages/afterSale/index',
        options: {
          orderId,
          type,
          skuId: goods.SkuId || ''
        }
      })
    } else {
      app.goPage({
        url: '/subPackageC/applyAfterSale/applyAfterSale',
        options: {
          orderId,
          type,
          skuId: goods.SkuId || ''
        }
      })
    }


  },
  /* 展示联系卖家的弹窗 */
  showContactCode(e) {
    const {
      items,
      type
    } = e.currentTarget.dataset;

    this.setData({
      displayDialog: !this.data.displayDialog,
    });

    if (!type) {
      this.setData({
        wechat: {
          id: items.WeChat,
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
          orderId
        }
      }
    } = e;

    wx.navigateTo({
      url: `/subPackageC/expressDetail/expressDetail?orderId=${orderId}`
    })

  },
  //初始化页面数据
  initData(param, val) {
    let {
      page,
      list,
      isEmpty,
      activeItem,
      searchVal
    } = this.data;

    if (param != 'onReachBottom') {
      page = 1;
      list = [];
    }

    if (activeItem == 4) {
      activeItem = 21;
    } else if (activeItem == 5) {
      activeItem = 98;
    } else if (activeItem == 6) {
      activeItem = 5;
    }

    app.$api.getOrderList({
      // 获取订单信息
      pageIndex: page,
      pageSize: 10,
      // status: activeItem == 4 ? 21 : activeItem,
      status: activeItem,
      SearchText: searchVal || '',
    }).then((res) => {

      wx.stopPullDownRefresh();
      if (res.success) {
        const {
          Data: dataList
        } = res;
        console.log('订单数据列表', dataList);
        if (dataList.length != 0) {
          dataList.forEach(item => {
            let status = item.LineItems.some(v => v.ReviewId == 0);
            if (status) {
              item.isShow = status; //v.ReviewId==0有一个条件成立,就显示评价按钮
            }
            if (item.Gifts){
              let giftArr = item.Gifts
              giftArr.forEach(v=>{
                if (v.Image.includes('http://')){
                  v.Image = v.Image.replace('http://','https://')
                }
              })
            }
            // if (item.PromotionDesStr.length !=0){//用于截取数组每一项的第一个字符
            //   let str = ''
            //   let arr = item.PromotionDesStr;
            //   arr.forEach(v => { //str.substr(0, 1)
            //     str += v.trim().substr(0, 1)+','
            //   })
            //   if (str.length - 1<=3){
            //     str = str.substring(0, str.length - 1)
            //   }
            //   item.activityType = `(${str})`
            // }
            if (item.FightGroupId>0){
              let strArr = ['拼']
              item.activityType = `(${strArr})`
            }

          })
          list = [...list, ...dataList];
          page++;
        } else isEmpty = true;
      }

      this.setData({
        list,
        page,
        isEmpty
      });
    });
  },

  //打开订单详情页面
  toOrderDetail(e) {
    let {
      id
    } = e.currentTarget.dataset;
    let {
      list
    } = this.data;
    let curOrder = null;
    list.forEach((item) => {
      if (item.OrderId == id) curOrder = JSON.stringify(item);
    });
    wx.navigateTo({
      url: `../orderDetail/orderDetail?id=${id}`
    });
  },

  //取消订单
  cancelOrder(e) {
    let {
      list
    } = this.data;
    let {
      id
    } = e.currentTarget.dataset;
    wx.showModal({
      content: '确定取消订单',
      success: (res) => {
        if (res.confirm) {
          cancelOrder({
            orderId: id
          }).then((res) => {
            wx.showToast({
              icon: 'none',
              title: res.data.Message
            });
            if (res.data.Status == 'Success') {
              setTimeout(() => {
                this.initData();
              }, 1000);
            }
          });
        }
      },
    });
  },

  //去支付
  pay(e) {
    let {
      id
    } = e.currentTarget.dataset;
    payment(id, (res) => {
      this.initData();
      wx.showToast({
        icon: 'none',
        title: '支付成功'
      });
    });
  },

  //  确认收货
  handleFinishOrder(e) {
    let {
      currentTarget: {
        dataset: {
          id: orderId
        }
      }
    } = e;

    app.alert.confirm({
      content: '是否确认收货'
    }, conf => {
      if (conf) {
        app.$api.handleFinishOrder({
          orderId
        }).then(res => {
          if (res.success) {
            this.setData({
              list: [],
              activeItem: 4, //评价页面
            })
            this.initData();
          }
        })
      }
    })


  },

  // 点击搜索
  handleSearch() {

    if (!this.data.searchVal) return
    this.initData(this.data.activeItem);
  },

  //搜索值
  handleVal(e) {
    const {
      value
    } = e.detail;

    this.setData({
      searchVal: value,
    }, () => {
      if (!this.data.searchVal) {
        this.initData()
      }
    });
  },

  //  查看物流
  handleLogistics(e) {
    wx.showLoading({
      title: '加载中~',
      mask: true,
      success(res) {},
      fail(res) {},
      complete(res) {},
    });
    console.log('点击查看物流', e);
    const {
      id,
      items
    } = e.currentTarget.dataset;
    let obj = JSON.stringify(items);
    wx.navigateTo({
      url: `/packageA/pages/Logistics/Logistics?id=${id}&item=${obj}`,
      success: (result) => {
        wx.hideLoading();
      },
      fail: () => {},
      complete: () => {},
    });
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({
      list: [],
      page: 1
    })
    this.initData(1);
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.initData('onReachBottom');
  },

});