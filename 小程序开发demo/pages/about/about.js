var app = getApp();
var common = require('../../utils/common.js');
var host = app.data.services;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    version: app.data.version
  },
  // 功能介绍
  function_introduce() {
    wx.navigateTo({
      url: '../h5/h5?src=' + host + '/v2/h5/introduce/introduce_user_list.html',
    })
  },

  // 服务协议
  service_protocol() {
    wx.navigateTo({
      url: '../h5/h5?src=' + host + '/v2/h5/agreement/agreement_licenseAndService.html',
    })
  },

  // 隐私协议
  privacy_protocol() {
    wx.navigateTo({
      url: '../h5/h5?src=' + host + '/v2/h5/agreement/agreement_privacy.html',
    })
  }

})