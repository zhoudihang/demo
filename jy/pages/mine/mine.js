var common = require('../../utils/common.js');

Page({
  data: {
    userInfo: '' // 所有个人信息
  },

  onShow: function() {
    var that = this;

    // 获得个人信息
    common.getUserInfo({

      success(userInfo) {

        if (userInfo.headUrl) {
          userInfo.headUrl = userInfo.headUrl + "@scale200";
        } else {
          userInfo.headUrl = "/images/default_head.png";
        }

        that.setData({
          userInfo: userInfo
        })

      },
      nologin: function() {
        // 什么都不做
        console.warn("用户未登录");
        that.setData({
          userInfo: ''
        })
      }
    });

  },

  // 呼叫电话
  callPhone() {
    wx.makePhoneCall({
      phoneNumber: '18666929877',
      success: function() {},
      fail: function() {}
    })
  },

  // 跳转我的免单
  gotoRecord() {
    wx.navigateTo({
      url: '../winRecord/winRecord',
    })
  },

  // 跳转到个人资料
  gotoInfo() {
    var info = this.data.userInfo;
    wx.navigateTo({
      url: '../userInfo/userInfo',
    })
  },
  share(){
    if (wx.getStorageSync("token")) {
      wx.navigateTo({
        url: '../share/index',
      })
    } else {
      wx.navigateTo({
        url: '/pages/phone/phone?type=login'
      })
    }
  }


})