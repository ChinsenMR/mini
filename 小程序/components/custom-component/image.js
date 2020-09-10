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
    bgColor: {
      type: String,
      value: '#f5f5f5'
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
    loadImage(e){
      console.log(e)
    },
    loadImageError(e){
      console.log(e, '图片加载失败')
      this.setData({
        src: app.data.img.error
      })
    }
  },
  attached() {
    this.setData({
      src: app.tools.setImage(this.data.src)
    })
  }
})