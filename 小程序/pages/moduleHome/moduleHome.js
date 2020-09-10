import {
  bindReferralUserId
} from '../../utils/util.js'
import {
  getAppletTitle,
  getGoodsDetail
} from "../../utils/requestApi"
import {
  getMainColor
} from "../../utils/image-main-color"
// pages/moduleHome/moduleHome.js
const WxParse = require('../../wxParse/wxParse.js');
const app = getApp();
Page({
  data: {
    imgUrl: app.data.imgurl,
    TopicData: null, //自定义模板数据
    timer: null,
    isShow: false,
    height: 20,
    shareInfo: {},

    groupdata: [], //拼团
    countDownList: [], //限时抢购数据 
    shareTitle: '', //首页分享标题
    shareImg: '', //分享图片
    skuItem: [], // 规格选择列表
    skus: [], // 规格选中项
    freight: null, //运费
    goodsInfo: null, //商品信息
    paramData: {},
    prDid: '', //列表商品id
    nav: ['人气爆品', '内衣', '护肤', '人气爆品', '内衣', '护肤',],
    nums: 0,
    title: '', //新标签的导航栏
    tagid: '', //标签的切换按钮
    obj: {},
    anchorArray: 0,
    toView: '',
    type102: [], //用来存储102商品的请求id
    menuTop: '', //距离顶部的高度
    menuFixed: '', //监听的高度
    scrollTop: 0,
    xiDing: 0, //导航栏距离顶部的距离
    headerTop: 0, //自定义头部距离顶部的距离
    navHeight: 0, //顶部到胶囊的高度
    cObj: {}, //颜色对象
    imageSrc: "https://hyosstest.oss-cn-shenzhen.aliyuncs.com/agentphotoes/bg3.jpg",
    colorArr: [], //颜色的数组
    colorIndex: 0, //颜色数组对应的颜色
    newArr: [], //轮播图图片构成的新数组
    swiperSite: 0,
    PROJECT_TITLE: null,
  },
  bindReferralUserId,
  getLocation(){
     /**
      * 检查权限是否已经打开,未打开则弹出授权窗,注意:此窗回调会触发onShow
      * 点击确定则进入callback回调,否则弹出确认框,提示是否重新打开权限
      * 点击确定后进入设置页面,可在设置页面打开权限或关闭
      */
     app.tools.scopeAuth({
      errMsg: '请打开地理位置权限',
      scope: 'userLocation',
      callback: () => { 
        // callback一定是在授权成功后执行的,所以我们只需要处理好逻辑就行
        wx.getLocation({
          type: 'wgs84',
          success (res) {
            console.log(res, 11)
          }
         })
      }
    })
  },
  onShow() {
   

 

    // app.getDefaultModel();
    app.getSystemInfo().then((res) => {
      console.log("res.statusBarHeightres.statusBarHeightres.statusBarHeight", res.statusBarHeight);
      this.setData({
        navHeight: res.statusBarHeight + 44,
        PROJECT_TITLE: app.data.PROJECT_TITLE
      })
    })
    this.bindReferralUserId();
    this.getDomScale();

  },

  //获取某元素的高度
  getHeight() {
    var that = this;
    try {
      wx.createSelectorQuery().select('.scroll_nav').boundingClientRect((res) => {
        res && that.setData({
            xiDing: res.top - 200
          })
      }).exec();
    } catch (error) {
    }
  },

  onLoad(a) {
    this.getNavTitle(); //首页标题
    this.getShareTitle(); //分享标题
  },

  getDomScale() {
    /**------------------------------------ */
    const scroll = wx.createSelectorQuery().select('.scroll_nav')
    scroll && scroll.boundingClientRect(res => {
      console.log("距离顶端的距离xiDing", res);//686
      this.setData({
        xiDing: res && res.top - 100
      })
      this.getTemplate()
    }).exec();
    const home = wx.createSelectorQuery().select('.home_title');
    home && home.boundingClientRect((res) => {
      // console.log("顶部头部的距离headerTop", res.top);//686
      this.setData({
        headerTop: res && res.top
      })
    }).exec();
  },
  // onPullDownRefresh() {
  //   this.getTemplate();
  // },
  /* 获取首页模板数据 */
  getTemplate() {
    const that = this;

    /***
     * 请求父接口得到了一个数组, 数组中个别项携带api 接口的url, 遍历该数组, 通过该url去请求子接口, 
     * 并在请求结束后修改数组中对应的值,最终在所有请求结束后重新渲染数据
     * 详细案例: 请求首页模板接口获得了骨架数据,需要通过每个项去获取对应的数据
     * 由于是在循环体内请求就必然会造成异步的问题,我们要实现的是
     */
    function initTemplate(templateList) {
      const promises = [];

      templateList.forEach((item, index) => {

        /* 是直播模块且draggable为true */
        if (item.type == 100 && item.content.isDynamic) {
          promises.push(new Promise((resolve, reject) => {
            app.$request({
              url: item.content.interfaceUrl
            }).then(res => {
              if (res.success) {
                const {
                  Data: liveRoomData
                } = res;

                liveRoomData && (item.content.newList = liveRoomData.room_info);
                resolve(true)
              }
            })
          }))

        }
        /* 处理新的标签导航,添加动态数据 */
        else if (item.type == 102 && item.content.isDynamic) {
          promises.push(new Promise((resolve, reject) => {

            item.content.dataset.forEach(ty => {
              that.data.type102 += ty.tagId + ','
            })

            that.data.type102 = that.data.type102.substring(0, that.data.type102.lastIndexOf(','));

            app.$api.getGradeProducts({
              tagIds: that.data.type102,
              pageIndex: 1,
              pageSize: 10,
            }).then(res => {
              if (res.success) {
                const {
                  Result: {
                    Data = {}
                  }
                } = res;

                item.content.newList = Data;
                const dataset = item.content.dataset;

                dataset.forEach((setItem, setIndex) => {
                  const tempList = [];
                  setItem.items = 'items' + setIndex;

                  item.content.newList.forEach(newKey => {

                    if (setItem.tagId == newKey.TagId) {
                      tempList.push(newKey)
                      setItem.newList = tempList
                    }
                  })
                })

                item.content.dataset = dataset;

                resolve(true)
              }
            })
          }))

        }
        /* 这个模块需要添加直播提示功能 */
        else if (item.type == 5) {
          promises.push(new Promise((resolve, reject) => {
            const {
              content: {
                categoryId,
                firstPriority,
                secondPriority,
                thirdPriority
              }
            } = item;

            app.$api.getGradeProducts({
              categoryId,
              firstPriority,
              secondPriority,
              thirdPriority,
              pageIndex: 1,
              pageSize: item.content.goodsize || '10',
            }).then(res => {
              if (res.success) {
                res.Result = res.Result || {};
                item.content.goodslist = res.Result.Data
                resolve(true)
              }
            })
          }))

        }
        /* 处理顶部和轮播图变色 */
        else if (item.type === 9) {
          const {
            content: {
              dataset
            }
          } = item;

          that.setData({ //将每一张轮播图,重新组成新数组
            newArr: dataset.map(v => v.pic)
          })

          if (dataset.length != 0) {
            that.getBackgroundColor(dataset[0].pic).then(data => { //初始化使用第一张轮播图
              that.setData({
                colorArr: [data]
              })
            })
          }
        }
      })

      that.setData({
        swiperSite: templateList.findIndex(v => v.type == 9), //type==9轮播图索引值
      })

      that.checkDataRichtext()

      Promise.all(promises).then(res => {
        that.setData({
          TopicData: templateList
        })
        that.getHeight();
      })
    }

    app.$api.getCustomTemplate().then(res => {
      if (res.success) {
        // wx.stopPullDownRefresh();
        const {
          Data: {
            LModules: modelList
          }
        } = res;

        modelList.unshift({
          type: 'home_title'
        })

        initTemplate(modelList);

      }
    })
  },



  //轮播变化
  handleChange(e) {
    const {
      current
    } = e.detail;
    const {
      colorArr,
      newArr
    } = this.data
    this.setData({
      colorIndex: current
    })
    if (colorArr.length === newArr.length) return //新生成的数组与轮播图数组长度相等,说明轮播图的数组已经添加完成,不在执行获取颜色的方法
    this.getBackgroundColor(this.data.newArr[current]).then((resArr) => {
      colorArr[current] = resArr
      this.setData({
        colorArr: colorArr
      });
    })
  },
  //特殊情况的跳转,用type==2的时候,用于直接跳进创建直播间
  handleTile(e) {
    let user = wx.getStorageSync('userInfo');
    let cookie = wx.getStorageSync('cookie');
    const {
      url
    } = e.currentTarget.dataset;
    if (url.includes('newLive')) { //必须路径 为subPackageC/newLive/index,才有跳转的资格
      if (!cookie) { //未登录
        app.goTo('/pages/authorizationLogin/authorizationLogin')
      } else if (user.StoreStatus == 2) { //跳转的条件
        app.goTo(`/${url}`)
      } else if (user.StoreStatus != 2) { //说明等级不够,要去升级,成为代理
        app.goTo('/packageA/wjx/equities/equities')
      }
    }
  },

  //获取canvas图片上的色块
  getBackgroundColor(url) {
    const ctx = wx.createCanvasContext('myCanvas')
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src: `${url}`,
        success: r => {
          const poster = r.path
          ctx.drawImage(poster, 0, 0, 150, 100)
          // console.log('poster: ', poster)
          ctx.draw(false, () => {
            // 这种方式获取canvas区域隐含的像素数据
            wx.canvasGetImageData({
              canvasId: 'myCanvas',
              x: 0,
              y: 0,
              width: 150,
              height: 100,
              success: res => {
                // console.log("隐含的像素数据", res);
                const imageData = res.data
                // 分区块，可以拓展性的求主要色板，用来做palette
                let colorObj = getMainColor(imageData)
                // console.log('resImageObj', colorObj)
                const {
                  defaultRGB
                } = colorObj
                const {
                  r,
                  g,
                  b,
                  a
                } = defaultRGB;
                const percent = +(a / 255).toFixed(2);
                const endVal = Math.max(50, a - 50); // 这里减去一个固定的数值，取出渐变的另一个数值，模拟渐变
                const endPercent = +(endVal / 255).toFixed(2);
                resolve({
                  startColor: `rgba(${r}, ${g}, ${b}, ${percent})`,
                  endColor: `rgba(${r}, ${g}, ${b}, ${endPercent})`,
                });
              },
            })
          })
        },
        fail: err => {
          // console.log(err);
          // reject(err)
        }
      });
    });
  },

  //直播提示跳转对应的直播间
  handleTipLive(e) {
    const {
      roomid,
      pid
    } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomid}`,
    });
  },

  onclick() {
    this.setData({
      isShow: true
    })
  },
  // 关闭分享
  closeEvent(e) {
    var mode = e.detail.mode;
    if (mode == 'mask') {
      this.setData({
        isShow: false
      })
    }
  },
  // 分享好友
  onShareAppMessage(res) {

    const {
      UserId: userId
    } = app.cache.loadUserInfo();
    console.log({
      // title: this.data.shareInfo.ProductName,
      title: this.data.shareTitle,
      path: 'pages/moduleHome/moduleHome?agentId=' + userId,
      imageUrl: this.data.shareImg
    })
    return {
      // title: this.data.shareInfo.ProductName,
      title: this.data.shareTitle,
      path: 'pages/moduleHome/moduleHome?agentId=' + userId,
      imageUrl: this.data.shareImg
    }
  },
  //检测富文本
  checkDataRichtext() {
    var richtextlist = []
    if (this.data.TopicData) {
      for (var i = 0; i < this.data.TopicData.length; i++) {
        switch (this.data.TopicData[i].type) {
          case 1:
            richtextlist.push(this.data.TopicData[i])
            var richtext = richtextlist[0].content.fulltext
            WxParse.wxParse('richtext', 'html', richtext, this, 5);
            break;
        }
      }
    }
  },
  //链接导航专门处理带linktype的跳转  
  jumpWhere(e) { //跳转类型跟下标
    console.log("跳转数据", e);
    const {
      currentTarget: {
        dataset: {
          linktype,
          link,
          index,
          topicslistjson = null
        }
      }
    } = e;

    // let linktype = e.currentTarget.dataset.linktype,
    //   index = e.currentTarget.dataset.index
    // let topicslistjson = e.currentTarget.dataset.topicslistjson ? e.currentTarget.dataset.topicslistjson : null;
    // let link = e.currentTarget.dataset.link;
    // console.log("自定义首页跳转数据",linktype, index, topicslistjson, e)
    switch (linktype) { //测试顺序按照后台配置顺序
      case 1: {
        app.goPage({
          url: '/pages/goodsDetail/goodsDetail',
          options: {
            p: link.split('id=')[1],
          }
        })
      }
        break;
      case 2: {
        app.goPage({
          url: '/packageA/wjx/allGoods/allGoods',
          options: {
            linktype
          }
        })
      }
        break;
      case 3: {
        app.goPage({
          url: '/packageA/wjx/allGoods/allGoods',
          options: {
            id: link.split('catetoryId=')[1],
          }
        })
      }
        break;
      case 4: {
        console.log('品牌专题,跳转品牌详情')
      }
        break;
      case 5: { //大转盘活动 
        let str = ''
        if (link) {
          str = link.split('?')[1]
          app.goTo(`/packageB/turntable/turntable?${str}`)
        } else {
          app.fa('未设置活动!')
        }
      }
        break;
      case 24: {
        console.log('品牌列表')
      }
        break;
      case 9: {
        app.goPage({
          url: '/packageA/wjx/allGoods/allGoods',
        })
      }

        break;
      case 14: {
        app.goPage({
          url: '/subPackageD/pages/customPage/index',
          options: {
            jsonUrl: encodeURIComponent(topicslistjson),
          }
        })
      }
        break;
      // 团购
      case 12: {
        app.goPage({
          url: '/pages/Groupindex/Groupindex',
        });
      }
        break;
      //限时抢购
      case 13: {
        app.goPage({
          url: '/packageB/flashSale/flashSale',
        });
      }
        break;
      //店铺主页
      case 6: {
        app.goPage({
          url: '/pages/shopkeeperList/shopkeeperList',
        });
      }
        break;
      //会员主页 
      case 7: {
        app.goPage({
          url: '/pages/member/member',
        });
      }
        break;
      // 购物车
      case 8: {
        app.goPage({
          url: "/pages/cart/cart"
        });
      }
        break;
      // 自定义链接
      case 10: { }

        break;
      // 积分商城
      case 15: {
        console.log('积分商城')
      }

        break;
      // 优惠券列表
      case 16: {
        app.goPage({
          url: "../../packageA/pages/MyCoupon/MyCoupon"
        });
      }
        break;
      // 领取优惠券
      case 18: {
        const couponId = link.split('couponId=')[1]

        app.$api.receiveCoupon({
          couponId
        }).then(res => {
          if (res.success) {
            app.alert.confirm({
              content: '优惠券领取成功',
              cancelText: '确定',
              confirmText: '去优惠券列表',
            }, conf => {
              if (conf) {
                app.goPage({
                  url: '/packageA/pages/MyCoupon/MyCoupon',
                })
              }
            });

          }
        })
        console.log('选择优惠券', e)
        // const 
      }
        break;
      // 拼团列表
      case 19: {
        app.goPage({
          url: "/pages/Groupindex/Groupindex"
        });
      }
        break;

      // 周边门店
      case 20: { }
        break;
      // 选择文章 
      case 21: { }
        break;
      // 文章列表
      case 25: { }
        break;
      // 升级会员
      case 26: {
        app.goPage({
          url: "/pages/upgradeMember/upgradeMember"
        });
      }

        break;
      // 组合套餐 
      case 27: {
        app.goPage({
          url: "../../packageA/pages/fuCombina/fuCombina"
        });
      }
      // 镇店之宝
      case 29: {
        const tagId = link.split('TagId=')[1];

        app.goPage({
          url: '/packageB/topOneGoods/topOneGoods',
          options: {
            tagId
          }
        })
      }
        break;
      // 满减优惠 
      case 30: {
        app.goPage({
          url: "/packageB/discounts/discounts"
        });
      }

        break;
    }
  },
  //跳转到商品详情的
  goToGoodsDetail(e) {

    const {
      currentTarget: {
        dataset: {
          item_id,
          item
        }
      }
    } = e;

    const productId = item_id || item.item_id || item.split('productId=')[1];

    if (productId) {
      wx.navigateTo({
        url: `/pages/goodsDetail/goodsDetail?p=${productId}`,
      })
    } else {
      app.alert.toast('商品已下架或状态异常')
    }
  },
  //新标签导航栏切换的方法
  handNav(e) {
    let _this = this;
    const {
      index,
      title,
      tagid,
      opt
    } = e.currentTarget.dataset;
    _this.setData({
      nums: index,
      title,
      tagid,
      toView: 'items' + index
    })
    var query = wx.createSelectorQuery();
    query.selectViewport().scrollOffset();
    query.select("#items" + e.currentTarget.dataset.index).boundingClientRect();
    query.exec(function (res) {
      console.log('点击时获取的高度', res);
      var miss = res[0].scrollTop + res[1].top - 100;
      // console.log("计算出高度scrollTop1",miss);
      wx.pageScrollTo({
        scrollTop: miss,
        duration: 0,
      });
    });

  },
  onPageScroll(e) {
    let that = this
    // console.log("计算出高度scrollTop2", e.scrollTop);
    this.setData({
      scrollTop: e.scrollTop
    })

  },


  // 获取商城主题信息
  getshowType() {
    // wx.showLoading({
    //   title: '加载中',
    // })
    // let _this = this
    // wx.request({
    //   url: getApp().data.url + '/api/PublicHandler.ashx?action=GetWebSet',
    //   data: {},
    //   success (res) {
    //     wx.hideLoading()
    //     // console.log(res)
    //     if (res.data.Result.Status == "Success") {
    //       _this.getTemplate(res.data.Result.WapTheme)
    //     } else {
    //       wx.showToast({
    //         title: '获取展示类型错误',
    //         icon: 'none',
    //         duration: 3000,
    //       })
    //     }
    //   }
    // })
    this.getTemplate(res.data.Result.WapTheme)
  },

  //直播模块跳转
  handleLive(e) {
    const {
      roomid,
      status
    } = e.currentTarget.dataset;
    if (status == 102) {
      app.fa('未开始')
    } else if (status == 103) {
      app.fa('已结束')
    } else if (status == 104) {
      app.fa('禁播')
    } else if (status == 106) {
      app.fa('异常')
    } else if (status == 107) {
      app.fa('已过期')
    }
    app.goTo(`plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=${roomid}`)
  },


  // 倒计时处理
  countdown(date) {
    var dateArr = date.split(' ');
    if (date.indexOf('T') != -1) dateArr = date.split('T');
    let dateArr2 = dateArr[0].split('-').map((item) => {
      return parseInt(item)
    });
    dateArr2[1] -= 1;
    let dateArr3 = dateArr[1].split(':').map((item) => {
      return parseInt(item)
    });
    let now = new Date(); // 当前系统时间
    let to = new Date(...dateArr2, ...dateArr3); // 用户设定的时间
    let deltaTime = to - now; // 时间差 (单位/毫秒ms)
    let limitHours, limitMin, limitSecond;
    let obj = null;
    //超时
    if (deltaTime <= 0) {
      return {
        limitHours: '00',
        limitMin: '00',
        limitSecond: '00',
        overTime: true // 倒计时已过
      }
    }
    var time = deltaTime / 1000
    if (time > 0) {
      let day = parseInt(time / (60 * 60 * 24));
      let hou = parseInt(time % (60 * 60 * 24) / 3600);
      let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
      let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
      let ms = parseInt(((time * 1000) % 1000) / 100)
      obj = {
        day: day,
        hou: hou,
        min: min,
        sec: sec,
        ms: ms
      }
    }
    return {
      limitHours: obj.hou < 10 ? '0' + obj.hou : obj.hou,
      limitMin: obj.min < 10 ? '0' + obj.min : obj.min,
      limitSecond: obj.sec < 10 ? '0' + obj.sec : obj.sec,
      overTime: false
    }
  },
  onHide() {
    clearInterval(this.data.timer)
  },
  imageLoad(e) {
    this.setData({
      height: e.detail.height
    })
    // console.log(e,333333333333333333333333333333);
  },
  //获取导航栏标题
  getNavTitle() {
    getAppletTitle({
      type: 0
    }).then(res => {
      if (res.data.Status == "success") {
        let title = res.data.Data.Title;
        // console.log("首页标题", title);
        //动态改变导航栏
        wx.setNavigationBarTitle({
          title
        })
        wx.setStorageSync("homeTitle", title);

      }
    })
  },
  //获取分享导航栏
  getShareTitle() {
    getAppletTitle({
      type: 1
    }).then(res => {
      // console.log("分享导航栏",res);
      if (res.data.Status == "success") {
        let title = res.data.Data.Title;
        // console.log("分享标题", title);
        this.setData({
          shareTitle: title,
          shareImg: res.data.Data.ImageUrl
        })
        wx.setStorageSync("shareTitle", title);
      }
    })
  },


  //加入购物车
  addCart(e) {
    let id = e.currentTarget.dataset.id;
    this.initData(id);
    this.setData({
      prDid: id
    })
  },
  //获取商品数据
  initData(id) {
    wx.showLoading({
      title: '加载中...',
    })
    getGoodsDetail({
      action: 'getProductDetail',
      ProductID: id
    }).then(res => {
      // console.log("商品详情数据", res)
      if (res.statusCode == 200) {
        wx.hideLoading();
        let {
          Result
        } = res.data;
        /*匹配规格数组，分类*/
        let typeArr = []
        if (Result.IsFightGroup) { //拼团的
          typeArr = Result.FightGroupSkuInfos
        } else if (Result.IsCountDown) { //限时抢购的
          typeArr = Result.CountDownSkuInfoList
        } else { //普通商品的
          typeArr = Result.Skus
        }
        Result.prDid = this.data.prDid
        this.setData({
          skuItem: Result.SkuItem,
          skus: typeArr,
          coupons: Result.Coupons,
          promotionStr: Result.PromotionStr,
          freight: Result.Freight,
          goodsInfo: Result
        })
        this.selectComponent('#goodsSpecsCom').showModal();
      }
    })
  },
  //跳转直播列表
  handleGo(e) {
    app.goTo('/packageA/wjx/broadcast/broadcast')
  }
});