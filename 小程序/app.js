import config from './config'
import project from './project'
import tools from './utils/tools/index'
import mixins from './utils/mixins/index'
import oldApiList from './utils/fjh-api'
import template from 'template/template.js'
import $store from './stores/index'
import wxParse from './wxParse/wxParse'
import {
  mapToData
} from './utils/store/index'
import {
  getUserInfo,
  getOpenId,
  getMemberByOpenId,
} from './utils/requestApi';

const livePlayer = requirePlugin('live-player-plugin');

const initApp = {
  ...mixins, // 方法库混合器
  ...oldApiList, // 旧的api方法,不建议再调用
  mapToData, // 状态管理链接器 相当于redux的connect
  $store, // 状态管理入口
  wxParse, // 富文本转换阿萨
  /* 全局对象 */
  globalData: {
    template,
    GetMembersInfo: wx.getStorageSync('userInfo'),
    shareOpenid: null,
    roomId: null, //直播房间id
    agentId: null // 用户带进来的代理id，用于绑定上下级 
  },
  data: {
    ...config, //存放url和配置数据
    cookie: null, // cookie
    navHeight: null, // 导航栏高度
    statusBarHeight: null, // 状态栏高度
    userInfo: null, // 用户信息
    imgurl: 'https://img.hmeshop.cn/hmeshop_jxy/images/',
    share_userid: null, //直播间分享者的userid,用于绑定当前使用的上级
    sessioKey: null,
    roomid: '', //从商品详情将该值存入全局,用于是直播间数据时带上
    cartNum: 0, //购物车总条数
    sku: null, // 商品规格
    isIphoneXSeries: false, // ios撑起底部的高度

  },
  onLaunch() {
    {
      /* 
        ！！！注意，这里注入了一些拓展的库，开关只有这一行代码
        app下注入了以下方法
          alert,tools,cache,verify,$api,$page,$request
        实例
          app.alert.toast(); app.verify.email('www.xxx@qq.com')
        tools/request是一个业务范围比较广的请求体封装
          1 解决了重复跳转登录页的问题
          2 如果未登录，且当前页面有N个接口调用，那么只要有一个需要登录，执行顺序次之的接口将被拦截
          3 兼容了后端多个版本的返回结果处理，如果发现新的，欢迎到tools/request.js加入
          4 正常的请求调用，结果处理
          5 console定位，每当调用一个接口在打印台可以看到常用的信息，以便后端，测试人员也能定位bug
          6 集中处理了后端返回的状态值，{ errorMsg: "请求成功" success: true }
          7 使用：app.$api.getList().then(res => {})
        mixins, store, tools, wxs这几个文件夹有问题找Chinsen
     */
      tools.init(this)
      this.getAccountInfo();

    }

    /* 检查版本更新 */
    this.checkNewVerison()
    /* 获取默认主题模板 */
    this.getDefaultModel();
    /* 获取系统信息 */
    this.getAppSystemInfo();
    /* 获取openid及 */
    this.getOpenId();
  },

  onShow(options) {

    const {
      query,
      scene
    } = options;

    /* 存储上级id,全局使用 */

    this.storeReferralUserId(query);
    /* 如果打开了直播权限开关 */
    if (this.data.IS_OPEN_LIVE) {
      this.getShareParams({
        room_id: query.room_id,
        scene: scene,
      });
    }

  },

  /* 获取用户openId */
  getOpenId() {
    wx.login({
      success: (res) => {
        if (res.code) {
          getOpenId({
            appid: this.data.appId,
            js_code: res.code
          }).then(res => {
            this.data.sessioKey = res.session_key;
            this.data.openid = res.openid;
            wx.setStorageSync('openid', res.openid);
          })

        } else {
          console.log('登录失败' + res.errMsg);
        }
      }
    })
  },
  /* 获取直播分享分享者的信息 */
  getShareParams(params) {
    livePlayer.getShareParams(params).then(res => {
      console.log("直播返回的openid", res);
      const openId = res.share_openid;
      this.globalData.roomId = res.room_id || ''

      this.globalData.shareOpenid = openId;

      if (!openId) return;

      getMemberByOpenId({
        openId
      }).then(res => {
        console.log('通过直播openid获取用户id', res);
        if (res.Status == "Success") {
          const {
            UserId
          } = res.Data;
          this.data.share_userid = UserId
          this.globalData.agentId = UserId;
        }
      })
    }).catch(err => {
      console.log('获取直播信息失败', err)
    })
  },

  // 获取用户信息
  getUserInfo() {
    getUserInfo().then(res => {
      wx.setStorageSync("userInfo", res.data.Data)
    })

  },
  /* 查看运行环境 动态配置域名*/
  getAccountInfo() {
    const info = wx.getAccountInfoSync();
    console.log("动态配置域名", info);
    const {
      miniProgram: {
        envVersion: env,
        version,
        appId
      }
    } = info;

    this.data.system = {
      env,
      version
    };

    const usingProject = project.find(v => v.appId === appId);
    this.data.url = !config.test ? usingProject.url : config.testDomain; //用于兼容动态域名，处理其他请求的测试域名
    this.data.appId = usingProject.appId;
    this.data.projectName = usingProject.name;

  },
  /* 切换不用的样式 */
  getDefaultModel() {
    return new Promise((resolve, reject) => {
      this.alert.loading();

      wx.request({
        url: this.data.url + this.data.api.setting,
        success: (res) => {
          this.alert.closeLoading();
          const {
            Result: {
              SiteLogo,
              SiteName,
              SiteUrl,
              TopMenus,
              WapTheme,
              SiteSettings: {
                AfterSale,
                IsBindPhone,
                IsDistributorAudit,
                HaveVideo,
                IsOpenPointShop,
                IsOpenPickeupInStore,
                OpenBalancePay,
                IsOpenStoreQuationOtherField,
                KjSendGoods
              }
            }
          } = res.data;

          // 详细注释请移步config.js查看
          this.data.IS_ALLOW_USER_APPLY_AFTER_SALE = !AfterSale;
          this.data.IS_NEED_BIND_MOBILE = IsBindPhone;
          this.data.IS_NEED_DISTRIBUTOR_AUDIT = IsDistributorAudit;
          this.data.PROJECT_LOGO = SiteLogo;
          this.data.PROJECT_DOMAIN = SiteUrl;
          this.data.PROJECT_TOP_MENU = TopMenus;
          this.data.PROJECT_TITLE = SiteName;
          this.data.PROJECT_THEME = WapTheme;
          this.data.IS_ARROW_USE_VIDEO = HaveVideo;
          this.data.IS_OPEN_POINT_SHOP = IsOpenPointShop;
          this.data.IS_ARROW_USER_PICK_UP = IsOpenPickeupInStore;
          this.data.IS_OPEN_BALANCE_DEDUCTION = OpenBalancePay;
          this.data.IS_OPEN_OTHER_FIELD = IsOpenStoreQuationOtherField,
            this.data.IS_ALLOW_USER_SHOW_DELIVER_GOODS = KjSendGoods

          resolve()
        }
      })
    })
  },

  /* 检查新版本 */
  checkNewVerison() {
    //判断时候需要更新新版小程序
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate((res) => {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: (res) => {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本',
              content: '新版本已经上线啦~，请删除当前小程序，重新搜索打开'
            })
          })
        }
      })
    }
  },

  /* 获取手机信息 */
  getAppSystemInfo() {

    wx.getSystemInfo({
      success: res => {
        // console.log("获取手机信息",res);
        let titleBarHeight
        let system = res.system;
        //胶囊高度32px
        if (system.indexOf("iOS") > -1) {
          //ios手机标题栏高度
          titleBarHeight = 44
        }
        if (system.indexOf("Android") > -1) {
          //安卓手机标题栏高度
          titleBarHeight = 48
        }
        const modelInclude = ["iPhone X", 'iPhone XR', "iPhone XS", "iPhone XS MAX", "iPhone 11"];

        for (let i = 0; i < modelInclude.length; i++) {
          //模糊判断是否是modelInclude 中的机型,因为真机上测试显示的model机型信息比较长无法一一精确匹配
          if (res.model.indexOf(modelInclude[i]) != -1) {
            this.data.isIphoneXSeries = true;
            continue;
          }
        }
        this.data.navHeight = titleBarHeight + res.statusBarHeight;
        this.data.statusBarHeight = res.statusBarHeight;

      }
    })
  },

  /* 存储绑定上下级id */
  storeReferralUserId(query) {
    const scene = decodeURIComponent(query.scene)

    const optList = this.getQueryVariable(scene, 'opt') || query.opt;
    const agentId = this.getQueryVariable(scene, 'agentId');

    // 三种接收上级id的方式
    // ?agentId=xx | 直接携带agentId参数分享
    // ?scene=xx,xx,xx,xx | 商品详情二维码分享
    // ?opt=xx,xx,xx,xx | 商品详情右上角分享 
    query.agentId = query.agentId || agentId || (optList && optList.split(',')[0]);

    /* 存储 agentId */
    if (query.agentId) {
      this.globalData.agentId = query.agentId;
      console.log(this.globalData.agentId, 'app.js:agentId')
    }
  },
}

App(initApp)