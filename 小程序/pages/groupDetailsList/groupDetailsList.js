import { getFightGroupList } from "../../utils/requestApi";
import { countDown } from '../../utils/myutil';

let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    groupData:[],
    groupList:[]
  },
  pages:{
    index:1
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getGroupData();
  },

  //页面初始化数据
  getGroupData(){
    getFightGroupList({
      pageIndex: this.pages.index,	
      pageSize:10
    }).then(res=>{
      if(res.data.Status=="Success"){
        let arr = res.data.FList;
        arr.forEach((item, index) => {
          item.aaa = item.StartTime.substring(0, 19)
          item.StartTime = item.aaa.replace('T', ' ')
          if (item.EndTime.includes('T')) {
            item.EndTime = item.EndTime.replace('T', ' ').substring(0, 19);
          }
        })
        let newArr = [...this.data.groupData,...arr];
        this.setData({
          groupData: newArr
        })
        this.Clusterdata();
      }
    })
  },

  // 参团数据
  Clusterdata() {
    const { groupData } = this.data;
    groupData.forEach((item, index) => {
      let endTime = item.EndTime.replace(/-/g, '/');
      this[`timeName-${index}`] = setInterval(() => {
        let obj = countDown(endTime);
        item.timeVal = obj
        this.setData({
          groupData,
        });
        if (obj.deltaT <= 0) {
          item.timeVal = obj
          clearInterval(this[`timeName-${index}`] );
        }
      }, 1000);
    })
    this.setData({
      groupData
    })
  },
  //跳转拼团详情
  handleGroup(e){
    const { id, productid } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/groupDetail/groupDetail?id=${id}&productid=${productid}`,
    });
      
  },
  //跳转订单详情
  handleOrder(e){
    const { orderid } = e.currentTarget.dataset;
    console.log(orderid);
    wx.navigateTo({
      url: `/pages/orderDetail/orderDetail?id=${orderid}`,
    });
  },
  /**
 * 生命周期函数--监听页面隐藏
 */
  onHide: function () {
    const { groupData } = this.data;
    groupData.forEach((item,index)=>{
      clearInterval(this[`timeName-${index}`] );
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    const { groupData } = this.data;
    groupData.forEach((item, index) => {
      clearInterval(this[`timeName-${index}`]);
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.pages.index = 1;
    this.setData({
      groupData: []
    });
    this.getGroupData();
    //  结束下拉刷新组件的显示
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.pages.index++
    this.getGroupData()
  },

})