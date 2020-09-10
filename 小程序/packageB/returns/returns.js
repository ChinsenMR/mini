import { getSplittinDetails } from '../../utils/requestApi';
import { debounce } from "../../utils/myutil";
const app =  getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    list: [],
    csList: [
      {
        name: '订单编号',
        val: '',
        type: 'OrderId',
      },
      {
        name: '下单时间',
        val: '',
        type: 'TradeDate',
      },
      {
        name: '订单金额',
        val: '',
        type: 'OrderTotal',
      },
      {
        name: '预估收益',
        val: '',
        type: 'Amount',
      },
      {
        name: '微信呢称',
        val: '',
        type: 'NickName',
      },
    ],
    orderVal:'',
  },
  page: {
    index: 1,
    size: 10
  },
  total: 1,//总页码

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // this.initData();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //初始化数据
  initData(val) {
    wx.showLoading({ title: '加载中...' })
    let {  list, csList, orderVal } = this.data;
    getSplittinDetails({
      pageSize: this.page.size,
      pageIndex: this.page.index,
      OrderId: val || orderVal || '',//	否	string	订单Id
      IsUse: true
    }).then(res => {
      console.log("输出佣金明细", res);
      wx.hideLoading()
      if (res.data.Status == 'Success') {
        let arr = res.data.Data;
        let all = res.data.Total;
        if (all / this.page.size < this.page.index) {
          this.total = 1;
        } else {
          this.total = Math.ceil(all / this.page.size);
        }
        //------------------------------------------------------------
        arr.forEach((item, index) => {
          item.csList = JSON.parse(JSON.stringify(csList));//深拷贝,因为是引用类型
          if (item.ExpensesList) {
            item.obj = (JSON.parse(item.ExpensesList));//解析JSON,重新赋值
            item.csList = [...item.csList, ...item.obj]
          }
          item.csList.forEach((e, i) => {
            for (const key in item) {
              if (e.type == key) e.val = item[key] || '暂无数据'
            }
          })
        })
        //------------------------------------------------------------
        let newArr = [...list, ...arr];
        this.setData({
          list: newArr,
        })
      }
    })
  },
  //获取输入框的值debounce
  handleInput: debounce(function (e) { //防抖
    this.setData({
      orderVal: e.detail.value
    });
  }, 500),

  //点击完成触发
  handleChange(e){
    const { value } = e.detail;
    this.setData({list:[]});
    this.initData(value);
  },
  //点击搜索按钮触发
  handleSeach(){
    this.setData({ list: [] });
    this.initData();
  },
  //清空输入值
  handleClear(){
    this.setData({ 
      list: [],
      orderVal:''
    });
  },
  //跳转订单详情
  handleGo(e) {
    const { order } = e.currentTarget.dataset;
    app.goPage({
      url: `/pages/orderDetail/orderDetail?id=${order}&boolState=0`
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
  onPullDownRefresh: function () {
    this.page.index = 1;
    this.setData({
      list: []
    });
    this.initData();
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
      this.initData()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})