// pages/addBank/addBank.js
// 6227002470170278192
// import {
//   bindBank
// } from "../../../utils/requestApi";
let app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    form: {
      bankCardId: "",
      phone: "",
      name: "",
      idCard: "",
      verifyCode: ""
    },
    getCodeText: "获取验证码",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {},

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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {},

  bindInput(e) {
    const {
      currentTarget: {
        dataset: {
          name
        },
      },
      detail: {
        value
      },
    } = e;
    let {
      form
    } = this.data;

    form[name] = value;

    this.setData({
      form
    });
  },
  getCode() {
    const code = this.selectComponent("#code-btn");
    const {
      __data__: {
        getCodeText
      },
      __proto__: {
        countDown
      },
    } = code;
    console.log(code);
    if (getCodeText == "获取验证码" || getCodeText == "重新获取") {
      getBindBankCardCode({}).then((res) => {
        countDown();
      });
    }
  },
  submit() {
    const {
      form: {
        bankCardId,
        phone,
        name,
        idCard
      },
    } = this.data;

    const verify = [
      app.verify.mobile(phone).verify,
      app.verify.bankCardId(bankCardId).verify,
      // app.verify.idCard(idCard).verify,
      // app.verify.name(name).verify,
    ];

    if (verify.includes(false)) return;

    const formData = {
      cardNo: bankCardId,
      phone,
      name: 1,
      identityNo: 1,
    };

    bindBank(formData).then((res) => {
      const {
        data: {
          Code,
          Msg,
        },
      } = res;
    
      if (Code === 1) {
        return wx.navigateBack();
      }

      wx.showToast({
        icon: "none",
        title: Msg
      });
    });
  },
});