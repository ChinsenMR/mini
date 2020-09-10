/**
 * Author: Chinsen
 * Desc: 图片自适应
 * <custom-image src="x" class-name="image"></custom-image> 
 */

const app = getApp();

Component({
  properties: {
    src: {
      type: String,
    },
    mode: {
      type: String,
      value: 'aspectFit',
    },
    className: {
      type: String,
      value: 'custom-image',
    }
  },
  data: {

  },
  methods: {

  },
  attached() {
    this.setData({
      src: app.tools.setImage(this.data.src)
    })
  }
})