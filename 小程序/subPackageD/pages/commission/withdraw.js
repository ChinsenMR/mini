import {
  getUserAuInfo,
  queryBank,
  subSplittinDrawByComssion,
} from "../../../utils/requestApi";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    bank: null,
    selectedtype: 0,
    allData: {},
    Remark: "", //备注
    name: "", //收款人
    requestAccount: "", //提现账号
    AccountExplain: "", //账号说明
    money: "", //提现金额
    amount: "",
    bankItem: {}, // 选择银行卡
    password: "", //支付密码
    displayDialog: false, // 显示二维码框
    codeBackgroundUrl: "https://img.hmeshop.cn/hmeshopV3/Storage/master/202005151422536891880.png",

    closeBtnUrl: "https://img.hmeshop.cn/hmeshopV3/Storage/master/202005151501135330470.png",
    totalScaleResult: '',
  },
  isCommission: null, // 是否从佣金页过来

  getBankCardList() {
    const formData = {
      cardNo: "all",
    };
    queryBank(formData).then((res) => {
      console.log(res);
    });
  },
  empty() {
    this.setData({
      amount: "",
    });
  },
  inputPassword(e) {
    const {
      detail: {
        value
      },
    } = e;
    this.setData({
      password: value
    });
  },
  showDialog(e) {
    const {
      amount,
      allData,
      bankItem
    } = this.data;
    if (!bankItem)
      return wx.showToast({
        icon: "none",
        title: "请选择提现银行卡"
      });
    else if (!amount)
      return wx.showToast({
        icon: "none",
        title: "请输入提现金额"
      });

    this.setData({
      displayDialog: !this.data.displayDialog,
    });
  },
  selectAllAmount() {
    this.setData({
      amount: this.data.allData.CommissionBalance,
    });
    this.totalScale()
  },
  bindInput(e) {
    const {
      value
    } = e.detail;
    this.setData({
      amount: value,
    }, () => {
      this.totalScale()
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBankCardList();
  },
  totalScale() {
    const {
      amount,
      allData: {
        WithdrawCharge,
        CommissionWithdrawCharge
      }
    } = this.data;

    const original = String(amount)
    const scale = (amount * (CommissionWithdrawCharge / 100)).toFixed(2);
    const result = (amount - (amount * (CommissionWithdrawCharge / 100))).toFixed(2);

    this.setData({
      totalScaleResult: `提现金额:（¥${ original }）- 手续费（${ CommissionWithdrawCharge }%）= 预估到账金额（¥${ result }）`
    })

  },

  getUserAuInfo() {
    getUserAuInfo().then((res) => {
      const {
        Data
      } = res.data;
      // if (!Data.IsOpenBalance) {
      //   wx.showToast({
      //     title: "请设置支付密码",
      //     icon: "none"
      //   });
      //   setTimeout(() => {
      //     return wx.navigateTo({
      //       url: "/packageA/pages/setPassword/setPassword?fromType=withdraw",
      //     });
      //   }, 1500);
      // }
      this.setData({
        allData: Data
      });
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log(this.data.bankItem);
    this.getUserAuInfo();
  },

  selected: function (e) {
    if (e.currentTarget.dataset.type == this.data.selectedtype) {
      return;
    }
    this.setData({
      selectedtype: e.currentTarget.dataset.type,
    });
    console.log(this.data.selectedtype);
  },

  // 申请提交
  submit: function (e) {
    const {
      amount,
      allData,
      bankItem = {},
      password
    } = this.data;

    if (!bankItem.bankName)
      return wx.showToast({
        icon: "none",
        title: "请选择提现银行卡"
      });
    else if (!amount)
      return wx.showToast({
        icon: "none",
        title: "请输入提现金额"
      });

    // if (!password || password.length < 6) {
    //   return wx.showToast({
    //     icon: "none",
    //     title: "请输入6位数密码"
    //   });
    // }
    const formData = {
      drawtype: 1, //是	int	提现类型，1为银行卡，2为微信，3为支付宝
      Amount: amount, //是	decimal	提箱金额
      MaxAmount: allData.Balance, //是	decimal	可提现金额
      MinAmount: allData.MinBanlance, //是	decimal	最少提现金额
      BankName: bankItem.bankName, //否	string	银行名称
      AccountName: allData.RealName, //否	string	开户姓名
      MerchantCode: bankItem.bankCardNo, //否	string	提现账号
      Remark: `${allData.RealName} 对${bankItem.bankName}【${bankItem.bankCardNo}】进行提现`, //否	string	备注
      TradePassword: password, //是	string	交易密码
      ImageUrl1: "", //否	string	身份正反面图片地址，用, 分割
      RealName: allData.RealName, //否	string	真实姓名
      Code: "", //否	string	支付宝账号
    };

    subSplittinDrawByComssion(formData).then((res) => {
      const {
        data: {
          Status,
          Message
        },
      } = res;

      this.setData({
        displayDialog: false,
        password: "",
      });


      if (Status == "Success") {
        wx.showToast({
          title: Message,
          mask: true,
        });

        setTimeout(() => {
          wx.navigateBack({
            delta: 1,
          });
        }, 1500);
      } else {
        wx.showToast({
          title: Message,
          icon: "none",
          duration: 1500,
          mask: true,
        });
      }
    });
  },
});