import {getReviewList} from '../../../utils/requestApi.js'
const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    listData:{//列表数据
      type:Array,
      value:[]
    },
    navHeight:{//计算高度
      type:String,
      value:''
    },
    videoStatus:{//是否展示视频状态
      type:Boolean,
      value:false
    },
    totalAll:{
      type:Number,
      value:0,
    },
    currentTab: String,
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    img1: app.data.imgurl + 'icon_01@2x (2).png',
    img2: app.data.imgurl + 'icon_02@2x.png',
    navList:[
      {
        name:'全部',
        num:0,
        status:true,
        type:'all'
      },
      {
        name: '视频晒单',
        num: 0,
        status: false,
        type:'video'
      },
      {
        name: '有图',
        num: 0,
        status: true,
        type:'img'
      },
    ],
    list:[],//
    vidStatus: false,//是否展示视频状态
    navIndex:0,//导航栏索引值
    total:0,//数据总条数
  },
  //监听数据
  observers: {
    
    'listData,videoStatus,totalAll': function (val,sta,all) {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      this.setData({
        list:val,
        vidStatus:sta,
        total:all
      })
    },
  },
  lifetimes: {
    attached: function () {
      // 在组件实例进入页面节点树时执行
      const { navList, vidStatus, total, list } = this.data;
      navList.forEach(v=>{
        if(v.type == 'all'){
          v.num = total
        } else if (vidStatus && v.type =="video"){
          let arr = list.filter(item => item.VideoUrl);
          v.num = arr.length
          v.status = vidStatus
        } else if (v.type == 'img'){//含有图片的数量
          let arr = list.filter(item => item.ImagesList.length != 0);
          v.num=arr.length
        }
      })
      this.setData({ navList })
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //导航栏切换
    handleChange(e){
      let oldArr = this.data.list;
      const {index,mold} = e.currentTarget.dataset;
      let newArr = [];
      this.setData({ list: [] });//切换重置数组
      if (mold == 'img'){
        oldArr.forEach((v, i) => {
          if (v.ImagesList.length != 0) {
            newArr.push(v)
            this.setData({ list: newArr })
          } 
        })
      } else if (mold == 'video'){
        oldArr.forEach((v, i) => {
          if (v.VideoUrl) {
            newArr.push(v)
            this.setData({ list: newArr })
          }
        })
      } else if (mold == 'all'){
        this.triggerEvent('evaluate', { pageIndex: 1 });//同时用去切换的时候重置请求页码
      }
      this.setData({
        navIndex:index
      })
    },
    //点击视频时全屏播放
    handlePlay(){
      let videoContext = wx.createVideoContext('myVideo', this);
      videoContext.requestFullScreen({direction:0});
    },
    //点击图片预览
    previewImage(e) {
      let {
        pindex,
        cindex
      } = e.target.dataset
      let arr = this.data.listData;
      wx.previewImage({
        urls: arr[pindex].ImagesList, // 需要预览的图片http链接列表
        current: arr[pindex].ImagesList[cindex], // 当前显示图片的http链接
      })
    },

  }
})