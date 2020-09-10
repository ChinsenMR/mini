import regeneratorRuntime from '../../utils/runtime';
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: app.data.imgurl,
    allList:[],//所有的导航栏
    navList:[],//导航栏
    sonList:[],
    tagIndex:0,//子集对应的id
    nums:0,
    imgSrc: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2225612955,2263330271&fm=26&gp=0.jpg'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInit();
    // this.getShareSelfTags();
  },
  onShow:function (){

  },

  //获取素材数据
  async getInit(){
    let res = await app.$api.shareSelfTags();
    if(res.success){
      let arr = res.Data;
      let nav = [], sonList = [];
      arr.forEach(v => {//筛选父级类目
        console.log("父级类目", v);
        if (v.ParentTagId == 0) {
          nav.push(v)
        }
      })

      arr.forEach(v => {//筛选子集类目
        nav.forEach(item => {
          if (item.TagID == v.ParentTagId && v.ParentTagId > 0 || item.TagID == v.ParentTagId && v.nodelevel == 2) {
            sonList.push(v)
          }
        })
      })
      this.setData({
        tagIndex: nav[0].TagID,
        navList: nav,
        allList: arr,
        sonList
      })
    }
  },

  //切换导航栏
  handleNav(e){
    const { index, tagid} = e.currentTarget.dataset;
    this.setData({
      nums:index,//用于导航栏
      tagIndex: tagid,//用于切换对应得子集
    })
  },

  //跳转素材朋友圈
  handleGo(e){
    const { tagid } = e.currentTarget.dataset;
    app.goTo(`/pages/material/material?tagid=${tagid}`)
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

  },

})