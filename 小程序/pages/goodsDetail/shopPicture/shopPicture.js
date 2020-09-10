import {
  getReviewList
} from '../../../utils/requestApi.js'
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    listData: {
      type: Array,
      value: []
    },
    goodsComment: Object,
    prDid: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    img1: app.data.imgurl + 'icon_01@2x (2).png',
    img2: app.data.imgurl+'icon_02@2x.png',
  },
  observers: {
    'listData': function (val) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      // console.log("asdsa1", val);
    }
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //打开实拍页面
    onChange: function(e) {
      this.triggerEvent('toChange', {
        id: 2
      })
    },

    //点击预览图片
    previewImage(e){
      let { pindex, sindex } = e.target.dataset
      let arr = this.data.listData;
      console.log("详情预览图片",arr);
      wx.previewImage({
        urls: arr[pindex].ImagesList, // 需要预览的图片http链接列表
        current: arr[pindex].ImagesList[sindex],// 当前显示图片的http链接
      })
    },
  }
})