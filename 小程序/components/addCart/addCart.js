const app = getApp();
import {
  addToCart,
  getCartList
} from '../../utils/requestApi'

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
    paramData: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    addSucc: false, //加入购物车成功
    imgUrl: app.data.imgurl,
    goodsNum: 1, //物品数量
    hiddenModal: true,
    combineIdArr: [], // 选择项后 组成的id
    selectedArr: [], // 已选
    combineGoodsImg: null, //商品图片
    salePrice: '', // 销售价格
    groupSalePrice: '',//拼团价格
    countDownPrice: '',//限时抢购价格
    stock: 0, // 库存
    // animationData: {}, // 加购动画
    aniImg: null, //动画图片
    hiddenAni: true, // 加购动画显示
    Defaultaddres: {}, //地址
    FightGroupPrice: 0, // 拼团价格
    // IsFightGroup:false,
  },

  ready: function () {
    // this.initData();
    // this.initDefaultaddress();
    console.log("规格中的数据", this.data);
  },

  /**
   * 组件的方法列表
   */
  observes: {
    'goodsInfo': (obj1) => {
      console.log(obj)
    }
  },
  methods: {
    //默认地址
    initDefaultaddress() {
      app.fg({
        url: '/API/MembersHandler.ashx?action=GetUserShippingAddress'
      }).then(res => {
        if (res.data.Status == "Success") {
          this.setData({
            Defaultaddres: res.data.Data[0]
          })

        }
      })
    },

    Toaddress() {
      wx.navigateTo({
        url: '/packageC/pages/receivingAddress/receivingAddress',
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
        // FightGroupPrice, 
        // IsFightGroup
      } = this.data;
      console.log('输出规格商品信息', this.data.goodsInfo);
      //没有规格是给默认值 skuItem = []

      if (skuItem.length == 0) {
        this.setData({
          combineGoodsImg: goodsInfo.ImageUrl1,
          salePrice: goodsInfo.DefaultSku.SalePrice,
          combineIdArr: goodsInfo.DefaultSku.SkuId,
          stock: goodsInfo.DefaultSku.Stock,
        })
        if (goodsInfo.IsFightGroup) {//拼团
          this.setData({ groupSalePrice: goodsInfo.FightGroupSkuInfos[0].HeadSalePrice })
        }
        if (goodsInfo.IsCountDown) {//限时抢购
          this.setData({
            countDownPrice: goodsInfo.CountDownSkuInfo.SalePrice
          })
        }
        return
      }
      combineIdArr = [];
      combineIdArr.push(prDid) //商品id

      skuItem.forEach(item => {
        item.AttributeValue.forEach((item2, index2) => {
          if (index2 == 0) item2.selectStatus = true;
          else item2.selectStatus = false;
        });
        selectedArr.push(item.AttributeValue[0].Value);
        combineIdArr.push(item.AttributeValue[0].ValueId); //规格id
      })

      if (goodsInfo.IsFightGroup) {//拼团规格
        this.setData({ groupSalePrice: goodsInfo.FightGroupSkuInfos[0].HeadSalePrice, })
        skus = goodsInfo.FightGroupSkuInfos;
      }
      if (goodsInfo.IsCountDown) {//限时抢购规格
        skus = goodsInfo.CountDownSkuInfoList
      }
      
      skus.forEach(item => {
        if (combineIdArr.join('_') == item.SkuId) {
          combineGoodsImg = item.ImageUrl;
          salePrice = item.SalePrice;
          // stock = item.Stock
          stock = goodsInfo.DefaultSku.Stock;
          groupSalePrice = item.HeadSalePrice;
          countDownPrice = item.SalePrice;
        }
      })
      this.setData({
        selectedArr,
        combineIdArr,
        skuItem,
        combineGoodsImg,
        stock,
        salePrice,//普通商品价格
        groupSalePrice,//拼团价格
        countDownPrice,//限时抢购价格
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

    // 属性选择
    selectItem: function (e) {

      let {
        attributeid,
        valueid,
        value,
        index
      } = e.currentTarget.dataset;
      let {
        selectedArr,
        combineIdArr = [],
        skuItem,
        skus,
        goodsInfo
      } = this.data;
      // if (typeof combineIdArr === 'string') {
      //   this.initData();
      // }

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
            if (item2.ValueId == valueid) item2.selectStatus = true
            else item2.selectStatus = false
            if (index2 == item.AttributeValue.length - 1) this.setData({
              skuItem
            })
          })
        }
      })

      //重置选择的内容
      if (wx.getStorageSync('buyType') == 'fightgroup') skus = goodsInfo.FightGroupSkuInfos;
      if (goodsInfo.IsCountDown) {//限时抢购规格
        skus = goodsInfo.CountDownSkuInfoList
      }
      skus.forEach(item => {
        if (item.SkuId == combineIdArr.join('_')) {
          this.setData({
            combineGoodsImg: item.ImageUrl1,
            aniImg: item.ImageUrl1,
            salePrice: item.SalePrice,
            stock: item.Stock,
            countDownPrice: item.SalePrice,
            groupSalePrice: item.HeadSalePrice,
          })
        }
      })
    },

    // 打开 关闭 showModal
    showModal: function () {
      this.initData();
      this.setData({
        aniImg: this.data.combineGoodsImg,
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
      addToCart({
        SkuID: skuId,
        Quantity: goodsNum
      }).then(res => {
        console.log(res)
        if (res.data.Status == 'Success') {
          app.alert.toast('添加成功！')
          app.data.sku = skuId;
          this.setData({
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
        } else if (res.data.Status == 'login' || res.data.Status == 'Login') {
          wx.navigateTo({
            url: '/packageC/pages/authorizationLogin/authorizationLogin',
          })
        } else {
          wx.showToast({
            title: res.data.Message,
            icon: 'none'
          })
        }
      })
    },

    // 
    aasdas() {
      this.setData({
        hiddenModal: true
      })
    },

    // 立即购买
    immediatelyBuy: function () {
      let {
        combineIdArr,
        goodsNum,
        goodsInfo
      } = this.data;
      let type = wx.getStorageSync('buyType'),
        groupId = '';
      if (typeof combineIdArr == 'object') combineIdArr = combineIdArr.join('_')
      if (goodsInfo.FightGroupActivityInfo) groupId = goodsInfo.FightGroupActivityInfo.FightGroupActivityId
      let groupStatus = goodsInfo.IsFightGroup; //拼团状态

      //跳转确认订单
      wx.navigateTo({
        url: `../confirmationOfOrder/confirmationOfOrder?fromPage=${type}&sku=${combineIdArr}&buyAmount=${goodsNum}&groupId=${groupId}&IsFightGroup=${groupStatus}&prDid=${goodsInfo.prDid}`, //
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