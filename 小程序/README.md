

[TOC]

# **【0】概述：**

​	为了提高开发效率，规范化开发标准，3.0+对项目进行模块化，确保日后进行可持续性维护与开发，请大家遵守W3C标准来开发项目，

   新的版本加入了很多便于开发的工具，根据我司项目开发的特点，我们对项目的定位是快，准，稳，既要保证效率，也要有序有标准

   有规划，更要保证代码稳定性，所以新开发的特性大部分集成在了getApp中，以便我们在开发的过程中灵活使用。



# **【1】规范：**

## **原则:**

- 身为开发人员，遵循开发规范并写整洁的代码也是实力的一部分，请大家严格遵守W3C标准开发项目。

- 语义化--让接手你代码的人看到就能知道代码的功能作用,不用同事去猜,猜不到还得问,降低了开发效率
- 短小精悍--养成代码洁癖,避免代码重复,逻辑重叠,命名重复
- 释义清晰--多写些注释,特别是在逻辑比较复杂的代码块
- 养成全局观--把可以复用的组件或方法甚至样式,变量等进行封装,并说明使用方法

## javascript 

- 尽量使用ES6+语法，减少冗余代码，遵循短小精悍守则   

- 变量 / 常量 / 私有变常量命名

  不以动词开头

  ```js
  const isNeedBind = false; let isNeedBind = true
  ```

  小写驼峰

  ```js
  const goodsDetail = {}; let goodsList = [];
  ```

  不以大写开头

  ```js
  const GoodsList = []; /* 错误 */
  ```

   私有变量必须以下划线开头

  ```js
  const _vars = 12; const _getSomeThing = function(args){ ...todo }
  ```

  命名必须语义化

  ```js
  var isShowDialog = false; /* 展示弹窗开关 */
  ```

- function名必须以动词开头 + 驼峰 + 语义化

  ```js
  /* 正确示例 */
  function handleEditCard(){} 
  
  const changeRadio = () => {}
  
  const getData = async () => { return await saveData() }; 
  ```

- 不允许用简写

  ```js
  /* 错误示例 */
  function fg(){} /* request get 请求*/
  
  function getDtl() /* getDataList */ 
  ```

  

- 不能以大写开头

  ```js
  /* 错误示例 */
  function InitData(){}
  
  function GetDetail(){}
  ```

- js语法的值用单引号

  ```js
  let demoText = 'xx'; /* 正确 */
  
  let demoText = "xx";  /* 错误 */
  ```

##  css

- 类命名

  ```
  错误：_coitainer, Container, goods1, aa, a-b, goodsItem
  
  正确: container, container-list, container__list-item, item-1 
  ```

## html

- 使用弹性布局

- 循环体内不写逻辑判断

  ```html
  <view wx:for="{{ [0,1,2] }}" wx:if="{{ index === 0 }}" /> /* 错误 */
  
  <block wx:for="{{ [0,1,2] }}">  /* 正确 */
  	<view wx:if="{{ index === 0 }}" />
  </block>  
  ```

-  不写行内样式 

  ```html
  错误：<view style="width: 100%" />
  
  ​正确：<view class="width-100" />
  ```

  

- 属性值必须用双引号

  ```html
  <view data-url="{{ test + '1.png' }}">
  ```

## component

- 使用: 

  ```html
    正确：<action /> <to-do /> <goods-item />
  
  ​  错误：<Action /> <toDo /> <goodsitem>
  ```

-  定义

  ```html
   正确：components/share-code/share-code.wxml || components/shareCode/shareCode.wxml
  
  ​ 错误：components/sharecode/sharecode.wxml
  ```

# 【2】项目新增目录结构：   

 --apis         接口存放地址，（user.js, goods.js, agent.js等） 集中在index.js暴露 

  --stores        状态管理库，（user.js...）

  --assets        静态文件存放，（wxss, scss...）

  --config.js       配置文件，如domain和appid等都放这里

  --wxs        提供一些在wxml使用的全局转换方法

  --utils      

​    --mixins      方法库混合器

​    --store       状态管理

​    --tools       工具库

​      --alert.js   系统弹窗二次封装

​      --cache.js   缓存的二次封装

​      --request.js  高级请求方法封装，app.js有详解，这里不赘述，请移步

​      --tools.js   常用工具库

​      --verify.js   字段校验封装，类似身份证，邮箱，手机等的校验都有

​      --wxPage.js   在Page生成之前，我们有机会重新定义一个对象传给Page，这是自定义的方法



# 【3】app聚合库：

## mixin聚合方法

| 功能             | api              | 参数                       | 参数类型                       | 说明                                                         |
| ---------------- | ---------------- | -------------------------- | ------------------------------ | ------------------------------------------------------------ |
| 修改当前标题     | setTitle         | text                       | String                         |                                                              |
| 查看大图         | previewImage     | currentUrl<br />urlList    | String<br />Array              | 第一个参数必须是有效的url，图片放大后会执行onShow事件        |
| 路由跳转二次封装 | goPage           | url<br />options<br />type | String<br />Object<br />String | 默认是navigaTo跳转路由，<br />options将对象里的参数转换成url的哈希值，<br />传入type可更改跳转方式例如redirect |
| url参数拼接      | concatOptions    | params                     | Object                         |                                                              |
| 返回             | goBack           | step                       | Number                         | 如果没有上一页默认回到首页                                   |
| 获取url参数      | getQueryVariable | url<br />paramName         | String<br />String             |                                                              |
| 简便获取参数     | getDataset       | event                      | Object                         |                                                              |
| 检查登录状态     | checkLoginStatus | mastLogin                  | Boolean                        | 用于需要校验登录位置，如加入购物车                           |
| 正整数过滤器     | intFilter        | number                     | Number                         | 用于输入框                                                   |
| 快捷输入         | input            |                            |                                | 详细使用方法移步实例                                         |

- 实例

  ```js
  app.setTitle('新标题')
  
  let currentUrl = 'https://img.hmeshop.cn/hmeshopV3/20200901/01101527882.jpg';
  let urlList = ['https://img.hmeshop.cn/hmeshopV3/20200901/01101527882.jpg']
  app.previewImage(currentUrl, urlList)
  
  app.goPage({
      url: 'page',
      options: { 
          id: 11,
          fromType: 2
      }
  })
  
  app.goBack(1)
  
  const params = app.concatOptions({a: 11, b: 2312}) // ?a=11&b=2312
  
  const a = getQueryVariable('?a=11', 'a') // 11
  app.goPage({
      url: '/pages/demo/demo' + params
      options: {
      	a
  	}
  })
  
  
  handleTap(e){
  	const id = app.getDataset(e).id;
  }
  
  todo(){ // 执行结果，如果未登录则弹出模态框提示登录
  	if(!isNoLogin){
          app.checkLoginStatus()
      }
  }
  
  inputValue(e){
      let { value } = e.detail;
  	value = app.intFilter(value);
  }
  
  /* demo.wxml */
  <input bindinput="input" data-name="name" value="{{ form.name }}"/>
  /* demo.js */
  Page({
  	data: {
  		form: { // 必须有form对象
              name: ''  
          }
      },
  	input(e){
  		app.input(e, this)
  	},
  	
  })
  ```

  

## $request请求

- 参数

| 参数名        | 类型    | 是否必传 | 作用                                                     |
| ------------- | ------- | -------- | -------------------------------------------------------- |
| data          | Object  | 否       | 传给后台的参数，默认为{}                                 |
| url           | String  | 是       | api请求接口                                              |
| method        | String  | 否       | 请求类型，默认为get                                      |
| hideLoading   | Boolean | 否       | 是否隐藏loading，默认为false                             |
| header        | Object  | 否       | 请求头部，默认为 { "content-type":  "application/json" } |
| loadingText   | String  | 否       | loading的文案，默认为'加载中...'                         |
| hideToast     | Boolean | 否       | 是否隐藏后台返回的报错信息弹窗，默认为false              |
| closeDebugger | Boolean | 否       | 是否关闭debug打印，默认为false                           |
| ignoreLogin   | Boolean | 否       | 是否越过登录权限，此接口无需登录校验拦截，默认为false    |

- 说明： **最终的$request会通过apis文件夹中的index.js暴露出去，由app接收，所以可以直接用app.$request().then(res => res)**

- 实例

  ```js
  /* agent.js */
  import $request from "../request";
  
  export default {
      bindAgent(data) {
         return $request({
           url: '/API/VshopProcess.ashx?action=BindAgent',
           data
         }).then(res => res)
      },
  }
  ```

  ```js
  /* index.js */
  import { bindAgent } './agent.js';
  
  bindAgent({ id: 1 }).then(res => {
  	if(res.success){
          console.log('请求成功')
          console.log(res)
      }
  })    
  ```

  

## alert系统弹窗

- 参数

| 功能                | api             | 参数                     | 参数类型             | 说明                                                         |
| ------------------- | --------------- | ------------------------ | -------------------- | ------------------------------------------------------------ |
| loading             | loading         | title                    | String               |                                                              |
| 关闭loading         | closeLoading    |                          |                      |                                                              |
| 顶部导航loading     | navLoading      |                          |                      |                                                              |
| 关闭顶部导航loading | closeNavLoading |                          |                      |                                                              |
| 没有icon的提示      | toast           | title                    | String               |                                                              |
| 成功提示（有icon）  | success         | title                    | String               | 限制六个字                                                   |
| 失败提示（有icon）  | error           | title                    | String               | 限制六个字                                                   |
| 无回调模态框        | message         | title<br />content       | String<br />String   |                                                              |
| 确认框              | confirm         | params<br />callback     | Object<br />Function | 对应wx.showMadal里的所有参数<br />callback接收一个布尔值表示确定或取消 |
| 行为选择框          | action          | actionList<br />callback | Array<br />Function  | actionList的每个元素都必须是字符串<br />callback res 接收两个参数:<br />confirm 是否选择取消<br />value选中actionList的值 |
|                     |                 |                          |                      |                                                              |

- 实例

  ```js
     loading: 
  
  	app.alert.loading('加载中...')
  	
  ​   closeLoading: 
  
  	app.alert.closeLoading()
  
  ​   loading: 
  
  	app.alert.navLoading('加载中...')
  	
  ​   closeLoading: 
  
  	app.alert.closeNavLoading()
  
  ​   toast: 
  
  	app.alert.toast('您的余额已不足，请及时充值')
  
  ​   success: 
  	
  	app.alert.success('操作成功')
  
  ​   error: 
  
  	app.alert.error('操作失败')
  
  ​   confirm: 
  
      app.alert.confirm({
          title: '提示',
          content: '是否进行xxx'
      }, confirm => { 
          confirm && console.log('点击了确定')
      }) 
  
  ​   message:
  	
  	app.alert.message('参数错误')
  
  
  ​   action:
  	
  	app.alert.action(['A','B','C'], res => {
          if(!res.confirm) return 
          switch(res.value){
              case 'A': ...todo; break;
          }
      })
  ```

  

## verify参数校验

- 参数

  | 功能             | api            | 参数      | 参数类型         | 接收参数                            | 说明                       |
  | ---------------- | -------------- | --------- | ---------------- | ----------------------------------- | -------------------------- |
  | 校检真实姓名     | name           | value     | String           | { verify: Boolean, error:Function } |                            |
  | 校验身份证       | idCard         | value     | String \| Number | { verify: Boolean, error:Function } |                            |
  | 校验邮箱         | email          | value     | String           |                                     |                            |
  | 校验银行卡       | bankCardId     | value     | String \| Number | { verify: Boolean, error:Function } |                            |
  | 校验手机         | mobile         | value     | String \| Number | { verify: Boolean, error:Function } |                            |
  | 校验字段是否为空 | field          | value     | String \| Number | { verify: Boolean, error:Function } |                            |
  | 校验整数         | isInt          | value     | Number           | { verify: Boolean, error:Function } |                            |
  | 校验所有参数     | verifyAllField | fieldList | Arguments        | Promise                             | 具体使用说明请参考【实例】 |

  

- 实例

  ```js
   常规调用：
  
  ​      const verifyObj = app.verfiy.idCard(4465416161); 
  
  ​      if(verifyObj.verify){ 
  
  ​        verifyObj.error(); 
  
  ​      }
  
  ​ 校验所有参数 / 默认会弹出错误
  
  ​  		app.verify.verifyAllField(
  
  ​        app.verify.name('陈静'),
  
  ​        app.verify.email('2645800@qq.com'),
  
  ​        app.verify.idCard(440582199607117219)
  
  ​       ).then(isTrue => {
  
  ​          if(isTrue){
  				console.log('所有参数校验无误')
  ​			}
  
  ​       })
  ```

## tools工具库

- **setImage**
  把后端传给的图片链接进行校验，如果格式或者不是https不对会自动转为默认图

  ```js
  /*
   * url | String
   */
   
  app.tools.setImage('https://xxx.png')
  ```

- **saveImage**

  保存图片到本地

  ```js
  /*
   * url | String
   */
   
  app.tools.saveImage('https://xxx.png')
  ```

- **upload** 
  文件上传 支持图片 / 视频

  | 参数名   | 作用                                               | 参数类型 | 例子             | 是否必传 |
  | -------- | -------------------------------------------------- | -------- | ---------------- | -------- |
  | url      | api接口                                            | String   | /api/upload      | 是       |
  | name     | 上传文件的关键词                                   | String   | 'file'           | 否       |
  | count    | 选择文件数量，只作用于图片，默认为1                | Number   | 1 - 9            | 否       |
  | formData | 文件上传时需要的formdata                           | Object   | { name: 'xxx'}   | 否       |
  | type     | 文件类型，默认为image                              | String   | image / video    | 否       |
  | header   | 请求header                                         | Object   | { xx: 'xxx'}     | 否       |
  | detail   | 为true时then接收服务器的完整返回结果               | Boolean  | true / false     | 否       |
  | maxSize  | 最大值 1024 * N， 传入1代表1mb，<br />只作用于视频 | Number   | 1                | 否       |
  | path     | 文件临时路径<br />如果传入path则不会调起相册       | String   | ’http://xxx.png‘ | 否       |

  

  ```js
   使用：
   
   app.tools.upload({
       type: 'image',
       url: app.data.api.upload,
       count: 1,
       path
   }).then(res => {
       const pages = getCurrentPages();
       const that = pages[pages.length - 2];
       const url = res[0];
       that.setData({
           avatar: url
       })
       app.goBack();
   })
  ```

  

- **goPageTimeOut**
  延时跳转页面，用于某一项操作后

  ```js
  /*
   * options | 与goPage保持一致，详细请移步参考app.goPage的参数
   * timeout | Number | 毫秒  
   */
   
  app.tools.goPageTimeOut({ 
  	url: '/pages/demo/demo',
  	options: {
  		a: 11
  	}
  }, 2000)
  ```

  

- **goBackTimeOut**
  延时跳转页面，用于某一项操作后

  ```js
  /*
   * step | Number | 返回页数
   * timeout | Number | 毫秒  
   */
  
  app.tools.goBackTimeOut(1, 2000)
  ```

  

- **scopeAuth**
  系统权限校验

  | 参数（params） | 参数类型 | 是否必传 | 说明                                               |
  | -------------- | -------- | -------- | -------------------------------------------------- |
  | errMsg         | String   | 否       | 重新授权的提示                                     |
  | callback       | Function | 否       | 授权成功的回调，可在方法里实现业务逻辑             |
  | scope          | String   | 是       | 授权的api，传如的参数可参考**下表**及对应的微信api |

  | scope            | 用途         | 对应微信api 或者 组件                                      |
  | ---------------- | ------------ | ---------------------------------------------------------- |
  | userInfo         | 用户信息     | wx.getUserInfo                                             |
  | userLocation     | 地理位置信息 | wx.getLocation, wx.chooseLocation                          |
  | address          | 通讯地址     | wx.chooseAddress                                           |
  | invoiceTitle     | 发票抬头     | wx.chooseInvoiceTitle                                      |
  | invoice          | 获取发票     | wx.chooseInvoice                                           |
  | werun            | 微信运动步数 | wx.getWeRunData                                            |
  | record           | 录音功能     | wx.startRecord                                             |
  | writePhotosAlbum | 保存到相册   | wx.saveImageToPhotosAlbum,<br /> wx.saveVideoToPhotosAlbum |
  | camera           | 摄像头       | 对应[camera]((camera)) 组件                                |

  

  ```js
  实例
    /* demo.wxml */
    <button bindtap="getLocation">获取经纬度</button>
  
    /* demo.js */
    getLocation(){
       /**
        * 检查权限是否已经打开,未打开则弹出授权窗,注意:此窗回调会触发onShow
        * 点击确定则进入callback回调,否则弹出确认框,提示是否重新打开权限
        * 点击确定后进入设置页面,可在设置页面打开权限或关闭
        */
       app.tools.scopeAuth({
        errMsg: '请打开地理位置权限',
        scope: 'userLocation',
        callback: () => { 
          // callback一定是在授权成功后执行的,所以我们只需要处理好逻辑就行
          wx.getLocation({
            type: 'wgs84',
            success (res) {
              console.log(res, '获取到的地址')
            }
           })
        }
      })
    },
  ```

  

##  **cache**

- **参数**

  | api    | 对应api          |
  | ------ | ---------------- |
  | get    | wx.getStorage    |
  | set    | wx.setStorage    |
  | remove | wx.removeStorage |

  

- **实例**

  ```js
  /* 获取 */
  app.cache.get('userInfo').then(res => {
  	app.goPage({
  		url: '/pages/demo/demo',
  		options: {
  			userId: res.userId
  		}
  	})
  })
  
  /* 存值 */
  app.cache.set('userInfo', data ).then(res => {
     app.goBack()
      
  })
  
  /* 删除值 */
  app.cache.remove('userInfo').then(res => {
      app.$request({url: '/api/update'})
         .then(res=>{
          if(res.success){
              ...todo
          }
      })
  })
  ```

  

##   wxs：

- **引入**  

  ```html
  <wxs src="../../../utils/wxs/common.wxs" module="common" />
  ```

- **wxs api**

  | api              | 参数 \| type                      | 实例                                  | 说明                             |
  | ---------------- | --------------------------------- | ------------------------------------- | -------------------------------- |
  | transOrderStatus | status \| Number                  | 0 - 9                                 | 把订单状态的值变更为文字         |
  | setImage         | url \| String<br />type \| String | https://xx.png<br />avatar \| default | 后端返回图片格式有误，设置默认图 |
  | background       | url \| String<br />type \| String | https://xx.png<br />auto \| cover     | 设置背景样式                     |

  ```html
  实例
  
  <image src="{{ common.setImage(imgUrl + 'bg_04@2x.png') }}" />
  
  <view>订单状态：{{common.transOrderStatus(1)}}</view>
  
  <view style="{{ common.background('http://xxx.png', 'auto') }}"></view>
  ```

# 【4】高级request：

##   **业务逻辑**

> 1 接口请求之前根据请求方式过滤header
>
> 2 开始检验权限并拦截请求，优先拦截未登录跳转，再拦截未登录而无需调用的接口
>
> 3 请求response拿到后，处理所有异常，如下表：

| 字段           | 处理顺序 | 结果               | 值类型  |
| -------------- | -------- | ------------------ | ------- |
| NO_RESPONSE    | 0        | 无返回值           | Boolean |
| NO_LOGIN       | 1        | 未登录             | Boolean |
| ERROR_WARNNING | 2        | 返回值携带错误信息 | Boolean |

> 4 过滤response返回的无效数据，并转换成前端相对稳定filterData并包含三个值

| 数据过滤（filterData） | 作用                                                         | 值类型  |
| ---------------------- | ------------------------------------------------------------ | ------- |
| errorMsg               | 请求结果提示                                                 | String  |
| success                | 请求结果,ture表示请求成功，false为失败                       | Boolean |
| errorCode              | 请求状态码处理，该状态码解释权归前端所有，请勿与后端混淆，详细见**下表** | Number  |

| 状态码（errorCode） | 描述                                         |
| ------------------- | -------------------------------------------- |
| 403                 | 未登录                                       |
| 300                 | 请求结果异常                                 |
| 500                 | 无返回结果，一般出现在服务器报错或者无返回值 |
| 200                 | 成功，正常返回数据                           |

> 5 检查是否需要打印，包含打印内容如下

```
 请求页面：pages/moduleHome/moduleHome
 请求地址：https://yanfu.hmeshop.cn/api/LiveInfo.ashx?action=GetTopLiveRoomListNew
 请求方式：GET 
 请求头部：{Cache-Control: "private", Content-Type: "text/html; charset=utf-8", Content-Encoding: "gzip", 			  Vary: "Accept-Encoding", Server: "Microsoft-IIS/10.0", …} 
 请求参数： {} 
 返回状态： 200 
 返回数据： {Status: "true", Data: {…}, Message: ""}
```

## **对项目的用途**

- 1 解决了重复跳转登录页的问题
- 2 如果未登录，且当前页面有N个接口调用，那么只要有一个需要登录，执行顺序次之的接口将被拦截
- 3 兼容了后端多个版本的返回结果处理，如果发现新的，欢迎到tools/request.js加入
- 4 正常的请求调用，结果处理
- 5 console定位，没调用一个接口在打印台可以看到常用的信息，以便后端，测试人员也能定位bug
- 6 集中处理了后端返回的状态值，{ errorMsg: "请求成功" success: true }
- 7 使用：app.$api.getList().then(res => {})
- 8 解决了由于请求过快导致loading闪一下的问题

# 【5】状态管理机$store：

##   \* 说明

​	**状态管理机是在页面onload的时候将变量注入到data里，后面调用状态管理的文件只会执行setData，而不会给变量赋值，详见下表**     

```js
 执行js
​        pointStore.changeDetailList([1,2,3]) 
​ 结果 
​        view层的detailList = [1,2,3]
​        js逻辑层的detailList = [];
​
​ 执行js
​        this.data.detailList = [12,3,4];
​        pointStore.changeDetailList([1,2,3]) 
​ 结果 
​        view层的detailList = [1,2,3]
​        js逻辑层的detailList = [12,3,4] ;
```

   **所以**：如果要保证逻辑层的detailList和视图层的一致，那就需要两者赋同样的值

   **备注**：（【详细案例】可以在/subPackageC/testDemo/index预览）

##   \* 实例目录结构：

> **stores**
>
>    **--demo.js // 存储store**
>
>    **--index.js // 暴露demoStore**
>
> **pages // 普通页面**
>
>    **--demo**
>
> ​      **--demo.js** 
>
> ​      **--demo.wxml**

##   \* api：

-  **app.$store**

这个api暴露了当前项目所有的$store，集中管理，可以直接调用其方法属性。

  ```js
  /* page A */
  app.$store.demo.update({a: 1})
  
  /* page B */
  state: {
      demo: ['a'],
  }
  
  onShow(){
      console.log(this.data.a) // 1
  }  
  ```

-  **app.$page中间件**

store的connect方式是通过app.$page，加入state属性

  ```js
  /* demo.js */
  Page(app.$page({
       state: {
            demo: ['cartCount', 'list'] // 注意，必须是字符串
          }
   }))
  ```

  

##   \* 实际使用：

1. **./stores文件夹中创建一个demo.js（file: stores/demo.js）**

   ```js
   		import { observe } from '../utils/store/index'
   ​
   ​        const app = getApp()
   ​
   ​        class DemoStore {
   ​          constructor() {
   ​            this.detailList = [];
   ​            this.point = 0;
   ​          }
   ​          /* 通用修改值的方法 */
   ​          update(obj) {
   ​            Object.keys(obj).forEach(key => {
   ​              this[key] = obj[key]
   ​            })
   ​          }
   ​        }
   ​        \* 第二个参数'user'会将当前store的所有内部变量绑定在全局变量的user属性上
   ​        \* 如果第二个参数没有写，会默认使用该class名字的全小写
   ​        export default observe(new DemoStore(), 'demo')
   
   ```

1. **./pages/demo/demo.js 使用connect（file: pages/demo/demo.js）**

   ```js
    const app = getApp();

    Page(app.$page({
        state: {
            ​ /* demo 对应的是app.$store.demo 数组中的值则是app.$store.demo的属性*/ ​
            demo: ['detailList', 'point']​
        }​,
        methods: {
            handleEdit() {
                ​ /* 修改state值的 api */ ​
                app.$store.demo.update({         ​
                    detailList: [12, 41],
                    ​point: 2123​
                })​
            }​
        }​
    }))
   ```

   

1. **./pages/demo/demo.wxml wxml使用跟平时在data里面定义变量无异**

   ```html
         <block wx:for="{{detailList}}" wx:key="index">
   ​        <view calss="demo">{{item.name + point}}</view>
   ​      </block>
   ```

   



##   \* 组件使用$store

​    注意：组件没有办法像Page一样使用app.$page，但是尽管如此，但是我们可以通过在父组件获取到state的属性，传入子组件

​       这样，我们就可以通过app.$store.xx.fn更新值，无需再与父组件进行通讯，就能简单的修改$store的值

> 父组件：
>

```js
/* father.wxml */

 <v-test wallet="{{wallet}}" />
 
/* father.js */  

​ state: {
​      user: ['wallet'],
​      cart: ['goodsCount']
​  },
```

> 子组件：
>

```js
const app = getApp();
Component({
    properties: {
        wallet: {
            type: Number,
            value: 0
        }
    },
    methods: {
        
        lost() {
            if (this.data.wallet < 3) {

                return app.alert.message('你没钱了')​
            }
            app.$store.user.update({
                
                wallet: this.data.wallet - 3
            })
        },
        
    }
})
```



# 【6】app.$page

​    说明：在我们创建page之前，我们有机会对page进行全局更改，由于小程序的限制，有些功能我们只能通过特定的方法去调用

​       所以如果要做到全局，必须在page生成之前进行对象重构，我们将通过$page强行改造成适用于我们业务范围的结构。

​	期望：能够通过外部全局变量进行管理实现控制，并且更加规范化		



```js
const app = getApp();
const $page = app.$page;

Page($page({
    // config 能够对当前页面进行配置，比如对分享的开关或者业务逻辑开关等
    config: {
        close: {
            share: true // share为true则关闭页面分享
        }
    },
    // 通过对$page开发实现了状态管理机制
    state: {
        cart: ['cartList'],
        demo: ['detail']
    },
    // methods实现是为了让自定义方法与钩子函数和生命周期区分开
	methods: { 
        // 自定义方法
        getList(){
           console.log(this.data.cartList);
        },
        updateList(){
            app.$store.cart.update({
                cartList: [1,2,3]
            })
        },
        handleTodo(){
            /* 默认将mixin的公用方法注入了$page，可以直接调用，详细查看mixin*/
            this.goPage();
            this.setTitle();
            this.previewImage()
            ...
        }
	},
   
}))

```

# 【7】wxss类库

​    说明：wxss类库可以帮助你快速为页面布局，该类库已在app.wxss引入，可在任意页面随意使用

```html
    <view class="wrap flex-center padding-30 margin-t-30 margin-b-40">
​        <view class="item flex-col-1 text-center">左边<view>
​        <view class="item flex-col-1 text-center">右边<view>
​    </view>
​    <view class="flex col-xs-12">
​        <view class="item col-xs-4 text-left">左<view>
​        <view class="item col-xs-4 text-center">中<view>
​        <view class="item col-xs-4 text-right">右<view>
​     </view>
```

# 【8】scss类库

​    说明：提供一些minxin方法，如果使用less请再创建文件夹并将scss文件拷贝过去

| 混合方法名        | 作用                        | 使用                                                  |
| ----------------- | --------------------------- | ----------------------------------------------------- |
| ellipsis          | 文字超过省略                | @include ellipsis(2)                                  |
| wh                | 设置宽高                    | @include wh(20rpx, 30rpx)                             |
| flex-center       | 弹性盒子居中                | @include flex-center(row, center,center, wrap)        |
| position-absolute | 绝对定位 参数顺序：上右下左 | @include position-absolute(20rpx, 20rpx,20rpx, 20rpx) |
| line-height       | 高和行高                    | @include line-height(40rpx)                           |
| circle            | 圆形盒子                    | @include circle(100rpx)                               |



# 【9】iconfont 类库

- ​    **说明：阿里云iconfont，调用的类名被改成了icons，字体文件全部存放在oss上**

- ​    **使用:** 

  ```html
  <icon class="icons icon-shoucang" />
  ```

- ​    **类名查看（本地服务器）：**http://192.168.3.86:9999/ 

# 【10】全局自定义组件（针对后端返回数据而设计）

- **custom-image** 
  自定义图片组件，图片格式校验错误会默认赋值为缺省图，图片加载失败赋值为错误图

  ```css
  css 
  ​ .custom-image{
  ​      width: 100rpx;
  ​      height: 100rpx;
  ​ }
  ```

  ```html
  html
  ​ <view class="custom-image">
  ​    <custom-image src="{{ gift.Image }}" />
  ​ </view>
  ```

​    注意：确定好容器的宽高就能直接使用，custom-image是自适应宽高的

- **custom-form**
  自定义表单，避免重复造轮子的问题，通过参数控制展示的控件

  ```html
  html
  <custom-form
    id="form"
    form="{{ form }}"
    bind:getFormValue="getFormValue"
    confirm-btn="{{ false }}"
    reset-btn="{{ false }}"
  />
  <button bind:tap="submit">提交</button>
  ```

  ```js
  js
    data:{
        form: [{
            value: null, // 输入值 
            field: 'name', // 字段名
            disabled: false, // 是否禁止输入 默认:false
            type: 'text', // input类型  默认:text
            placeholder: '请输入', // 描述 
            errorMsg: '姓名不能为空', // 错误提示 默认:form.title + '输入错误'
            regExp: null, // 校验字段值的正则表达式 
            tag: 'input', // 要使用的标签名，如果不传则不出现
            title: '姓名', // 字段的标题
            require: true, // 是否必传
            options: [{
                name: '选项1',
                value: 1,
                checked: false,
            }]， // radio / checkbox / picker 等的值展示的值
            picker: {
            	mode: ''
        	  }
        }]
    },
    submit() {
      const form = this.selectComponent('#form');
      const verifyForm = form.verifyFormValue();
      console.log(verifyForm)
    },
  
  ```

- **super-swiper**
  视频与轮播互相切换的轮播器

  ```html
  <super-swiper 
      banner-list="{{ goodsInfo.ImgList }}"
      video-src="{{ goodsInfo.VideoUrl }}" 
      top="{{ navHeight }}"
      show-video="{{showVideo}}"
  />
  ```

  ```js
  goodsInfo: {
  	ImgList: ['xxx.png'], // 图片列表
  	navHeight: 50, // 距离顶部的高度，通过系统获取，自定义导航时才需要，不需要时传0
  	VideoUrl: 'xxx.mp4', // 视频链接，建议使用 mp4，3gp，m3u8  
  },
  showVideo: true, // 控制是否展示视频，由于层级过高的问题，所以需要在有些操作的时候隐藏视频，避免被遮盖
  ```

- **count-down**
  天时分秒倒计时

  ```html
  <count-down start-date="{{ startDate }}" end-date="{{ endStart }}" /count>
  ```

  ```js
  {
      startDate: '2020/10/10', // 开始时间，具体日期时间格式
      endDate: '2020/10/10' // 结束时间，具体日期时间格式
  }
  ```

  

# 【11】小程序问题：

  1 打开体验版小程序时必须打开调试模式

  2 项目开始时请检查所有ip白名单

  3 使用webview时请配置安全域名

  ......

  



###项目相关

江小鱼微信平台

2831448381@qq.com

hme32020



appid:wx6f27923f569192a7





\###研芙小程序资料

小程序

AppID(小程序ID): wx31a7e86c1839437b

AppSecret(小程序密钥): b0e22cd22aca4e3dfe276a4725e09cca

账号：yanzhimiyu777@163.com

密码：yanfu888

公众号账号yanzhimi777@163.com

密码yanfu888



\###神州小程序资料

登录邮箱：szqa20200713@163.com

登录密码：@1234QWER

AppID(小程序ID)wxcfff605b43118f75

AppSecret(小程序密钥)：4e6e4809248cb6dbfbf8630cef1f54d4    

​      