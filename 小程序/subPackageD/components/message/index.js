const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
    noticeList: {
      type: Array,
      value: [{
          title: '个人账户',
          text: '即个人与银行办理的银行卡,是指个人名义在银行开立的账户'
        },
        {
          title: '对公账户',
          text: '指银行为企事业单位、机关团体、民间组织、部队、个体经营业户等单位开立的银行账户'
        }
      ]
    }
  },

  data: {
    closeIcon: 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202007311145003557090.png'
  },

  ready() {

  },
  /**
   * 组件的方法列表
   */
  methods: {
    catch () {
      return false
    },
    close() {
      this.triggerEvent('close')
    }
  }
})