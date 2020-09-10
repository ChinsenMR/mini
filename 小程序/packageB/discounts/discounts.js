let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    pageIndex: 0,
    productList: [],
    loadMore: true,
    pageSize: 10,
    activityDetailList: [], // 活动详情列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getFullReductionList();
    this.getProductList();
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
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getFullReductionList(1);
    this.getProductList(1);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.getProductList();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  getFullReductionList(init) {
    if (init) {
      this.setData({
        activityDetailList: []
      })
    }
    app.$api.getFullReductionList({
      promoteType: 12
    }).then(res => {
      if (res.success) {
        const {
          Data: {
            rows: activityDetailList
          }
        } = res;

        this.setData({
          activityDetailList
        })
        console.log(res)
      }
    })
  },
  /* 获取活动商品列表 */
  getProductList(init) {

    let {
      pageIndex,
      productList,
      loadMore,
      pageSize
    } = this.data;

    if (init) {
      productList = [];
      loadMore = true;
      pageIndex = 0;

      this.setData({
        productList,
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
      sortBy: 'string',
      sortOrder: 0,
      isCount: true
    }
    app.$api.getFullAmountReduxcedProductAllList(ajaxData).then(res => {

      if (res.success) {
        const {
          Data: {
            ProductList: list,
            count: totalLimit
          }
        } = res;

        const maxPageSize = Math.ceil(totalLimit / pageSize);

        loadMore = !pageIndex >= maxPageSize;
        
        productList = productList.concat(list);


        this.setData({
          productList,
          loadMore,
          pageIndex,
        });
      }
      wx.stopPullDownRefresh();
    })

  },
  /* 查看商品详情 */
  seeGoodsDetail(e) {
    const {
      currentTarget: {
        dataset: {
          goodsId
        }
      }
    } = e;
    
    app.goPage({
      url: '/pages/goodsDetail/goodsDetail',
      options: {
        p: goodsId,
      }
    })
  }
})