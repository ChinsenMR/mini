/**
 * Author: Chinsen
 * Desc: request请求，逻辑相对复杂，
 * 调用：$request({...options}).then(res => {})
 * options：
 *     data: Object | 请求参数 
 *     url: String | 后端api接口, 
 *     method: String | 请求方式 
 *     hideLoading: Boolean | 请求是否需要loading，不需要则会自动触发导航栏的loading
 *     header: Object | 传入自定义header
 *     loadingText: String | loading的文案
 *     hideToast: Boolean | 关闭请求后的弹窗
 *     closeDebugger: Boolean | 关闭debugger打印
 *     ignoreLogin: Boolean | 直接跳过权限校验
 */
/* 请求开始时才去拿getApp() */
let app = null;

const setting = {
  /* 是否需要拦截下一个请求 避免多次跳转到登录页面*/
  IS_NEED_INTERCEP: false,

  /* 请求超时限制 */
  TIME_OUT: 10 * 1000,

  /* 上一页面路由 */
  PREV_ROUTE: null,

  /* 历史页面 */
  HISTORY_PAGES: [],

  /* 返回默认错误状态，避免response为undefined，场景只针对被拦截的接口*/
  ERROR_CONTENT: {
    success: false,
    errorMsg: '未登录，请求已被拦截',
    errorCode: 0
  },

  ERROR_FIELD: {
    ERROR_LIST: ['Error', 'Message', 'msgMsg', 'errMsg', 'ErrorMsg', 'Msg'], // 后端历来出现过的error字段
    CODE: [500, 403, 300, 200, 100],
    GET_ERROR_MSG: (response) => {
      const current = setting.ERROR_FIELD.ERROR_LIST.filter(v => response[v])[0];
      return response[current]
    }
  }
};

/**
 * 单独处理header
 * @returns header参数
 */
function setHeader(method, cookie) {
  const contentTypes = {
    POST: "application/x-www-form-urlencoded",
    GET: "application/json",
    PUT: "application/x-www-form-urlencoded",
    DELETE: "application/x-www-form-urlencoded",
    UPDATE: 'application/x-www-form-urlencoded'
  };

  return {
    Cookie: cookie,
    "content-type": contentTypes[method.toUpperCase()],
  };
};


/* 验证是否有继续执行下一个方法的权限 */
function handleCheckRequestAccess() {
  /* cookie */
  const pages = getCurrentPages();
  const isLogined = app.cache.loadCookie();

  const currentPageRoute = pages[pages.length - 1].route;

  let isHaveRequestAuth = true; /* 请求接口的权限 */
  const HISTORY_STR = setting.HISTORY_PAGES.join(',');

  /* 如果有cookie那么就是为true，无需往下验证 */
  if (isLogined || !setting.IS_NEED_INTERCEP) return isHaveRequestAuth;

  /* 如果当前路由不等于上一页面路由 */
  if (setting.PREV_ROUTE !== currentPageRoute) {
    /* 重新开启跳转拦截 */
    setting.IS_NEED_INTERCEP = false;


    /* 如果拦截条件为true那么必然未登录，故没有权限 */
    if (setting.IS_NEED_INTERCEP) {
      isHaveRequestAuth = false
    }

    /*对应小程序5条page的限制,删除第0条 */
    if (setting.HISTORY_PAGES.length === 5) {
      setting.HISTORY_PAGES.splice(0, 1);
    } else {
      /* 如果历史page里面没有当前路由，那么将当前路由push进历史page */
      if (!HISTORY_STR.includes(currentPageRoute)) {
        setting.HISTORY_PAGES.push(currentPageRoute);
      }
    }

    /* 逻辑处理完上一页面路由赋值为当前页面 */
    setting.PREV_ROUTE = currentPageRoute;
  } else {
    /* 如果历史page中有当前路由，那么确定为返回页，给予请求权限 */
    if (HISTORY_STR[currentPageRoute]) {
      isHaveRequestAuth = true
    }
    /* 路由相同，仍在当前页面，已请求过一个接口返回未登录，无权限 */
    isHaveRequestAuth = false;
  }

  return isHaveRequestAuth
};

/**
 * 数据过滤
 * @param {form-data} data 
 * 根据后端的业务需求，仅有Number || String两种数据结果
 * 所以在请求之前先将undefined未定义，NaN运算错误，null空值进行过滤
 * 当然只过滤一层，如果后端需要一个对象，请手动过滤这个对象中的数据
 */
function formDataFilter(data) {
  Object.keys(data).forEach(v => {
    if (data[v] === undefined || data[v] === NaN || data[v] === null) {
      data[v] = '';
    }
  });

  return data
}
/**
 * 主请求体，参数详见顶部说明
 * @param {data, url, method, hideLoading, header, hideToast, ignoreLogin} options
 */
async function $request(options) {
  app = getApp();
  /* 查看请求权限，如果没有权限那么停止执行 */
  /* 如果传入ignoreLogin那么直接跳过权限，默认为true */
  const IS_HAVE_RIGHT = options.ignoreLogin || handleCheckRequestAccess();

  /* 无请求权限直接拦截 */
  if (!IS_HAVE_RIGHT) {
    console.error('错误：！！！未登录，请求已被拦截', options.url)
    return setting.ERROR_CONTENT
  }

  /* request只拿数据 直接返回不做任何数据处理 */
  const executeRequest = () => {
    const {
      header,
      loadingText,
      data = {},
      url,
      method = 'GET',
      hideLoading,
      closeDebugger,
    } = options;

    const timeout = setting.TIME_OUT;

    const cookie = app.cache.loadCookie();

    /* 请求头部，如果默认根据请求类型设置相应头部 */
    const ajaxParams = {
      method,
      data: formDataFilter(data),
      timeout,
      url: app.data.test ? app.data.testDomain + url : app.data.url + url,
      header: header || setHeader(method, cookie),
    };

    return new Promise((resolve, reject) => {

      /* 处理loading因为请求太快而闪一下的问题,请求未结束300毫秒后才出现loading */
      let requestStatus = 0;
      const timer = setTimeout(() => {
        if (requestStatus != 1) {
          !hideLoading ? app.alert.loading(loadingText) : app.alert.navLoading();
          clearTimeout(timer)
        }
      }, 300)

      wx.request({
        ...ajaxParams,
        success: (res) => {
          resolve(res.data);
        },
        fail: (err) => {
          const {
            errMsg
          } = err;

          const isTimeOut = errMsg.indexOf("timeout") != -1;

          app.alert.message(isTimeOut ? "请求超时，请检查网络状况" : errMsg);

          reject(err);
        },
        complete: (result) => {
          requestStatus = 1;

          !hideLoading ? app.alert.closeLoading() : app.alert.closeNavLoading();

          /* 执行debugger，可在控制台查看请求前后状态 */
          !closeDebugger && throwDebugger(ajaxParams, result)
        },
      });
    });
  };

  /* 拿到请求结果 */
  const response = await executeRequest();

  /* 返回结果 */
  return handleAbnormal(response, options);
};

/* 将后端的返回结果处理成前端固定格式 */
function handleResultFilter(response = {}) {
  const {
    Status = '',
      Code = null,
  } = response;

  const REST = {
    /*
      旧接口Status的值可能为Success || success故直接转大写进行判断
      新规范的Code为1视为请求正常
      注意：如果请求结果里面没有提示字段，视为不规范，找后端要字段，不给则找Mars
    */
    SUCCESS: Status.toLocaleUpperCase() === "SUCCESS" || Code === 1, // 请求成功与否
    /*
      新规范Code为-99视为未登录
      就接口Status出现了Login // login,前端强行转为大写
    */
    NO_LOGIN: Code === -99 || Status.toLocaleUpperCase() === 'LOGIN' ? true : false,
    /*
      后端服务器维护中会返回一堆乱字符串，视为返回错误
      服务端返回空白，即null，视为返回错误
    */
    RESPONSE: Object.keys(response).length > 0 && typeof response !== 'string',
    /* 提示文案的字段在就接口中可能不出现，这种视为垃圾接口，返回值为正常 */
    MESSAGE: setting.ERROR_FIELD.GET_ERROR_MSG(response) || ''
  }


  /* 
    请求处理的优先级分别是:
      1 后端无返回或者服务器异常
      2 旧接口不规范返回的数据，没有提示字段
      3 正常返回，注意：success为true不代表已经登录
  */
  const success = !REST.RESPONSE ? false : !REST.MESSAGE ? true : REST.SUCCESS;

  /* 
    请求状态码处理，该状态码解释权归前端所有，请勿与后端混淆
    500为无返回结果 
    403为未登录 
    300为请求结果异常 
    200为正常 
  */
  const errorCode = !REST.RESPONSE ? 500 : REST.NO_LOGIN ? 403 : !success ? 300 : 200;


  /* 重构返回结果 */
  return {
    success,
    errorMsg: REST.MESSAGE,
    errorCode
  }
};

/**
 *  处理异常，并返回结果
 * @param {请求结果} response 
 * @param {请求参数} options 
 */
function handleAbnormal(response, options) {

  const {
    hideToast
  } = options;

  /* 重构返回值，并返回新的数据结构 */
  const filterData = handleResultFilter(response)

  /* 
    异常表，status为true则为异常反之亦然
    针对新旧版本接口返回值异常处理
    经过handleResultFilter方法，最终我们会得到自定义的状态码
    根据状态码直接判断结果是否符合异常列表
  */
  const abnormals = [
    /* 接口无返回值 */
    {
      type: "NO_RESPONSE",
      status: filterData.errorCode === 500,
      action: () => app.alert.message("服务器错误【NO_RESPONSE】")
    },

    /* 处理未登录 */
    {
      type: "NO_LOGIN",
      status: filterData.errorCode === 403,
      action: () => {
        /* 未开启跳转拦截，未登录，那么允许前往登录 */
        if (!setting.IS_NEED_INTERCEP) {
          return app.alert.confirm({
            content: '您还没有登录'
          }, confirm => {

            confirm && app.goPage({
              url: app.data.loginUrl
            }, () => {
              /* 已经跳转去登录了，无需重复跳转 开启拦截，阻止重复跳转到授权页面 */
              setting.IS_NEED_INTERCEP = true;
            })
          })
        }
      },
    },
    /* 处理普通错误结果 */
    {
      type: "ERROR_WARNNING",
      status: filterData.errorCode === 300,
      action: () => !hideToast && app.alert.message(filterData.errorMsg)
    }
  ];

  /* 循环处理异常，如果异常的数组中某个type的status值为true并且过滤后的数据被处理方法认定为false那么才执行action */
  abnormals.forEach((v) => (v.status && !filterData.success) && v.action());

  /* 正常返回数据，登录跳转拦截关闭 */
  setting.IS_NEED_INTERCEP = false;

  /* 无异常，返回数据,filterData 为过滤了后的结果，可放心使用 */
  return Object.assign(response, filterData);
};

/**
 * 提供请求参数打印，以便快速定位错误
 * @param {请求参数} params 
 * @param {请求结果} response 
 */
function throwDebugger(options, response) {
  const targetPage = getCurrentPages();
  const route = targetPage[targetPage.length - 1].route;

  console.info(
    ` 请求页面：${route}\n 请求地址：${options.url}\n 请求方式：${options.method} \n`,
    `请求头部：`,
    response.header,
    `\n`,
    `请求参数：`,
    options.data,
    `\n`,
    `返回状态：`,
    response.statusCode,
    `\n`,
    `返回数据：`,
    response.data
  );

  console.log("</debugger>");
};

export default $request