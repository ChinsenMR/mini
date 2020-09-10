import axios from "axios";
import qs from "qs";

const instance = axios.create({
  //超时时间
  timeout: 20 * 1000,
  //响应前处理
  transformResponse: responseData => {
    return responseData;
  },
  headers: {
    async: true,
    crossDomain: true,
  }
});

// 请求拦截
instance.interceptors.request.use(function (config) {
  if (config.method == "post") {
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    config.data = qs.stringify(config.data);
  }

  return config;
});

// 响应拦截
instance.interceptors.response.use(
  function (response) {
    const {
      status,
      data,
      statusText,
      headers
    } = response;
    // if (status === 200) {
    //   // 未登录
    //   if (
    //     headers["content-type"] === "application/json"
    //       ? data.Status == "login"
    //       : JSON.parse(data).Status == "login"
    //   ) {
    //     Toast(
    //       headers["content-type"] === "application/json"
    //         ? data.ErrorMessage
    //         : JSON.parse(data).ErrorMessage
    //     );
    //     // setTimeout(() => {
    //     //   router.push({
    //     //     path: "/main/wjxLogin"
    //     //   });
    //     // }, 2000);
    //   }
    //   return headers["content-type"] === "application/json"
    //     ? data
    //     : JSON.parse(data);
    // } else {
    //   return response;
    // }
    return response;
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default {
  async get(url, params) {
    const result = instance.get(url, params);
    console.log(params, 1213213);
    return result;
  },
  post: (url, params, option) => {
    return instance.post(url, params);
  },
  delete: (url, params, option) => {
    return instance.delete(url, params);
  }
};