// component/YDelete/YDelete.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    id: {
      type: String,
      value: 0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    delete: false,
    startX: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    bindStart (e) {
      this.data.startX = e.changedTouches[0].clientX
    },
    bindEnd (e) {
      const end = e.changedTouches[0].clientX
      if (end - this.data.startX < -80) {
        this.setData({
          delete: true
        })
      }
      if (end - this.data.startX > 80) {
        this.setData({
          delete: false
        })
      }
    },
    delete () {
      this.triggerEvent('delete', this.properties.id)
    }
  }
})
