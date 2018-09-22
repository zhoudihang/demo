//index.js
//获取应用实例
var app = getApp();
var common = require('../../utils/common.js');
// var location = require('../../utils/location.js');
Page({
  data: {
    history: [] //历史搜索记录
  },

  // 页面显示时触发
  onShow: function(options) {
    try {
      var value = wx.getStorageSync('search_history');
      if (value) {
        this.setData({
          history: JSON.parse(value) // 获取历史记录
        })
        // Do something with return value
      }
    } catch (e) {
      // Do something when catch error
    }
  },

  // 输入关键字
  bindinputKeyWord: function(e) {
    this.setData({
      keyword: e.detail.value
    })
  },
  // 绑定输入框输入关键字
  bindconfirm: function(e) {
    if (e.detail.value.replace(/^\s|\s$/g, '') === '') {
      return false;
    }
    this.setData({
      keyword: e.detail.value
    })
    this.submitSearch();
  },
  // 点击历史搜索跳转到搜索页面
  historyli: function(e) {
    // var keyword = e.currentTarget.dataset.keyword;

    this.setData({
      keyword: e.currentTarget.dataset.keyword
    })
    this.submitSearch();
  },
  // 点击搜索按钮跳转到搜索页面
  submitSearch: function() {
    var keyword = this.data.keyword;
    if (keyword != undefined && keyword != '') {
      // 获取历史记录
      try {
        var value = wx.getStorageSync('search_history');
        if (value) {
          value = JSON.parse(value);
          for (var i = 0; i < value.length; i++) {
            if (value[i] == keyword) {
              value.splice(i, 1);
            }
          }
          value.unshift(keyword);
          // 存储历史记录
          wx.setStorageSync('search_history', JSON.stringify(value))
          // Do something with return value
        } else {
          wx.setStorageSync('search_history', JSON.stringify([keyword]))
        }
      } catch (e) {
        wx.setStorageSync('search_history', JSON.stringify([keyword]))
        // Do something when catch error
      }
      this.navigateTo(keyword);
    }
  },
  // 页面跳转到
  navigateTo: function(keyword) {
    wx.navigateTo({
      url: '../shopSearch/index?keyword=' + keyword
    })
  },
  // 移除历史记录
  removehistory: function() {
    try {
      wx.removeStorageSync('search_history');
      this.setData({
        history: []
      })
    } catch (e) {
      // Do something when catch error
    }
  }
})