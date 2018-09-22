//index.js
//获取应用实例
var app = getApp();
Page({
  data: {
    msg:'',
    route:'',
    redirectTo:false
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var data = this.data;
    var obj = Object.assign({}, data, options)
    this.setData(obj);
    if (options.redirectTo){
      this.onNetworkStatusChange();
    }
    
  },
  // 网络监听
  onNetworkStatusChange() {
    // console.log(this)
    var route = this.data.route;
    return false;
    wx.onNetworkStatusChange(function (res) {
      console.log(res);
      if (res.isConnected) {
        wx.redirectTo({
          url: decodeURIComponent(route),
        })
      }
    })
  }
})