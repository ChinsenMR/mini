import {
  getpersondata,
  getMemberData
} from '../../../utils/requestApi.js'
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [{
        t: '用户名',
        p: '请输入用户名',
        v: '',
        m: 'UserName'
      },
      {
        t: '昵称',
        p: '请输入昵称',
        v: '',
        m: 'NickName'
      },
      {
        t: '姓名',
        p: '请输入姓名',
        v: '',
        m: 'realName'
      },
      {
        t: '性别',
        p: '请选择性别',
        v: '',
        m: 'Gender'
      },
      {
        t: '生日',
        p: '请选择日期',
        v: '',
        m: 'BirthDate'
      },
      {
        t: '地区',
        p: '请选择地址',
        v: '',
        m: 'Address'
      },
      {
        t: '个人描述',
        p: '请输入个人描述',
        v: '',
        m: 'PerDescribe'
      },
      // {
      //   t: 'QQ',
      //   p: '请输入QQ号码',
      //   v: '',
      //   m: 'QQ'
      // },
      {
        t: '详细地址',
        p: '请输入地址',
        v: '',
        m: 'TakeDeliverySpecificAddress'
      },
    ],
    sexArr: ['未知', '男', '女'],
    avatar: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // 初始化页面数据
  initData() {
    let {
      list,
      avatar
    } = this.data;
    app.$api.getUserInfo().then(res => {
      if (res.success) {
        const {
          Data: userInfo
        } = res;


        list.forEach(item => {
          Object.getOwnPropertyNames(userInfo).forEach(item2 => {
            if (item.m == item2) {

              //if (item.m == 'Gender') item.v = userInfo[item2] == 0 ? '男' : '女'
              if (item.m == 'Gender') {
                if (userInfo[item2] === 0) {
                  item.v = userInfo[item2] = '未知'
                } else {
                  item.v = userInfo[item2] == 1 ? '男' : '女'
                }

              } else if (item.m == 'BirthDate') item.v = userInfo[item2] ? userInfo[item2].split('T')[0] : ''
              else item.v = userInfo[item2]
            }
          })
        })
        this.setData({
          list,
          avatar: userInfo.picture,
        })
      }


    })
  },
  //退出登录
  logout() {

    app.alert.confirm({
      content: '您确定要退出登录吗'
    }, conf => {
      if (conf) {
        wx.clearStorage().then(() => app.goTo('/pages/authorizationLogin/authorizationLogin'));
      }
    })
  },

  // 选择picker
  onPicker(e) {
    let {
      list,
      sexArr
    } = this.data;
    let {
      type
    } = e.currentTarget.dataset;
    if (type == '性别') {
      list.forEach(item => {
        if (item.t == type) item.v = sexArr[e.detail.value]
      })
    } else {
      list.forEach(item => {
        if (item.t == type) item.v = e.detail.value
      })
    }
    this.setData({
      list
    })
  },

  // 上传头像
  upAvatar() {

    wx.showNavigationBarLoading()
    wx.chooseImage({
      count: 1,
      success: res => {
        const tempFilePaths = res.tempFilePaths;
        wx.hideNavigationBarLoading()
        app.goPage({
          url: '/subPackageE/pages/uploadAvatar/uploadAvatar?src=' + tempFilePaths,
        })
      }
    })
  },

  // 提交保存
  onSubmit(e) {
    wx.showLoading({
      title: '保存中...'
    })
    let {
      UserName,
      NickName,
      realName,
      Gender,
      BirthDate,
      Address,
      PerDescribe,
      // QQ,
      TakeDeliverySpecificAddress
    } = e.detail.value;

    const sexObj = {
      '男': 1,
      '女': 2,
      '未知': 0
    }
    getpersondata({
      picture: this.data.avatar,
      gender: sexObj[Gender],
      birthday: BirthDate,
      realName: realName,
      nickname: NickName,
      address: Address,
      // qq: QQ,
      perDescribe: PerDescribe,
      TakeDeliverySpecificAddress,
      region: Address
    }).then(res => {
      const {
        Result = {}, Status
      } = res.data
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: Result.Message
      })
      if (Result.Status == 'Success') {
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      }
    })
  },
  //获取输入框的值
  handleInput(e) {
    let {
      list
    } = this.data
    console.log("输出++++", e);
    list.forEach((item, index) => {
      if (item.m == e.target.dataset.name) {
        list[index].v = e.detail.value
      }
    })
    this.setData({
      list
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

})