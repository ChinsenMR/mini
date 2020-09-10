const app = getApp();

Page(app.$page({
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

    this.getAgreement(options.index);
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},
  methods: {

    /* 获取协议 */
    getAgreement(index) {
      app.$api.getAgreeList({
          type: 3
        })
        .then(res => {
          console.log(res)
          if (res.success) {
            const {
              Data: agreeList
            } = res;

            const target = agreeList[Number(index)]
            
            app.setTitle(target.Name)
            app.wxParse.wxParse('article', 'html', target.AContent, this, 0);
          }
        })
    },
  }

}));