
/**
 * 大转盘抽奖
 */

let util = require("../../utils/util.js");
import { throttle } from '../../utils/myutil';
let app = getApp();

Page({
  data: {
    imgUrl: app.data.imgurl,
    awardsList: {},//大转盘内容
    animationData: {},
    btnDisabled: '',
    content:{},//中奖弹窗对象
    mold:'',//中奖的类型
    show: true,//true隐藏弹窗 false显示弹窗
    img: app.data.imgurl + 'bj_icon1234.png',
    img2: app.data.imgurl + 'bgnyl-icon@2x.png',
    activityid:'',//活动id
    prize:{},//中奖的对象
    prizeIndex:null,//中奖的索引值
    prizeObj:{},//初始化数据
    showShade:false,//防止进动画时重复点击
    projectName:'',//大转盘描述项目名称
    overShow:false,//活动结束弹窗
  },
  //奖品配置
  awardsConfig: {
    chance: true,
    awards: [//大转盘数据格式
      // { 'index': 0, 'name': '优惠券', 'url': app.data.imgurl + 'icon_qbdd@2x.png' },
      // { 'index': 1, 'name': '苹果手机', 'url': app.data.imgurl + '213.jpg' },
      // { 'index': 2, 'name': '谢谢惠顾', 'url': app.data.imgurl + 'icon_xsxhg@2x.png' },
      // { 'index': 3, 'name': '8积分', 'url': app.data.imgurl + 'icon_zs@2x.png' },
      // { 'index': 4, 'name': '5元无门槛券', 'url': app.data.imgurl + '12.jpg' },
      // { 'index': 5, 'name': '10元红包', 'url': app.data.imgurl + '12.jpg' }
    ]
  },
  onLoad(options) {
    
    this.setData({
      activityid: options.activityid,//活动id
      projectName: app.data.projectName+'商城' || '神州商城',
    })
    this.getActivityInfo(options.activityid,1);//商品配置
  },
  onShow(){

  },
  //获取中奖商品 throttle
  getActivityDraw: throttle(function(e){
    this.setData({ showShade:true })
    const { activityid, prizeObj } = this.data;
    app.$api.activityDraw({
      ActivityId: activityid,//	是	int	活动Id
    }).then(res => {
      let obj = res.Data;
      if (res.Code == 1) {
        // this.awardsConfig.awards = [];
        this.setData({
          prize: obj
        })
        this.playReward(obj.AwardId);
        setTimeout(() => {
          this.getActivityInfo(activityid, 10);//商品配置
        }, 4000);
      } else if (res.Code == '1006') {//积分不充足
        let args = {content: res.Msg}
        app.alert.confirm(args, (res) => {
          console.log("确定", res);
        })
      } else if (res.Code=='1003'){//活动结束
        this.setData({overShow:true})
      } else {//未中奖操作
        this.playReward();
        setTimeout(() => {
          this.getActivityInfo(activityid, 10);//商品配置
        }, 4000);
      }
    })
  },500),

  //获取转盘奖品
  getActivityInfo(id,type){
    const { imgUrl, prize } = this.data;
    app.$api.activityInfo({
      ActivityId:id,//	是	int	活动Id（首页模板 linkType=5的 link截取activityid，如： “link”: ”/ vshop / BigWheel.aspx ? activityid = 20”）
    }).then(res=>{
      if(res.Code==1){
        let obj = res.Data;
        let arr = obj.AwardList;
        let xxhg = {
          name: '谢谢惠顾',
          PrizeType: 'xxhg99',
          url: imgUrl+'icon_xsxhg@2x.png' 
        };
        arr.push(xxhg)
        let newArr = JSON.parse(JSON.stringify(arr))
        newArr.forEach((v,i)=>{
          v.index=i;
          if (v.AwardName) v.name = v.AwardName
          if (v.AwardPic) v.url = v.AwardPic
          if (v.PrizeType==1){//积分
            v.url = imgUrl + 'icon_integral@2x.png'
          } else if (v.PrizeType == 2) {//优惠券/礼品券
            v.url = imgUrl + 'icon_coupon@2x.png'
          } 
        })
        if(type ==1){//重新获取总积分时，不需要重新调用转盘，只有为1的时候需要
          this.awardsConfig.awards = newArr
          this.drawAwardRoundel();//因为awardsConfig不是定义在data中的,需要调用this.drawAwardRoundel()该方法重新刷新视图
        }
        this.setData({
          prizeObj:obj,
        })
        
      }
    })
  },

  onReady: function (e) {
    this.drawAwardRoundel();
    //分享
    wx.showShareMenu({
      withShareTicket: true
    });
  },

  //画抽奖圆盘
  drawAwardRoundel: function () {
    let awards = this.awardsConfig.awards;
    console.log('画抽奖圆盘数字', awards);
    let awardsList = [];
    let turnNum = 1 / awards.length;  // 文字旋转 turn 值
    // 奖项列表
    for (let i = 0; i < awards.length; i++) {
      awardsList.push({
        turn: i * turnNum + 'turn',
        lineTurn: i * turnNum + turnNum / 2 + 'turn',
        award: awards[i].name,
        url: awards[i].url,
        PrizeType: awards[i].PrizeType
      });
    }
    console.log("新数组",awardsList);
    // console.log("大转盘数据", awardsList);
    this.setData({
      btnDisabled: this.awardsConfig.chance ? '' : 'disabled',
      awardsList: awardsList
    });
  },
  

  //发起抽奖
  playReward: function (awardid) {
    let awards = this.awardsConfig.awards;
    let prizeIndex = awards.findIndex(item => item.AwardId == awardid);
    console.log('发起抽奖1', prizeIndex);
    // let awardIndex = prizeIndex || awards.length;//中奖index,用于控制那个奖品中奖
    let awardIndex = prizeIndex;//中奖index,用于控制那个奖品中奖
    let runNum = 8;//旋转8周
    let duration = 4000;//时长

    // 旋转角度
    this.runDeg = this.runDeg || 0;
    this.runDeg = this.runDeg + (360 - this.runDeg % 360) + (360 * runNum - awardIndex * (360 / awards.length));//根据数组控制长度
    //创建动画
    let animationRun = wx.createAnimation({
      duration: duration,
      timingFunction: 'ease'
    })
    animationRun.rotate(this.runDeg).step();
    this.setData({
      animationData: animationRun.export(),
      btnDisabled: 'disabled'
    });

    // 中奖提示
    let awardsConfig = this.awardsConfig;
    console.log('中奖提示', awardsConfig);
    setTimeout(function () {
      // wx.showModal({
      //   title: '恭喜',
      //   content: '获得' + (awardsConfig.awards[awardIndex].name),
      //   showCancel: false
      // });
     
      // this.setData({ showShade: true })
      this.setData({
        showShade:false,//关闭遮挡层
        show:false,//显示弹窗
        // mold: awardsConfig.awards[awardIndex].PrizeType,//类型判断显示那个
        // content: awardsConfig.awards[awardIndex].name,//中奖的商品名称
        content: awardsConfig.awards[awardIndex],
        btnDisabled: ''
      });
    }.bind(this), duration);

  },

  //切换弹窗
  handleGo(){
    app.goTo('/packageB/recordPrize/recordPrize')
  },
  //关闭弹窗
  handleOff(){
    this.setData({
      show: !this.data.show
    })
  },
  //防止穿透
  handleShade(){
    return
  },
  //活动结束，返回上一层
  handleOver(){
    console.log("输出了吗");
    this.setData({ overShow:false})
    wx.navigateBack({
      delta: 1
    });
  },

})
