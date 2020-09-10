import {
  observe,
  Store
} from '../utils/store/index'


// const $Store = new Store();
class CartStore {

  constructor() {
    this.cartCount = 0;
    this.totalPrice = 0;
    this.cartList = {
      CartItemInfo: []
    };

  }

  /* 通用修改值的方法 */
  update(obj) {
    const app = getApp();
    Object.keys(obj).forEach(key => {
      this[key] = obj[key]
    })
  }
}


export default observe(new CartStore(), 'cart')