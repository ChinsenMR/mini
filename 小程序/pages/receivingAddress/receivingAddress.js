import { getAddressList, setdefaultAddress,getRegion,deletedAddress} from "../../utils/requestApi.js"
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    delBtnWidth: 180,
    isEmpty: false,
    listData: [],
    list: [],
    startX: "",
    fromType: '', //用于判断是从哪个页面过来的
    ungetAddress: false,//是否受过权
  },

  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    console.log("确认订单过来的", options);
    this.setData({
      fromType: options.fromType, //用于判断从那个页面过来的有fromType这个参数就是从'确认订单页面过来的'
    })
    this.initEleWidth();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getAddressList() //获取列表数据
  },
  initEleWidth() {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    // console.log(delBtnWidth)
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  delItem: function (e) {
    //获取列表中要删除项的下标
    var index = e.currentTarget.dataset.index;
    console.log(index)
    var list = this.data.list;
    //移除列表中下标为index的项
    list.splice(index, 1);
    //更新列表的状态
    this.setData({
      list: list
    });
  },
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth; //以宽度750px设计稿做宽度的自适应
      var scale = (750 / 2) / (w / 2);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  touchS: function (e) {
    if (e.touches.length == 1) {
      // console.log(e.touches[0].clientX)
      this.setData({
        //设置触摸起始点水平方向位置
        startX: e.touches[0].clientX
      });
    }
  },
  touchM: function (e) {
    if (e.touches.length == 1) {
      //手指移动时水平方向位置
      // console.log(e.touches[0].clientX)
      var moveX = e.touches[0].clientX;
      //手指起始点位置与移动期间的差值
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var txtStyle = "";
      if (disX == 0 || disX < 0) { //如果移动距离小于等于0，说明向右滑动，文本层位置不变
        txtStyle = "transform: translateX(0)";
      } else if (disX > 0) { //移动距离大于0，文本层left值等于手指移动距离
        txtStyle = "transform: translateX(-" + disX + "px)";
        if (disX >= delBtnWidth) {
          //控制手指移动距离最大值为删除按钮的宽度
          txtStyle = "transform: translateX(-" + delBtnWidth + "px)";
        }
      }
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = this.data.list;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        list: list
      });
    }
  },
  touchE: function (e) {
    if (e.changedTouches.length == 1) {
      //手指移动结束后水平位置
      var endX = e.changedTouches[0].clientX;
      //触摸开始与结束，手指移动的距离
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var txtStyle = disX > delBtnWidth / 2 ? "transform:translateX(-" + delBtnWidth + "px)" : "transform:translateX(0)";
      //获取手指触摸的是哪一项
      var index = e.currentTarget.dataset.index;
      var list = this.data.list;
      list[index].txtStyle = txtStyle;
      //更新列表的状态
      this.setData({
        list: list
      });
    }
  },
  goadd: function () {
    console.log('添加收货地址')
    wx.removeStorage({
      key: 'address',
      success(res) {
        console.log(res)
      }
    })

    wx.navigateTo({
      url: '/pages/newAddress/newAddress',
    })
  },

  clickEdit(e) { //点击编辑
    console.log(e.currentTarget.dataset.index, '编辑')
    console.log(this.data.listData[e.currentTarget.dataset.index], '点击当前')
    wx.setStorage({
      key: "address",
      data: JSON.stringify(this.data.listData[e.currentTarget.dataset.index])
    })
    wx.navigateTo({
      url: '/pages/newAddress/newAddress?type=modify',
    })
  },
  removeAddress(e) {
    wx.showLoading({
      title: '正在尝试删除地址',
    })
    // console.log(e.currentTarget.dataset.index,'删除')
    // this.data.listData[e.currentTarget.dataset.index].ShippingId
    console.log(this.data.listData[e.currentTarget.dataset.index].ShippingId, '删除的当前shpipiD')
    deletedAddress({
      shippingId: this.data.listData[e.currentTarget.dataset.index].ShippingId
    }).then(res => {
      console.log(res)
      var that = this
      if (res.data.Status == "Success") {
        wx.removeStorageSync('addressDefault')
        wx.showToast({
          title: '删除地址成功',
          icon: 'none',
          mask: true,
          duration: 2000,
          success: function () {
            setTimeout(function () {
              that.getAddressList()
            }, 2000)
          }
        })
      } else {
        // wx.showToast({
        //   title: '删除地址失败',
        //   icon: 'none',
        //   mask: true,
        //   duration: 2000,
        //   success: function () {
        //     setTimeout(function () {
        //       that.getAddressList()
        //     }, 2000)
        //   }
        // })
      }
    })


  },
  setDefaultAddress(e) {
    const {
      currentTarget: {
        dataset: {
          index,
          item
        }
      }
    } = e;
    const {
      listData
    } = this.data;

    app.$api.setDefaultAddress({
      shippingId: this.data.listData[index].ShippingId
    }).then(res => {
      if (res.success) {
        listData.forEach(v => v.IsDefault = false)
        listData[index].IsDefault = true;
        this.setData({
          listData
        })
        // this.getAddressList()
        wx.setStorageSync('addressDefault', item);
        app.alert.success('设置成功');
        // app.tools.goBackTimeOut();
      } else {
        app.alert.message('设置失败')
      }
    })
  },
  //获取地址列表
  getAddressList() {

    app.$api.getAddressList().then(res => {

      if (res.success) {
        const {
          Data: list
        } = res;

        if (list && list != '[]') {
          const defaultAddress = list.find(v => v.IsDefault);

          defaultAddress && wx.setStorageSync('addressDefault', defaultAddress); //默认地址存入本地

          this.setData({
            isEmpty: true,
            listData: list
          })

        } else {
          this.setData({
            isEmpty: false,
          })
        }
      }

    })
  },
  //点击任意地址列表返回确认订单页面
  handleBakc(e) {
    const {
      item
    } = e.currentTarget.dataset;

    if (this.data.fromType === 'tradeGoods') {
      const pages =  getCurrentPages();
      const prevPage = pages[pages.length -2]
      prevPage.setNextPageAddressData(item)
      app.goBack();
    } else {
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2]
      prevPage.setNextPageAddressData(item)
      wx.setStorageSync('addressDefault', item); //默认地址存入本地
      app.goBack();
    }

  },
  // 获取微信地址
  getAddress() {
    const _this = this;
    wx.chooseAddress({
      success(res) {
        _this.getAddressInfo(res);
      },
      fail(err) {
        wx.hideLoading();
        // 点击了拒绝授权
        _this.setData({
          ungetAddress: true  // 记录用户拒绝了授权操作
        })
        console.log(JSON.stringify(err))
      }
    })
  },
  //添加地址
  async getAddressInfo(obj){
    let strAdd = `${obj.provinceName},${obj.cityName},${obj.countyName}`;
    let objAdd = await app.$api.regionIdByArea({ area: strAdd });
    let addObj ={
      address: obj.detailInfo,
      cellphone: obj.telNumber,
      shipTo: obj.userName,
      isDefault: false,
      RegionId: objAdd.data,
      BuildingNumber: '', //门牌号
      LatLng: '' //经纬度
    }
    let res = await app.$api.addShipping(addObj);
    if(res.success){
      this.setData({listData:[]});
      this.getAddressList();
    }
  },

  //重新获取授权
  addressAgain() {
    let that = this;
    wx.openSetting({
      success(res) {
        console.log(res.authSetting)
        wx.setStorageSync('address', res)  // 获取的地址信息存入缓存
        that.getAddress();
        that.setData({
          address: res,
          ungetAddress: false  // 记录用户接受了授权操作          
        })
      }
    })
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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