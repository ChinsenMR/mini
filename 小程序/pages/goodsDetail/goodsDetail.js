const app = getApp();
import {
  bindReferralUserId,
  createProductSharePath,
  getProductShareParams,
  deleteBlankData
} from '../../utils/util.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartCount: 0, //购物车数量
    imgUrl: app.data.imgurl,
    currentTab: 1, // 当前选择的tab,
    navHeight: null, //系统状态栏高度
    statusBarHeight: null, //导航栏栏高度
    bannerArr: [], //bannerArr
    skuItem: [], // 规格选择列表
    skus: [], // 规格选中项
    freight: null, //运费
    goodsInfo: null, //商品信息
    paramData: {},
    //页面类型   新人限时抢购：1，  限时折扣：2，  9.9包邮：3， 品牌秒杀： 4， 即将销售：5， 拼团：6
    pageType: null,
    prDid: null, //商品id
    description: null, // 图文详情
    shopUser: [], //购买下单用户
    coupons: [], //  优惠卷
    promotionStr: [], // 优惠卷 ---> 促销 
    //福利列表
    isShow: false, // 分享弹窗展示
    shareInfo: {},
    newHeight: 0,
    //---------------------------
    roomid: '', //从直播间到商品详情,这是直播间的房号id
    openid: '', //直接用户的openid
    //---------------------------
    upAgentId: '', //分享进来的分享代理id
    groupId: '', //分享进来的分享团id
    agencyInfo: {}, //代理信息
    productid: [], //用来存储所有的进来的商品id
    liveShow: false, //控制直播提示的显示隐藏
    Defaultaddres: {}, //默认地址对象
    isLogin: true, // 是否已登录
    listData: [], //评论列表
    videoStatus: false, //是否显示相关的视频
    totalAll: 0, //评论总条数

  },
  bindReferralUserId,
  page: {
    index: 1,
    size: 10
  },
  totalPage: 1, //总页码


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      pageType: parseInt(options.pagetype) || 6,
      userid: app.cache.loadUserId(),
      prDid: options.p || options.prDid,
      roomid: options.room_id, //直播间的房号id
      openid: options.openid, //直接用户的openid
    })

    if (options.scene || options.opt) {
      const paramsObj = getProductShareParams(options.scene || options.opt);
      console.log(paramsObj, '获取到的参数')
      this.setData({
        prDid: paramsObj.productId, //商品id
        groupId: paramsObj.groupId, //团id
        agentId: paramsObj.agentId, //代理id

      })
    }
    if (options.room_id) { //直播间id
      app.data.roomid = options.room_id
    }
    this.storeGoodsHistory(options);

    //判断是否开启视频相关的控件
    let status = app.data.IS_ARROW_USE_VIDEO;
    this.setData({
      videoStatus: status
    })
    // this.getGoodsDetail();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if (!app.cache.loadCookie()) {
      this.setData({
        isLogin: false
      })
    }
    this.getGoodsDetail();


    this.setNavHeight();


    this.getBuyUserList()
    this.getCartList()
    this.getDefaultAddress();
    this.bindReferralUserId(); //绑定上下级
  },
  /* 获取商品详情 */
  getGoodsDetail() {
    let user = wx.getStorageSync('userInfo');
    const {
      prDid,
      upAgentId,
      groupId
    } = this.data;
    app.$api.getGoodsDetail({
      ProductID: prDid,
      FightDistributorUserId: upAgentId || '', //代理id
      FightGroupId: groupId || '', //团id
    }).then(res => {
      if (res.success) {
        const {
          Result
        } = res;
        if (Result.FullAmountReduce) { //处理优惠活动
          Result.FullAmountReduce = Result.FullAmountReduce.split("|");
          let feedBackImg = deleteBlankData(Result.FullAmountReduce); //删除空格和过滤数组空数据
          Result.FullAmountReduce = feedBackImg
        }
        if (Result.FullAmountSentFreight) { //处理优惠运费活动
          Result.FullAmountSentFreight = Result.FullAmountSentFreight.split("|");
          let feedBackImg = deleteBlankData(Result.FullAmountSentFreight);
          Result.FullAmountSentFreight = feedBackImg
        }

        if (Result.IsFightGroup && !user) { //处理分享进来未登录造成的bug
          if (!user) {
            let args = {
              title: '未登录',
              content: '是否确认登录',
            }
            app.alert.confirm(args, conf => {
              if (conf) {
                app.goTo('/pages/authorizationLogin/authorizationLogin')
              } else {
                app.goBack()
              }
            })
          }
        }

        Result.prDid = this.data.prDid;

        /*匹配规格数组，分类*/
        let typeArr = []
        if (Result.IsFightGroup) { //拼团的
          typeArr = Result.FightGroupSkuInfos
        } else if (Result.IsCountDown) { //限时抢购的
          typeArr = Result.CountDownSkuInfoList
        } else { //普通商品的
          typeArr = Result.Skus
        }
        this.getComments(1); //获取评论列表
        this.setData({
          bannerArr: Result.ImgList,
          animationImg: Result.ImgList[0],
          description: Result.Description,
          skuItem: Result.SkuItem,
          skus: typeArr,
          coupons: Result.Coupons,
          promotionStr: Result.PromotionStr,
          freight: Result.Freight,
          goodsInfo: Result, //商品详情数据
          agencyInfo: Result.FightDistributorInfo, //代理信息
          liveShow: true, //显示直播提示
        })

      }
    })
  },
  /* 设置导航栏高度 */
  setNavHeight() {
    this.getSystemInfo().then((res) => {
      const newHeight = (res.statusBarHeight + 44) - res.statusBarHeight;
      
      this.setData({
        statusBarHeight: res.statusBarHeight,
        navHeight: res.statusBarHeight + 44,
        newHeight
      })
    })
  },
  /**获取浏览过的商品id */
  storeGoodsHistory(options) {
    let oldArr = wx.getStorageSync('goodsId');
    let newArr = this.data.productid;
    if (options.p != undefined || options.p != null) {
      newArr.push(options.p);
      if (oldArr) {
        oldArr.push(options.p)
        console.log('oldArr', oldArr);
        if (oldArr.length > 20) { //超过20个商品删除前一个
          oldArr.splice(0, 1);
        }
        wx.setStorageSync('goodsId', [...new Set(oldArr)]); //去重
      } else {
        wx.setStorageSync('goodsId', newArr);
      }
    }

  },

  /* 获取购物车列表 */
  getCartList() {
    if (!this.data.isLogin) return
    app.$api.getCartList().then(res => {
      if (res.success) {
        this.setData({
          cartCount: res.Data.RecordCount
        })
      }

    })
  },

  //组件点击全部重新调取评论接口
  handleEvaluate(e) {
    app.alert.loading();
    const {
      pageIndex
    } = e.detail;
    this.data.index = pageIndex; //重置评论页码
    this.setData({
      listData: []
    })
    this.getComments(pageIndex);
  },
  //获取评论信息
  getComments(pageIndex) {
    let {
      prDid
    } = this.data;
    app.$api.loadReview({
      action: 'LoadReviewYinLiu',
      PageSize: 10,
      pageIndex: pageIndex || this.page.index,
      ProductId: prDid
    }).then(res => {
      let arr = res.Result.Data;
      if (res.success && arr.length != 0) {
        app.alert.closeLoading();
        let total = res.Result.TotalRecords; //评论总条数
        arr.forEach(v => {
          if (v.Score > 5) {
            v.Score = 5
          } else {
            v.Score = Number(v.Score); //高亮的星星
          }
          v.gray = 5 - Number(v.Score); //不高亮的星星
        })
        if (total / this.page.size < this.page.index) {
          this.totalPage = 1
        } else {
          this.totalPage = Math.ceil(total / this.page.size);
        }
        let newArr = [...this.data.listData, ...arr];
        this.setData({
          listData: newArr,
          totalAll: total
        })
      } else {
        app.alert.closeLoading();
      }
    })
  },

  succ(e) {
    this.setData({
      cartCount: e.detail
    })
  },


  //跳转直播房间
  handleGo(e) {
    const {
      roomid,
      pid
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomid}`,
    });
  },
  //关闭直播提示弹窗
  handleOff() {
    this.setData({
      liveShow: false
    })
  },
  /* 获取分享参数 */
  getShareOptions(type) {
    const {
      goodsInfo: info,
      prDid: productId,
    } = this.data;

    let upAgentId = '',
      groupId = '';

    if (info.FightGroupInfo && Object.keys(info.FightGroupInfo).length > 0) {
      groupId = info.FightGroupInfo.FightGroupId || ''
    }
    if (info.FightDistributorInfo && Object.keys(info.FightDistributorInfo).length > 0) {
      upAgentId = info.FightDistributorInfo.UserId || ''
    }

    const path = createProductSharePath({
      url: 'pages/goodsDetail/goodsDetail',
      /* 注意：！！！分享参数的顺序依次是商品ID，团Id，分享的代理ID，如果还有那就继续往后面加 */
      options: [productId, groupId, upAgentId]
      /* type决定了分享的类型 */
    }, type);

    return {
      path,
      groupId,
      upAgentId
    }
  },

  /*获取二维码分享列表*/
  getShareQrCode() {

    const {
      goodsInfo = {},
        prDid = '',
        isLogin
    } = this.data;

    const ajaxData = {
      type: 1,
      path: this.getShareOptions('code').path,
      salePrice: goodsInfo.SalePrice,
      productId: prDid
    }

    if (!isLogin) {
      return app.alert.message('用户未登录')
    }
    app.$api.producQrcodeList(ajaxData).then(res => {

      if (res.success) {
        this.setData({
          shareInfo: res.Data,
          isShow: true
        })
      }
    })
  },

  /* 关闭分享弹窗 */
  closeShareDialog(e) {
    const mode = e.detail.mode;

    mode === 'mask' && this.setData({
      isShow: false
    })
  },
  /* 分享好友 */
  onShareAppMessage(res) {

    const {
      goodsInfo = {},
    } = this.data;

    console.log({
      title: goodsInfo.ProductName,
      path: this.getShareOptions().path,
      imageUrl: goodsInfo.ImageUrl1
    })

    return {
      title: goodsInfo.ProductName,
      path: this.getShareOptions().path,
      imageUrl: goodsInfo.ImageUrl1
    }

  },

  /* 获取手机信息 */
  getSystemInfo() {
    return new Promise((resolve, reject) => {
      wx.getSystemInfo({
        success(res) {
          resolve(res)
        }
      })
    })
  },

  /* 获取默认地址 */
  getDefaultAddress() {
    if (!this.data.isLogin) return;

    app.$api.getAddressList().then(res => {
      if (res.success) {
        this.setData({
          Defaultaddres: res.Data[0]
        })
      }
    })

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    wx.removeStorageSync('buyType')
  },

  /* 切换头部Nav */
  selectNav(e) {
    this.page.index = 1; //重置评论的分页页码数
    this.setData({
      currentTab: e.target.dataset.id || e.detail.id
    })
  },

  /* 自定义返回上一级 */
  navigateBack() {
    getCurrentPages().length > 1 ?
      wx.navigateBack() :
      wx.redirectTo({
        url: '/pages/home/home'
      })


  },

  /* 初始化下单的用户列表 */
  getBuyUserList() {
    app.$api.getBuyUserData()
      .then(res => {
        if (res.success) {
          this.setData({
            shopUser: !res ? [] : res.Result.Data
          })
        }
      })
  },

  /* 打开规格选择modal */
  openSpecs(param) {
    console.log("打开规格", param);
    const {
      goodsInfo
    } = this.data;
    this.setData({
      paramData: param.detail
    })
    this.selectComponent('#goodsSpecsCom').showModal(param.detail.handleType);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.currentTab == 2) { //头部导航栏为 ->评价<- 的时候才触发分页功能
      app.alert.loading();
      if (this.page.index >= this.totalPage) {
        app.alert.toast('没有更多数据了!')
      } else {
        this.page.index++
        this.getComments();
      }
    }

  },

})