const app = getApp()
import { getProductsList } from '../../utils/requestApi.js'
import { countDown } from "../../utils/myutil"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    groupList: [], // 拼团
    page: 1, //页码
    imgNo: app.data.imgurl + 'zawuicons.png',
    timeVal:{},//倒计时对象
    ruleShow:false,//控制规则弹窗
    richObj:'',//规则富文本
  },
  page:{
    index:1,
    size:10,
  },
  total:1,
  timeVal:{},
  timeName1: null,
  timeName2: null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getGroup();
  },
  
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  //获取拼团列表
  getGroup(){
    app.$api.groupList({
      pageIndex: this.page.index,
      pageSize: 10,
      sortBy: 'SalePrice'
    }).then(res=>{
      if(res.success){
        let obj = res.Result;
        let arr = obj.Data;
        let all = obj.TotalRecords;//总页数
        if (all / this.page.size < this.page.index) {
          this.total = 1
        } else {
          this.total = Math.ceil(all / this.page.size);
        }

        arr.forEach(v=>{
          let nowTime = v.SysDateTime.replace(/-/g, '/');
          let startTemp = +new Date(nowTime);
          this.timeName2 = setInterval(() => {
            startTemp += 1000
          }, 1000);
          this.timeName1 = setInterval(() => {
            let endTime = v.EndDate.replace(/-/g, '/');
            let obj = countDown(endTime, startTemp);
            v.timeVal = obj
            this.setData({
              groupList: arr,
            });
            if (obj.deltaT <= 0) {
              v.timeVal = obj
              clearInterval(this.timeName1);
              clearInterval(this.timeName2);
            }
          }, 1000);
        })
        let newArr = [...this.data.groupList, ...arr];
        this.setData({
          groupList: newArr,
        });
      }
    })
  },

  //跳转商品详情
  handlDetai(e) {
    const { productid, pagetype} = e.currentTarget.dataset;
    let url = `/pages/goodsDetail/goodsDetail?p=${productid}&pagetype=${pagetype || ''}`;
    app.goTo(url)
  },
  //打开/关闭规则弹窗
  handleClick(e){
    const {type} = e.currentTarget.dataset;
    if(type==1){
      this.getFightRule();//获取活动规则
    }else{
      this.setData({ ruleShow: false })
    }
  },
  //获取活动规则
  getFightRule(){
    app.$api.fightRule().then(res=>{
      if(res.Code==1){
        let obj = res.Data;
        this.setData({
          richObj:obj,
          ruleShow: true
        })
      }
    })
  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(this.timeName1);
    clearInterval(this.timeName2);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(this.timeName1);
    clearInterval(this.timeName2);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.page.index = 1;
    this.setData({
      groupList: []
    });
    this.getGroup();
    //  结束下拉刷新组件的显示
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.page.index >= this.total) {
      app.fa('没有更多数据了!')
    } else {
      this.page.index++
      this.getGroup()
    }
  },
 
})