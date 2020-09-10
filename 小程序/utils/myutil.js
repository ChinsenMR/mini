const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//节流 多用于页面scroll滚动，或者窗口resize这种会实时变化的函数，或者防止按钮重复点击（看项目需求，两种方式都可选择）等情况
function throttle(func, wait, mustRun) {
  var timeout,
    startTime = new Date(); // 设置初始时间
  return function () {
    var context = this,
      args = arguments, // 将当函数的参数赋值给args
      curTime = new Date(); // 设置函数执行当前时间
    clearTimeout(timeout);
    // 如果达到了规定的触发时间间隔mustRun，触发 handler
    if (curTime - startTime >= mustRun) {
      func.apply(context, args); // 将当前函数的参数传进fnc并绑定上下文环境
      startTime = curTime; // 记录本次时间，作为下一次的初始时间
      // 没达到触发间隔，重新设定定时器
      console.log('时间间隔内')
    } else {
      timeout = setTimeout(function () {
        // console.log('定时器内')
        func.apply(context, args)
      }, wait);
    }
  };
}

// 防抖 多用于 input 框 输入时，匹配的输入内容，加入购物车，防止发起请求的按钮多次请求接口等情况
function debounce(fn, interval) {
  var timer;
  var gapTime = interval || 1000; //间隔时间，如果interval不传，则默认1000ms
  return function () {
    clearTimeout(timer);
    var context = this;
    let args = arguments[0]; //保存此处的arguments，因为setTimeout是全局的，arguments不是防抖函数需要的。
    timer = setTimeout(function () {
      fn.call(context, args);
    }, gapTime);
  };
}


//带天数的倒计时 time(单位秒)为倒计时开始的时间，单位小时
function countDown(endTime,dateTime) {
  // let newStr = '',oldStr = '';
  // if (endTime.includes('T') || dateTime.includes('T')){//过滤含有T的时间戳
  //   endTime = endTime.replace('T', ' ').substring(0, 19); 
  //   dateTime = dateTime.replace('T', ' ').substring(0, 19);
  // }else{
  //   endTime = endTime;
  //   dateTime = dateTime
  // }
  let nowDate ;
  if (dateTime){
    nowDate = +new Date(dateTime) || new Date();//当前时间(要使用服务器的时间,防止用户修改本地时间,造成错误数据)
  }else{
    nowDate = new Date()
  }
  let endDate = +new Date(endTime);//结束时间
  // let nowDate = +new Date(dateTime) || new Date();//当前时间(要使用服务器的时间,防止用户修改本地时间,造成错误数据)
  let time_dis = endDate - nowDate;
  let days = Math.floor(time_dis / (24 * 3600 * 1000));
  //计算出小时数
  let leave1 = time_dis % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
  let hours = Math.floor(leave1 / (3600 * 1000));
  //计算相差分钟数
  let leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
  let minutes = Math.floor(leave2 / (60 * 1000));
  //计算相差秒数
  let leave3 = leave2 % (60 * 1000); //计算小时数后剩余的毫秒数
  let second = Math.ceil(leave3 / 1000);
  let seckillDay = days;
  let seckillHours = hours;
  let seckillMinutes = minutes;
  let seckillSeconds = second;
  if (seckillDay < 10) {
    seckillDay = "0" + seckillDay;
  }
  if (seckillHours < 10) {
    seckillHours = "0" + seckillHours;
  }
  if (seckillMinutes < 10) {
    seckillMinutes = "0" + seckillMinutes;
  }
  if (seckillSeconds < 10) {
    seckillSeconds = "0" + seckillSeconds;
  }
  let obj = {}
  
  if (time_dis<=0){
    obj = {
      day: '00',//天
      hours: '00',//时
      minutes: '00',//分
      seconds: '00',//秒
      deltaT: time_dis,//时间差值
    }
  }else{
    obj = {
      day: String(seckillDay),//天
      hours: String(seckillHours),//时
      minutes: String(seckillMinutes),//分
      seconds: String(seckillSeconds),//秒
      deltaT: time_dis,//时间差值
    }
  }
  return obj
}
/*数组拆分 */
function anArrayOfSplit(array, subGroupLength) {
  let index = 0;
  let newArray = [];
  while (index < array.length) {
    newArray.push(array.slice(index, index += subGroupLength));
  }
  return newArray;
}

//保存图片到相册
const writePhotosAlbum = (successFun, failFun) => {
  wx.getSetting({
    success(res) {
      console.log("能到这里吗", res);
      if (!res.authSetting['scope.writePhotosAlbum']) {
        wx.authorize({
          scope: 'scope.writePhotosAlbum',
          success: function () {
            successFun && successFun()
          },
          fail: function (res) {
            wx.hideLoading()
            wx.showModal({
              title: '提示',
              content: "小程序需要您的微信授权保存图片，是否重新授权？",
              showCancel: true,
              cancelText: "否",
              confirmText: "是",
              success: function (res2) {
                if (res2.confirm) { //用户点击确定'
                  wx.openSetting({
                    success: (res3) => {
                      if (res3.authSetting['scope.writePhotosAlbum']) {
                        //已授权
                        successFun && successFun()
                      } else {
                        failFun && failFun()
                      }
                    }
                  })
                } else {
                  failFun && failFun()
                }
              }
            });
          }
        })
      } else {
        successFun && successFun()
      }
    }
  })
}

module.exports = {
  countDown,
  throttle,
  formatTime,
  debounce,
  writePhotosAlbum,
  anArrayOfSplit
}