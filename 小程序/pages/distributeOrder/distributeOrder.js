const app = getApp();
Page({
  data: {
    IS_ALLOW_USER_APPLY_AFTER_SALE: false, // 是否允许用户退款退货
    IS_ALLOW_USER_SHOW_DELIVER_GOODS: false, // 是否隐藏发货按钮
    imgUrl: app.data.imgurl,
    activeItem: 0,
    active: 0, //选,
    page: 1, //页码
    pageType: 1, // 页面类型 --->   1为代理订单  2为分销订单
    orderList: [],
    allOrderNum: 0, // 全部订单
    completeOrderNum: 0, //  已完成订单
    BuyerAlreadyPaid: 0, //待发货订单数
    WaitReceivedCount: 0, //待收货订单数
    AfterSaleCount: 0, // 售后订单数量
    showFH: false, //选择配送方式
    showEdit: false, //填写物流
    sendGoodsTypeList: [
      {
        name: "代理发货 (快递)",
        id: 0,
        status: false,
        type: 1
      },
      
      {
        name: "代理发货 (自提)",
        id: 0,
        status: false,
        type: 2
      },
      {
        name: "云仓发货",
        id: 1,
        status: true,
        type: 3
      },
      // {
      //   name: "转总部",
      //   id: 2,
      //   status: true,
      //   type: 4
      // }
      {
        name: "代理发货 (无需物流)",
        id: 0,
        status: false,
        type: 5
      },
    ], //选择配送方式项
    showEditList: [
      // {
      //   name: "收货时间:",
      //   val: "任意时间",
      //   data: "ShipToDate"
      // },
      {
        name: "省市区:",
        val: "无",
        data: "ShippingRegion"
      },
      {
        name: "收货地址:",
        val: "无",
        data: "Address"
      },
      {
        name: "收货人:",
        val: "无",
        data: "ShipTo"
      },
      {
        name: "手机号:",
        val: "无",
        data: "CellPhone"
      },
      {
        name: "买家留言:",
        val: "无",
        data: "Remark"
      },
      // {
      //   name: "发货方式:",
      //   val: "普通物流",
      //   data: ""
      // }
    ],
    columns: [],
    sendData: {
      name: "",
      orderId: "",
      sendId: ""
    },
    id: 0, //发货需要的SendType
    nums: 0,
    type: 1, //1代表正常情况,2代表直播订单


    /* 新版本的请求数据 */
    pageIndex: 0,
    list: [],
    loadMore: true,
    limit: 8,
  },
  pages: {
    index: 1,
    size: 10
  },
  total: 1, //总页码
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (opt) {
    let str = ''
    if (opt.pageType == 3) {
      str = '直播订单'
    } else if (opt.pageType == 2) {
      str = '团队订单'
    } else if (opt.pageType == 1) {
      str = '待发货单'
    } else {
      str = '售后订单'
    }
    app.setTitle(str)
    console.log("IS_ALLOW_USER_SHOW_DELIVER_GOODS", app.data.IS_ALLOW_USER_SHOW_DELIVER_GOODS);
    this.setData({
      pageType: opt,
      type: opt.type,
      activeItem: opt.status ? Number(opt.status) : 0,
      IS_ALLOW_USER_APPLY_AFTER_SALE: app.data.IS_ALLOW_USER_APPLY_AFTER_SALE,
      IS_ALLOW_USER_SHOW_DELIVER_GOODS: app.data.IS_ALLOW_USER_SHOW_DELIVER_GOODS
    })
    this.checkQualification();
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getList(1);
  },
  /* 获取地址 */
  checkQualification() {
    const userInfo = app.cache.loadUserInfo();

    if (userInfo.qualification == -2 || userInfo.qualification == 2) {
      app.alert.confirm({
        content: '您还未填写收货地址，为保证客户能正常进行售后，请前往填写收货地址'
      }, conf => {
        conf && app.goPage({
          url: '/subPackageD/pages/shopQualification/index',
          fromType: 'distributeOrder'
        })
      })
    }


  },
  /* 获取订单列表数据 */
  getList(init) {
    let {
      pageIndex = 0,
        list = [],
        loadMore = true,
        limit = 8,
        activeItem,
        type
    } = this.data;

    if (init) {
      list = [];
      loadMore = true;
      pageIndex = 0;

      this.setData({
        list,
        loadMore,
        pageIndex
      });
    }

    if (!loadMore) return;

    pageIndex++;

    this.setData({
      loadMore: true
    });

    const formData = {

      pageSize: limit,
      pageIndex: pageIndex,
      IsReferralUserId: true,

      status: activeItem,
      IsLive: type == 2 ? true : ''
    };

    app.$api.getDistributorOrderList(formData).then((res) => {
      console.log(res)
      const {
        AllOrderCount,
        FinishedOrderCount,
        BuyerAlreadyPaid,
        WaitReceivedCount,
        AfterSaleCount,
        Total = 1,
        Data = [],
      } = res;

      const maxPageLength = Math.ceil(Total / limit);

      loadMore = pageIndex < maxPageLength

      list = list.concat(Data);

      wx.stopPullDownRefresh();

      this.setData({
        list,
        loadMore,
        pageIndex,
        allOrderNum: AllOrderCount, // 全部订单
        completeOrderNum: FinishedOrderCount, //  已完成订单
        BuyerAlreadyPaid: BuyerAlreadyPaid, //待发货
        WaitReceivedCount: WaitReceivedCount, //待收货
        AfterSaleCount,
      });

    });
  },

  /* 切换导航栏 */
  selectNav: function (e) {
    const {
      target: {
        dataset: {
          id
        }
      }
    } = e;

    this.setData({
      activeItem: id,
    })

    this.getList(1)
  },

  // 获取配送公司
  onChange(e) {
    this.setData({
      'sendData.name': this.data.columns[e.detail.value]
    })
    // this.sendData.name = value;
  },

  //发货
  openSendFN(e) {
    const {
      IS_ALLOW_USER_SHOW_DELIVER_GOODS,
      showEditList
    } = this.data;
    const { item } = e.currentTarget.dataset;


    showEditList.forEach(c => {
      console.log('发货',c);
      c.val = item[c.data];
    });

    const SEND_TYPE = ['默认', '代理发货', '云仓发货', '总部发货', '待代理补货', '自营订单']; // 对应后端返回的值
    const sendGoodsModel = SEND_TYPE[item.ReferralTempId];

    // ShippingModeId 0 为快递 -1门店 -2自提
    const getGoodsType = item.ShippingModeId == 0 ? '快递' : item.ShippingModeId == -1 ? '门店' : '自提'

    // sendGoodsTypeList 1 = 代理发货 (快递) 2 = 代理发货 (自提) 3 = 云仓发货 4 = 转总部
    this.data.sendGoodsTypeList.forEach(v => {
      /* 用户自提 */
      if (getGoodsType == '自提') {
        if (v.type === 2 || v.type === 4) {
          v.status = true
        } else {
          v.status = false
        }
      }
      /* 快递发货 */
      else {
        if (sendGoodsModel == '云仓发货') {
          // 显示:代理发货 (快递), 云仓发货
          if (v.type == 3 || v.type == 1 || v.type == 5) {
            v.status = true
          } else {
            v.status = false
          }
        }
        else if (sendGoodsModel == '待代理补货') {
          // 显示:代理发货 (快递), 云仓发货 , 转总部
          if (v.type == 4 || v.type == 3 || v.type == 1 || v.type == 5) {
            v.status = true
          } else {
            v.status = false
          }
        } else {
          if (v.type == 2) {
            v.status = false
          } else {
            v.status = true
          }
        }
      }
      /* 如果不允许自提，关闭自提按钮 */
      if (!IS_ALLOW_USER_SHOW_DELIVER_GOODS) {
        if (v.type == 2 || v.type == 3) {
          v.status = false
        }
      }
      /* 是否允许代理快递发货 true 为允许，隐藏代理自提 */
      if (!item.KjSendGoods) {
        v.type == 1 && (v.status = false)
      }

    })
    this.setData({
      sendGoodsTypeList: this.data.sendGoodsTypeList
    })
    // }
    this.setData({
      columns: item.AllExpressName,
      // 'sendData.orderId': item.OrderId,
      'sendData.orderId': item.OrderId,
      showEditList: showEditList,
      showFH: true
    })
  },
  /* 选择发货 */
  chooseFN(e) {
    let {
      currentTarget: {
        dataset: {
          index,
          id,
          type
        }
      }
    } = e;
    

    this.setData({
      id,
      showFH: false
    })
    if(type==5){
      this.submitSendType(id, type);
      return
    }

    if (!index) {
      return this.setData({
        showEdit: true
      })
    }

    index--
    this.submitSendType(id,type);
  },

  /* 提交配送方式 */
  submitSendType(id,type) {
    /* 如果id为1为快递发货 */

    if (this.data.showEdit) {
      if (!this.data.sendData.name) {
        return app.alert.message('请选择快递公司')
      }
      if (!this.data.sendData.orderId) {
        return app.alert.message('请输入快递单号')
      }
    }
    const ajaxData = {
      SendType: this.data.id,
      OrderId: this.data.sendData.orderId,
      Company: this.data.sendData.name,
      LogisticCode: this.data.sendData.sendId
    };
 
    const ajaxData2 = {//代理发货（无需物流）
      SendType: this.data.id,
      OrderId: this.data.sendData.orderId,
      Company: '默认',
      LogisticCode: '默认'
    }
    
    app.$api.sendGoodsByAgent(type == 5 ? ajaxData2 : ajaxData).then(res => {
      if (res.success) {
        // app.alert.toast(res.Message);
        let args = {
          content: res.Message,
          showCancel:false,
          confirmColor:'#1d82fe'
        }
        app.alert.confirm(args, (res) => {
          this.setData({
            showEdit: false
          })
          this.getList(1)
        })
      }
    })
  },

  //输入框的值
  handleInput(e) {
    let value = e.detail.value;
    this.setData({
      'sendData.sendId': value
    })
  },

  //点击遮罩层关闭
  closeFilter(e) {
    let index = e.currentTarget.dataset.index
    if (index == 1) {
      this.setData({
        showFH: false
      })
    } else {
      this.setData({
        showEdit: false
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getList(1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getList();
  },
  /* 去售后或申请退款 */
  applyAfterSale(e) {
    const {
      currentTarget: {
        dataset: {
          item,
          goods = {},
          type
        }
      }
    } = e;

    /* 自动解析对象为参数并且跳转，支持直接传入事件获取到的event对象 */
    app.goPage({
      url: '/subPackageC/applyAfterSale/applyAfterSale',
      options: {
        orderId: item.OrderId,
        type,
        skuId: goods.SkuId || ''
      }
    })
  },
  seeOrderDetail(e) {
    const {
      currentTarget: {
        dataset: {
          id
        }
      }
    } = e;

    app.goPage({
      url: '/pages/orderDetail/orderDetail',
      options: {
        id
      }
    })
  },
  /* 查看售后当前的状态 */
  reviewAftarSaleStatus(e) {
    const {
      currentTarget: {
        dataset: {
          item = {},
          goods = {},
          type
        }
      }
    } = e;

    const refundId = item.RefundInfo ? item.RefundInfo.RefundId : '';
    const returnId = goods.ReturnInfo ? goods.ReturnInfo.ReturnId : '';

    app.goPage({
      url: '/subPackageC/afterSaleDetail/afterSaleDetail',
      options: {
        refundId, // 退款id
        returnId, // 退货id
        type,
        skuId: goods.SkuId || '', // 商品规格id
        orderId: item.OrderId,
        fromType: 'distributeOrder' // 用于区分是从分销订单 || 用户订单
      }

    })
  },
})