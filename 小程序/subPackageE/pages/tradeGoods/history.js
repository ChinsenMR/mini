const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    pageIndex: 0,
    loadMore: true,
    pageSize: 6,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getList(1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.getList();
  },
  /* 兑换 */
  handleTrade() {
    app.alert.confirm({
      content: '确认兑换'
    }, conf => {
      // app.$api.tradeCode({tradeCode}).then(res => {
      //   // if(res.success){}
      // })
      conf && app.goPage({
        url: '/subPackageE/pages/tradeGoods/goods'
      })
    })
  },
  /* 查看兑换记录 */
  seeTradeHistory() {
    app.goPage({
      url: '/subPackageE/pages/tradeGoods/history'
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /* 获取活动商品列表 */
  getList(init) {

    let {
      pageIndex,
      list,
      loadMore,
      pageSize,
    } = this.data;

    if (init) {
      list = [];
      loadMore = true;
      pageIndex = 0;

      this.setData({
        list,
        loadMore,
        pageIndex
      });
    }

    if (!loadMore) return;

    pageIndex++;

    this.setData({
      loadMore: true
    });

    const ajaxData = {
      pageIndex,
      pageSize,
    }

    app.$api.getMyExchangeCodeList(ajaxData).then(res => {

      if (res.success) {
        const {
          Data: {
            Data: resultList,
            TotalRecords: totalLimit
          }

        } = res;

        const maxPageSize = Math.ceil(totalLimit / pageSize);

        loadMore = pageIndex < maxPageSize

        list = list.concat(resultList);


        this.setData({
          list,
          loadMore,
          pageIndex,
        });
      }
      wx.stopPullDownRefresh();
    })

  },
})