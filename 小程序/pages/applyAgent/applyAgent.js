const app = getApp();
import { signAgreement, getAgreement } from '../../utils/requestApi';
var WxParse = require('../../wxParse/wxParse');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    realName: "", // 姓名
    wxNum: "", // 微信号
    telphone: "", // 电话
    IdCard: "", // 身份证号码
    adress: "", // 收货地址
    headData: "", //头像
    isShowAgency: false, //根据不同等级切换不同输入框
    listFlag: [],
    list: [], //代理升级的条件
    imgUrl: app.data.imgurl,
    agentValue: null, //已选择代理等级
    agentArr: [], //代理等级
    BrandLevle: "", //代理级别
    intiData: {},//初始化对象数据
    LicenseImg: "", //打款凭证
    CertImg: "",//保证金截图
    iconUrl: "https://img.hmeshop.cn/hmeshopV3/Storage/master/202005141509443964190.png",

    isShow: false,
    status: '',//是否同意协议
    isNeedReadAgree: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let KjId = wx.getStorageSync('userInfo').KjCustomId;
    if (KjId==0){
      this.agreementData();
    }else{
      wx.showToast({
        title: '您已是代理!',
        icon: 'none',
        duration: 1500,
        mask: true,
        success: (result) => {
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            });
          }, 1500);
        },
        fail: () => {},
        complete: () => {}
      });
    }

    this.InitData()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    
  },
  //获取协议弹窗
  agreementData() {
    getAgreement({
      TypeId: 1,//	是	int	协议类型，1为推广员协议，2为提现协议
    }).then(res => {
      console.log("输出提现协议", res);
      if (res.data.Status == "Success") {
        let fwb = res.data.AContent;
        let sign = res.data.IsSign;
        if (sign == false) {
          this.setData({
            isNeedReadAgree: true
          })
        }
        const regex = new RegExp('<p', 'gi');//修改富文本样式1
        fwb = fwb.replace(regex, `<p style="color: #fff;font-size:28rpx"`);//修改富文本样式2
        WxParse.wxParse('article', 'html', fwb, this, 0);
      }

    })
  },

  InitData() {
    app.fg({
      url: '/API/KjAgentHandler.ashx?action=GetKjAgentField'
    }).then(res => {
      console.log("====", res)
      if (res.data.Status == "Success") {
        let obj = res.data.Result;
        let list = res.data.Result.lstField.filter(item => item.Value !== "");
        var nameList = [
          "Name",
          "WeChat",
          "Phone",
          "IdCardNo",
          "CustomField5",
          "CustomField6",
          "CustomField7",
          "CustomField8",
          "HeadData"
        ];
        for (var i = 0; i < nameList.length; i++) {
          var flag = nameList.indexOf(nameList[i]) > -1 ? true : false;
          this.data.listFlag.push({
            name: nameList[i],
            isShow: flag
          })
          this.setData({
            listFlag: this.data.listFlag
          })
        }
        let arr = res.data.Result.lstLevel;
        arr = arr.filter(item => item.RecruitLevel!=1);//过滤最高等级
        this.setData({
          intiData: obj,//初始化对象数据
          agentArr: arr,
          list: list,
          pageLoading: false
        })
      }else{
        wx.showToast({
          title: res.data.Message,
          icon: 'none',
          duration: 2000,
          mask: true,
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      }
    })
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
      }
    })

  },

   //点击同意弹窗
   handleAgree() {
    // app.$api.signAgreement({
    //   TypeId: 1, //	是	int	协议类型id，1为推广员协议，2为提现协议
    // }).then((res) => {
    //   this.setData({
    //     isNeedReadAgree: false,
    //   });
    // });
    this.setData({
      isNeedReadAgree: false,
    });
  },
  // //点击同意弹窗
  // handleAgree() {
  //   let sta = this.data.status;
  //   if (sta == 1) {
  //     //签订协议
  //     signAgreement({
  //       TypeId: 1, //	是	int	协议类型id，1为推广员协议，2为提现协议
  //     }).then(res => {
  //       console.log('签署协议状态', res);
  //       if (res.data.Status == "Success") {
  //         wx.showToast({
  //           title: res.data.Message,
  //           icon: 'none',
  //           duration: 1500,
  //           mask: true,
  //           success: (result) => {
  //             setTimeout(() => {
  //               this.setData({
  //                 isNeedReadAgree: false
  //               })
  //             }, 1500);
  //           },
  //           fail: () => { },
  //           complete: () => { }
  //         });

  //       } else {
  //         wx.showToast({
  //           title: res.data.Message,
  //           icon: 'none',
  //           duration: 1500,
  //           mask: true,
  //         });
  //       }
  //     })
  //   } else {
  //     wx.showToast({
  //       title: '请点击同意',
  //       icon: 'none',
  //       duration: 1500,
  //       mask: true,
  //     });

  //   }
  // },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  selectAgent: function(e) {
    console.log("6666", e)
    let IsShopping = this.data.agentArr[e.detail.value].IsShopping
    if (IsShopping == 0) {
      this.setData({
        isShowAgency: true
      })
    } else {
      this.setData({
        isShowAgency: false
      })
    }
    this.setData({
      agentValue: this.data.agentArr[e.detail.value].BrandLevelName,
      BrandLevle: this.data.agentArr[e.detail.value].RecruitLevel
    })
  },

  //升级申请
  submitForm: function(e) {
    const { LicenseImg,CertImg} = this.data;
    let {
      AgentGrade,
      IdCard,
      adress,
      realName,
      telphone,
      wxNum
    } = e.detail.value
    if (realName == '') return wx.showToast({
      title: '请填写您的真实姓名',
      icon: 'none'
    })
    if (this.data.listFlag[2].isShow) {
      if (!/^1[3456789]\d{9}$/.test(telphone)) {
        wx.showModal({
          title: '请填写正确手机号',
        })
        return;
      }
    }
    if (AgentGrade == '') return wx.showToast({
      title: '请您选择升级等级',
      icon: 'none'
    })
    if (this.data.listFlag[3].isShow && this.data.isShowAgency) {
      var rgxIdCard = /(^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$)|(^[1-9]\d{5}\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{2}$)/;
      if (!rgxIdCard.test(IdCard)) {
        wx.showModal({
          title: '请填写正确身份证',
        })
        return;
      }
    }
    var arr = {
      Name: realName.replace(/\s+/g, ''),
      WeChat: wxNum.replace(/\s+/g, ''),
      Phone: telphone.replace(/\s+/g, ''),
      IdCardNo: IdCard.replace(/\s+/g, ''),
      BrandLevle: this.data.BrandLevle,
      HeadData: this.data.headData,
      CustomField5: adress,
      CustomImageData2: LicenseImg,
      CustomImageData3:CertImg,
    }
    console.log(JSON.stringify(arr));

    app.fg({
      url: '/API/KjAgentHandler.ashx?action=ApplyKjAgent',
      data: {
        JsonObj: JSON.stringify(arr)
      }
    }).then(res => {
      wx.showModal({
        title: res.data.Message,
        success(res) {
          if (res.confirm) {
            wx.navigateBack({
              delta: 1
            })
          } else if (res.cancel) {
            wx.navigateBack({
              delta: 1
            })
          }

        }
      })
    })


  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

 
})