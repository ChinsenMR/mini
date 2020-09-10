import { getGoodsDetail, getProductsDataList, getGrade } from "../../utils/requestApi";
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    tabIndex: '',//导航栏索引值
    ProductIds: '', //商品id
    GetReferralGrades: [],
    goodsInfo: null,
    gradeArr: [],//等级列表
    glanceOver: [],//猜你喜欢数据列表
    // levelArr: [],//特权数组
  },
  pageSize: 10, //	每页数量
  pageIndex: 1,	//	当前第几页
  user: {},//用户信息
  newStr: '',//浏览过的商品id

  onLoad(options) {
    this.getDefauslt();
    this.setData({ tabIndex: options.tabIndex })
    let user = wx.getStorageSync("userInfo");

    if (user.KjCustomId > 0) {//如果是代理则无需在进入改页面
      app.alert.toast('您已是代理!');
      setTimeout(() => {
        app.goTo('/pages/member/member', 2)
      }, 1500);
      return
    }
    if (user) {
      this.user = user;
      this.getProductIds(1); // 获取本地缓存 同时将还原商品id => getProductsData()
    } else {//未登录的情况
      app.alert.confirm({
        title: '未登录',
        content: '该用户还未登录,是否去登录界面?',
      }, confirm => {
        if (confirm) {
          app.goTo('/pages/authorizationLogin/authorizationLogin')
        } else {
          app.goTo('/pages/moduleHome/moduleHome', 2)
        }
      })


    }
  },
  //获取默认会员升级商品等级数组
  getDefauslt() {
    app.$api.memberGradesProduct().then(res => {
      if (res.success) {
        let obj = res.Data;
        let arr = obj.MemberGradesProduct;
        // 循环出数组中的商品 ProductIds
        arr.forEach((v, i) => {
          v.bg_img = app.data.imgurl + 'max_bg_01.png';
          if (v.ProductIds) {
            v.title = `成为${v.Name}会员`
            v.gradeList = []
            this.getProductsData(v.ProductIds, 2, i)
          }
        })

        this.setData({
          gradeArr: arr
        })
      }
    })
  },

  // 根据本地缓存获取相对应会员等的上商品id
  getProductIds() {
    let goodsId = wx.getStorageSync('goodsId');//浏览过的商品id数组
    if (goodsId.length != 0) {
      let str = ''
      goodsId.forEach(v => { str += v + ',' })
      str = str.substring(0, str.lastIndexOf(','));//去除最后一个字符
      this.newStr = str
      this.getProductsData(str, 1);//传入type==1,是说明此时是要获取浏览过的商品数据
    }
  },

  // 获取根据会员等级获取升级商品
  getProductsData(ids, type, index) {

    app.$api.gradeProducts({
      pageSize: this.pageSize,
      pageIndex: this.pageIndex,
      ProductIds: ids
    }).then(res => {
      if (res.success) {
        let arr = res.Result.Data;
        if (type == 1) {//获取浏览过的商品列表
          this.setData({
            glanceOver: arr
          })
        } else {//获取升级会员上列表
          let { gradeArr } = this.data;
          gradeArr[index].gradeList = arr
          console.log('gradeArr', gradeArr);
          this.setData({ gradeArr })
        }
      }

    })
  },

  //获取详情数据
  getDetailData(id) {
    let prDid = id
    let data = {
      action: 'getProductDetail',
      ProductID: prDid
    }
    getGoodsDetail(data).then(res => {
      if (restusCode == 200) {
        wx.hideLoading();
        let { Result } = res.data;
        this.setData({
          bannerArr: Result.ImgList,
          animationImg: Result.ImgList[0],
          description: Result.Description,
          skuItem: Result.SkuItem,
          skus: Result.Skus,
          coupons: Result.Coupons,
          promotionStr: Result.PromotionStr,
          freight: Result.Freight,
          goodsInfo: Result
        })
      }
    })
  },
  //监听商品滚动
  scroll(e) {
    console.log(e)
  },


  // 跳转详情
  handleDetail(e) {
    wx.navigateTo({
      url: `/pages/goodsDetail/goodsDetail?p=${e.currentTarget.dataset.productid}`,
    })
    wx.setStorageSync("buyType", "fightgroup")
  },
  //跳转页面
  handleGo(e) {
    const { type } = e.currentTarget.dataset;
    if (type == 1) {//升级代理
      app.goTo('/packageA/wjx/equities/equities')
    } else {//去首页
      app.goTo('/pages/moduleHome/moduleHome')
    }
  },
  // 添加购物车
  handleAdds(e) {
    let id = e.currentTarget.dataset.productid;
    this.getDetailData(id);
    wx.setStorageSync('buyType', e.currentTarget.dataset.type)
    this.triggerEvent('open')
  },

  // 跳转代理页面
  handleMember() {
    wx.navigateTo({
      url: '/packageA/wjx/equities/equities',
    })
  },

})