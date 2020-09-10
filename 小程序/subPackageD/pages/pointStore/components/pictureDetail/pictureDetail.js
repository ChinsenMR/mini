var WxParse = require('../../../wxParse/wxParse.js');

const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    description: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    iconList:[
      { icon: 'icon_zhengpinbaozhang_w@2x.png', txt:'假一赔三' },
      { icon: 'icon_zhengpinbaozhang_w@2x.png', txt: '买贵必赔' },
      { icon: 'icon_zhengpinbaozhang_w@2x.png', txt: '假一赔三' },
      { icon: 'icon_shouhouwuyou_w@2x.png', txt: '售后无忧' },
    ]
  },

  ready: function () {
    const html = decodeURI(this.data.description);
    console.log(html, '222222222222222222')
     WxParse.wxParse('article', 'html', html, this, 5);
  
  },


  /**
   * 组件的方法列表
   */
  methods: {

  }
})
