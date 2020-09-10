const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    productlist: [],
    reasonList: [],
    imgUrl: app.data.imgurl,
    reasonArr: ['收件与实际不符', '产品质量问题', '商家发错货', '尺码不适合', '其他'],
    curReason: '',
    curSelect: '0',
    voucherImg: [],
    orderId: '',
    price: 0,
    point: 0,
    orderStatus: '',
    orderType: '', //订单类型 主流 、 引流
    amount: 0, //订单总价
    orderInfo: [],
    count: 1, // 件数
    remark: '', // 备注
    logInfo: {
      ShipTo: '',
      ShipAddress: '',
      CellPhone: '',
    }, //收货人物流信息
    initData: {}, // 初始化售后的数据
    refundType: [],
    refundTypeIndex: 0,
    params: {
      orderId: '',
      type: '',
      skuId: '',
    },

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      params: options
    });

    const returnReason = [
      "收件与实际不符",
      "产品质量问题",
      "商家发错货",
      "尺码不适合",
      "其他",
    ]
    const refundReason = [
      '拍错或多拍',
      '我不想要了',
      '发货太慢',
      '其他'
    ]

    this.setData({
      reasonArr: options.type != 0 ? returnReason : refundReason
    })

    this.initAfterSaleInfo();

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  //当前选择的radio
  onRadio(e) {
    this.setData({
      curSelect: e.detail
    });
  },
  /* 初始化售后数据 */
  initAfterSaleInfo() {

    let {
      params: {
        orderId,
        skuId = '',
        type
      },
      refundTypeIndex
    } = this.data;

    app.$api.initAfterSaleInfo({
      orderId,
      type,
      skuId,
    }).then((res) => {

      const {
        Status,
        Message,
        TypeList = []
      } = res;

      if (!res.success) {
        return app.alert.confirm({
          content: Message,
          showCancel: false
        }, () => {
          app.goBack();
        })
      }

      const tempArr = [];

      TypeList.forEach(item => {
        tempArr.push({
          value: item,
          text: item == 1 ? '退到余额' : '原路返回'
        })
      })

      if (tempArr.length === 1) {
        refundTypeIndex = 0;
      }

      this.setData({
        refundType: tempArr,
        initData: res,
        refundTypeIndex
      });
    });
  },
  // 选择退货原因
  onChange(e) {
    this.setData({
      curReason: this.data.reasonArr[e.detail.value],
    });
  },
  onChangeType(e) {
    this.setData({
      refundTypeIndex: e.detail.value,
    });
  },
  // input输入收货人物流信息
  onShipToInput(e) {
    let {
      logInfo
    } = this.data;
    logInfo[e.currentTarget.dataset.name] = e.detail.value;
    this.setData({
      logInfo
    });
  },
  /* 修改数量 */
  changeCount(e) {
    const {
      currentTarget: {
        dataset: {
          type
        }
      }
    } = e;
    let {
      initData: {
        SkuInfo
      },
      count
    } = this.data;

    const maxCount = SkuInfo[0].Quantity;

    if (type) {
      if (count !== maxCount) {
        count++
        this.setData({
          count
        })
      }
    } else {
      if (count > 1) {
        count--
        this.setData({
          count
        })
      }
    }
  },
  // input输入收货人物流信息
  inputText(e) {
    const {
      currentTarget: {
        dataset: {
          name
        }
      },
      detail: {
        value
      }
    } = e;

    const {
      initData: {
        SkuInfo
      }
    } = this.data;

    const maxCount = SkuInfo[0].Quantity;

    if (name == 'count') {
      this.data[name] = value > maxCount ? maxCount : value;

    } else {
      this.data[name] = value;
    }


    this.setData({
      count: this.data.count,
      remark: this.data.remark
    });

  },
  goSetPassword() {
    app.alert.confirm({
      content: '请设置交易密码'
    }).then(confirm => {
      if (confirm) {
        wx.navigateTo({
          url: '/packageA/pages/addPassword/addPassword?fromType=applyAfterSale',
        })

      }
    })
  },
  // 提交
  onSubmit(e) {
    let {
      curReason,
      count,
      remark,
      voucherImg,
      orderStatus,
      curSelect,
      initData,
      refundType,
      refundTypeIndex,
      params: {
        orderId,
        skuId,
        type
      }
    } = this.data;

    if (curReason == '') return app.alert.message(`请选择${ type === 0 ? '退款': '退货'}原因`)
    
    const currentType = refundType[refundTypeIndex].value;

    /* 退款 */
    if (type == 0) {
   

      app.$api.applyRefund({
        orderId, //	是	string	订单Id
        remark, //	否	string	备注文本
        refundType: currentType, //	是	int	退款方式
        RefundReason: curReason || '', //	是	string	退款原因
      }).then((res) => {
        // console.log("输出申请退款状态",res);
        const {
          Status,
          Message
        } = res;

        if (Status == 'Success') {
          app.alert.confirm({
            content: Message
          }, conf => {
            if (conf) {
              // app.goPage({
              //   url: '/pages/myOrder/myOrder',
              //   type: 'redirect',
              //   options: {
              //     status: 5
              //   }
              // })
              app.goBack();
            } else {
              app.goBack();
            }

          })

        } else {
          if (Message === "请先设置交易密码") {
            return this.goSetPassword();

          }
        }
      });
    }
    /* 退货退款 */
    else {

      app.$api.applyReturn({
        orderId,
        skuId,
        returnType: currentType, //	是	int	退款方式
        Quantity: count,
        Remark: remark || '', //	否	string	备注文本
        RefundReason: curReason,
        afterSaleType: curSelect == 0 ? 3 : 1,
        UserCredentials: voucherImg.join(','),
        ShipTo: initData.ShipTo,
        ShipAddress: initData.ShipAddress,
        CellPhone: initData.CellPhone,
      }).then((res) => {
        const {
          Message
        } = res;

        if (res.success) {
          app.alert.confirm({
            content: Message
          }, conf => {
            if (conf) {
              // app.goPage({
              //   url: '/pages/myOrder/myOrder',
              //   type: 'redirect',
              //   options: {
              //     status: 5
              //   }
              // })
              app.goBack();
            } else {
              app.goBack();
            }
          })
        } else if (Message === '请先设置交易密码') {
          return this.goSetPassword();
        } else {
          app.tools.goBackTimeOut();
        }

      });
    }
  },
  seeImage(e) {
    const {
      currentTarget: {
        dataset: {
          currentUrl
        }
      }
    } = e;

    app.previewImage(currentUrl, this.data.voucherImg)
  },

  // 上传图片
  uploadFile() {
    let {
      voucherImg
    } = this.data;
  
    app.tools.upload({
      url: '/AppShop/AppShopHandler.ashx?action=AppUploadImage',
      count: 3
    }).then(res => {

      voucherImg = [...voucherImg, ...res];

      this.setData({
        voucherImg
      });
    })
  },

  // 删除图片
  onClear(e) {
    let {
      voucherImg
    } = this.data;
    let {
      index
    } = e.currentTarget.dataset;
    voucherImg.splice(index, 1);
    this.setData({
      voucherImg
    });
  },


  // 查询订单在代理系统中的状态（主要是备货订单）
  getOrderStatus() {
    let {
      orderType,
      orderStatus,
      orderId
    } = this.data;
    getKjOrderStatus({
      OrderId: orderId,
    }).then((res) => {
      if (res.data.Status == 'Success') {
        let s = res.data.Data.Data.Status;
        if (orderType == 0) {
          //主流订单
          this.setData({
            curSelect: s == 0 ? '0' : '1',
            orderStatus: s == 0 ? 0 : 3,
          });
        } else {
          //引流订单
          this.setData({
            curSelect: s == 2 && (orderStatus == 2 || orderStatus == 100) ? '0' : '1',
            orderStatus: s == 2 && (orderStatus == 2 || orderStatus == 100) ? 0 : 3,
          });
        }
      }
    });
  },

});