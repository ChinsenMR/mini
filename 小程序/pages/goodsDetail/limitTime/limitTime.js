const app = getApp();
import { countdown } from '../../../utils/util.js';
import { countDown, } from '../../../utils/myutil'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsInfo: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    limitHours: '00',
    limitMin: '00',
    limitSecond: '00' ,
    timeObj:{},   
    goods:{},//商品详情参数
  },
  bookingTime1: null,//预售时间定时器
  bookingTime2: null,//预售时间定时器
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
      let _this = this;
      let { goods } = this.data;
      let nowTime = goods.NowTime.replace(/-/g,'/');
      let startTemp = +new Date(nowTime);
      _this.bookingTime1 = setInterval(() => {
        startTemp += 1000
      }, 1000);
      _this.bookingTime2 = setInterval(() => {
        let newTime = goods.CountDownSkuInfo.EndDate.replace(/-/g, '/');
        let obj = countDown(newTime, startTemp);
        _this.setData({
          timeObj: obj,
        });
        if (obj.deltaT <= 0) {
          _this.setData({
            timeObj: obj,
          });
          clearInterval(_this.bookingTime2);
          clearInterval(_this.bookingTime1);
        }
      }, 1000);
    },
  },
  observers: {
    'goodsInfo': function (val) {
      this.setData({
        goods:val
      })
    },
    
  },

 

  /**
   * 组件的方法列表
   */
  methods: {
    initData:function(){

    }    
  }
})
