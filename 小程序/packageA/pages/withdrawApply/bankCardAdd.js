const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    nameVal:'',//真实姓名
    bankCode:'',//银行卡号
    accountType:'0',//选择账户类型(0--个人账户,1--对公账户)
    getCodeText: "获取验证码",
    switchChecked:false,//是否设置为默认
    navList:[
      {
        name:'个人账户',
        id:0,
      },
      {
        name:'对公账户',
        id:1
      }
    ],
    form:{
      bankCardKey:null
    },
    bankList: [{
      text: '中国银行',
      value: 'ccc'
    }],
    tipIcon: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202007311036375832860.png', // 提示
    showTip:false,//联行行号显示输入框
  },
  page: {
    index: 1,
    size: 100
  },
  total: 1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBank();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  //添加银行卡
  formSubmit(e) {
    const { accountType, switchChecked, bankList,form } = this.data;
    const { nameVal, bankCode, jonesLangLasalle } = e.detail.value;
    if (!nameVal){
      app.alert.toast('真实姓名不能为空!');
      return
    } 
    if (bankList[form.bankCardKey] == undefined) {
      app.alert.toast('请选择开户银行!');
      return
    } 
    if (bankCode == '') {
      app.alert.toast('银行卡账号不能为空!');
      return
    } 
    let bankStatu = app.verify.bankCardId(bankCode).verify;
    if (!bankStatu){
      app.alert.toast('银行卡账号格式不正确!');
      return
    }
    if (accountType==1){
      if (jonesLangLasalle==''){
        app.alert.toast('联行行号不能为空！');
        return
      }
    } 
    let objData= {//个人
      AccountNo: bankCode,// 银行卡账号 ,
      AccountUserName: nameVal,// 账号用户名称(真实姓名) ,
      BankId: bankList[form.bankCardKey].Id,// 银行id ,
      IsDefault: switchChecked ? 1 : 0,// 是否为默认银行卡 ,
      BankType: accountType,// 0对私 1对公
    }
    let objData2 = {//对公
      AccountNo: bankCode,// 银行卡账号 ,
      AccountUserName: nameVal,// 账号用户名称(真实姓名) ,
      BankId: bankList[form.bankCardKey].Id,// 银行id ,
      IsDefault: switchChecked ? 1 : 0,// 是否为默认银行卡 ,
      BankType: accountType,// 0对私 1对公
      BankChannelNo: jonesLangLasalle
    }
    
    app.$api.addUserAccount(accountType == 1 ? objData2 : objData).then(res=>{
      if(res.Code==1){
        app.alert.toast(res.Msg);
        //获取上页面的数据
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 2];
        currentPage.getList();
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          });
        }, 1500);
      }
    })
  },
  //获取可选银行列表
  getBank() {
    app.$api.getBankList({
      pageIndex: this.page.index,
      pageSize: this.page.size
    }).then(res => {
      if (res.Code == 1) {
        let arr = res.Data.Data;
        console.log('银行列表',arr);
        arr.forEach(v=>{
          v.text = v.BankName
          v.value = v.Id
        })
        console.log('输出新数组',arr);
        this.setData({
          bankList: arr
        })
      }
    })
  },
  //点击问号图标显示提示
  handleShowTip(e){
    this.setData({
      showTip: !this.data.showTip
    })
  },
  //关闭弹窗
  handleOffTip(){
    this.setData({
      showTip: false
    })
  },
  /* 选择 */
  onChange(e) {
    const {value} = e.detail;
    this.setData({
      'form.bankCardKey': Number(value),
    })
  },
  
  /* 切换单选框 */
  radioChange(e) {
    const { value } = e.detail;
    this.setData({
      accountType: value
    })
  },
  //银卡号输入框
  inputForm(e) {
    console.log("sasdsadada",e);
    const {
      detail: {
        value
      },
    } = e;
    this.setData({
      bankCode: value
    })
  },
  //是否选择默认
  switchChange(e){
    this.setData({
      switchChecked: e.detail.value
    })
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
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {},

  
  

});