import { getSplittinDetails, orderDetail } from '../../../utils/requestApi.js';
const app =  getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    list: [],
    isEmpty: false,
    img:'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=1693705592,2304443847&fm=26&gp=0.jpg',
    infos:[],
    nums:'',
    isShow:false,
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
    showTip:false,
    showList:false,
  },
  page:{
    index:1,
    size:10
  },
  total:1,//总页码

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
  },
  //初始化数据
  initData() {
    let { list, csList } = this.data;
    app.$api.splittinDetails({
      pageSize: 10,
      pageIndex: this.page.index,
      IsUse: false
    }).then(res => {
      if (res.success) {
        let arr = res.Data;
        let all = res.Total;
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
        
        // let newArr = [...this.data.list, ...arr];
        let newArr = this.data.list.concat(arr);
        if (newArr.length == 0) this.setData({ showList:true })
        this.setData({
          list: newArr,
        })
      } 
    })
  },
  //点击获取商品id
  handleClick(e) {
    console.log("输出点击值", e);
    let { order, index } = e.currentTarget.dataset;
    this.setData({
      nums: index,
      isShow: !this.data.isShow
    })
    this.getOrder(order);//201911138938609
  },

  //获取订单详情
  getOrder(id) {
    orderDetail({
      orderId: id,
    }).then(res => {
      console.log("输出订单详情", res);
      if (res.data.Status == "Success") {
        let data = res.data.Data.Suppliers[0].LineItems;
        this.setData({
          infos: data
        })
      }
    })
  },

  //关闭详情
  handleGb(e) {
    console.log("输出了e", e);
    let { index } = e.currentTarget.dataset;
    this.setData({
      infos: [],
    })
  },

  //跳转订单详情
  handleGo(e){
    const { order } = e.currentTarget.dataset;
    app.goPage({
      url: `/pages/orderDetail/orderDetail?id=${order}&boolState=0`
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    // this.setData({
    //   list: [],
    // })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // this.setData({
    //   list: [],
    // })
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
      this.setData({ showTip:true})
    } else {
      this.page.index++
      this.initData()
    }
  },

})