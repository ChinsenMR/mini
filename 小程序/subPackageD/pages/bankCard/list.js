// pages/bankCard/bankCard.js
// import { queryBank, untyingBank } from "../../../utils/requestApi";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    delete: false,
    startX: 0,
    list: [],
    fromType: "",
    showBtn: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData(options);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (opt) {
    this.getList();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.getList(true);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
  goAddBank() {
    wx.navigateTo({
      url: "../addBank/addBank",
    });
  },
  selectBankCardItem(e) {
    if (!this.data.fromType) {
      return;
    }

    const {
      currentTarget: {
        dataset: { item },
      },
    } = e;

    let pages = getCurrentPages();
    let prevPage = pages[pages.length - 2];
    this.data.bankItem = {};
    prevPage.setData({
      bankItem: item,
    });

    wx.navigateBack({
      delta: 1,
    });
  },
  getList(init) {
    if (init) this.setData({ list: [] });

    const formData = {
      cardNo: "all",
    };
    queryBank(formData).then((res) => {
      wx.stopPullDownRefresh();
      if (res.Code != 1) {
        return wx.showToast({ icon: "", title: res.Msg });
      }

      const {
        Data: { Data },
      } = res;

      Data.forEach((d) => {
        d.smallId = d.bankCardNo.substring(d.bankCardNo.length - 4);
      });

      this.setData({
        list: Data,
      });
    });
  },
  showRemoveBtn() {
    this.setData({ showBtn: !this.data.showBtn });
  },
  bindDelete(e) {
    let that = this;
    wx.showModal({
      title: "提示",
      content: "确定解绑该卡",
      confirmColor: "#0081CC",
      success(res) {
        if (res.confirm) {
          const {
            currentTarget: {
              dataset: { index },
            },
          } = e;
          // this.data.list.splice(index, 1);
          untyingBank({ cardNo: that.data.list[index].bankCardNo }).then(
            (res) => {
              const { Data, Code, Msg } = res.data;

              wx.showToast({ title: Msg, icon: "none" });
              if (Code == 1) {
                that.getList(true);
              }
            }
          );
        } else {
        }
      },
    });
  },
});
