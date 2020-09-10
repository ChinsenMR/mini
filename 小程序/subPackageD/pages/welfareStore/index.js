const app = getApp();
// import { getWelfareShopGoodsList } from "../../../utils/requestApi.js";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    searchIcon: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202005132003151358180.png',
    closeIcon: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202005132002166983410.png',
    imgUrl: app.data.imgurl,
    list: [],
    page: 0, // 分页
    limit: 8, // 每页条数
    loadMore: true, // 是否为最后一页
    keyword: "",
  },
  claerContent() {
    this.setData({
      keyword: ""
    });
    this.getList(1);
  },
  search() {
    if (this.data.keyword) this.getList(1);
  },
  addCart(e) {
    const {
      id
    } = e.currentTarget.dataset;
    PointChangeAddCart({
      giftId: id,
      needPoints: 1,
      isExemptionPostage: true,
    }).then((res) => {
      console.log(res);
      const ErrorResponse = res.data.ErrorResponse;
      const Result = res.data.Result;
      if (ErrorResponse && ErrorResponse.ErrorCode == 101) {
        wx.showToast({
          title: res.data.ErrorResponse.ErrorMsg,
          icon: "none"
        });
      } else if (Result) {
        wx.showToast({
          title: "兑换成功",
          icon: "none"
        });
        wx.navigateTo({
          url: "../cart/cart",
        });
      }
    });
  },
  inputText(e) {
    this.setData({
      keyword: e.detail.value,
    });
  },
  seeDetail(e) {
    console.log(e);
    const {
      id
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: "/pages/goodsDetail/goodsDetail?p=" + id,
    });
  },
  getList(currentPage) {
    let {
      page,
      list,
      loadMore,
      limit,
      keyword
    } = this.data;
    if (currentPage) {
      page = 0;
      list = [];
      loadMore = true;
      this.setData({
        page,
        list,
        loadMore
      });
    }

    if (!loadMore) {
      return;
    }

    page++;
    this.setData({
      isLoading: true
    });
    let ajaxData = {
      pageIndex: page,
      pageSize: limit,
      IsWelfareProduct: true
    };
    if (keyword) {
      ajaxData.Keywords = keyword;
    }

    app.$api.getWelfareShopGoodsList(ajaxData).then((res) => {
      if (!res.success) return

      const {
        Result: {
          Data: data,
          TotalRecords: total
        }
      } = res;

      const maxPage = Math.ceil(total / limit) || 1;

      list = list.concat(data);

      loadMore = page >= maxPage ? false : true;

      this.setData({
        page,
        list,
        loadMore
      });
      wx.stopPullDownRefresh();
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getList();

    app.globalData.template.tabbar("tabBar", 1, this); //0表示第一个tabba
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  onPullDownRefresh() {
    this.getList(1);
    console.log("下拉刷新");
  },
  onReachBottom() {
    this.getList();
    console.log("上拉触底");
  },
  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {},
});