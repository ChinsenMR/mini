//大转盘相关接口
import $request from "../utils/tools/request"
export default {
  /**
   * 
   * 获取中奖商品 
   */
  activityDraw(data) {
    return $request({
      url: '/api/ActivitysHandler.ashx?action=ActivityDraw',
      data,
      hideToast: true,
    }).then(res => res)
  },

  /**
   * 获取大转盘配置接口
   */
  activityInfo(data) {
    return $request({
      url: '/api/ActivitysHandler.ashx?action=GetActivityInfo',
      data
    }).then(res => res)
  },
  /**
   * 获取中奖记录 
   */
  currUserAcceptPrize(data) {
    return $request({
      url: '/api/ActivitysHandler.ashx?action=GetCurrUserAcceptPrize',
      data
    }).then(res => res)
  },
  /**
   * 礼品兑换
   */
  submmitorder(data) {
    return $request({
      url: '/api/ActivitysHandler.ashx?action=ProcessSubmmitorder',
      data,
      method: 'POST',
    }).then(res => res)
  },




}