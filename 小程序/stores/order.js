import {
  observe,
} from '../utils/store/index'


// const $Store = new Store();
class OrderStore {

  constructor() {
    this.afterSaleList = [];
    this.checked = false;
  
  }

  /* 通用修改值的方法 */
  update(obj) {
    const app = getApp();
    Object.keys(obj).forEach(key => {
      this[key] = obj[key]
    })
  }
}


export default observe(new OrderStore(), 'order')