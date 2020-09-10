/**
 * Author: Chinsen
 * Desc: 工具库 
 * 使用方式：
 * app.alert.loading('哈哈哈')
 */
export default {
  /* 弹出加载中框 */
  loading(title = '加载中...', mask = true) {
    wx.showLoading({
      title,
      mask,
    });
  },


  /* 关闭加载框 */
  closeLoading() {
    wx.hideLoading();
  },
  /**
   * 导航栏loading
   */
  navLoading() {
    wx.showNavigationBarLoading();
  },
  /**
   * 关闭导航栏loading
   */
  closeNavLoading() {
    return wx.hideNavigationBarLoading().then(res => res)
  },
  /* 消息提示 */
  message(content, title = '提示') {
    wx.showModal({
      title,
      content,
      color: '#E7483F',
      showCancel: false,
    });
  },

  /* 弹出确认框 */
  confirm(args, callback) {
    const {
      title = '提示',
        content = '确认本次操作',
        confirmColor = '#E7483F',
        cancelColor = '#666666',
        showCancel = true,
        cancelText = '取消', confirmText = '确定'
    } = args;

    wx.showModal({
      title,
      content,
      showCancel,
      confirmColor,
      cancelColor,
      cancelText,
      confirmText,
      success: (res) => {
        callback(res.confirm);
      },
    });
  },

  /* 普通提示框 */
  toast(title, duration = 2000, icon = 'none') {
    wx.showToast({
      title,
      icon,
      duration,
    });
  },

  /* 成功提示框 */
  success(title, duration = 2000) {
    wx.showToast({
      title,
      duration,
    });
  },

  /* 失败提示框 */
  error(title, duration = 2000, image = "/assets/images/close.png") {
    wx.showToast({
      title,
      image,
      duration
    });
  },
  /* 行为弹窗 */
  action(itemList = ['A', 'B', 'C'], callback) {
    const isFunction = callback && typeof callback === 'function';
    wx.showActionSheet({
      itemList,
      success(res) {
        isFunction && callback({
          confirm: true,
          value: res.tapIndex
        })
      },
      fail(res) {
        isFunction && callback({
          confirm: false,
          value: null
        })
      }
    })
  },
};