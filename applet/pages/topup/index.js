var app = getApp();
var common = require('../../utils/common.js');
var location = require('../../utils/location.js');
Page({
  data: {
    
  },
  // 生命周期函数--监听页面加载
  onLoad: function(options) {
    
  },
  // 页面加载完成显示
  onReady:function(){
    
  },
  // 页面显示加载
  onShow: function(options) {
   
  },

  // 滚动到底部触发事件
  onReachBottom: function() {

  },
  // 下拉刷新
  onPullDownRefresh: function() {
   
  },
  // 初始化加载数据变量
  initload: function() {
    
  },
  navigateToShopSearch: function(TYPE) {
    wx.navigateTo({
      url: '../shopSearch/index?type=' + TYPE,
    })
  },
  navigateTo: function(e) {
    var target = e.currentTarget || e.target;
    if (!target.dataset.uri) {
      return false;
    }
    wx.navigateTo({
      url: target.dataset.uri,
    })
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    return {
      path: 'pages/index/index'
    }
  }
})