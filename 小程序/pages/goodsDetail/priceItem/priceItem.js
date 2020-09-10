const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    pageType: Number,
    goodsInfo: Object
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    IsFavorite: "", //收藏
    ShopName:null,
    goods:{}
  },
  /**
   * 生命周期
   */
  lifetimes: {
    // 在组件实例进入页面节点树时执行
    attached: function () {

    },
    // 在组件实例被从页面节点树移除时执行
    detached: function () {
      
    },
    //在组件在视图层布局完成后执行
    ready: function () {
      let ShopName = wx.getStorageSync("tab").SiteName
      // console.log("======",ShopName)
      this.setData({
        IsFavorite: this.data.goodsInfo.IsFavorite,
        ShopName: ShopName
      })
    },
  },
  observers: {
    'goodsInfo': function (val) {
      this.setData({
        goods: val
      })
    },
  },

  
  /**
   * 组件的方法列表
   */
  methods: {
    Celect() {
      app.fg({
        url: '/API/MembersHandler.ashx?action=AddFavorite',
        data: {
          ProductId: this.data.goodsInfo.DefaultSku.ProductId
        }
      }).then(res => {
     
        if (this.data.IsFavorite == "false") {
          this.setData({
            IsFavorite: "true"
          })
          wx.showToast({
            title: res.data.Message,
          })
        } else {
          this.setData({
            IsFavorite: "false"
          })
          wx.showToast({
            title:'已取消收藏',
          })
        }
      })
    },

    // 客服
    serviceWin(){
      wx.showToast({
        title: '美洽客服未开启',
        icon: 'none',
        duration: 2000,
        mask: false,
        success: (result) => {
          
        },
        fail: () => {},
        complete: () => {}
      });
        
    }



  
  }
})