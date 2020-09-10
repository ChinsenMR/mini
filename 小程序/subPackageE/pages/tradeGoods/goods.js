const app = getApp();
Page({
  data: {
    iconUrl: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202008140910383897140.png',
    arrowRightIcon: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202008131409100679052.png',
    tradeDetail: {
      goods: [],
      address: {
        name: '张佳佳',
        addressText: '广州市越秀区越秀南路创举商业大厦商业大厦商业大厦商业大厦',
        phone: '13725196604'
      },
      remark: null,
    },
    params: {
      skuId: null
    },
    defaultAddress: {},
    selectAddressUrl: '/pages/receivingAddress/receivingAddress?fromType=tradeGoods'
  },

  onLoad(options) {
    
    this.setData({
      params: {
        ...this.data.params,
        ...options
      },
    })

    this.getTradeProduct();
  },
  /* 输入备注 */
  inputRemark(e) {
    const {
      detail: {
        value
      }
    } = e;

    this.setData({
      'tradeDetail.remark': value
    })
  },
  /* 到下个页面执行这段代码 */
  setNextPageAddressData(data) {
    this.setData({
      defaultAddress: data
    })
  },
 
  /* 获取兑换商品 */
  getTradeProduct() {
    app.$api.getSkuByExchangeCode({
      CardCode: this.data.params.code
    }).then(res => {
      if (res.success) {
        const {
          Data: goods
        } = res;

        this.data.tradeDetail.goods.push(goods)
        this.setData({
          'tradeDetail.goods': this.data.tradeDetail.goods
        })
      }
    })
  },
  /* 兑换商品 */
  exchangeCodeToOrder() {
    const {
      params: {
        code: cardCode
      },
      tradeDetail: {
        remark,
      },
      defaultAddress
    } = this.data;

    if (!defaultAddress.ShippingId) {
      return app.alert.message('收货地址不能为空')
    }

    app.$api.exchangeCodeToOrder({
      cardCode,
      remark,
      shippingId: defaultAddress.ShippingId
    }).then(res => {
      if (res.success) {

        app.alert.success('兑换成功')
        app.tools.goPageTimeOut({
          type: 'redirect',
          url: '/pages/myOrder/myOrder',
        })
      }
    })
  },

  /* 查看兑换记录 */
  seeTradeHistory() {
    app.goPage({
      url: '/subPackageE/pages/tradeGoods/history'
    })
  },

})