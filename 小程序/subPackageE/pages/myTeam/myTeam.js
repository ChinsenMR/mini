import { debounce } from "../../../utils/myutil"
const app =  getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:app.data.imgurl,
    navList:[],//导航栏
    activeIndex:0,//导航栏索引值
    joinTimeIcon: 0,
    totalPriceIcon: 0,
    empolyIcon: 0,
    obj:{
      sortOrder:'CreateDate',
      sortBy: false,//排序方式 true为倒序 false升序
    },
    keyVal:'',//搜索值
    list:[],//数据
    showTip:false,
    projectName:''
  },
  page:{
    index:1,
    size:10,
  },
  total:1,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.setTitle(app.data.projectName == '青创智选' ? '我的团队' : '门店会员')
    this.setData({
      projectName: app.data.projectName
    })
    this.getNavList();
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  
  //获取导航栏
  getNavList(){
    const {activeIndex,keyVal,obj} = this.data;
    app.$api.referralGrades({
      NotKjLevel:false,//	否	bool	代理下属级别true分销下属级别false
    }).then(res=>{
      if(res.success){
        let arr = res.Data;
        console.log("导航栏",arr);
        arr.forEach(v=>{
          v.Name = `${v.Name}(${v.ReferralCount})`
        })
        this.setData({
          navList:arr
        })
        this.mySubMembers(activeIndex, keyVal, obj);
      }
    })
  },

  // 导航栏切换
  selectTabbar(e){
    let { keyVal,obj } = this.data
    const { index, title } = e.detail;
    this.setData({
      list:[],
      activeIndex:index
    })
    this.mySubMembers(index,keyVal,obj);
  },
  //排序
  attrSort: function (e) {
    let { id } = e.currentTarget.dataset;
    let { joinTimeIcon, totalPriceIcon, empolyIcon, keyVal, activeIndex} = this.data, obj = {};
    if (id == 1) {
      joinTimeIcon = joinTimeIcon == 0 ? 1 : (joinTimeIcon == 1 ? 2 : 0)
      if (joinTimeIcon != 0) {
        obj.sortOrder = joinTimeIcon == 1 ? false : true
        obj.sortBy = 'CreateDate'
      }
    }
    if (id == 2) {
      totalPriceIcon = totalPriceIcon == 0 ? 1 : (totalPriceIcon == 1 ? 2 : 0)
      if (totalPriceIcon != 0) {
        obj.sortOrder = totalPriceIcon == 1 ? false : true
        obj.sortBy = 'SubSumOrderTotal'
      }
    }
    if (id == 3) {
      empolyIcon = empolyIcon == 0 ? 1 : (empolyIcon == 1 ? 2 : 0)
      if (empolyIcon != 0) {
        obj.sortOrder = empolyIcon == 1 ? false : true
        obj.sortBy = 'SubMemberAllSplittin'
      }
    }
    this.setData({
      list:[],
      joinTimeIcon,
      totalPriceIcon,
      empolyIcon,
      obj
    })
    this.mySubMembers(activeIndex, keyVal,obj)
  },
  

  //获取代理下属
  mySubMembers(index,val,obj){
    const { navList, keyVal } = this.data;
    app.$api.mySubMembers({
      pageSize:10,//	是	string	当前页显示数量，默认20
      pageIndex:this.page.index,//	是	string	当前页数默认1
      // UserId: obj.userid || '',	//否	int	用户ID
      search: val || keyVal || '',//	否	string	搜索关键词
      SortBy: obj.sortBy || '',//	否	string	排序字段（CreateDate加入时间 SubSumOrderTotal消费总额 SubMemberAllSplittin贡献佣金）
      SortOrder: obj.sortOrder || '',//	否	bool	排序方式 true为倒序 false升序
      GradeId: navList[index].GradeId,//	否	int	代理级别ID
    }).then(res=>{
      if (res.success){
        let agencyObj = res;
        let arr = agencyObj.MySubUsersList;
        let newArr = []
        if (agencyObj.MySubUsersList) {
          if (!agencyObj.MySubUsersList.length == 0) agencyObj.MySubUsersList = [];
          arr.forEach(v => {
            if (!v.Picture.includes('https' || 'http')) {
              v.Picture = app.data.url + v.Picture
            }
          })
          
          newArr = [...this.data.list, ...arr];
        }
        // agencyObj.ExpandMemberAll = obj.ExpandMemberAll
        // agencyObj.NextMemberTotal = obj.NextMemberTotal
        // agencyObj.SplittinTotal = obj.SplittinTotal
        this.setData({
          agencyObj,
          list: newArr
        })
        
      }
    })
  },
  //搜索
  search: debounce(function(e){
    let { value } = e.detail;
    this.initData({
      keyVal: value
    })
  },300),
  //点击搜索
  handleSearch(e){
    const {keyVal,activeIndex,obj} = this.data;
    this.mySubMembers(activeIndex, keyVal,obj);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    const { activeIndex, keyVal, obj, list } = this.data;
    if ( list.length <= this.page.size) {
      this.setData({showTip:true})
    } else {
      this.page.index++
      this.mySubMembers(activeIndex, keyVal, obj);
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})