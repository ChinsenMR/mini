/**
 * Author: Chinsen
 * Desc: 图片自适应
 * <custom-image src="x" class-name="image"></custom-image> 
 */

const app = getApp();

Component({
  properties: {
    wrapClass: {
      type: String,
      value: 'default-wrap'
    },
    imageUrl: {
      type: String,
    },
    textClass: {
      type: String,
      value: 'custom-image',
    },
    options: {
      type: Object,
      value: {
        count: 9,
        url: app.data.api.upload,
        type: 'image',
        detail: true
      }
    }
  },
  data: {

  },
  methods: {
    upload() {
      app.tools.upload({
        ...this.data.options
      }).then(res => {
        this.triggerEvent('callback', res)
      })
    }
  },
  attached() {
    this.setData({
      imageUrl: app.tools.setImage(this.data.imageUrl)
    })
  }
})