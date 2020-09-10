const app = getApp();
const mock = {
  name: '陈俊生',
  phone: '13143667746',
  idCard: '440582199607117219',
  idCardFront: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202005151346548567740.png',
  idCardBack: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202005151346548567740.png',
  acountType: '0',
  bankCardKey: 0,
  bankCardId: '4611145166448516464'
}
Page(app.$page({
  data: {
    statusIconUrls: [
      "https://img.hmeshop.cn/hmeshopV3/Storage/master/202005151346548567740.png",
      "https://img.hmeshop.cn/hmeshopV3/Storage/master/202005151346552005272.png",
      "https://img.hmeshop.cn/hmeshopV3/Storage/master/202005151346550755241.png",
    ],
    status: null,
    remark: null,
    iconUrl: "https://img.hmeshop.cn/hmeshopV3/Storage/master/202005141509443964190.png", // 上传图片
    tipIcon: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202007311036375832860.png', // 提示
    imgurl: app.data.imgurl,
    form: {
      name: null,
      phone: null,
      idCard: null,
      idCardFront: null,
      idCardBack: null,
      acountType: '0',
      bankCardKey: null,
      bankCardId: null
    },
    acountTypeList: [{
      checked: 'true',
      name: '0',
      type: '个人账户',
    }, {
      checked: 'false',
      name: '1',
      type: '对公账户',
    }, ],
    bankList: [{
      text: '中国银行',
      value: 'ccc'
    }],
    showDialog: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // this.initDraw();
    this.getData();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},
  methods: {
    /* 展示提示弹窗 */
    showTipDialog() {
      this.setData({
        showDialog: !this.data.showDialog
      })
    },
    /* 切换单选框 */
    onChangeRadio(e) {
      const {
        detail: value
      } = e;

      this.setData({
        'form.acountType': value
      })
    },
    /* 选择 */
    onChange(e) {
      const {
        value
      } = e.detail;

      this.setData({
        'form.bankCardKey': Number(value)
      })
    },
    inputForm(e) {
      const {
        currentTarget: {
          dataset: {
            name,
          }
        },
        detail: {
          value
        }
      } = e;

      this.setData({
        ['form.' + name]: value
      })
    },
    /* 用户判断有没有交易密码 */
    initDraw() {
      app.$api.initDraw().then(res => {
        if (res.success && !res.IsOpenBalance) {
          return app.alert.confirm({
            content: '请先设置交易密码'
          }, conf => {
            conf ? app.goPage({
              url: '/packageA/pages/setPassword/setPassword',
              options: {
                fromType: 'realName'
              }
            }) : app.goBack();

          })
        } else {
          this.getData();
        }
      })
    },
    /* 获取申请信息 */
    getData() {
      app.$api.getStatusMemberBalanceApplyAuitList().then(res => {
        if (!res.success) return

        const {
          Data: {
            Idcard: idCard,
            Phone: phone,
            RealName: name,
            UserIdcardFront: idCardFront,
            UserIdcardReverse: idCardBack,
            status,
            Remark: remark
          }
        } = res;

        this.setData({
          status,
          remark,
          form: {
            ...this.data.form,
            idCard,
            phone,
            name,
            idCardFront,
            idCardBack
          }
        })
        // const {
        //   form:  {
        //     name,
        //     phone,
        //     idCard,
        //     idCardFront,
        //     idCardBack,
        //     bankCardKey,
        //     bankCardId
        //   },
        // }
        console.log(res)
      })
    },
    /* 文件 */
    upload(e) {
      const {
        currentTarget: {
          dataset: {
            type
          }
        }
      } = e;

      app.tools.upload({
        type: 'image',
        url: app.data.api.upload,
        count: 1,
      }).then(res => {
        type ? this.setData({
          ['form.idCardFront']: res[0]
        }) : this.setData({
          ['form.idCardBack']: res[0]
        })
      })
    },


    submitForm() {
      const {
        form: {
          name,
          phone,
          idCard,
          idCardFront,
          idCardBack,
          acountType,
          bankCardKey,
          bankCardId,
        }
      } = this.data;

      if (!app.verify.name(name).verify) {
        return app.alert.message('请输入正确的真实姓名')
      }
      if (!app.verify.mobile(phone).verify) {
        return app.alert.message('请输入正确的手机号')
      }
      if (!app.verify.idCard(idCard).verify) {
        return app.alert.message('请输入正确的身份证号')
      }

      if (!idCardFront) {
        return app.alert.message('请上传身份证正面照')
      }
      if (!idCardBack) {
        return app.alert.message('请上传身份证反面照')
      }

      const ajaxData = {
        UserIdcardFront: idCardFront,
        UserIdcardReverse: idCardBack,
        RealName: name,
        Idcard: idCard,
        Phone: phone,
        Remark: ''
      }


      console.log(ajaxData, )
      app.$api.submitMemberInfo(ajaxData).then(res => {
        if (res.success) {
          app.alert.success('提交成功')
          app.tools.goBackTimeOut(1, 2000)
        }
      })

    },
  },

}));