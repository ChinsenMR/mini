"use strict";

var _config = _interopRequireDefault(require("./config"));

var _project = _interopRequireDefault(require("./project"));

var _index = _interopRequireDefault(require("./utils/tools/index"));

var _index2 = _interopRequireDefault(require("./utils/mixins/index"));

var _fjhApi = _interopRequireDefault(require("./utils/fjh-api"));

var _template = _interopRequireDefault(require("template/template.js"));

var _index3 = _interopRequireDefault(require("./stores/index"));

var _wxParse = _interopRequireDefault(require("./wxParse/wxParse"));

var _index4 = require("./utils/store/index");

var _requestApi = require("./utils/requestApi");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var livePlayer = requirePlugin('live-player-plugin');

var initApp = _objectSpread({}, _index2["default"], {}, _fjhApi["default"], {
  // 旧的api方法,不建议再调用
  mapToData: _index4.mapToData,
  // 状态管理链接器 相当于redux的connect
  $store: _index3["default"],
  // 状态管理入口
  wxParse: _wxParse["default"],
  // 富文本转换阿萨

  /* 全局对象 */
  globalData: {
    template: _template["default"],
    GetMembersInfo: wx.getStorageSync('userInfo'),
    shareOpenid: null,
    roomId: null,
    //直播房间id
    agentId: null // 用户带进来的代理id，用于绑定上下级 

  },
  data: _objectSpread({}, _config["default"], {
    //存放url和配置数据
    cookie: null,
    // cookie
    navHeight: null,
    // 导航栏高度
    statusBarHeight: null,
    // 状态栏高度
    userInfo: null,
    // 用户信息
    imgurl: 'https://img.hmeshop.cn/hmeshop_jxy/images/',
    share_userid: null,
    //直播间分享者的userid,用于绑定当前使用的上级
    sessioKey: null,
    roomid: '',
    //从商品详情将该值存入全局,用于是直播间数据时带上
    cartNum: 0,
    //购物车总条数
    sku: null,
    // 商品规格
    isIphoneXSeries: false // ios撑起底部的高度

  }),
  onLaunch: function onLaunch() {
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
      _index["default"].init(this);

      this.getAccountInfo();
    }
    /* 检查版本更新 */

    this.checkNewVerison();
    /* 获取默认主题模板 */

    this.getDefaultModel();
    /* 获取系统信息 */

    this.getAppSystemInfo();
    /* 获取openid及 */

    this.getOpenId();
  },
  onShow: function onShow(options) {
    var query = options.query,
        scene = options.scene;
    /* 存储上级id,全局使用 */

    this.storeReferralUserId(query);
    /* 如果打开了直播权限开关 */

    if (this.data.IS_OPEN_LIVE) {
      this.getShareParams({
        room_id: query.room_id,
        scene: scene
      });
    }
  },

  /* 获取用户openId */
  getOpenId: function getOpenId() {
    var _this = this;

    wx.login({
      success: function success(res) {
        if (res.code) {
          (0, _requestApi.getOpenId)({
            appid: _this.data.appId,
            js_code: res.code
          }).then(function (res) {
            _this.data.sessioKey = res.session_key;
            _this.data.openid = res.openid;
            wx.setStorageSync('openid', res.openid);
          });
        } else {
          console.log('登录失败' + res.errMsg);
        }
      }
    });
  },

  /* 获取直播分享分享者的信息 */
  getShareParams: function getShareParams(params) {
    var _this2 = this;

    livePlayer.getShareParams(params).then(function (res) {
      console.log("直播返回的openid", res);
      var openId = res.share_openid;
      _this2.globalData.roomId = res.room_id || '';
      _this2.globalData.shareOpenid = openId;
      if (!openId) return;
      (0, _requestApi.getMemberByOpenId)({
        openId: openId
      }).then(function (res) {
        console.log('通过直播openid获取用户id', res);

        if (res.Status == "Success") {
          var UserId = res.Data.UserId;
          _this2.data.share_userid = UserId;
          _this2.globalData.agentId = UserId;
        }
      });
    })["catch"](function (err) {
      console.log('获取直播信息失败', err);
    });
  },
  // 获取用户信息
  getUserInfo: function getUserInfo() {
    (0, _requestApi.getUserInfo)().then(function (res) {
      wx.setStorageSync("userInfo", res.data.Data);
    });
  },

  /* 查看运行环境 动态配置域名*/
  getAccountInfo: function getAccountInfo() {
    var info = wx.getAccountInfoSync();
    console.log("动态配置域名", info);
    var _info$miniProgram = info.miniProgram,
        env = _info$miniProgram.envVersion,
        version = _info$miniProgram.version,
        appId = _info$miniProgram.appId;
    this.data.system = {
      env: env,
      version: version
    };

    var usingProject = _project["default"].find(function (v) {
      return v.appId === appId;
    });

    this.data.url = usingProject.url;
    this.data.appId = usingProject.appId;
    this.data.projectName = usingProject.name;
  },

  /* 切换不用的样式 */
  getDefaultModel: function getDefaultModel() {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      _this3.alert.loading();

      wx.request({
        url: _this3.data.url + _this3.data.api.setting,
        success: function success(res) {
          _this3.alert.closeLoading();

          var _res$data$Result = res.data.Result,
              SiteLogo = _res$data$Result.SiteLogo,
              SiteName = _res$data$Result.SiteName,
              SiteUrl = _res$data$Result.SiteUrl,
              TopMenus = _res$data$Result.TopMenus,
              WapTheme = _res$data$Result.WapTheme,
              _res$data$Result$Site = _res$data$Result.SiteSettings,
              AfterSale = _res$data$Result$Site.AfterSale,
              IsBindPhone = _res$data$Result$Site.IsBindPhone,
              IsDistributorAudit = _res$data$Result$Site.IsDistributorAudit,
              HaveVideo = _res$data$Result$Site.HaveVideo,
              IsOpenPointShop = _res$data$Result$Site.IsOpenPointShop,
              IsOpenPickeupInStore = _res$data$Result$Site.IsOpenPickeupInStore,
              OpenBalancePay = _res$data$Result$Site.OpenBalancePay,
              IsOpenStoreQuationOtherField = _res$data$Result$Site.IsOpenStoreQuationOtherField,
              KjSendGoods = _res$data$Result$Site.KjSendGoods; // 详细注释请移步config.js查看

          _this3.data.IS_ALLOW_USER_APPLY_AFTER_SALE = !AfterSale;
          _this3.data.IS_NEED_BIND_MOBILE = IsBindPhone;
          _this3.data.IS_NEED_DISTRIBUTOR_AUDIT = IsDistributorAudit;
          _this3.data.PROJECT_LOGO = SiteLogo;
          _this3.data.PROJECT_DOMAIN = SiteUrl;
          _this3.data.PROJECT_TOP_MENU = TopMenus;
          _this3.data.PROJECT_TITLE = SiteName;
          _this3.data.PROJECT_THEME = WapTheme;
          _this3.data.IS_ARROW_USE_VIDEO = HaveVideo;
          _this3.data.IS_OPEN_POINT_SHOP = IsOpenPointShop;
          _this3.data.IS_ARROW_USER_PICK_UP = IsOpenPickeupInStore;
          _this3.data.IS_OPEN_BALANCE_DEDUCTION = OpenBalancePay;
          _this3.data.IS_OPEN_OTHER_FIELD = IsOpenStoreQuationOtherField, _this3.data.IS_ALLOW_USER_SHOW_DELIVER_GOODS = KjSendGoods;
          var tabIndexOfCart = TopMenus.findIndex(function (v) {
            return v.Name === '购物车';
          }); //获取购物车的索引值,为了加入购物车的动画需要索引值

          wx.setStorageSync('cartTabIndex', tabIndexOfCart);
          resolve();
        }
      });
    });
  },

  /* 检查新版本 */
  checkNewVerison: function checkNewVerison() {
    //判断时候需要更新新版小程序
    if (wx.canIUse('getUpdateManager')) {
      var updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function () {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function success(res) {
                if (res.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本',
              content: '新版本已经上线啦~，请删除当前小程序，重新搜索打开'
            });
          });
        }
      });
    }
  },

  /* 获取手机信息 */
  getAppSystemInfo: function getAppSystemInfo() {
    var _this4 = this;

    wx.getSystemInfo({
      success: function success(res) {
        // console.log("获取手机信息",res);
        var titleBarHeight;
        var system = res.system; //胶囊高度32px

        if (system.indexOf("iOS") > -1) {
          //ios手机标题栏高度
          titleBarHeight = 44;
        }

        if (system.indexOf("Android") > -1) {
          //安卓手机标题栏高度
          titleBarHeight = 48;
        }

        var modelInclude = ["iPhone X", 'iPhone XR', "iPhone XS", "iPhone XS MAX", "iPhone 11"];

        for (var i = 0; i < modelInclude.length; i++) {
          //模糊判断是否是modelInclude 中的机型,因为真机上测试显示的model机型信息比较长无法一一精确匹配
          if (res.model.indexOf(modelInclude[i]) != -1) {
            _this4.data.isIphoneXSeries = true;
            continue;
          }
        }

        _this4.data.navHeight = titleBarHeight + res.statusBarHeight;
        _this4.data.statusBarHeight = res.statusBarHeight;
      }
    });
  },

  /* 存储绑定上下级id */
  storeReferralUserId: function storeReferralUserId(query) {
    var scene = decodeURIComponent(query.scene);
    var optList = this.getQueryVariable(scene, 'opt') || query.opt;
    var agentId = this.getQueryVariable(scene, 'agentId'); // 三种接收上级id的方式
    // ?agentId=xx | 直接携带agentId参数分享
    // ?scene=xx,xx,xx,xx | 商品详情二维码分享
    // ?opt=xx,xx,xx,xx | 商品详情右上角分享 

    query.agentId = query.agentId || agentId || optList && optList.split(',')[0];
    /* 存储 agentId */

    if (query.agentId) {
      this.globalData.agentId = query.agentId;
      console.log(this.globalData.agentId, 'app.js:agentId');
    }
  }
});

App(initApp);