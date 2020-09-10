const app = getApp();
import {
  countdown
} from '../../../utils/util.js';
import {
  countDown
} from "../../../utils/myutil";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsInfo: Object,
    num: {
      type: Number,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    buyTxt: '立即购买',
    buyBtnBg: 'inner2-bg1',
    isDefault: null,
    goods: {},
    bookingObj: {}, //预售时间倒计时
    statusTime: false, //是否显示预售按钮
  },
  bookingTime1: null, //预售时间定时器
  bookingTime2: null, //预售时间定时器
  /**
   * 生命周期
   */
  lifetimes: {
    // 在组件实例进入页面节点树时执行
    attached: function () {

    },
    // 在组件实例被从页面节点树移除时执行
    detached: function () {
      clearInterval(this.bookingTime2);
      clearInterval(this.bookingTime1);
    },
    //在组件在视图层布局完成后执行
    ready: function () {
      if (wx.getStorageSync('tab').WapTheme == 'fruit') this.setData({
        isDefault: 1
      })
      else this.setData({
        isDefault: 2
      })
      this.initData();
    },
  },
  observers: {
    'goodsInfo': function (val) {
      this.setData({
        goods: val
      })
    },

  },



  /**
   * 组件的方法列表
   */
  methods: {
    // 分享
    onShare() {
      this.triggerEvent("share")
    },
    //初始化页面数据
    initData: function () {
      let {
        buyTxt,
        buyBtnBg,
        goodsInfo
      } = this.data;
      if (goodsInfo.IsDiscount) buyBtnBg = 'inner2-bg2'
      if (goodsInfo.Is99) buyBtnBg = 'inner2-bg3'
      if (goodsInfo.IsCountDown) buyBtnBg = 'inner2-bg4'
      // 预售时间
      if (goodsInfo.IsPreSaleProduct) {
        let statusTime = (new Date(goodsInfo.SaleStartDate).getTime()) > (new Date(goodsInfo.NowTime).getTime());
        this.setData({
          statusTime
        })
        if (statusTime) {
          this.openBookingTime(goodsInfo.NowTime, goodsInfo.SaleStartDate, statusTime);
        }
      }
      this.setData({
        buyTxt,
        buyBtnBg
      })

      if (goodsInfo.FightGroupActivityInfo == null) return;
      if (goodsInfo.FightGroupActivityInfo.length == 0) return;
      let endState = countdown(goodsInfo.FightGroupActivityInfo.EndDate);
      if (endState.overTime) {
        goodsInfo.IsFightGroup = false;
        this.setData({
          goodsInfo: this.data.goodsInfo
        })
      }
    },

    onAdd: function (e) {
     

      const {
        goodsInfo
      } = this.data;
      const {
        currentTarget: {
          dataset: {
            type,
            handleType,
            group
          }
        }
      } = e;
      wx.setStorageSync('buyType', type);
      if (group == 'group') { //发起拼团的时候
        if (!goodsInfo.FightSetting.CanCreateFight) { //不成立时
          app.alert.toast('等级权限不足,无法发起拼团!')
          return
        } else {
          this.triggerEvent('open', {
            type,
            handleType
          })
        }
      } else if (goodsInfo.IsCountDown && handleType == 1) {
        app.alert.toast('限时抢购不能加入购物车！');
        return
      } else {
        this.triggerEvent('open', {
          type,
          handleType
        })
      }

    },

    //预售商品获取预售时间和倒计时
    openBookingTime(star, end, statusTime) {
      let _this = this;
      let startTemp = +new Date(star);
      _this.bookingTime1 = setInterval(() => {
        startTemp += 1000
      }, 1000);
      _this.bookingTime2 = setInterval(() => {
        let obj = countDown(end, startTemp);
        _this.setData({
          bookingObj: obj,
        });
        if (obj.deltaT <= 0) {
          _this.setData({
            goodsInfo: {},
            statusTime,
            bookingObj: obj,
          });
          _this.initData();
          clearInterval(_this.bookingTime2);
          clearInterval(_this.bookingTime1);
        }
      }, 1000);
    },
    //提示
    handleBooking() {
      app.alert.toast('还未到购买时间！');
    },
  },
})