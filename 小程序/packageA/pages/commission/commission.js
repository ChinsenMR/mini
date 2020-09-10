const app = getApp();
import { getSplittinDetails, signAgreement, getAgreement } from '../../../utils/requestApi.js';
let WxParse = require('../../../wxParse/wxParse');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    listData: null,
    list: [],
    page: 1,
    isEmpty: false,
    isShow: false,
    status: '',//是否同意协议
    isWin: false,
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
        name: '实际收益',
        val: '',
        type: 'Amount',
      },
      {
        name: '微信呢称',
        val: '',
        type: 'NickName',
      },
    ],
    earnings: {},//收益数据
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
    this.getMoney();
    this.initData();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  //获取累计佣金和奖励金
  getMoney() {
    app.$api.getAcccountMoney({
      MemberBanlanceTypeStr: '0,1',//0表示余额，1表示佣金，如果只查余额，就传0，如果佣金和余额都查，就传0，1
    }).then(res => {
      if (res.Status == "Success") {
        let arr = res.Data;
        let sum = 0, //总累计收益
          balance = 0, //余额(零售)
          commission = 0;//佣金(奖励金)
        arr.map((v, i) => {
          sum += v.NowMoney;
          if (i == 0) {
            balance = v.NowMoney;
          } else {
            commission = v.NowMoney;
          }
        })
        let obj = {
          sum,
          balance,
          commission
        }
        this.setData({
          earnings: obj
        })
      }
    })
  },
  //初始化数据
  initData() {
    wx.showLoading({ title: '加载中...' })
    let { listData, list, csList } = this.data;
    getSplittinDetails({
      pageSize: this.page.size,
      pageIndex: this.page.index,
      IsUse: true
    }).then(res => {
      console.log("输出佣金明细", res);
      wx.hideLoading()
      if (res.data.Status == 'Success') {
        listData = res.data
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
          if (item.ExpensesList){
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
          listData,
          list: newArr,
        })
      }
    })
  },
  //获取协议弹窗
  agreementData() {
    getAgreement({
      TypeId: 2,//	是	int	协议类型，1为推广员协议，2为提现协议
    }).then(res => {
      console.log("输出提现协议", res);
      if (res.data.Status == "Success") {
        let fwb = res.data.AContent;
        let sign = res.data.IsSign;
        if (sign == false) {
          this.setData({
            isWin: true
          })
        }
        const regex = new RegExp('<p', 'gi');//修改富文本样式1
        fwb = fwb.replace(regex, `<p style="color: #fff;font-size:28rpx"`);//修改富文本样式2
        WxParse.wxParse('article', 'html', fwb, this, 0);
      }

    })
  },
  //跳转收益明细页面
  handleGo(e) {
    
  },

  //跳转佣金提现页面
  handleWithdraw() {
    if (this.data.listData.Commission == 0) {

      return app.alert.message('余额不足!!!')

    } else {
      wx.navigateTo({
        url: '/packageB/brokerage/brokerage',
      });
    }
  },

  //点击同意协议
  handleTY(e) {
    console.log("输出", e);
    const { status } = e.currentTarget.dataset;
    this.setData({
      isShow: true,
      status,
    })
  },
  //点击同意弹窗
  handleAgree() {
    let sta = this.data.status;
    if (sta == 1) {
      //签订协议
      signAgreement({
        TypeId: 2, //	是	int	协议类型id，1为推广员协议，2为提现协议
      }).then(res => {
        console.log('签署协议状态', res);
        if (res.data.Status == "Success") {
          wx.showToast({
            title: res.data.Message,
            icon: 'none',
            duration: 1500,
            mask: true,
            success: (result) => {
              setTimeout(() => {
                this.setData({
                  isWin: false
                })
              }, 1500);
            },
            fail: () => { },
            complete: () => { }
          });

        } else {
          wx.showToast({
            title: res.data.Message,
            icon: 'none',
            duration: 1500,
            mask: true,
          });
        }
      })
    } else {
      wx.showToast({
        title: '请点击同意',
        icon: 'none',
        duration: 1500,
        mask: true,
      });

    }
  },
  //跳转订单详情
  handleGo(e) {
    const { order, type } = e.currentTarget.dataset;
    if(type==1){
      app.goTo('/packageB/returns/returns')
    }else{
      app.goPage({
        url: `/pages/orderDetail/orderDetail?id=${order}&boolState=0`
      })
    }
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


})