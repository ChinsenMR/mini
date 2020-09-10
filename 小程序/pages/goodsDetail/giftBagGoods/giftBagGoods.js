const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    list: {
      type: Array,
      value: [],
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  ready: function () {

  },
  /**
   * 组件的方法列表
   */
  methods: {

    seeDetail(e) {
      const {
        currentTarget: {
          dataset: {
            productId
          }
        }
      } = e;
      
      app.goPage({
        url: '/pages/goodsDetail/goodsDetail',
        options: {
          p: productId
        }
      })
      console.log(e)
    }
  }
})