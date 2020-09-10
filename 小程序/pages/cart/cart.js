import {deleteBlankData} from '../../utils/util';
const app = getApp();
let touchDotX = 0; //X按下时坐标
let touchDotY = 0; //y按下时坐标
let interval; //计时器
let time = 0; //从按下到松开共多少时间*100

/**
 * 选中订单时，如果是同一类的订单，那么可以一起选择
 * 否则的话，直接置灰，全选时也一样
 */
Page(app.$page({
  data: {
    checkedIcon: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202008111639374708700.png',
    uncheckIcon: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202008111639375802501.png',
    imgUrl: app.data.imgurl,
    tabIndex: null, // 底部导航栏的索引值
    isCheckAll: false, // 全选
    magnitudeObj: {}, //等于判断数据
    showAgentOrder: true,
    showShopOrder: true,
    isSelectedAllAgentGoods: false,
    isSelectedAllShopGoods: false,
    showShopTemplate: false,
    showAgentTemplate: false,
  },
  state: {
    cart: ['cartList', 'cartCount', 'totalPrice']
  },
  onLoad(options) {
    this.setData({
      tabIndex: options.tabIndex
    })
    this.getStoreInfo()
  },
  onShow() {

    this.getCartList();
  },
  methods: {
    /* 商品面板折叠 */
    handleArrowOrder(e) {
      const {
        currentTarget: {
          dataset: {
            type
          }
        }
      } = e;
      const {
        showAgentOrder,
        showShopOrder
      } = this.data;

      type === '2' ? this.setData({
        showAgentOrder: !showAgentOrder
      }) : this.setData({
        showShopOrder: !showShopOrder
      })

    },
    /* 查看满减详情 */
    seeActiyityDetail() {
      app.goPage({
        url: '/packageB/discounts/discounts'
      })
    },
    /* 获取门店信息*/
    getStoreInfo() {
      const {
        StoreId,
        BrandLevel
      } = app.cache.loadUserInfo("userInfo");

      this.setData({
        magnitudeObj: {
          StoreId: Number(StoreId),
          BrandLevel: Number(BrandLevel)
        }
      })

    },
    /* 获取购物车数据 */
    getCartList() {
      app.$api.getCartList()
        .then(res => {
          const {
            Data: data,
            success
          } = res;

          if (success) {
            const {
              CartItemInfo: cartList
            } = data;
            console.log('购物车列表', cartList);

            cartList.forEach(item => {
              item.status = false;
              item.clearStatus = false;
              item.Quantity = parseInt(item.Quantity);
              item.ItemAdjustedPrice = app.tools.tranPriceToFixed(item.ItemAdjustedPrice);
              item.MemberPrice = app.tools.tranPriceToFixed(item.MemberPrice);
              if (item.PromotionDesStr){
                item.PromotionDesStr = item.PromotionDesStr.split("|");
                let feedBackImg = deleteBlankData(item.PromotionDesStr);//删除空格和过滤数组空数据
                item.PromotionDesStr = feedBackImg
                console.log("输出满减活动数组", item.PromotionDesStr);
              }
              if (item.KjProductId == 0) {
                this.data.showShopTemplate = true
              }
              if (item.KjProductId > 0) {
                this.data.showAgentTemplate = true
              }
            })
            console.log(cartList.filter(v => v.KjProductId > 0), cartList.filter(v => v.KjProductId == 0))

            this.setData({
              isCheckAll: false,
              isSelectedAllAgentGoods: false,
              isSelectedAllShopGoods: false,
              showShopTemplate: this.data.showShopTemplate,
              showAgentTemplate: this.data.showAgentTemplate,
            })

            app.$store.cart.update({
              cartList: data,
              cartCount: 0,
              totalPrice: 0
            })

            app.data.cartNum = data.RecordCount;
          }
        })
    },

    /* 改变商品的数量 */
    editGoodsCount(e) {
      const {
        cartList
      } = this.data;
      let {
        currentTarget: {
          dataset: {
            id: goodsId,
            num: quantity,
            type: editType
          }
        }
      } = e;

      const index = cartList.CartItemInfo.findIndex(v => v.SkuID === goodsId);

      quantity += editType === 'reduce' ? -1 : 1;

      if (quantity > 0) {
        app.$api.editGoodsCount({
          skuID: goodsId,
          quantity: quantity
        }).then(res => {
          if (res.success) {
            cartList.CartItemInfo[index].Quantity = quantity;

            app.$store.cart.update({
              cartList
            })

            this.handleGoodsCount()
          }
        })
      }

    },
    /* 选中单个类型的商品 */
    checkAllGoodsByType(e) {
      const {
        currentTarget: {
          dataset: {
            type
          }
        }
      } = e;

      let {
        cartList: {
          CartItemInfo: list
        },
        isSelectedAllAgentGoods,
        isSelectedAllShopGoods,
      } = this.data;

      type == 1 ?
        isSelectedAllShopGoods = !isSelectedAllShopGoods :
        isSelectedAllAgentGoods = !isSelectedAllAgentGoods


      list.forEach(v => {
        if (type == 1 && v.KjProductId == 0) {
          v.status = isSelectedAllShopGoods;
        }

        if (type == 2 && v.KjProductId > 0) {
          v.status = isSelectedAllAgentGoods
        }
      })

      const checkedList = list.filter(v => v.status);

      this.setData({
        isCheckAll: checkedList.length === list.length,
        isSelectedAllShopGoods,
        isSelectedAllAgentGoods,
        'cartList.CartItemInfo': list
      })

      this.handleGoodsCount()

    },
    /* 全选商品 */
    checkAllGoods() {
      let {
        cartList: {
          CartItemInfo: list = []
        },
        cartList,
        isCheckAll
      } = this.data;

      list.forEach(item => {
        item.status = !isCheckAll
      })

      app.$store.cart.update({
        cartList
      })

      this.setData({
        isSelectedAllShopGoods: !isCheckAll,
        isSelectedAllAgentGoods: !isCheckAll,
        isCheckAll: !isCheckAll
      })

      this.handleGoodsCount()
    },

    /* 单选商品 */
    checkGoodsItem(e) {
      const id = e.currentTarget.dataset.id,
        {
          cartList: {
            CartItemInfo: list = []
          },
          cartList,
        } = this.data;

      list.forEach(item => {
        if (item.SkuID === id) {
          item.status = !item.status;
        }
      })

      const len = list.filter(v => !v.status);

      const checkedAgentList = list.filter(v => !v.status && v.KjProductId > 0);
      const checkedShopList = list.filter(v => !v.status && v.KjProductId == 0);

      this.setData({
        isSelectedAllShopGoods: !checkedShopList.length,
        isSelectedAllAgentGoods: !checkedAgentList.length,
        isCheckAll: !len.length,
      })

      app.$store.cart.update({
        cartList
      })

      this.handleGoodsCount();
    },

    /* 计算价格数量 */
    handleGoodsCount() {
      
      let {
        cartList: {
          CartItemInfo: list
        },
        cartCount,
        totalPrice
      } = this.data;

      cartCount = 0
      totalPrice = 0

      list.forEach(item => {
        if (item.status) {
          cartCount++;
          totalPrice += item.Quantity * item.MemberPrice;
        }
      })

      app.$store.cart.update({
        cartCount,
        totalPrice: app.tools.tranPriceToFixed(totalPrice),
      })

    },
    callback(res) {
      console.log(res, 1)
    },

    /* 触摸开始事件 */
    touchStart(e) {
      touchDotX = e.touches[0].pageX; // 获取触摸时的原点
      touchDotY = e.touches[0].pageY;
      // 使用js计时器记录时间    
      interval = setInterval(function () {
        time++;
      }, 100);
    },
    /* 回到首页 */
    handleGoIndex(){
      app.goTo('/pages/home/home')
    },
    /* 编辑商品 */
    handleEdit(e) {
      this.setData({
        isEdit: !this.data.isEdit
      })
    },

    /* 触摸结束事件 */
    touchEnd(e) {
      let {
        cartList
      } = this.data;
      let id = e.currentTarget.dataset.id;
      let touchMoveX = e.changedTouches[0].pageX;
      let touchMoveY = e.changedTouches[0].pageY;
      let tmX = touchMoveX - touchDotX;
      let tmY = touchMoveY - touchDotY;
      if (time < 20) {
        let absX = Math.abs(tmX);
        let absY = Math.abs(tmY);
        if (absX > 2 * absY) {
          cartList.CartItemInfo.forEach(item => {
            if (id == item.SkuID) {
              if (tmX < -5) item.clearStatus = true;
              else item.clearStatus = false;
              this.setData({
                cartList
              })
            }
          })
        }

      }
      clearInterval(interval); // 清除setInterval
      time = 0;
    },

    removeGoodsList(e) {

      const {
        cartList: {
          CartItemInfo: goodsList
        }
      } = this.data;

      const result = goodsList.filter(v => v.status);
      const skuIds = result.map(v => v.SkuID).join(',')

      if (!skuIds) {
        return app.alert.message('请选择商品')
      }

      app.alert.confirm({
        content: '请确认删除'
      }, conf => {
        if (conf) {
          app.$api.removeGoods({
            SkuIDs: skuIds,
          }).then(res => {
            if (res.success) {
              this.getCartList();
            }
          })
        }
      })
    },

    /* 获取优惠券 */
    handleShowCouponModal() {
      this.selectComponent("#coupon").showModal();
    },

    /*去满减活动页面 */
    handleSpecial(){
      app.goTo('/packageB/discounts/discounts')
    },
    
  },
}))