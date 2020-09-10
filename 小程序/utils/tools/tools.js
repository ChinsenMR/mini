/**
 * Author: Chinsen
 * Desc: 工具库
 */
import Alert from './alert'

export default {
  /* 用于请求结束后的操作 */
  goPageTimeOut(params = {}, callback, time = 2000) {
    const app = getApp();
    const timeout = setTimeout(() => {
      app.goPage({
        ...params,
        callback
      });
      clearTimeout(timeout);
    }, Number(time));
  },

  /* 用于请求结束后的操作 */
  goBackTimeOut(delta = 1, time = 2000) {
    const timeout = setTimeout(() => {
      wx.navigateBack({
        delta,
        complete: () => {
          clearTimeout(timeout);
        }
      });
    }, Number(time));
  },

  /* 
   * 设置默认图片，过滤后端传来的无效链接 
   * setImag('http://xxx.png?test=2124')
   */
  setImage(url, type) {
    const filterUrl = url.trim().split('?')[0];
    const defaultUrl = 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202007091714423634040.png?ive';
    const avatar = 'https://img.hmeshop.cn/hmeshopV3/Storage/master/202006181754581252080.png';
    const isHttps = filterUrl.substring(0, 8) === 'https://';
    const fileType = filterUrl.substring(filterUrl.length - 5);
    let isPicture = false;
    const typeList = ['png', 'gif', 'jpg', 'jpeg'];
    let targetUrl;

    for (let i = 0; i < typeList.length; i++) {
      if (fileType.indexOf(typeList[i]) > -1) {
        isPicture = true;
        break;
      } else {
        isPicture = false
      }
    }

    if (!isHttps || !isPicture) {
      switch (type) {
        case 'avatar': {
          targetUrl = avatar;
        }
        break;
      default: {
        targetUrl = defaultUrl;
      }
      break;
      }
    } else {
      targetUrl = url;
    }

    return targetUrl;
  },

  loadImage(e) {
    console.log(e);

  },

  /* 获取当前格式化日期 */
  getDate(targetDate = new Date()) {
    const date = targetDate;

    let [year, month, strDate, line] = [date.getFullYear(), date.getMonth() + 1, date.getDate(), "-"]

    month = month >= 1 && month <= 9 ? "0" + month : month;

    strDate = strDate >= 0 && strDate <= 9 ? "0" + strDate : strDate;

    const currentDate = year + line + month + line + strDate;

    return currentDate;
  },

  /* 设置所有数据,包括本页面和view视图的数据 */
  setAllData(that, data) {
    for (let i in data) {
      that.data[i] = data[i];
    }

    that.setData(data);
  },

  /* 计算数量,超过一万缩略显示 */
  tranNumber(num = 0) {
    let targetNumber = Number(num);

    if (targetNumber < 10000) {
      return targetNumber.toFixed(2);
    } else {
      return (targetNumber / 10000).toFixed(2) + 'w';
    }
  },
  /* 价格转换 */
  tranPriceToFixed(value, fixed = 2) {
    return parseFloat(value).toFixed(fixed)
  },

  /* 获取位置信息*/
  getLocation() {
    const app = getApp();
    wx.getSetting({
      success: (res) => {

        const isNeedAuth = res.authSetting["scope.userLocation"] != undefined &&
          res.authSetting["scope.userLocation"] != true;

        if (isNeedAuth) {
          app.alert.confirm({
            title: "请求授权当前位置",
            content: "需要获取您的地理位置，请确认授权",
          }, (result) => {

            /* 拒绝授权 */
            if (!result) {
              app.alert.message("您拒绝了地理位置授权");
              return
            }

            /* 正常授权 */
            wx.openSetting({
              success(authData) {
                if (authData.authSetting["scope.userLocation"] == true) {
                  app.alert.message("授权成功");
                  /* 再次授权，调用wx.getLocation的API */
                } else {
                  app.alert.message("授权失败");
                }
              },
            });
          })

        } else if (res.authSetting["scope.userLocation"] == undefined) {
          /* 调用wx.getLocation的API wx.getLocation()*/
        } else {

          //调用wx.getLocation的API
          wx.getLocation({
            type: "wgs84",
            success(res) {

              const {
                latitude,
                longitude,
                speed,
                accuracy
              } = res;

              return {
                latitude,
                longitude,
                speed,
                accuracy,
              };
            },
          });
        }
      },
    });
  },

  /*
   * 文件上传
   * 支持多文件数量,格式上传
   使用:
    upload({
      count: 9,
      url: '/AppShop/AppShopHandler.ashx?action=AppUploadImage',
    }).then(res => {
      ...todo
    })
    参数:
   * options: {
   *  url: String | api接口 | /AppShop/AppShopHandler.ashx?action=AppUploadImage
   *  name: String | 上传文件的关键词 | 'file'
   *  count: Number | 选择文件的数量
   *  formData: Object | form-data | {}
   *  type: String | 上传文件类型 | [video", "image"]
   *  header: Object | 自定义header
   *  detail: Boolean | 如果为true则返回后端请求结果,反之则以数组格式返回图片路径
   *  minSize: Number | 最小图片字节 1024 = 1kb
   *  maxSize: Number | 最大图片字节 1024 = 1kb
   * } 
   */
  async upload(options) {
    const app = getApp(),
      {
        url,
        name = "file",
        count = 1,
        formData = {
          hidFileMaxSize: 15
        },
        type = "image",
        detail = false,
        minSize = 1024 * 20, // 20kb
        maxSize = 1024 * 1024 * 2, // 10mb
        header = {
          "content-type": "multipart/form-data",
        },
        path
      } = options;


    /* 参数校验 */
    if (!url && typeof url !== "string" && url[0] !== "/") {
      return app.alert.message("错误URL");
    }

    if (
      typeof type !== "string" ||
      !["video", "image"].includes(type)
    ) {
      return app.alert.message("错误TYPE");
    }

    /* 根据传入type选择上传文件类型 */

    const choose = () => {
      return new Promise((resolve) => {
        if (path) {
          const outPut = {
            filePaths: path,
            fileList: [path],
          };
          resolve(outPut);
          return
        }

        if (type === 'video') {

          wx.chooseVideo({
            compressed: false, // 否	是否压缩所选择的视频文件
            maxDuration: 60, // 拍摄视频最长拍摄时间，单位秒
            sourceType: ['album', 'camera'],
            size: maxSize,
            maxDuration: 60,
            camera: 'back',
            success(file) {
              handleAfterChoose(file)
            },
          });
        } else {
          wx.chooseImage({
            sizeType: ['original', 'compressed'],
            count,
            sourceType: ['album', 'camera'],
            success: (file) => {

              handleAfterChoose(file)
            }

          })
        }

        function handleAfterChoose(file) {
          let tempFiles = type === 'video' ? file.tempFilePath : file.tempFilePaths;

          /* 视频上传 */
          if (type === 'video') {
            // 输出符合规格的文件
            resolve({
              fileList: [tempFiles],
            })
          } else {
            const filterFiles = []; // 过滤不符合规格的文件
            // const fileList = tempFiles.filter(f => {
            //   if (f.size < maxSize && f.size > minSize) {
            //     return f
            //   } else {
            //     filterFiles.push(f.name)
            //   }
            // })

            // 输出符合规格的文件
            const outPut = {
              filePaths: tempFiles,
              fileList: tempFiles,
            };
            resolve(outPut);
            // 如果有不符合规格的文件,提示用户
            // if (filterFiles.length) {
            //   app.alert.confirm({
            //     content: `以下文件规格不符合系统要求,将无法上传:\n ${ filterFiles.join(';')}`,
            //     showCancel: false,
            //   }, () => {
            //     resolve(outPut);
            //   })
            // } else {
            //   resolve(outPut);
            // }
          }


        }
      });
    };

    /* 上传文件到服务器 */
    const $upload = (target) => {
      const {
        fileList
      } = target;

      // 把promise存成数组,统一调用
      const uploaders = fileList.map(file =>

        new Promise(resolve => {
          // 上传文件的所有参数
          const params = {
            header,
            name,
            formData,
            filePath: file,
            url: app.data.url + url,
            complete(response) {

              app.alert.closeLoading();

              /* 微信服务端返回包装结果 */
              if (response.errMsg !== "uploadFile:ok" || response.statusCode !== 200) {
                app.alert.message("文件上传失败");
              }

              /* 服务器返回错误结果处理 */
              try {
                JSON.parse(response.data);
              } catch (error) {
                console.log(response, )
                app.alert.message(response.data);
              }

              // 确认后端返回的data是一个可用对象
              const res = JSON.parse(response.data);

              // 传入此参数会接受一个相当于callback
              if (detail) {
                resolve(res)
              }

              if (!res.Result) {
                app.alert.message(res.ErrorResponse.ErrorMsg);
              } else {
                resolve(res.Result.ImageURL);
              }
            },
          };

          // 执行服务器上传
          const uploadTask = wx.uploadFile({
            ...params,
          })

          // 输出上传进度
          uploadTask.onProgressUpdate(res => {
            app.alert.loading("上传中..." + res.progress + "%");
          })
        }))

      return Promise.all(uploaders);
    };

    /* 执行选择文件并上传到服务器，拿取结果 */
    return await choose().then((res) => $upload(res));
  },
  /* 对象简单拷贝 */
  copy(obj) {
    return Object.parse(Object.stringify(obj));
  },
  /* 对象深拷贝
    const obj1 = {
        a: 11,
        b: [1,2,3],
        c: {a: 111, b:23213, c: {aaa:2312}, d: [1,23,3,]}
      }
    const obj2 = {};
    console.log(obj2)
  */
  deepCopy(obj1, obj2) {
    for (const key in obj1) {
      let item = obj1[key];
      if (obj1[key] instanceof Array) {
        obj2[key] = [];
        this.deepCopy(item, obj2[key])
      } else if (obj1[key] instanceof Object) {
        obj2[key] = {};
        this.deepCopy(item, obj2[key])
      } else {
        obj2[key] = item;
      }
    }

    return obj2;
  },
  /* 数组累加 */
  sum(includeArray) {
    return includeArray.reduce((previousValue, value, index, array) => previousValue + value)
  },

  // 其中只有在传递 1020、1035、1036、1037、1038、1043 这几个场景值时，才会返回referrerInfo.appId
  /**
   * 用户拒绝授权操作
   * @param {数值} scope
   * scope.userInfo
    是否授权用户信息，对应接口 wx.getUserInfo

    scope.userLocation
    是否授权地理位置，对应接口 wx.getLocation, wx.chooseLocation

    scope.address
    是否授权通讯地址，对应接口 wx.chooseAddress

    scope.invoiceTitle
    是否授权发票抬头，对应接口 wx.chooseInvoiceTitle

    scope.invoice
    是否授权获取发票，对应接口 wx.chooseInvoice

    scope.werun
    是否授权微信运动步数，对应接口 wx.getWeRunData

    scope.record
    是否授权录音功能，对应接口 wx.startRecord

    scope.writePhotosAlbum
    是否授权保存到相册 wx.saveImageToPhotosAlbum, wx.saveVideoToPhotosAlbum

    scope.camera
    是否授权摄像头，对应[camera]((camera)) 组件
  */

  scopeAuth(params) {
    const app = getApp();
    let {
      scope,
      errMsg,
      callback
    } = params;
    scope = 'scope.' + scope

    /* 用户拒绝授权后的回调 */
    function executeFailHandle() {

      app.alert.confirm({
          content: errMsg || '您有权限未打开,为避免影响您使用,请在【系统设置】打开',
        },
        conf => {
          if (conf) {
            wx.openSetting({
              success: (res) => {
                if (res.authSetting[scope]) {
                  ////如果用户重新同意了授权登录
                  wx.authorize({
                    scope: scope,
                    success() {
                      //这里是用户同意授权后的回调
                      // return true;
                      callback()
                    },
                  });
                }
              },
            });
          } else {
            app.alert.message('您拒绝了授权')
          }

        }
      );
    }



    /* 用户授权成功后的回调 */
    function executeSuccessHandle(res) {
      if (!res.authSetting[scope]) {
        wx.authorize({
          scope: scope,
          success() {
            /* 这里是用户同意授权后的回调 */
            callback()
          },
          fail() {
            executeFailHandle()
          },
        });
      } else {
        /* 用户已经授权过了 */
        callback()
      }
    }

    wx.getSetting({
      success(res) {
        executeSuccessHandle(res)
      },
      fail() {
        executeFail(res)
      }
    });
  },
  /**
   * 
  data : {
    pageIndex: 0,
    list: [],
    loadMore: true,
    limit: 8,
  };
  
	onPullDownRefresh() {
		this.getList(1);
	},
	onReachBottom() {
		this.getList();
	},
   * @param {*} init
   * @returns
   */

  getList(init, params, getList) {

    let {
      pageIndex = 0, list = [], loadMore = true, limit = 8
    } = params;

    if (init) {
      list = [];
      loadMore = true;
      pageIndex = 0;

      this.setData({
        list,
        loadMore,
        pageIndex
      });
    }

    if (!loadMore) return;

    pageIndex++;

    this.setData({
      loadMore: true
    });

    const formData = {
      limit,
      pageIndex,
    };

    getList(formData).then((res) => {
      const {
        totalLimit = 1, resultData = []
      } = res.data;

      const maxPageLength = Math.ceil(totalLimit / rows);

      loadMore = pageIndex >= maxPageLength;

      list = list.concat(resultData);

      wx.stopPullDownRefresh();

      this.setData({
        list,
        loadMore,
        pageIndex,
      });

    });
  },
  /* 
   * 长按保存图片,直接将事件捕获到的event传进来 
   * saveImage(e)
   */
  saveImage(target) {
    const isObject = typeof target === 'object';

    const src = isObject ? target.currentTarget.dataset.src : target;

    const save = () => {
      wx.getImageInfo({
        src,
        success: res => {
          wx.saveImageToPhotosAlbum({
            filePath: res.path,
            success(success) {
              console.log(success);
              Alert.success('保存成功')
            },
            fail(error) {
              console.log(error);
            }
          })
        }
      })
    }

    const getAuth = () => {
      wx.authorize({
        scope: 'scope.writePhotosAlbum',
        success(res) {
          console.log('用户同意获取权限')
        },
        fail() {
          /* 用户拒绝后回调 */
          Alert.confirm({
            title: "提示",
            content: "请打开权限，否则无法保存",
          }, (confirm) => {
            if (confirm) {
              wx.openSetting({
                success(res) {}
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          })

        }
      })
    }

    /* 获取设置权限，如果没有权限则去获取，否则保存图片 */
    wx.getSetting({
      success(res) {
        !res.authSetting['scope.writePhotosAlbum'] ? getAuth() : save()
      }
    })

  },

  /**
   * start
   * 用于监听，在pages/js文件onload使用
   * @param {接收index.js传过来的data对象} data
   * @param {接收index.js传过来的watch对象} watch
   */
  setWatcher(data, watch) {
    // 和watch对象
    Object.keys(watch).forEach((v) => {
      // 将watch对象内的key遍历
      this.observe(data, v, watch[v]); // 监听data内的v属性，传入watch内对应函数以调用
    });
  },

  observe(obj, key, watchFun) {
    let val = obj[key]; // 给该属性设默认值
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      set: (value) => {
        val = value;
        watchFun(value, val); // 赋值(set)时，调用对应函数
      },
      get: () => {
        return val;
      },
    });
  },



};