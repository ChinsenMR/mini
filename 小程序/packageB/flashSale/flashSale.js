const app = getApp()
import { getProductsList } from '../../utils/requestApi.js'
import { countDown } from "../../utils/myutil";
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    imgNo: app.data.imgurl + 'zawuicons.png',
    ruleShow: false,//控制规则弹窗
    richObj: '',//规则富文本
    oldList: [],
    limitList: [],
    intervalArr: [],//清楚定时器数组
    initStartTemp:null,
    CountDownIdArr:[],//活动id
    timeList:[],
  },
  page: {
    index: 1,
    size: 10,
  },
  total: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCountDownInfos();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  //获取限时抢购列表
  getCountDownInfos() {
    app.$api.countDownInfos({
      pageIndex: 1,
      pageSize: 20,
      State: 0,//	否	int	状态，0进行中 ，1未开始，2已过期
    }).then(res => {
      if (res.Code == 1) {
        let arr = res.Data.List;
        let time = res.Data.NowTime;
        time = time.replace(/-/g,'/')
        let startTemp = +new Date(time);
        var initStartTemp = this.data.initStartTemp;
        initStartTemp = setInterval(() => {
          startTemp += 1000
        }, 1000)
        this.setData({//
          oldList: arr,
          limitList: arr
          // timeList: arr
        })
        let downid = []
        arr.forEach((v, i) => {
          downid.push(v.CountDownId)
          this.getCountDonwInfoSkuList(v.CountDownId, i);
          var intervalArr = this.data.intervalArr
          intervalArr[i] = setInterval(() => {
            v.EndDate = v.EndDate.replace(/-/g, '/')
            let obj = countDown(v.EndDate, startTemp);
            v.timeVal = obj
            this.setData({
              CountDownIdArr: downid,
              oldList: arr,
              limitList: arr
              // timeList: arr
            })
            if (obj.deltaT <= 0) {
              if (intervalArr.length === 1) {
                clearInterval(initStartTemp)
              }
              clearInterval(intervalArr[i]);
            }
          }, 1000);
        })
      }
    })
  },
  //
  getCountDonwInfoSkuList(id, index) {
    app.$api.countDonwInfoSkuList({
      pageindex: this.page.index,//	否	int	页码
      pageSize: 10,//	否	int	页大小
      CountDownId: id,//	是	int	活动Id
    }).then(res => {
      let obj = res.Data;
      let all = obj.TotalRecords;
      let newArr = obj.List;
      let list = this.data.oldList
      list[index].timeLimit = newArr;
      if (all / this.page.size < this.page.index) {
        this.total = 1
      } else {
        this.total = Math.ceil(all / this.page.size);
      }
      let pageArr = [...this.data.timeList, ...list];
      this.setData({
        oldList: list,
        limitList: pageArr
      })
    })
  },

  //跳转商品详情
  handlDetai(e) {
    const { limitList,intervalArr, initStartTemp } = this.data;
    limitList.map((v, i) => {
      clearInterval(intervalArr[i])
    })
    clearInterval(initStartTemp)
    const { productid, pagetype } = e.currentTarget.dataset;
    let url = `/pages/goodsDetail/goodsDetail?p=${productid}&pagetype=${pagetype || ''}`;
    app.goTo(url)
  },
  //打开/关闭规则弹窗
  handleClick(e) {
    return
    const { type } = e.currentTarget.dataset;
    if (type == 1) {
      this.getFightRule();//获取活动规则
    } else {
      this.setData({ ruleShow: false })
    }
  },
  //获取活动规则
  getFightRule() {
    app.$api.fightRule().then(res => {
      if (res.Code == 1) {
        let obj = res.Data;
        this.setData({
          richObj: obj,
          ruleShow: true
        })
      }
    })
  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    const { limitList,intervalArr, initStartTemp } = this.data;
    limitList.map((v, i) => {
      clearInterval(intervalArr[i])
    })
    clearInterval(initStartTemp)
  },

  /**
   * 生命周期函数--监听页面卸载 intervalArr
   */
  onUnload: function () {
    const { limitList,intervalArr, initStartTemp } = this.data;
    limitList.map((v,i)=>{
      clearInterval(intervalArr[i])
    })
    clearInterval(initStartTemp)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    const { limitList, intervalArr, initStartTemp, CountDownIdArr } = this.data;
    limitList.map((v, i) => {
      clearInterval(intervalArr[i])
    })
    clearInterval(initStartTemp)
    this.page.index = 1;
    this.setData({
      oldList:[],
      limitList: []
    });
    this.getCountDownInfos();
    // CountDownIdArr.forEach((v, i) => {
    //   this.getCountDonwInfoSkuList(v, i)
    // })
    //  结束下拉刷新组件的显示
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let { CountDownIdArr } = this.data;
    if (this.page.index >= this.total) {
      app.alert.toast('没有更多数据了!')
    } else {
      this.page.index++
      // CountDownIdArr.forEach((v,i)=>{
      //   this.getCountDonwInfoSkuList(v,i)
      // })
      
      this.getCountDownInfos()
    }
  },

})