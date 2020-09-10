const app = getApp();
import {countdown} from '../../../utils/util.js';
import { anArrayOfSplit } from '../../../utils/myutil';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsInfo: Object,
    dlr: String,
    fid: String,
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    hiddenModal: true,
    limitShow: false,
    limitTxt: '',
    limitDay:'00',
    limitHours: '00',
    limitMin: '00',
    limitSecond: '00',
    groupList: [],  // 参团数据
    isShow:false,
    newArr:[],
    goods:[],//商品详情数据
    newGroup:[],//重组的数组
  },
  timeName:null,
  timeName2:null,
  /**
 * 生命周期
 */
  lifetimes: {
    // 在组件实例进入页面节点树时执行
    attached: function () {

    },
    // 在组件实例被从页面节点树移除时执行
    detached: function () {
      clearInterval(this.timeName)
      clearInterval(this.timeName2)
    },
    //在组件在视图层布局完成后执行
    ready: function () {
      // 参团倒计时
      this.timeName2 = setInterval(() => {
        this.Clusterdata()
      }, 1000)

      // 拼图狂欢倒计时
      this.timeName = setInterval(() => {
        this.initData()
      }, 1000)

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
    
    //倒计时
    initData: function() {
      let {FightGroupActivityInfo,FightGroupInfos} = this.data.goodsInfo;
      let startState = countdown(FightGroupActivityInfo.StartDate);
      let endState = countdown(FightGroupActivityInfo.EndDate);
      if (startState.overTime) {
        this.setData({
          limitTxt: '距结束',
          limitDay: endState.limitDay,
          limitHours: endState.limitHours,
          limitMin: endState.limitMin,
          limitSecond: endState.limitSecond
        })
      } else {
        this.setData({
          limitTxt: '距开始',
          limitDay: startState.limitDay,
          limitHours: startState.limitHours,
          limitMin: startState.limitMin,
          limitSecond: startState.limitSecond
        })
        clearInterval(this.timeName);//清除定时器
      }
    },
    // 参团数据
    Clusterdata() {
      let { goodsInfo } = this.data;
      if (goodsInfo.FightGroupInfos){
        goodsInfo.FightGroupInfos.forEach((item, index) => {
          let endDate = countdown(item.EndTime);
          item.limitHours = endDate.limitHours;
          item.limitMin = endDate.limitMin;
          item.limitSecond = endDate.limitSecond;
          item.index = index;
        })
        if (goodsInfo.FightGroupInfos.length != 0) {
          let arr = goodsInfo.FightGroupInfos[0].FightGroupUsers
          this.setData({
            newArr: arr
          })
        }

        /*分数组*/
        let newArr = anArrayOfSplit(goodsInfo.FightGroupInfos, 2);
        this.setData({
          newGroup: newArr,
        })
      }
    },

    //立即拼团
    joinGroup: function(e) {
      const { goodsInfo } = this.data;
      let {
        id,
        isown,
        sku,
        fightgroupid, 
        tuxedo,//用判断是不是立即参团,有这个值就是参团
        dluser,//代理id
      } = e.currentTarget.dataset;
      if (isown) {
        wx.showToast({
          icon: 'none',
          title: '不能参加自己的团'
        })
        return
      }
      if (!goodsInfo.FightSetting.CanJoinCreateFight && goodsInfo.IsFightGroup){
        if (goodsInfo.FightSetting.Msg){
          app.alert.toast(goodsInfo.FightSetting.Msg)
        }else{
          app.alert.toast('等级权限不足,无法参团!')
        }
        return
      }
      wx.navigateTo({
        url: `../confirmationOfOrder/confirmationOfOrder?fromPage=fightgroup&sku=${sku.trim()}&buyAmount=1&groupId=${id}&FightGroupId=${fightgroupid}&tuxedo=${tuxedo}&d=${dluser}`,
      })
    },
    //拼团结束
    joinOver(){
      wx.showToast({
        title: '已经结束啦!',
        icon: 'none',
        duration: 1500,
        mask: true,
        success: (result) => {
          
        },
        fail: () => {},
        complete: () => {}
      });
        
    },
    //打开代理弹窗
    handleClick(){
      this.setData({
        isShow:true
      })
    },
    //关闭弹窗
    handleOff(){
      this.setData({
        isShow: false
      })
    },
    //复制微信号
    copyBtn(){
      let that = this;
      console.log("this.data",this.data);
      let { goodsInfo } = this.data;
      wx.setClipboardData({
        data: goodsInfo.FightDistributorInfo.wechat,
        success: (result) => {
          wx.showToast({
            title: '复制成功',
            icon: 'none',
            duration: 1500,
            mask: true,
          });
        },
        fail: (result) => {
          console.log("输出复制错误信息", result);
        },
        complete: () => {}
      });
        
    },



  }
})