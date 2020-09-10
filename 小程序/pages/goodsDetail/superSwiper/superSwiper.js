const app = getApp();

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    videoSrc: {
      type: String,
      value: null
    },
    bannerList: {
      type: Array,
      value: []
    },
    top: {
      type: String,
      value: '0'
    }
  },
  observers: {
    'videoSrc': function (params)  {
      console.log(this)
      this.setData({
        selectType: params ? 1: 2
      })
    },
    'bannerList': (params) => {
      
    }
  },

  /**
   * 组件的初始数据
   */

  data: {
    selectType: 1,
    options: {
      muted: false,
      play: false,
      fullScreen: false,
      controls: true,
      src: 'http://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400'
    }
  },
  videoContext: null,
  lifetimes: {
    attached() {
      this.videoContext = wx.createVideoContext('myVideo', this);
    },
    detached() {
      this.videoContext = null;
    },
   
  },

  ready() {
  
  },

 
  methods: {
    changeFullScreen(e) {
    
      const isFullScreen = e.detail.fullScreen;
      console.log(isFullScreen)
      this.setData({
        'options.fullScreen': isFullScreen
      })

      isFullScreen ?  this.videoContext.requestFullScreen() : this.videoContext.exitFullScreen()
    },

    changeVideoStatus(e) {
      let {
        options: {
          play
        }
      } = this.data;

      if (!play) {
        this.videoContext.play()
      } else {
        this.videoContext.pause();
      }
      console.log(this.videoContext)

      this.setData({
        'options.play': !play,
      })

    },
    changeShowType(e) {
      const {
        currentTarget: {
          dataset: {
            type
          }
        }
      } = e;

      if (type == 1) {
        this.videoContext.play()
      } else {
        this.videoContext.pause();
      }

      this.setData({
        selectType: type
      })

    },
  }



})

