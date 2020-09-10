const app = getApp();
import {
  getUnionId,
  authorizationLogin,
  getMemberData
} from '../../utils/requestApi';
import {
  bindReferralUserId
} from '../../utils/util'

Page({
  data: {
    checkedIcon: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202008111639374708700.png',
    uncheckIcon: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202008111639375802501.png',
    projectLogo: null,
    userid: null, //用户id
    unionId: null, // 公众号与小程序关联的ID
    userInfo: {}, // 用户信息
    params: {
      fromType: '', // 特殊操作专用
      callback: '' // 回调路径
    },
    /* 协议列表 */
    agreementList: [],
    isReadAgree: false,
  },

  onLoad(options) {

    /* 登录直播id */
    if (app.data.share_userid) {
      this.setData({
        userid: app.data.share_userid
      })
    }


    this.setData({
      params: options,
      projectLogo: app.data.PROJECT_LOGO
    })

    /* 获取登录协议 */
    this.getAgreementList();
  },
  /**
   * 查看协议
   */
  seeAgree(e) {
    const {
      currentTarget: {
        dataset: {
          index
        }
      }
    } = e;

    app.goPage({
      url: '/subPackageD/pages/agreement/agreement',
      options: {
        index
      }
    })
  },
  /* 获取协议列表 */
  getAgreementList() {
    app.$api.getAgreeList({
      type: 3
    }).then(res => {
      console.log(res, 44)
      const {
        Data: agreementList
      } = res;

      this.setData({
        agreementList
      })
    })
  },
  bindReferralUserId,
  /**
   *授权 
   **/
  bindGetUserInfo(e) {
    if (!this.data.isReadAgree) {
      return app.alert.toast('请先阅读注册相关协议并勾选同意按钮')
    }
    console.log("授权", e);
    const {
      userInfo: {
        nickName,
        avatarUrl
      },
      errMsg
    } = e.detail;

    this.setData({
      userInfo: {
        nickName,
        headimage: avatarUrl
      }
    })

    this.getUserInfo()
  },
  /* 获取后端解密后的 */
  getUnionId(params) {
    getUnionId(params).then(res => {
      if (res.Status == "Success") {
        this.setData({
          unionId: res.UnionId || ''
        })
        this.authorizationLogin()
      } else {
        app.alert.toast(res.Message)
      }
    })
  },

  /* 获取UnionId及用户信息 */
  getUserInfo() {
    const that = this;
    wx.getSetting({
      success: (response) => {
        if (response.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            withCredentials: true,
            success: (res) => {
              const params = {
                action: 'GetUnionId', //	是	string	GetUnionId
                encryptedData: res.encryptedData, //	是	string	解密参数
                iv: res.iv, //	是	string	解密参数
                session_key: app.data.sessioKey, //	是	string	解密参数
              }

              that.getUnionId(params)

            }
          })
        }
      }
    })
  },
  /* 登录成功后根据状态判断要何去何从 */
  handleAfterLoginCallback() {
    const {
      params: {
        fromType,
        callback
      }
    } = this.data;

    if (fromType) {
      switch (fromType) {
        /* 从绑定代理页面过来 */
        case 'bindAgent':
          app.goBack(3);
          break;
        default:
          app.goBack(2);
      }

    } else if (callback) {
      wx.reLaunch({
        url: `/${decodeURIComponent(callback)}`,
      })
    } else {
      app.goBack();
    }
  },
  /* 最终登录接口 */
  authorizationLogin() {

    const {
      userInfo,
      userid = '',
      scene = '',
      unionId
    } = this.data;

    const ajaxData = {
      ...userInfo,
      openId: app.data.openid || '', //this.data.openid
      openType: 'hmeshop.plugins.openid.wxapplet',
      UnionId: unionId || '',
      referralUserId: scene || userid || '',
      KjCustomId: wx.getStorageSync('KjCustomId') || '', //绑定代理
    };

    app.alert.loading('登录中...')

    authorizationLogin(ajaxData).then(res => {

      app.alert.closeLoading();

      const {
        Status,
        Cookie,
        Data,
        Message
      } = res;

      /* 失败的处理 */
      if (Status !== 'Success') {
        return app.alert.message(Message)
      }

      /* 如果系统需要绑定手机号 */
      if (app.data.IS_NEED_BIND_MOBILE) {
        app.cache.set('_cookie_temp', Cookie).then(() => {
          app.goPage({
            url: app.data.bindPhoneUrl
          })
        })
      }
      /* 默认已经登录成功 */
      else {

        app.alert.success('登录成功');

        /* 存储cookie并获取用户信息 */
        app.cache.set('cookie', Cookie).then(res => {
          /* 获取用户信息 */
          this.getMemberData();

          /* 绑定上下级关系 */
          this.bindReferralUserId()
        })

          

        /* 登录之后处理路由 */
        // this.handleAfterLoginCallback()
      }

      /* 获取系统配置 */
      app.getDefaultModel();
    })

  },
  /* 签订协议 */
  handleReadAgree() {
    this.setData({
      isReadAgree: !this.data.isReadAgree
    })
  },
  /* 获取会员信息 */
  getMemberData() {
    getMemberData().then(res => {
      const {
        Status,
        Data
      } = res.data;

      if (Status === "Success") {
        wx.setStorageSync("userInfo", Data);
        /* 登录之后处理路由 */
        this.handleAfterLoginCallback()
      }
    })
  },


  /* 回到首页 */
  goBackHome() {
    wx.navigateTo({
      url: '/pages/moduleHome/moduleHome',
    });
  }


})