import {
  observe
} from '../utils/store/index'
class UserStore {
  constructor() {
    this.name = null
    this.wallet = 100
  }

  changeName(name) {
    this.name = name
  }

  /* 通用修改值的方法 */
  update(obj) {
    Object.keys(obj).forEach(key => {
      this[key] = obj[key]
    })
  }
}

// 第二个参数'user'会将当前store的所有内部变量绑定在全局变量的user属性上
// 如果第二个参数没有写，会默认使用该class名字的全小写
export default observe(new UserStore(), 'user')