import regeneratorRuntime from '../../../utils/runtime';
const app =  getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    bank: null,
    selectedtype: 0,
    allData: {},
    Remark: "", //备注
    name: "", //收款人
    requestAccount: "", //提现账号
    AccountExplain: "", //账号说明
    money: "", //提现金额
    amount1: "",//佣金输入金额
    amount2: "",//余额输入金额
    bankItem: {}, // 选择银行卡
    password: "", //支付密码
    displayDialog: false, // 显示二维码框
    codeBackgroundUrl: "https://img.hmeshop.cn/hmeshopV3/Storage/master/202005151422536891880.png",
    closeBtnUrl: "https://img.hmeshop.cn/hmeshopV3/Storage/master/202005151501135330470.png",
    totalScaleResult: '',
    bankDefault:null,//银行卡默认数据
    withdrawalType: '',//提现类型(用于判断调用余额提现(balance),还是佣金提现(commission))
    commissionObj:{},//佣金初始化对象
    balanceObj:{},//余额初始化对象
    btnShow:true,//禁止提现按钮
  },
  page: {
    index: 1,
    size: 100
  },
  total: 1,
  isCommission: null, // 是否从佣金页过来


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let type = options.type;
    if (type =='commission'){//佣金
      let commissionObj = wx.getStorageSync('commissionObj');
      if (commissionObj) { //用于解决频繁请求接口奔溃问题
        this.setData({ commissionObj })
        this.totalScale();
      }else{
        this.getIntitData();
      }
    } else if (type == 'balance'){//余额
      let balanceObj = wx.getStorageSync('balanceObj');
      if (balanceObj){
        this.setData({ balanceObj })
        this.totalScale();
      }else{
        this.getBalanceDraw();
      }
    }
    
    this.setData({
      withdrawalType: options.type,//提现类型balance--余额,commission--佣金
    })
    
  },
 
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //默认银行卡
    let bankDefault = wx.getStorageSync('bankDefault');
    if (bankDefault) {
      bankDefault.newAccountNo = bankDefault.AccountNo.substring(bankDefault.AccountNo.length - 4);//银行卡后4位
      this.setData({
        bankDefault
      })
    }
  },
 
  //获取佣金提现初始化数据
  getIntitData() {
    app.$api.getInitSplittinDraw({}).then(res => {
      if (res.Status == "Success") {
        let obj = res.Data.Data;
        wx.setStorageSync('commissionObj', obj);//用于解决频繁请求接口奔溃问题
        this.setData({commissionObj:obj})
        this.totalScale();
      }
    })
  },
  //获取余额提现初始化数据
  getBalanceDraw(){
    app.$api.getInitDraw().then(res=>{
      if(res.Status=="Success"){
        wx.setStorageSync('balanceObj', res);//用于解决频繁请求接口奔溃问题
        this.setData({balanceObj:res})
        this.totalScale();
      }
    })
  },

  // 申请提交(佣金提现)
  submit1: function (e) {
    const { amount1, commissionObj, bankDefault } = this.data;
    if (!bankDefault){
      app.alert.toast('未选择银行卡，请选择一张银行卡！');
      return
    }
    app.alert.loading();
    let data = {
      drawtype: 5 || '',  //是	int	提现类型，1为银行卡，2为微信，3为支付宝
      Amount: amount1 || 0,	  //是	decimal	提现金额
      MaxAmount: commissionObj.MaxAmount || '',	 //是	decimal	可提现金额
      MinAmount: commissionObj.MinAmount || '',	 //是	decimal	最少提现金额
      BankName: bankDefault.BankName || '',	 //否	string	银行名称
      AccountName: bankDefault.AccountUserName || '',	 //否	string	开户姓名
      MerchantCode: bankDefault.AccountNo || '',	  //否	string	提现账号
      BankType: bankDefault.BankType,//0对私,1对公
      BankChannelNo: bankDefault.BankType == 1 ? bankDefault.BankChannelNo:'',//对公账号需要传联行行号
    }
    app.$api.setSplittinDraws(data).then(res => {
      if (res.success) {
        app.alert.toast(res.Message);
        setTimeout(() => {
          app.goTo('/packageB/particulars/particulars?type=1');
        }, 1000);
      }
    })
  },
  // 申请提交(余额提现)
  submit2: function (e) {
    const { amount2, balanceObj, bankDefault } = this.data;
    if (!bankDefault) {
      app.alert.toast('未选择银行卡，请选择一张银行卡！');
      return
    }
    app.alert.loading();
    let data = {
      drawtype: 5 || '',  //是	int	提现类型，1为银行卡，2为微信，3为支付宝
      Amount: amount2 || 0,	 //是	decimal	提现金额
      MaxAmount: balanceObj.Balance || '',	//是	decimal	最大提现金额
      MinAmount: balanceObj.MinBanlance || '',	//是	decimal	最少提现金额
      BankName: bankDefault.BankName || '',	 //否	string	银行名称
      AccountName: bankDefault.AccountUserName || '',	 //否	string	开户姓名
      MerchantCode: bankDefault.AccountNo || '',	//否	string	提现账号
      BankType: bankDefault.BankType,//0对私,1对公
      BankChannelNo: bankDefault.BankType == 1 ? bankDefault.BankChannelNo : '',//对公账号需要传联行行号
    }
    app.$api.requestBalanceDraw(data).then(res => {
      if (res.success) {
        app.alert.toast(res.msg);
        setTimeout(() => {
          app.goTo('/packageB/particulars/particulars?type=1');
        }, 1000);
      } 
    })
  },
  //跳转  选择银行卡   
  handleSelect(){
    app.goTo('/packageA/pages/withdrawApply/bankCardList')
  },
  //提现类型(用于判断调用余额提现(balance),还是佣金提现(commission))
  selectAllAmount() {
    const { commissionObj, withdrawalType, balanceObj } = this.data;
    if (withdrawalType == 'commission') {//佣金提现(commission)
      this.setData({
        amount1: commissionObj.MaxAmount,
      });
    } else {
      this.setData({
        amount2: balanceObj.Balance,
      });
    }
    this.totalScale()
  },
  bindInput1(e) {//佣金
    const { value } = e.detail;
    this.setData({ amount1: value, }, () => {
      this.totalScale()
    });
  },
  bindInput2(e) {//余额
    const { value } = e.detail;
    this.setData({ amount2: value, }, () => {
      this.totalScale()
    });
  },



  empty() {
    this.setData({
      amount: "",
    });
  },
  //
  totalScale() {
    //withdrawalType: '',//提现类型(用于判断调用余额提现(balance),还是佣金提现(commission))
    //commissionObj: { },//佣金初始化对象
    //balanceObj: { },//余额初始化对象
    const {
      amount1,
      amount2,
      commissionObj: {//佣金
        MinAmount,
        MaxAmount,
        CommissiondrawCharge,
      },
      balanceObj: {//余额
        MinBanlance,
        Balance,
        WithdrawCharge,
      },
      withdrawalType
    } = this.data;
    //提现金额￥{参数}-提现手续费￥(参数*费率) = 最终到账金额￥(提现金额-手续费)
    if (withdrawalType =='commission'){
      const original = String(amount1 || 0)
      const scale = (amount1 * (CommissiondrawCharge / 100)).toFixed(2);
      const result = (amount1 - (amount1 * (CommissiondrawCharge / 100))).toFixed(2);
      if (Number(original) > Number(MaxAmount)) {
        this.setData({
          btnShow: false,
          totalScaleResult: `已超出最大提现金额，无法提现！`
        })
      } else {
        this.setData({
          btnShow: true,
          totalScaleResult: `提现金额:（¥${original}）- 手续费（￥${scale}）=最终到账金额（¥${result}）`
        })
      }
    }else{
      const original = String(amount2 || 0)
      const scale = (amount2 * (WithdrawCharge / 100)).toFixed(2);
      const result = (amount2 - (amount2 * (WithdrawCharge / 100))).toFixed(2);
      if (Number(original) > Number(Balance)){
        this.setData({
          btnShow: false,
          totalScaleResult: `已超出最大提现金额，无法提现！`
        })
      }else{
        this.setData({
          btnShow: true,
          totalScaleResult: `提现金额:（¥${original}）- 手续费（￥${scale}）=最终到账金额（¥${result}）`
        })
      }
    }
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
  // inputPassword(e) {
  //   const {
  //     detail: {
  //       value
  //     },
  //   } = e;
  //   this.setData({
  //     password: value
  //   });
  // },
  // showDialog(e) {
  //   const {
  //     amount,
  //     allData,
  //     bankItem
  //   } = this.data;
  //   if (!bankItem)
  //     return wx.showToast({
  //       icon: "none",
  //       title: "请选择提现银行卡"
  //     });
  //   else if (!amount)
  //     return wx.showToast({
  //       icon: "none",
  //       title: "请输入提现金额"
  //     });

  //   this.setData({
  //     displayDialog: !this.data.displayDialog,
  //   });
  // },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorageSync('bankDefault');//离开页面清除缓存
  },
});