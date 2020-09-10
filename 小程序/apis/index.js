import agent from './agent';
import order from './order';
import point from './point';
import common from './common';
import money from './money';
import goods from './goods';
import cart from './cart';
import system from './system';
import adventures from './adventures';
import user from './user';


const apiList = Object.assign(
    agent,
    order,
    point,
    common,
    money,
    goods,
    cart,
    system,
    adventures,
    user
)

export const $apiList = apiList;

export default {
    ...apiList,
};