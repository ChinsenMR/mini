const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    LicenseImg: "",
    CertImg: "",
    WxImage: "",
    RequetStatus: -1,
    isShow: false,
    arrowRightIcon: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202008081626557070150.png',
    statusIconUrls: [
      "https://img.hmeshop.cn/hmeshopV3/Storage/master/202008061501316618380.png", // 0 代表审核中
      "https://img.hmeshop.cn/hmeshopV3/Storage/master/202008061501319274682.png", // 1 审核通过
      "https://img.hmeshop.cn/hmeshopV3/Storage/master/202008061501318024671.png", // 2 审核被拒
    ],
    iconUrl: "https://img.hmeshop.cn/hmeshopV3/Storage/master/202005141509443964190.png",
    fleidList: [{
        type: "微信号",
        desc: "请输入微信号",
        value: null,
        fleid: "WeChat",
        length: 32,
        inputType: 'text',
        
      },
      {
        type: "联系电话",
        desc: "手机或固话",
        value: null,
        fleid: "Phone",
        length: 11,
        inputType: 'number',
      },
      {
        type: "身份证号",
        desc: "请输入身份证号",
        value: null,
        fleid: "IdCardNo",
        length: 18,
        inputType: 'idcard',
      },
      // {
      //   type: "单位名称",
      //   desc: "请输入单位名称(选填)",
      //   value: null,
      //   fleid: "UnitName",
      //   length: 20,
      //   inputType: 'text',
      // },
      {
        type: "真实姓名",
        desc: "请输入真实姓名",
        value: null,
        fleid: "Name",
        length: 20,
        inputType: 'text',
      },
      {
        type: "经营地区",
        desc: "地区信息",
        value: null,
        fleid: "Region",
        inputType: 'text',
      },
      {
        type: "详细地址",
        desc: "街道门牌信息",
        value: null,
        fleid: "TakeDeliverySpecificAddress",
        length: 50,
        inputType: 'text',
      },
    ],
    sexArr: ["男", "女"],
    avatar: null,
    refuseReason: '',
    isNeedReadAgree: false,
  },
  setAllData() {
    app.tools.setAllData(this, this.data);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad (options) {
    // console.log(this.data, "ready");
    this.initData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow () {},
  //获取协议弹窗
  agreementData() {
    app.$api.getAgreement({
      typeId: 1, //	是	int	协议类型，1为推广员协议，2为提现协议
    }).then((res) => {
      const {
        AContent,
        IsSign,
        success
      } = res;

      if (success) {
        if (!IsSign) {
          this.setData({
            isNeedReadAgree: true,
          });
        }

        app.wxParse.wxParse("article", "html", AContent, this, 0);
      }
    });
  },
  //点击同意协议
  handleReadAgree(e) {

    this.setData({
      isNeedReadAgree: !this.data.isNeedReadAgree,
    });
  },
  //点击同意弹窗
  handleAgree() {
    app.$api.signAgreement({
      TypeId: 1, //	是	int	协议类型id，1为推广员协议，2为提现协议
    }).then((res) => {
      this.setData({
        isNeedReadAgree: false,
      });
    });
  },
  // 初始化页面数据
  initData() {
    let {
      fleidList,
      LicenseImg,
      CertImg,
      WxImage,
      RequetStatus,
      refuseReason
    } = this.data;

    this.agreementData();

    const userInfo = app.cache.loadUserInfo()

    app.$api.getAgentInfoByDistributorSystem({
      ReferralUserId: userInfo.UserId
    }).then(
      (res) => {


        if (res.success) {
          const {
            Data
          } = res;

          fleidList.forEach((item) => {
            Object.getOwnPropertyNames(Data).forEach((item2) => {
              if (item.fleid == item2) {
                item.value = Data[item2];
              }
              if (item.fleid == "Region") {
                item.value = Data.Region;
              }
            });
          });

          LicenseImg = Data.LicenseImg;

          CertImg = Data.CertImg;
          WxImage = Data.WxImage;
          RequetStatus = Data.RequetStatus;
          refuseReason = Data.RefuseReason;

          this.setData({
            fleidList,
            LicenseImg,
            CertImg,
            WxImage,
            RequetStatus,
            refuseReason
          });
        }

      }
    );
  },

  // 选择picker
  onPicker(e) {
    const {
      fleidList,
      sexArr
    } = this.data;


    const {
      currentTarget: {
        dataset: {
          type
        },
      },
      detail: {
        value
      }
    } = e;

    if (type === "性别") {
      fleidList.forEach((item) => {
        if (item.type === type) item.value = sexArr[value];
      });
    } else {
      fleidList.forEach((item) => {
        if (item.type === type) item.value = value.join(',');
      });
    }
    this.setData({
      fleidList
    });
  },

  /* 上传文件  */
  upload(e) {

    app.tools.upload({
      url: app.data.api.upload
    }).then(res => {

      const {
        currentTarget: {
          dataset: {
            type
          }
        }
      } = e;

      const url = res[0];

      switch (type) {
        case 1:
          this.setData({
            LicenseImg: url
          });
          break;
        case 2:
          this.setData({
            CertImg: url
          });
          break;
        case 3:
          this.setData({
            WxImage: url
          });
          break;
      }
    })

  },
  submit(e) {
    const {
      fleidList,
      LicenseImg,
      CertImg,
      WxImage
    } = this.data;

    const params = {};

    fleidList.forEach(v => {
      if (!params[v.fleid]) {
        params[v.fleid] = v.value;
      }
    })

    const {
      Phone: CellPhone,
      WeChat: wxNumber,
      Name,
      IdCardNo,
      Region,
      TakeDeliverySpecificAddress,
      UnitName
    } = params;

    const ajaxData = {
      CellPhone,
      IdCardNo,
      RealName:Name,
      Region,
      TakeDeliverySpecificAddress,
      UnitName,
      LicenseImg,
      CertImg,
      WxImage,
      wxNumber
    }

    const {
      verify: {
        mobile,
        idCard,
        name
      }
    } = app;

    /**
     * 以下校验格式的字段，如果有就校验，没有就为非必传 
     */
    if (ajaxData.CellPhone && !mobile(ajaxData.CellPhone).verify) {
      return app.alert.message('请输入正确的手机号')
    }
    // if (!ajaxData.wxNumber) {
    //   return app.alert.message('请填写微信号')
    // }
    if (ajaxData.IdCardNo && !idCard(ajaxData.IdCardNo).verify) {
      return app.alert.message('请输入正确的身份证号')
    }
    if (ajaxData.Name=='') {
      return app.alert.message('请输入真实姓名姓名')
    }
    // if (ajaxData.Name && !name(ajaxData.Name).verify) {
    //   return app.alert.message('请输入真实姓名姓名')
    // }
    // if (!ajaxData.Region) {
    //   return app.alert.message('请选择地区')
    // }
    // if (!ajaxData.TakeDeliverySpecificAddress || ajaxData.TakeDeliverySpecificAddress.length < 5) {
    //   return app.alert.message('请输入具体地址，不小于5位')
    // }
    // if (!ajaxData.LicenseImg) {
    //   return app.alert.message('请上传营业执照')
    // }
    // if (!ajaxData.WxImage) {
    //   return app.alert.message('请上传微信二维码')
    // }

    app.$api.updateAgentInfo(ajaxData).then((res) => {

      if (res.success) {
        app.alert.message('申请成功');
        app.tools.goBackTimeOut();
      }

    });
  },

  //获取输入框的值
  handleInput(e) {
    const {
      detail: {
        value
      },
      currentTarget: {
        dataset: {
          name
        }
      }
    } = e;
    const current = this.data.fleidList.findIndex(v => v.fleid === name);

    this.data.fleidList[current].value = value;

    this.setData({
      fleidList: this.data.fleidList
    });
  },

});