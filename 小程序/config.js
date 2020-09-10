/* 常规配置 */
const commonConfig = {
  test: false, // 如果为true 则使用测试域名（testDomain），反之使用正式域名
  // 项目列表文件：project.js 
  url: null, // 域名是通过 app.js 里的 getAccountInfo 动态配置
  appId: null, // appId是通过 app.js 里的 getAccountInfo 动态配置
  testDomain: 'http://192.168.3.86:8091', // 测试域名
  bindPhoneUrl: '/subPackageD/pages/authentication/bindPhone', // 绑定手机的路径
  loginUrl: '/pages/authorizationLogin/authorizationLogin', // 登录路径
  // 全局公用api
  api: {
    setting: '/api/PublicHandler.ashx?action=GetWebSet', 
    upload: '/AppShop/AppShopHandler.ashx?action=AppUploadImage'
  },
  // 全局公用图片
  img: {
    default: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202007091714423634040.png',
    error: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202008041422237205570.png'
  },
  /* 系统信息， */
  system: {
    env: null, // 开发环境为develop, 体验环境为trial, 正式版为release
    verion: null, // 当前版本，只有正式环境才会有
  }
}

if (commonConfig.test) {
  commonConfig.url = commonConfig.testDomain;
}

/* 前端控制的功能或设置开关 */
const systemConfig = {
  // 主动控制(本地)
  IS_OPEN_LIVE: true, // 是否开启直播
 
  // 被动控制(服务器)
  IS_OPEN_BALANCE_DEDUCTION: false, // 是否可以用余额抵扣
  IS_ALLOW_USER_APPLY_AFTER_SALE: false, // 判断是否允许用户申请退款 / 售后
  IS_NEED_BIND_MOBILE: false, // 是否需要绑定手机
  IS_NEED_DISTRIBUTOR_AUDIT: false,
  IS_OPEN_POINT_SHOP: false, // 是否打开积分商城
  IS_ARROW_USE_VIDEO: false, // 判断是否允许使用视频
  IS_ARROW_USER_PICK_UP: false, // 是否允许用户自提
  IS_OPEN_OTHER_FIELD: false, // 门店资质审核是否需要其他字段
  IS_ALLOW_USER_SHOW_DELIVER_GOODS:false,// 控制门店订单/售后订单/待发订单的发货按钮是否显示
  IS_ALLOW_SET_LIVE_REBATE: false, // 是否允许设置直播返利

  
  // 获取项目配置
  PROJECT_LOGO: null, // logo
  PROJECT_DOMAIN: null, // 项目域名
  PROJECT_TITLE: null, // 项目名
  PROJECT_THEME: null, // 主题样式
  PROJECT_TOP_MENU: null, // 菜单
  PROJECT_KJ_LOGIN_URL: null, // 控价地址

};

export default Object.assign(commonConfig, systemConfig)