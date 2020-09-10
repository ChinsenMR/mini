import {payment} from '../../utils/util.js';
import { debounce } from '../../utils/myutil';
import regeneratorRuntime from '../../utils/runtime';
const app = getApp()
/* 
  注意不要改错地方，这里的代码是相对独立的，只有从购物车进来，
  并且是自营订单跟代理订单合并支付才会用到这里的代码，
   */
const gatherMethods = {

  /***************接下来的代码时拆单专用****************************** */
  /* 统一获取 */
  async getGatherOrdersData() {
    const shopOrderResult = await this.getGatherOrders(1);
    const agentOrderResult = await this.getGatherOrders(2);

    let {
      goodsCountTotal,
      goodsPriceTotal,
    } = this.data;

    goodsCountTotal = shopOrderResult.totalCount + agentOrderResult.totalCount;
    goodsPriceTotal = app.tools.tranPriceToFixed(shopOrderResult.totalPrice + agentOrderResult.totalPrice);
    
    console.log(shopOrderResult, agentOrderResult)

    this.setData({
      goodsCountTotal,
      goodsPriceTotal,
      Balance: app.tools.tranPriceToFixed(agentOrderResult.Balance),
      OrderFreight: app.tools.tranPriceToFixed(agentOrderResult.OrderFreight),
      agentOrderInfo: Object.assign(this.data.agentOrderInfo, agentOrderResult), // 代理订单详情
      shopOrderInfo: Object.assign(this.data.shopOrderInfo, shopOrderResult), // 自营订单详情
    })

    console.log(this.data.agentOrderInfo, this.data.shopOrderInfo)

  },
  /* 更新订单 isOnlyTotal 为 false时则为生成订单  */
  async handleComputeGatherOrders() {
    const shopComputedResult = await this.updateGatherOrders(1);
    const agentComputedResult = await this.updateGatherOrders(2);
    const {
      isOnlyTotal,
      goodsPriceTotal
    } = this.data;

    if (isOnlyTotal) {

      this.setData({
        pickUpInfo: shopComputedResult.pickUpInfo,
        BalanceAmount: app.tools.tranPriceToFixed(shopComputedResult.BalanceAmount + agentComputedResult.BalanceAmount), // 可抵扣的钱
        goodsPriceTotal: app.tools.tranPriceToFixed(shopComputedResult.goodsPriceTotal + agentComputedResult.goodsPriceTotal) // 抵扣前后的值
      })
    } else {
      console.log(shopComputedResult, agentComputedResult)

      /* 如果计算价格大于0就需要支付 */
      if (goodsPriceTotal > 0) {
        const orderId = `${shopComputedResult.orderId},${agentComputedResult.orderId}`;

        payment(orderId, () => {
          app.goPage({
            url: '/pages/paySuccess/paySuccess',
            type: 'redirect',
            options: {
              total: shopComputedResult.OrderTotal + agentComputedResult.OrderTotal,
              orderId
            }
          })
        })
      } else {

        app.goPage({
          url: '/pages/paySuccess/paySuccess',
          type: 'redirect',
          options: {
            total: 0,
            orderId
          }
        })
      }
    }


  },
  /* 初始化订单数据 */
  getGatherOrders(type) {
    let {
      agentGoodsSkus,
      shopGoodsSkus,
      defaultAddressData,
    } = this.data;

    const shopGoodsCount = shopGoodsSkus.split(',').length || '';
    const agentGoodsCount = agentGoodsSkus.split(',').length || '';

    const ajaxData = {
      shipAddressId: defaultAddressData.ShippingId,
      productSku: type === 1 ? shopGoodsSkus : agentGoodsSkus,
      buyAmount: type === 1 ? shopGoodsCount : agentGoodsCount,
      fromPage: '',
      fightGroupActivityId: '',
      FightGroupId: ''
    }

    return new Promise((resolve, reject) => {
      app.$api.getOrderInfo(ajaxData).then(res => {

        const {
          Data,
          Message,
          success,
        } = res;

        if (!success) {
          return app.alert.confirm({
            content: Message,
            showCancel: false
          }, () => {
            wx.navigateBack();
          })
        }

        const {
          ProductAmount,
          OrderFreight,
          Balance,
          ProductItems: goodsList,
          CouponList: couponList,
          PromotionDesStr: promotionList
        } = Data;

        /* 价格统计 */
        const totalPrice = ((ProductAmount * 100) + (OrderFreight * 100)) / 100;

        /* 统计所朋友商品的数量 */
        const totalCount = app.tools.sum(goodsList.map(v => v.Quantity));

        resolve({
          // buyAmount: app.tools.sum(totalCount),
          Balance,
          OrderFreight,
          totalCount,
          totalPrice,
          goodsList,
          couponList,
          promotionList
        })

      })
    })

  },
  /* 修改提交数据 */
  updateGatherOrders(type) {
    const {
      agentGoodsSkus,
      shopGoodsSkus,
      agentId = '',
      remark = '',
      isUseDeduction,
      extractType,
      isOnlyTotal,
      defaultAddressData: {
        ShippingId = ''
      },
      shopOrderInfo: {
        currentCoupon: {
          code: shopOrderCouponCode
        }
      },
      agentOrderInfo: {
        currentCoupon: {
          code: agentOrderCouponCode
        }
      },
      goodsPriceTotal,
      countDownId
    } = this.data;

    if (!isOnlyTotal && !ShippingId) {
      return app.alert.message('请选择收货地址')
    }



    const couponCode = type === 1 ? shopOrderCouponCode : agentOrderCouponCode;
    const shopGoodsCount = shopGoodsSkus.split(',').length || '';
    const agentGoodsCount = agentGoodsSkus.split(',').length || '';
    const agentFromType = agentGoodsCount == 1 ? 'signbuy' : '';
    const shoppFromType = shopGoodsCount == 1 ? 'signbuy' : '';

    const ajaxData = {
      buyAmount: '',
      // type === 1 ? shopGoodsCount : agentGoodsCount,
      remark, //	备注
      shippingId: ShippingId, // 收货地址id
      productSku: type === 1 ? shopGoodsSkus : agentGoodsSkus, // 购物车商品规格 多个商品用,隔开
      fromPage: '',
      // type === 1 ? shoppFromType : agentFromType, // signbuy 为立即购买
      fightGroupActivityId: '', // 拼团活动id
      fightGroupId: '', // 参团的拼团ID，开团为0
      OrderSource: 8,
      couponCode, // 优惠劵代码 price
      IsAdvancePay: isUseDeduction,
      // type === 1 ? isUseDeduction : false, // 是否使用余额抵扣
      IsGetOrderTotal: isOnlyTotal, // 是否只计算订单金额（true只计算金额false生成订单）
      ShippingModeId: 0, // 配送方式(0快递-1门店-2自提)
      RoomId: app.data.roomid, //	否	int	直播间ID
      FightDistributorUserId: agentId, //代理id,有就传,没有就传空字符串
      MustHasFightDistributorUserId: true,
      countDownId: countDownId || ''
    }


    return new Promise((resolve, reject) => {
      app.$api.submitOrderInfo(ajaxData).then(res => {
        if (!res.success) {
          return
        }

        const {
          BalanceAmount,
          PickeupInStoreMsg,
          OrderTotal,
          PickeupInStore,
          OrderId: orderId,
        } = res;

        /* 开启自提时提醒用户弹窗 */
        if (extractType === -2 && PickeupInStoreMsg) {
          app.alert.message(PickeupInStoreMsg)
        }

        /* 如果不是支付，那就是更新订单 */
        if (isOnlyTotal) {
          resolve({
            BalanceAmount: BalanceAmount, // 可抵扣的钱
            goodsPriceTotal: OrderTotal, // 抵扣前后的值
            pickUpInfo: PickeupInStore, // 自提信息
          })
        } else {
          resolve({
            orderId,
            OrderTotal
          })
        }


      })
    })
  },
  /* 余额抵扣 */
  handleOpenDeductionByGather(e) {
    const {
      value
    } = e.detail;

    /* 未选择地址 */
    if (!this.data.defaultAddressData.ShippingId) {

      return app.alert.confirm({
        content: '您还没有收货地址哦，请先完善收货地址',
        showCancel: false
      }, conf => {
        if (conf) {
          this.goSelectAddress()
        }
        this.setData({
          isUseDeduction: false,
        })
      })
    }

    this.setData({
      isUseDeduction: value,
      isOnlyTotal: true
    }, () => {
      this.handleComputeGatherOrders()
    })
  },

  /* 是否自提  */
  handlePickUpByGather(e) {
    const {
      value
    } = e.detail;;

    /* 未选择地址 */
    if (!this.data.defaultAddressData.ShippingId) {

      return app.alert.confirm({
        content: '前往设置地址',
        showCancel: false
      }, conf => {
        if (conf) {
          this.goSelectAddress()
        }
        this.setData({
          extractType: false,
        })
      })
    }

    this.setData({
      extractType: value ? -2 : 0,
      orderStatus: value,
      isOnlyTotal: true
    }, () => {
      this.handleComputeGatherOrders()
    })
  },

  /* 选择优惠券 */
  showCouponModal(e) {

    const {
      currentTarget: {
        dataset: {
          type
        }
      }
    } = e;

    if (type === 1) {
      this.selectComponent("#shopOrderCoupon").showModal();
    } else {
      this.selectComponent("#agentOrderCoupon").showModal();
    }

  },
  /* 保存优惠券 */
  getGatherCoupon(e) {
    console.log('didididididiidididi')
    const {
      currentTarget: {
        dataset: {
          type
        }
      }
    } = e;

    if (type === 1) {
      this.setData({
        'shopOrderInfo.currentCoupon': e.detail
      })
    } else {
      this.setData({
        'agentOrderInfo.currentCoupon': e.detail
      })
    }
    this.handleComputeGatherOrders();
  }
}

/* ***************************************************分割线****************************************************************** */
Page({
  ...gatherMethods, // 嵌入拆单功能
  data: {
    IS_ARROW_USER_PICK_UP: false, // 是否允许自提，后台控制
    IS_OPEN_BALANCE_DEDUCTION: false, // 是否开启余额抵扣
    imgurl: app.data.imgurl,
    expressList: ['顺丰', '圆通', '中通', '韵达'],
    currentExpress: null, // 快递值
    defaultAddressData: null, // 地址
    orderInfo: null, //商品列表
    goodsCountTotal: 0, // 商品列表总数
    goodsPriceTotal: 0, //商品总价
    sku: null, // 商品skuid
    fromPage: null, // 如果 fromPage为空就是多规格合并付款，场景为从购物车来 countdown--限时抢购
    hiddenPay: true, // 支付modal
    payType: false, // 选择支付类型
    buyAmount: null, //
    groupId: null, //拼团活动id
    couponList: null, //优惠券 
    FightGroupId: 0, //开团为0，参团为FightGroupId
    isDefault: true,
    OrderFreight: 0, //运费
    Balance: 0, // 余额
    isUseDeduction: false, // 控制是否采用余额抵消
    extractType: 0, // 提取方式(0快递-1门店-2自提)
    isPay: 0, // 控制支付
    remark: null, // 备注
    orderStatus: false, // 自提信息的显示隐藏
    isOnlyTotal: true, // 控制订单号的获取,false才可以支付
    BalanceAmount: 0, // 可用于抵扣的值
    couponData: {}, // 选中的优惠卷数据
    prDid: null, // 商品id
    tuxedo: null, // 判断是不是从详情那边立即参团跳过来的字符串
    IsFightGroup: null, //拼团状态
    agentId: null, // 代理id,
    pickUpInfo: {}, // 自提信息
    /* 代理商品sku 拆单专用 */
    agentGoodsSkus: null,
    shopGoodsSkus: null,
    isEdit: false,
    isGather: false, // 是否未拆单
    agentOrderInfo: { // 代理订单详情
      currentCoupon: {
        code: ''
      }
    },
    shopOrderInfo: { // 自营订单详情
      currentCoupon: {
        code: ''
      }
    },
    promotionList: [], // 非拆单模式下满减活动
    countDownId: '', //限时抢购活动id
    showText: false, //处理textarea穿透问题
  },

  onLoad(opt) {
    console.log("optoptoptoptopt", opt);
    //获取上一个页面的数据
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 2];

    const {
      isGather,
      agentGoodsSkus,
      /* 代理商品sku 拆单专用 */
      shopGoodsSkus,
      /* 自营商品sku 拆单专用 */
      sku,
      fromPage,
      buyAmount,
      groupId,
      FightGroupId,
      p: prDid, //商品丶
      ProductId,
      productSku,
      tuxedo,
      IsFightGroup,
      d: agentId, //代理id
    } = opt;
    let countDownId = ''
    if (fromPage == 'countdown') {
      countDownId = currentPage.data.goodsInfo.CountDownSkuInfo.CountDownId || ''
    }
    


    this.setData({
      IS_ARROW_USER_PICK_UP: app.data.IS_ARROW_USER_PICK_UP,
      IS_OPEN_BALANCE_DEDUCTION: app.data.IS_OPEN_BALANCE_DEDUCTION,
      sku,
      fromPage,
      buyAmount,
      groupId,
      FightGroupId,
      prDid,
      ProductId,
      productSku,
      tuxedo,
      IsFightGroup,
      agentId,
      /* 代理商品sku 拆单专用 */
      agentGoodsSkus,
      isGather,
      shopGoodsSkus,
      countDownId, //限时抢购活动id
    })

    /* 提交的样式 */
    if (wx.getStorageSync('tab').WapTheme != 'fruit') {
      this.setData({
        isDefault: false
      })
    }
    this.setData({
      goodsCountTotal: 0
    })

    this.getDefaultAddress();

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    
  },

  /* 选择快递 */
  selectExpress(e) {
    this.setData({
      currentExpress: this.data.expressList[e.detail.value]
    })
  },


  /* 跳转选择地址页面 */
  goSelectAddress() {
    app.goPage({
      url: '/pages/receivingAddress/receivingAddress',
      options: {
        fromType: 1
      }
    })
  },
  /* 到下个页面执行这段代码 */
  setNextPageAddressData(data) {
    this.setData({
      defaultAddressData: data
    })
  },


  /* 获取地址 */
  getDefaultAddress() {
    app.$api.getAddressList().then(res => {
      const {
        success,
        Data
      } = res;

      if (success) {
        let addressDefault = wx.getStorageSync('addressDefault');
        this.setData({
          defaultAddressData: addressDefault || Data[0],
        }, () => {
          if (this.data.isGather) {
            this.getGatherOrdersData();
          } else {
            this.getOrderInfo();
          }
        })
      }
    })
  },

  /* 获取订单详情 */
  getOrderInfo() {
    let {
      fromPage,
      sku,
      buyAmount = '',
      productSku,
      FightGroupId,
      tuxedo,
      goodsCountTotal,
      goodsPriceTotal,
      defaultAddressData,
      groupId
    } = this.data;

    const ajaxData = {
      shipAddressId: defaultAddressData.ShippingId,
      fromPage: fromPage ? fromPage.trim() : '',
      productSku: sku.trim() || productSku.trim(),
      buyAmount,
      fightGroupActivityId: groupId ? groupId.trim() : '',
      FightGroupId: tuxedo ? FightGroupId : ''
    }

    app.$api.getOrderInfo(ajaxData).then(res => {

      const {
        Data,
        Message,
        success,
      } = res;

      if (!success) {
        return app.alert.confirm({
          content: Message,
          showCancel: false
        }, () => {
          wx.navigateBack();
        })
      }

      const {
        ProductAmount,
        OrderFreight,
        Balance,
        ProductItems,
        CouponList,
        PromotionDesStr,
      } = Data;

      /* 计算商品数量和价格 */
      ProductItems.forEach(item => {
        goodsCountTotal = item.Quantity
        goodsPriceTotal = ((ProductAmount * 100) + (OrderFreight * 100)) / 100
      })

      /* 统计所朋友商品的数量 */
      const totalCount = ProductItems.map(v => v.Quantity);

      this.setData({
        buyAmount: app.tools.sum(totalCount),
        Balance: app.tools.tranPriceToFixed(Balance),
        OrderFreight: app.tools.tranPriceToFixed(OrderFreight),
        goodsCountTotal,
        goodsPriceTotal: app.tools.tranPriceToFixed(goodsPriceTotal),
        orderInfo: ProductItems,
        couponList: CouponList,
        promotionList: PromotionDesStr
      })
    })

  },

  /* 确认订单 */
  submitOrder() {
    this.setData({
      isOnlyTotal: false // 用于改变状态  可以获取到订单号
    }, () => {
      this.updateOrderInfo(); // 提交订单
    })
  },




  /* 修改提交数据 */
  updateOrderInfo() {
    const {
      prDid,
      buyAmount = '',
      groupId = '',
      FightGroupId = '',
      agentId = '',
      remark = '',
      isUseDeduction,
      extractType,
      isOnlyTotal,
      fromPage = '',
      sku: productSku,
      defaultAddressData: {
        ShippingId = ''
      },
      couponData: {
        code = ''
      },
      goodsPriceTotal,
      countDownId
    } = this.data;

    // isOnlyTotal为false就是确认订单的操作，建议在此处理所有要拦截的请求
    if (!isOnlyTotal && !ShippingId) {
      return app.alert.message('请选择收货地址')
    }

    const fightGroupActivityId = fromPage == 'signbuy' ? '' : groupId;
    const fightGroupId = fromPage == 'signbuy' ? '' : FightGroupId;

    const ajaxData = {
      buyAmount, // 购买数量 fromPage为空时可不传，数量在购物车里已统计
      remark, //	备注
      shippingId: ShippingId, // 收货地址id
      productSku: productSku, // 购物车商品规格 多个商品用,隔开
      fromPage, // signbuy 为立即购买
      fightGroupActivityId, // 拼团活动id
      fightGroupId, // 参团的拼团ID，开团为0
      OrderSource: 8,
      couponCode: code, // 优惠劵代码 price
      IsAdvancePay: isUseDeduction, // 是否使用余额抵扣
      IsGetOrderTotal: isOnlyTotal, // 是否只计算订单金额（true只计算金额false生成订单）
      ShippingModeId: extractType, // 配送方式(0快递-1门店-2自提)
      RoomId: app.data.roomid, //	否	int	直播间ID
      FightDistributorUserId: agentId, //代理id,有就传,没有就传空字符串
      MustHasFightDistributorUserId: true,
      countDownId: countDownId || ''
    }

    app.$api.submitOrderInfo(ajaxData).then(res => {
      if (!res.success) {
        return
      }

      const {
        BalanceAmount,
        PickeupInStoreMsg,
        OrderTotal,
        OrderId: orderId,
        FightGroupId: groupId,
        PickeupInStore
      } = res;


      /* 开启自提时提醒用户弹窗 */
      if (extractType === -2 && PickeupInStoreMsg) {
        app.alert.message(PickeupInStoreMsg)
      }

      /* 如果不是支付，那就是更新订单 */
      if (isOnlyTotal) {
        this.setData({
          BalanceAmount: app.tools.tranPriceToFixed(BalanceAmount), // 可抵扣的钱
          goodsPriceTotal: app.tools.tranPriceToFixed(OrderTotal), // 抵扣前后的值
          pickUpInfo: PickeupInStore, // 自提信息
        })

        return
      }


      /* 针对订单生成后的操作 */
      const handlers = {
        /* 去拼团详情 */
        navigaToGroupDetail() {
          app.goPage({
            url: '/pages/groupDetail/groupDetail',
            options: {
              fromPage,
              FightGroupId: groupId,
              sku: productSku,
              prDid,
              agentId
            }
          })
        },
        /* 支付成功跳转*/
        paySuccess() {
          app.goPage({
            url: '/pages/paySuccess/paySuccess',
            type: 'redirect',
            options: {
              total: OrderTotal,
              orderId
            }
          })
        },
        /* 调起支付后的成功回调 */
        paymentSuccess() {
          groupId ? app.goPage({
            url: '/pages/groupDetail/groupDetail',
            options: {
              FightGroupId: groupId,
              prDid
            }
          }) : handlers.paySuccess()
        },
        /* 支付失败后的回调，不传则默认处理为跳转到订单列表 */
        paymentFail() {
          if (fromPage === 'presale') {
            app.$api.cancelOrder({
              orderId
            }).then((cancelResult) => {
              cancelResult.success && app.goBack();
            })
          } else {
            app.alert.confirm({
              content: '您取消了支付',
              showCancel: false
            }, conf => {
              conf && app.goPage({
                url: '/pages/myOrder/myOrder'
              })
            })

          }
        }
      }

      /* 以下是正式支付的逻辑，注意，在这里订单已经生成了 */
      /* 开启抵扣余额 */
      if (isUseDeduction) {
        /* 如果有拼团id就证明是拼团订单, 判断是跳转拼团详情还是普通支付完成页面 */
        if (groupId) {
          handlers.navigaToGroupDetail();
        }
        /* 普通支付 */
        else {
          /* 支付金额大于0调起支付，否则直接跳转支付成功 */
          goodsPriceTotal ?
            payment(orderId, () => {
              handlers.paySuccess()
            }) :
            handlers.paySuccess()
        }
      }
      /* 没有开启余额的，直接调起支付 */
      else {
        payment(orderId, handlers.paymentSuccess, handlers.paymentFail)
      }

    })
  },
  /* 确认订单 */
  confirmOrder(orderId, groupId, OrderTotal) {
    /* 将订单号传给后台 */
    const params = {
      orderId,
      pinId: groupId
    };

    app.$api.confirmOrder(params).tnen((res) => {

      app.goPage({
        url: '/pages/paySuccess/paySuccess',
        type: 'redirect',
        options: {
          total: OrderTotal,
          orderId
        }
      })
    })
  },
  /* 关闭modal */
  handleOpenPayModal() {
    /* 拆单 */
    if (this.data.isGather) {
      this.setData({
        isOnlyTotal: false
      })
      this.handleComputeGatherOrders()
    } else {
      this.selectPayType();
    }


  },

  /* 选择支付方式 */
  selectPayType() {
    this.setData({
      payType: true,
      isPay: 1
    }, () => {
      this.submitOrder()
    })

  },

  /* 获取优惠券 */
  selectCoupons() {
    this.selectComponent("#coupon").showModal();
  },

  /* 余额抵扣 */
  handleOpenDeduction(e) {
    const {
      value
    } = e.detail;

    /* 未选择地址 */
    if (!this.data.defaultAddressData.ShippingId) {

      return app.alert.confirm({
        content: '前往设置地址',
        // showCancel: false
      }, conf => {
        if (conf) {
          this.goSelectAddress()
        }

        this.setData({
          isUseDeduction: false,
        })

      })
    }

    this.setData({
      isUseDeduction: value,
      isOnlyTotal: true
    }, () => {
      this.updateOrderInfo()
    })
  },

  /* 是否自提  */
  handlePickUp(e) {
    const {
      value
    } = e.detail;;
    /* 未选择地址 */
    if (!this.data.defaultAddressData.ShippingId) {

      return app.alert.confirm({
        content: '前往设置地址',
        // showCancel: false
      }, conf => {
        if (conf) {
          this.goSelectAddress()
        }
        this.setData({
          extractType: false,
        })
      })
    }

    this.setData({
      extractType: value ? -2 : 0,
      orderStatus: value,
      isOnlyTotal: true
    }, () => {
      this.updateOrderInfo()
    })
  },

  /* 修改备注的值 */ 
  handleEditRemark: debounce(function(e){
    return
    const { value } = e.detail;
    if(value==''){
      this.setData({ remark:'选填，请先和商家协商'})
    }else{
      this.setData({ remark: value })
    }
  },300),

  /* 获取选中的优惠卷的数据 */
  getCouponData(e) {
    this.setData({
      couponData: e.detail
    }, () => {
      this.updateOrderInfo();
    })
  },

  //处理textarea穿透问题,聚焦的时候触发
  handleFocus(e) {
    return
    const { value } = e.detail;
    this.setData({
      remark: '',
      showText: true,
    })
    wx.createSelectorQuery().select('#box').boundingClientRect(function (rect) {
      // 使页面滚动到底部
      wx.pageScrollTo({
        scrollTop: 1000
      })
    }).exec()
  },
  //失去焦点的时候触发
  handleBlur(e) {
    return
    const { value } = e.detail;
    if (value == '') {
      this.setData({ remark: '选填，请先和商家协商' })
    } else {
      this.setData({ showText: false })
    }
  },
  //点击的时候显示
  handleChange(){
    return
    this.setData({
      showText:true
    })
  },

})