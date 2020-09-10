import mixins from '../mixins/index';
import middleware from '../mixins/middleware';
import tools from '../../utils/tools/tools'
import {
    mapToData
} from '../../utils/store/index'

export default ($$page) => {
    const {
        methods: $methods = {},
        data: $data = {},
        state: $state = {},
        config: $config = {}
    } = $$page;

    /* 私有变量 */
    const _static = {
        _mask: false,
        _loading: false,
    }

    Object.assign($methods || {}, mixins, middleware);
    Object.assign($data, _static)

    /* 分开所开钩子函数和自定义函数 */
    delete $$page.methods;

    /* 控制是否分享页面 */
    const {
        close = {}
    } = $config;

    close.share && delete $$page.onShareAppMessage;

    /* 注入状态管理 */
    const connect = mapToData(function (state, opt) {
        const stateObj = {};
        const pageState = $state || {};
        Object.keys(pageState).forEach(key => {
            stateObj[key] = {};
            if (key && pageState[key] instanceof Array) {
                pageState[key].forEach(child => {
                    child && (stateObj[child] = state[key][child]);
                })
            } else {
                console.error(`$state.${key} is not defined`)
            }
        })

        return {
            ...stateObj
        }
    })



    return connect(Object.assign($$page, $methods))
}