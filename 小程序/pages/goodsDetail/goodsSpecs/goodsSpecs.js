const app = getApp();
import {
  addToCart,
  getCartList
} from '../../../utils/requestApi.js'

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsInfo: Object,
    prDid: String,
    skuItem: Array,
    skus: Array,
    freight: Number,
    paramData: {
      type: Object,
      vlaue: {}
    },
    Defaultaddres: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showType: null,
    addSucc: false, //加入购物车成功
    imgUrl: app.data.imgurl,
    goodsNum: 1, //物品数量
    hiddenModal: true,
    combineIdArr: [], // 选择项后 组成的id
    selectedArr: [], // 已选
    combineGoodsImg: null, //商品图片
    salePrice: '', // 销售价格
    groupSalePrice: '', //拼团价格
    countDownPrice: '', //限时抢购价格
    stock: 0, // 库存
    // animationData: {}, // 加购动画
    aniImg: null, //动画图片
    hiddenAni: true, // 加购动画显示
    Defaultaddres: {}, //地址
    // IsFightGroup:false,
    buyType: '', //用于拼团的时候区分buyType=='signbuy'->单独购买，buyType=='fightgroup'，发起拼团
  },
  /**
   * 生命周期
   */
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },

    ready: function () {
      this.initData();
    },
  },
  //监听数据
  observers: {
    'paramData': function (val) {
      console.log('购买状态', val);
      this.setData({
        buyType: val
      })
    },

  },



  /**
   * 组件的方法列表
   */
  methods: {

    Toaddress() {
      wx.navigateTo({
        url: '/pages/receivingAddress/receivingAddress',
      })
    },

    //初始化页面数据
    initData: function () {
      let {
        selectedArr,
        combineIdArr,
        skuItem,
        skus,
        stock,
        combineGoodsImg,
        salePrice,
        prDid,
        goodsNum,
        goodsInfo,
        groupSalePrice,
        countDownPrice,
        paramData
        // IsFightGroup
      } = this.data;
      //没有规格是给默认值 skuItem = []
      if (skuItem.length == 0) {
        this.setData({
          // combineGoodsImg: goodsInfo.DefaultSku.ImageUrl,
          combineGoodsImg: goodsInfo.ImageUrl1,
          salePrice: goodsInfo.DefaultSku.SalePrice,
          combineIdArr: goodsInfo.DefaultSku.SkuId,
          stock: goodsInfo.DefaultSku.Stock,

          // IsFightGroup: goodsInfo.IsFightGroup
        })
        if (goodsInfo.IsFightGroup) { //拼团
          this.setData({
            groupSalePrice: goodsInfo.FightGroupSkuInfos[0].HeadSalePrice
          })
        }
        if (goodsInfo.IsCountDown) { //限时抢购
          this.setData({
            countDownPrice: goodsInfo.CountDownSkuInfo.SalePrice
          })
        }
        return
      }
      combineIdArr.push(prDid) //商品id
      skuItem.forEach(item => {
        item.AttributeValue.forEach((item2, index2) => {
          if (index2 == 0) item2.selectStatus = true;
          else item2.selectStatus = false;
        });
        selectedArr.push(item.AttributeValue[0].Value);
        combineIdArr.push(item.AttributeValue[0].ValueId); //规格id
      })

      if (goodsInfo.IsFightGroup) { //拼团规格
        this.setData({
          groupSalePrice: goodsInfo.FightGroupSkuInfos[0].HeadSalePrice,
        })
        skus = goodsInfo.FightGroupSkuInfos;
      }
      if (goodsInfo.IsCountDown) { //限时抢购规格
        skus = goodsInfo.CountDownSkuInfoList
      }
      skus.forEach(item => {
        if (combineIdArr.join('_') == item.SkuId) {
          combineGoodsImg = item.ImageUrl;
          salePrice = item.SalePrice;
          groupSalePrice = item.HeadSalePrice;
          countDownPrice = item.SalePrice;
          // stock = item.Stock
        }
      })
      this.setData({
        selectedArr,
        combineIdArr,
        skuItem,
        combineGoodsImg,
        salePrice, //普通商品价格
        groupSalePrice, //拼团价格
        countDownPrice, //限时抢购价格
        stock: goodsInfo.DefaultSku.Stock
      })
    },

    //减少数量
    reduceFun: function () {
      if (this.data.goodsNum > 1) {
        this.setData({
          goodsNum: this.data.goodsNum - 1
        })
      }
    },

    // 增加数量
    addFun: function () {
      let {
        goodsInfo,
        goodsNum
      } = this.data;
      if (goodsNum < goodsInfo.Stock) {
        this.setData({
          goodsNum: this.data.goodsNum + 1
        })
      }
    },

    // 规格属性选择
    selectItem: function (e) {
      let {
        attributeid,
        valueid,
        value,
        index
      } = e.currentTarget.dataset;
      let {
        selectedArr,
        combineIdArr,
        skuItem,
        skus,
        goodsInfo
      } = this.data;

      selectedArr.splice(parseInt(index), 1, value);
      combineIdArr.splice(parseInt(index) + 1, 1, valueid);
      combineIdArr.splice(0, 1, this.data.prDid)
      this.setData({
        selectedArr,
        combineIdArr
      })

      skuItem.forEach(item => {
        if (item.AttributeId == attributeid) {
          item.AttributeValue.forEach((item2, index2) => {
            console.log("选择规格", item2);
            if (item2.ValueId == valueid) {
              item2.selectStatus = true
            } else {
              item2.selectStatus = false
            }
            if (index2 == item.AttributeValue.length - 1) {
              this.setData({
                skuItem
              })
            }
          })
        }
      })

      //重置选择的内容
      if (wx.getStorageSync('buyType') == 'fightgroup') skus = goodsInfo.FightGroupSkuInfos;
      if (goodsInfo.IsCountDown) { //限时抢购规格
        skus = goodsInfo.CountDownSkuInfoList
      }
      skus.forEach(item => {
        if (item.SkuId == combineIdArr.join('_')) {
          console.log('普通商品规格', item);
          this.setData({
            combineGoodsImg: item.ImageUrl1,
            aniImg: item.ImageUrl1,
            salePrice: item.SalePrice,
            groupSalePrice: item.HeadSalePrice,
            countDownPrice: item.SalePrice,
            stock: goodsInfo.DefaultSku.Stock
          })
        }
      })
    },

    // 打开 关闭 showModal
    showModal: function (type) {
      let {
        goodsInfo
      } = this.data;
      this.setData({
        showType: type,
        // aniImg: this.data.combineGoodsImg,
        aniImg: goodsInfo.ImageUrl1,
        hiddenModal: !this.data.hiddenModal
      });
    },

    // 添加购物车
    addGoods: function (e) {
      let {
        combineIdArr,
        goodsNum,
        goodsInfo
      } = this.data;

      let skuId = typeof combineIdArr != 'object' ? goodsInfo.DefaultSku.SkuId : combineIdArr.join('_');
      if (!app.data.roomid) {
        addToCart({
          SkuID: skuId,
          Quantity: goodsNum
        }).then(res => {
          console.log(res)
          if (res.data.Status == 'Success') {
            app.data.sku = skuId;
            this.setData({
              aniImg: goodsInfo.ImageUrl1,
              addSucc: true
            })
            //动画圆隐藏
            setTimeout(() => {
              this.setData({
                addSucc: false
              })
            }, 1800)
            //更新购物车数量
            setTimeout(() => {
              getCartList().then(res => {
                this.setData({
                  num: res.data.Data.RecordCount
                })
                this.triggerEvent('succ', this.data.num)
              })
            }, 1000)
            //this.myAni();
            this.showModal();
          } else {
            wx.showToast({
              title: res.data.Message,
              icon: 'none'
            })
          }
        })
      } else {
        wx.showToast({
          title: '直播商品,不能加入购物车!',
          icon: 'none',
          duration: 1500,
          mask: true,
        });
        return
      }
    },

    // 
    aasdas() {
      this.setData({
        hiddenModal: true
      })
    },

    // 立即购买
    immediatelyBuy: function () {

      /* 检查是否需要登录 */
      if (!app.cache.loadCookie()) {
        return app.checkLoginStatus();
      }

      let {
        combineIdArr,
        goodsNum,
        goodsInfo
      } = this.data;
      let dlr = goodsInfo.FightDistributorInfo.UserId;
      // console.log('立即购买代理id',dlr);
      let type = wx.getStorageSync('buyType'),
        groupId = '';
      if (typeof combineIdArr == 'object') combineIdArr = combineIdArr.join('_'); //拼接规格
      if (goodsInfo.FightGroupActivityInfo) groupId = goodsInfo.FightGroupActivityInfo.FightGroupActivityId
      let groupStatus = goodsInfo.IsFightGroup; //拼团状态
      if (goodsInfo.IsCountDown) { //限时抢购
        type = 'countdown'
        wx.setStorageSync('countDownId', goodsInfo.CountDownSkuInfo.CountDownId);
      } else {
        wx.removeStorageSync('countDownId')
      }
      //跳转确认订单
      wx.navigateTo({
        url: `../confirmationOfOrder/confirmationOfOrder?fromPage=${type}&sku=${combineIdArr}&buyAmount=${goodsNum}&groupId=${groupId}&IsFightGroup=${groupStatus}&p=${goodsInfo.prDid}&d=${dlr}`, //
      })
      this.setData({
        hiddenModal: !this.data.hiddenModal
      });
    },

    //加购动画
    // myAni: function () {
    //   this.setData({ hiddenAni: false })
    //   const animation = wx.createAnimation({
    //     duration: 1000,
    //     timingFunction: 'ease',
    //   })
    //   animation.opacity(1).scale(1.5, 1.5).step({ duration: 300 });
    //   animation.scale(0.2, 0.2).step();
    //   animation.translate(-320, 1500).opacity(0).step({ duration: 200 });
    //   this.setData({
    //     animationData: animation.export()
    //   })
    //   // 1.5秒后复位动画
    //   setTimeout(() => {
    //     animation.opacity(1).translate(0, 0).step();
    //     this.setData({
    //       aniImg: '',
    //       animationData: animation.export()
    //     })
    //   }, 1500)
    // },
  }
})