const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    totalPrice: String, // 商品总价  非传值
    goodsTotal: Number, // 商品总条数  非传值
    cartList: Object,
    magnitude: Object,
    isEdit: Boolean, 
  },

  /**
   * 组件的初始数据
   */
  data: {
    customBottom: null,
    imgUrl: app.data.imgurl,
    isDefault: null, //判断是否为默认tab样式
  },

  ready() {
    
    if (wx.getStorageSync('tab').WapTheme == 'fruit') this.setData({
      isDefault: 1
    })
    else this.setData({
      isDefault: 2
    })
    this.setData({
      customBottom: app.data.isIphoneXSeries ? '144rpx' :'114rpx'
    })
  },

  /**
   * 组件的方法列magnitude表
   */
  methods: {
    remove() {
      this.triggerEvent('remove')
    },
    placeOrder() {
      /* 这里走两套逻辑 */

      const {
        cartList: {
          CartItemInfo: list
        }
      } = this.data;
      const agentGoodsSkus = list.filter(v => v.status && v.KjProductId > 0).map(v => v.SkuID);
      const shopGoodsSkus = list.filter(v => v.status && v.KjProductId == 0).map(v => v.SkuID);

      /* 拆单,即自营商品和代理商品都有选中 */
      if (agentGoodsSkus.length && shopGoodsSkus.length) {
        app.goPage({
          url: '/pages/confirmationOfOrder/confirmationOfOrder',
          options: {
            agentGoodsSkus: agentGoodsSkus.join(','),
            shopGoodsSkus: shopGoodsSkus.join(','),
            fromPage: '',
            isGather: 1
          }
        })
      } else {
        const skus = list.filter(v => v.status && v.SkuID).map(v => v.SkuID);

        if (!skus.length) {
          return app.alert.message('请选择商品');
        }
        app.goPage({
          url: '/pages/confirmationOfOrder/confirmationOfOrder',
          options: {
            sku: skus.join(','),
            fromPage: ''
          }
        })
      }

    },


    // 跳转掌柜页面
    handleMagnitude() {
      wx.redirectTo({
        url: '/packageA/pages/shopkeeperList/shopkeeperList',
        success: (result) => {

        },

      });

    },

    // 跳转升级页面
    handleUpgrade() {
      wx.navigateTo({
        url: '/pages/upgradeMember/upgradeMember',
        success: (result) => {

        },
      });
    },


    // 回首页
    goIndex() {
      console.log("触发了");
      wx.redirectTo({
        url: '/pages/moduleHome/moduleHome',
      })
    },

  }
})