const app = getApp();
import {
  login
} from '../utils/requestApi.js';
module.exports = {

  debounce(fn, interval = 1000) { //防抖
    let timer;
    return function () {
      clearTimeout(timer);
      const context = this;
      const args = arguments[0]; //保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
      timer = setTimeout(function () {
        fn.call(context, args);
      }, interval);
    };
  },
  /**
   *  [ 倒计时函数 调用须知 ]: 
   *  @param {[array]} date [设定超时时间]  
   *  列如：  '2019-5-30 14:30:00' 
   * **/
  countdown(date) {
    let dateArr = '';
    date = date.toString()
    if (date.indexOf('T') != -1) dateArr = date.split('T');
    else dateArr = date.split(' ');
    let dateArr2 = dateArr[0].split('-').map((item) => {
      return parseInt(item)
    });
    dateArr2[1] -= 1;
    let dateArr3 = dateArr[1].split(':').map((item) => {
      return parseInt(item)
    });

    let now = new Date(); // 当前系统时间
    let to = new Date(...dateArr2, ...dateArr3); // 用户设定的时间
    let deltaTime = to - now; // 时间差 (单位/毫秒ms)
    let limitHours, limitMin, limitSecond;

    //超时
    if (deltaTime <= 0) {
      return {
        limitDay: '00',
        limitHours: '00',
        limitMin: '00',
        limitSecond: '00',
        overTime: true // 倒计时已过
      }
    }
    let days = Math.floor(deltaTime / (24 * 3600 * 1000));
    //计算天数后剩余的毫秒数
    let leave1 = deltaTime % (24 * 3600 * 1000);
    //计算出小时数
    let hours = Math.floor(leave1 / (3600 * 1000));

    //计算小时数后剩余的毫秒数
    let leave2 = leave1 % (3600 * 1000);
    //计算相差分钟数
    let minutes = Math.floor(leave2 / (60 * 1000));

    //计算分钟数后剩余的毫秒数
    let leave3 = leave2 % (60 * 1000);
    //计算相差秒数
    let seconds = Math.round(leave3 / 1000);

    return {
      limitDay: days< 10 ? '0'+days : days,
      limitHours: hours < 10 ? '0' + hours : hours,
      limitMin: minutes < 10 ? '0' + minutes : minutes,
      limitSecond: seconds < 10 ? '0' + seconds : seconds,
      overTime: false
    }
  },
  /* 关键字搜索功能 */
  goodsSearch(opt) {
    let searchResult = [];
    opt.data.forEach((item, index) => {
      if (item[opt.keyName].indexOf(opt.searchKey) != -1) searchResult.push(item);
      console.log("[[[[[", item[opt.keyName])
    })
    if (opt.searchKey != '') return searchResult;
  },

  /* 跳转登录页面 */
  toLoginPage: function () {
    wx.reLaunch({
      url: 'pages/authorizationLogin/authorizationLogin',
    })
  },

  /* 订单支付 */
  payment(orderId, callback) {
    const app = getApp();

    app.$api.getPaymentParams({
      orderId
    }).then(res => {

      if (!res.success) {
        return
      }
      if (res.Status =='AdvancePay'){//代表余额完全抵扣不需要吊起支付
        app.alert.toast('余额支付成功！')
        setTimeout(() => {
          wx.reLaunch({
            url: '/pages/myOrder/myOrder'
          })
        }, 1500);
        return
      }

      const {
        Data
      } = res;

      const {
        prepayId,
        nonceStr,
        timeStamp,
        payType = 'weChat',
        signType = 'MD5',
      } = Data;

      const paySign = payType === 'HuiJuPay' ? Data.paySign : Data.sign;

      const paymentData = {
        timeStamp,
        nonceStr,
        paySign,
        signType,
        package: 'prepay_id=' + prepayId,
      }

      wx.requestPayment({
        ...paymentData,
        success(res) {
          callback(res)
        },
        fail(res) {
          console.log(res)
          const isCancel = res.errMsg === 'requestPayment:fail cancel';

          return app.alert.confirm({
            content: isCancel ? '您取消了支付' : '支付失败：' + res.errMsg,
            showCancel: false
          }, () => {
            wx.reLaunch({
              url: '/pages/myOrder/myOrder'
            })
            // app.tools.goBackTimeOut(1, 0);
          })

        }
      })
    })
  },

  //绑定分享的方法
  bindingShare() {
    login({
      openId: app.data.openid, //		openId
      openType: 'hmeshop.plugins.openid.wxapplet', //小程序（hmeshop.plugins.openid.wxapplet）
      referralUserId: app.data.referralUserId //否	int	推荐人ID(注册时)
    }).then(res => {
      if (res.data.Status == 'Success') app.data.referralUserId = null
    })
  },

  /**
   *  检查是否还有更多
   * @param {number} curPage 当前页码
   * @param {number} curSize 当前页数
   * @param {number} dataLen 当前数据长度
   * @param {number} dataTotal 当前数据总长度
   */
  checkMore(curPage, curSize, dataLen, dataTotal) {
    let hasMore = true;

    if (!dataLen || dataLen + (curPage - 1) * curSize >= +dataTotal) {
      hasMore = false;
    }
    return hasMore;
  },
  /**
   *
   * @param {number} min 分钟格式化成小时 例如：60 -> 01:00
   */
  formatMinute(min) {
    const minute = min % 60;
    const hour = parseInt(min / 60);

    return String(hour).padStart(2, '0') + ':' + String(minute).padStart(2, '0');
  },


  /* 绑定上下级 */
  bindReferralUserId(options = {}, calllback) {

    const app = getApp();
    console.log(app.data.system, 'system')
    let referralUserId = app.globalData.agentId;

    /* 针对运行环境进行提示 */
    if (app.data.system.env == 'trial') {
      app.alert.toast('referralUserId:' + referralUserId)
    }
    /* 如果有携带代理ID referralUserId */
    const cookie = app.cache.loadCookie();
    
    /* 判断是否已经登录 */
    if (referralUserId && cookie) {
      app.$api.bindReferralUserId({
          referralUserId
        })
        .then(res => {
          app.globalData.referralUserId = null;

          /* 针对运行环境进行提示 */
          if (app.data.system.env == 'trial') {
            app.alert.toast(`仅测试环境弹出 >>> 请求绑定用户接口成功，上级id为【${referralUserId}】`)
          } else {
            console.warn(`请求绑定用户接口成功，上级id为【${referralUserId}】`)
          }

          if (calllback && typeof calllback === 'function') {
            return calllback(res)
          } else {
            if (![0, -99, -1].includes(res.Code)) {
              app.alert.toast(res.Msg)
            }
          }
        })
    }
  },
  /* 商品分享拼接 */
  createProductSharePath(includes, type) {
    const app = getApp();
    const {
      url,
      options
    } = includes;
    const userId = app.cache.loadUserInfo().UserId || '';

    let params;

    if (type === 'code') {
      params = `?opt=${[userId, ...options].join(',')}`
    } else {
      params = app.concatOptions({
        // agentId: app.cache.loadUserId(),
        opt: [userId, ...options].join(',')
      })
    }

    return url + params;
  },
  /* 获取分享的二维码 */
  getProductShareParams(opt) {

    let paramsData = decodeURIComponent(opt).split('opt=')[1] || opt;
    if (paramsData) {
      paramsData = paramsData.split(',');
      return {
        agentId: paramsData[0], // 代理id
        productId: paramsData[1], // 商品id
        groupId: paramsData[2], // 团id
        upAgentId: paramsData[3], // 分享团
      }
    }
  },
  //删除空白数组
  deleteBlankData(arr){
    var feedBackImg = arr.filter(function (s) {
      return s && s.trim(); // 注：IE9(不包含IE9)以下的版本没有trim()方法
    });
    return feedBackImg
  }
  
}