const app = getApp()
import {
  getindexsharedata
} from '../../utils/requestApi.js';

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tabH: Number || String
  },

  lifetimes: {
    attached: function () {

      let KjId = wx.getStorageSync('userInfo').KjCustomId;
      this.setData({
        KjId
      })
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentIndex: 0,
    isIphoneXSeries: false,
    imgUrl: app.data.imgurl,
    isDefault: null, //判断是否为默认tab
    KjId: '', //代理id
    // 默认tab
    defaultTabbarList: [],
    list: [{
        t: '首页',
        i: 'icon_shouye@2x.png',
        si: 'icon_shouye@2x (4).png',
        u: 'index',
        w: 47
      },
      {
        t: '升会员',
        i: 'huiyuan.png',
        si: 'huiyuan_select.png',
        u: 'upgradeMember',
        w: 57
      },
      {
        t: '掌柜',
        i: 'icon_zhuanqian@2x.png',
        si: 'icon_zhuanqian_seleted@2x.png',
        u: 'shopkeeperList',
        w: 45
      },
      {
        t: '购物车',
        i: 'icon_gouwuche@2x.png',
        si: 'icon_gouwuche@2x_2.png',
        u: 'cart',
        w: 59
      },
      {
        t: '我的',
        i: 'icon_wode@2x (1).png',
        si: 'icon_wode@2x.png',
        u: 'member',
        w: 42
      }
    ],
    customTabbarList: [], //自定义tab
    showShare: false,
    sImgArr: [], //分享图片数组
    currentIndex: 0
  },

  pageLifetimes: {
    show() {

      this.setData({
        isIphoneXSeries: app.data.isIphoneXSeries
      })
      if (app.data.PROJECT_TOP_MENU) {
        this.setTabBarData();
      } else {
        app.getDefaultModel().then(() => {
          this.setTabBarData();
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /* 设置底部导航栏数据 */
    setTabBarData() {
      let {
        PROJECT_TOP_MENU,
        PROJECT_THEME
      } = app.data;

      const userInfo = wx.getStorageSync('userInfo') || {};

      let {
        list,
        isDefault
      } = this.data;


      if (PROJECT_TOP_MENU) {
        if (PROJECT_THEME != 'fruit') {
          isDefault = 2

          PROJECT_TOP_MENU.forEach(item => {
            if (item.Content2 == 'upgradeMember') {
              item.Content2 = userInfo.StoreId == 0 ? 'pages/upgradeMember/upgradeMember' : 'pages/shopkeeperList/shopkeeperList';
              item.Name = userInfo.StoreId == 0 ? '升级' : '掌柜'
            }
          })
  
          const pages = getCurrentPages();
          const currentRoute = pages[pages.length - 1].route;
          const currentIndex = PROJECT_TOP_MENU.findIndex(v => v.Content2.indexOf(currentRoute) != -1);
         
          app.setTitle(PROJECT_TOP_MENU[currentIndex].Name);
          
          this.setData({
            currentIndex: currentIndex
          })

        } else {

          isDefault = 1
          PROJECT_TOP_MENU = JSON.stringify(list)
          PROJECT_TOP_MENU = JSON.parse(PROJECT_TOP_MENU)
          PROJECT_TOP_MENU.splice(userInfo.StoreId != 0 ? 1 : 2, 1)

        }

        this.setData({
          defaultTabbarList: PROJECT_TOP_MENU,
          customTabbarList: PROJECT_TOP_MENU,
          isDefault
        })

      }
    },
    onShare(e) {
      if (e.currentTarget.dataset.type == 'close') {
        this.setData({
          showShare: false
        });
        return
      }
      wx.showLoading({
        title: '获取中...'
      })
      getindexsharedata({
        Type: 1,
        Path: 'pages/home/home'
      }).then(res => {
        wx.hideLoading()
        if (res.data.Status == 'Login' || res.data.Status == 'Faile') {
          wx.showToast({
            icon: 'none',
            title: res.data.Message
          })
        } else this.setData({
          sImgArr: res.data.Result.Data,
          showShare: true
        })

      })
    },

    /* 自定义跳转 */
    redirectPage(e) {
      const pages = getCurrentPages();
      const currentRoute = pages[pages.length - 1].route;
      const {
        currentTarget: {
          dataset: {
            index,
            url,
            item
          }
        }
      } = e;

      if (url.includes(currentRoute)) {
        return
      }

      const targetUrl = `/${url}${url.includes('?') ? '&' : '?'}tabIndex=${index}&name=${item.name}`;

      app.goPage({
        url: targetUrl,
        type: 'redirect',
      })
    },



    // 获取swiper  current
    onChange(e) {
      this.setData({
        currentIndex: e.detail.current
      })
    },

    // 保存图片
    onSave() {
      let {
        sImgArr,
        currentIndex
      } = this.data;
      wx.showLoading({
        title: '保存中...'
      })
      wx.downloadFile({
        url: sImgArr[currentIndex].url,
        success(res) {
          wx.hideLoading()
          if (res.statusCode === 200) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success() {
                wx.showToast({
                  icon: 'none',
                  title: '保存成功'
                })
              },
              fail() {
                wx.showToast({
                  icon: 'none',
                  title: '保存失败'
                })
              }
            })
          }
        }
      })
    }
  }
})