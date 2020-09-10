import axios from 'axios'


/* 工具类 */
export default {
  //错误代码,需要初始化
  errorData: {},

  loginStatus: {},

  /* axios */
  axios,

  ksort: function (data) { //排序验证
    var keys = [],
      k, i, len;

    for (k in data) {
      if (data.hasOwnProperty(k)) {
        keys.push(k);
      }
    }

    keys.sort();

    len = keys.length;
    var obj = {};
    for (i = 0; i < len; i++) {

      k = keys[i];
      obj[k] = data[k];
      // alert(k + ':' + data[k]);
    }
    return obj;
  },
  GetRequest: function (url) {
    var theRequest = new Object();
    var str = url.substr(1);
    var strs = str.split("&");
    for (var i = 0; i < strs.length; i++) {
      theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
    }
    return theRequest;
  },
  objToStr: function (data) {
    var text = '';
    for (var i in data) {
      if (typeof (data[i]) != 'object') {
        if (data[i] !== "") {
          if (i != "file") {
            text += i + '=' + data[i] + '&';
          }
        }
      }

    }
    if (text.length > 0) {
      text = text.substring(0, text.length - 1);
    }
    return text;
  },

  /* 去掉两边空格 */
  trim: function trim(str) {
    str = str.toString() || '';
    return str.replace(/(^\s*)|(\s*$)/g, '');
  },

  /**
   * 类似php的日期转时间戳(date)
   * @param  format    格式
   * @param  timestamp 时间戳
   * @return
   */
  date: function (format, timestamp) {
    var jsdate = ((timestamp) ? new Date(timestamp * 1000) : new Date());
    var pad = function (n, c) {
      if ((n = n + "").length < c) {
        return new Array(++c - n.length).join("0") + n;
      } else {
        return n;
      }
    };
    var txt_weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var txt_ordin = {
      1: "st",
      2: "nd",
      3: "rd",
      21: "st",
      22: "nd",
      23: "rd",
      31: "st"
    };
    var txt_months = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    var f = {
      // Day
      d: function () {
        return pad(f.j(), 2);
      },
      D: function () {
        t = f.l();
        return t.substr(0, 3);
      },
      j: function () {
        return jsdate.getDate();
      },
      l: function () {
        return txt_weekdays[f.w()];
      },
      N: function () {
        return f.w() + 1;
      },
      S: function () {
        return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th';
      },
      w: function () {
        return jsdate.getDay();
      },
      z: function () {
        return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0;
      },

      // Week
      W: function () {
        var a = f.z(),
          b = 364 + f.L() - a;
        var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;

        if (b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b) {
          return 1;
        } else {

          if (a <= 2 && nd >= 4 && a >= (6 - nd)) {
            nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
            return date("W", Math.round(nd2.getTime() / 1000));
          } else {
            return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
          }
        }
      },

      // Month
      F: function () {
        return txt_months[f.n()];
      },
      m: function () {
        return pad(f.n(), 2);
      },
      M: function () {
        t = f.F();
        return t.substr(0, 3);
      },
      n: function () {
        return jsdate.getMonth() + 1;
      },
      t: function () {
        var n;
        if ((n = jsdate.getMonth() + 1) == 2) {
          return 28 + f.L();
        } else {
          if (n & 1 && n < 8 || !(n & 1) && n > 7) {
            return 31;
          } else {
            return 30;
          }
        }
      },

      // Year
      L: function () {
        var y = f.Y();
        return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0;
      },
      //o not supported yet
      Y: function () {
        return jsdate.getFullYear();
      },
      y: function () {
        return (jsdate.getFullYear() + "").slice(2);
      },

      // Time
      a: function () {
        return jsdate.getHours() > 11 ? "pm" : "am";
      },
      A: function () {
        return f.a().toUpperCase();
      },
      B: function () {
        // peter paul koch:
        var off = (jsdate.getTimezoneOffset() + 60) * 60;
        var theSeconds = (jsdate.getHours() * 3600) +
          (jsdate.getMinutes() * 60) +
          jsdate.getSeconds() + off;
        var beat = Math.floor(theSeconds / 86.4);
        if (beat > 1000) beat -= 1000;
        if (beat < 0) beat += 1000;
        if ((String(beat)).length == 1) beat = "00" + beat;
        if ((String(beat)).length == 2) beat = "0" + beat;
        return beat;
      },
      g: function () {
        return jsdate.getHours() % 12 || 12;
      },
      G: function () {
        return jsdate.getHours();
      },
      h: function () {
        return pad(f.g(), 2);
      },
      H: function () {
        return pad(jsdate.getHours(), 2);
      },
      i: function () {
        return pad(jsdate.getMinutes(), 2);
      },
      s: function () {
        return pad(jsdate.getSeconds(), 2);
      },
      //u not supported yet

      // Timezone
      //e not supported yet
      //I not supported yet
      O: function () {
        var t = pad(Math.abs(jsdate.getTimezoneOffset() / 60 * 100), 4);
        if (jsdate.getTimezoneOffset() > 0) t = "-" + t;
        else t = "+" + t;
        return t;
      },
      P: function () {
        var O = f.O();
        return (O.substr(0, 3) + ":" + O.substr(3, 2));
      },
      //T not supported yet
      //Z not supported yet

      // Full Date/Time
      c: function () {
        return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P();
      },
      //r not supported yet
      U: function () {
        return Math.round(jsdate.getTime() / 1000);
      }
    };

    return format.replace(/[\\]?([a-zA-Z])/g, function (t, s) {
      var ret;
      if (t != s) {
        // escaped
        ret = s;
      } else if (f[s]) {
        // a date function exists
        ret = f[s]();
      } else {
        // nothing special
        ret = s;
      }
      return ret;
    });
  },

  /**
   * 类似php的日期转时间戳(strtotime)
   * @param  datetime
   * @return
   */
  strtotime: function (datetime) {
    var p = {};
    p.datetime = datetime || '';
    datetime = undefined;
    // if(p.datetime.toString().indexOf(' ') == -1){
    //     if(p.datetime.toString().indexOf(':') == -1){
    //         p._ = [p.datetime, ''];
    //     }else{
    //         p._ = ['', p.datetime];
    //     }
    // }else{
    //      p._ = p[datetime].split(' ');
    // }
    p._ = p.datetime.toString().indexOf(' ') == -1 ? (p.datetime.toString().indexOf(':') == -1 ? [p.datetime, ''] : ['', p.datetime]) : p.datetime.split(' ');
    p.ymd = p._[0] || '';
    p.his = p._[1] || '';
    p.ymd = p.ymd.toString().indexOf('-') == -1 ? [p.ymd] : p.ymd.split('-');
    p.his = p.his.toString().indexOf(':') == -1 ? [p.his] : p.his.split(':');
    p.year = (p.ymd[0] || 0) - 0;
    p.month = (p.ymd[1] || 0) - 1;
    p.day = (p.ymd[2] || 0) - 0;
    p.hour = p.his[0] - 0;
    p.minute = p.his[1] - 0;
    p.second = p.his[2] - 0;
    //兼容无"时:分:秒"模式
    if ((p.his[0] == undefined) || isNaN(p.hour)) {
      p.hour = 0;
    }
    if ((p.his[1] == undefined) || isNaN(p.minute)) {
      p.minute = 0;
    }
    if ((p.his[2] == undefined) || isNaN(p.second)) {
      p.second = 0;
    }
    p.time = (new Date(p.year, p.month, p.day, p.hour, p.minute, p.second)).getTime();
    p = parseInt(p.time / 1000);
    return p;
  },

  /* 获取当前时间开始 */
  now: function () {
    return (new Date()).getTime();
  },

  /* 获取php的时间戳 */
  time: function () {
    return parseInt(this.now() / 1000);
  },

  /* 判断是否空 */
  isEmpty: function (value) {
    if (value === null || value === undefined || value === '' || value === false) {
      return true;
    }

    //判断对象
    if (typeof value === 'object' && Object.getOwnPropertyNames(value).length === 0) {
      return true;
    }

    return false;
  },

  /* url操作 */
  url: {
    /* 地址栏get参数对象 */
    query: function () {
      var __url = location.href.substring(location.href.indexOf('?'));
      var str = __url.substr(1);

      if (str.indexOf('#') >= 0) {
        str = str.split('#')[0];
      }

      var UrlObj = {},
        urlArr = str.split('&');

      if (str === "") return UrlObj;

      for (var i = 0, len = urlArr.length; i < len; i++) {
        var get_Url = urlArr[i].split('='),
          url = '';

        for (var j = 0; j < get_Url.length; j++) {
          if (j !== 0) {
            get_Url[j] = get_Url[j] === "" ? '=' : get_Url[j];
            url += get_Url[j];
          }
        }

        UrlObj[get_Url[0]] = url;
      }
      return UrlObj;
    },

    /* 获取地址栏get参数 */
    params: function (query) {
      return this.query()[query];
    },

    /* 替换地址栏中的参数 */
    replaceParamVal: function (arg, arg_val, url) {
      if (url === undefined) {
        url = window.location.href.toString();
      }
      var pattern = arg + '=([^&]*)';
      var replaceText = arg + '=' + arg_val;
      if (url.match(pattern)) {
        var tmp = '/(' + arg + '=)([^&]*)/gi';
        tmp = url.replace(eval(tmp), replaceText);
        return tmp;
      } else {
        if (url.match('[\?]')) {
          return url + '&' + replaceText;
        } else {
          return url + '?' + replaceText;
        }
      }
    },

    /* 批量替换地址栏中的参数 */
    replaceParamVals: function (params, url) {
      if (tools.isEmpty(params) && tools.isEmpty(url)) {
        url = window.location.href.toString();
      } else {
        for (var key in params) {
          url = this.replaceParamVal(key, params[key], url);
        }
      }

      return url;
    },

    /* 改变地址栏url */
    changeUrl: function (url, data) {
      var history = data || {};
      if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE9.0") {

      } else {
        window.history.pushState(history, 0, url);
      }
    },

    /* 改变地址栏url */
    replaceUrl: function (url, data) {
      var history = data || {};
      if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE9.0") {

      } else {
        window.history.replaceState(history, 0, url);
      }

    }
  },

  /* 缓存 */
  cache: {
    /* 获取 */
    get: function (key) {
      if (window.is_storage === 0) {
        this.cookie.get(key)
        return
      }
      return window.localStorage.getItem(key);
    },

    /* 保存 */
    set: function (key, value) {
      if (window.is_storage === 0) {
        this.cookie.set(key, value)
        return
      }
      return localStorage.setItem(key, value);
    },

    /* 删除 */
    del: function (key) {
      if (window.is_storage === 0) {
        this.cookie.del(key)
        return
      }
      return localStorage.removeItem(key);
    },

    /* 获取 */
    getSession: function (key) {
      if (window.is_storage === 0) {
        this.cookie.get(key)
        return
      }
      return sessionStorage.getItem(key);
    },

    /* 保存 */
    setSession: function (key, value) {
      if (window.is_storage === 0) {
        this.cookie.setSession(key, value)
        return
      }
      return sessionStorage.setItem(key, value);
    },

    /* 删除 */
    delSession: function (key) {
      if (window.is_storage === 0) {
        this.cookie.del(key, value)
        return
      }
      return sessionStorage.removeItem(key);
    }
  },

  cookie: {
    /* 获取 */
    get: function (name) {
      var arr = document.cookie.split('; ');
      var i = 0;
      for (i = 0; i < arr.length; i++) {
        var arr2 = arr[i].split('=');

        if (arr2[1] !== "" && arr2[0] === name) {
          return decodeURIComponent(arr2[1]);
        }
      }
    },
    /* 保存 */
    set: function (name, value, iDay) {
      var oDate = new Date();
      if (iDay !== undefined) {
        var iDay = iDay ? iDay : 0;
        oDate.setDate(oDate.getDate() + iDay);
      } else {
        oDate.setFullYear(oDate.getFullYear() + 99)
      }
      document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + oDate.toGMTString() + ';path=/';
    },
    setSession: function (name, value) {
      document.cookie = name + '=' + encodeURIComponent(value) + ';path=/';
    },
    /* 删除 */
    del: function (name) {
      this.set(name, "", -1);
    }
  },

  /* 网页标题 */
  title: {
    /* 获取 */
    get: function () {
      return document.title;
    },

    /* 设置 */
    set: function (value) {
      return document.title = value;
    }
  },

  /* 获取生成内容 */
  get: {
    /* 生成guid */
    guid: function guid() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  },

  /* 处理错误 */
  errorHandle: function (data) {
    var error_data = this.errorData;
    var flag = true;

    for (var i = 0; i < error_data.length; i++) {
      var index = i;

      if (data.errcode == error_data[index].errcode) {
        //提示信息,prompt为空字符串时不提示
        if (error_data[index].prompt !== undefined && error_data[index].prompt !== '') {
          window.tools.alert.message(error_data[index].prompt);
        }

        //执行方法
        if (error_data[index].fun !== '' && typeof error_data[index].fun == 'function') {
          error_data[index].fun({
            option: data.option
          });
        }

        //跳转判断,url为空字符串时忙不跳转
        if (error_data[index].url !== undefined && error_data[index].url !== '' && error_data[index].url !== -1) {
          var jumpFun;
          if (error_data[index].url === true) { //url为true时刷新自己
            jumpFun = function () {
              window.location.reload();
            };
          } else {
            jumpFun = function () {
              window.tools.router.push(error_data[index].url);
            };
          }

          setTimeout(jumpFun, 2000);
        }

        flag = false;

        if (error_data[index].url === -1) {
          return true;
        }

        return false;
      }
    }
    return flag;
  },

  /* 删除对象中为空的属性 */
  deleteObj: function (obj) {
    for (var v in obj) {
      if (obj.hasOwnProperty(v)) {
        if (obj[v] === "" || obj[v] === undefined || obj[v] === null) {
          delete obj[v];
        }
      }
    }
    return obj;
  }
}
