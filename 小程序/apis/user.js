//大转盘相关接口
import $request from "../utils/tools/request"
export default {
 
  /* 直属上级信息 */
  getUserInfo(data) {
    return $request({
        url: '/API/MembersHandler.ashx?action=GetMember',
        data
    }).then(res => res)
  },


}