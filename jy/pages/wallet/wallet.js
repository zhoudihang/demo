var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '', // 用户详情
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    // 获得个人信息
    common.getUserInfo({

      cache: false,

      success(userInfo) {

        userInfo.balance = (userInfo.balance + 0.00).toFixed(2);

        that.setData({
          userInfo: userInfo
        })

      }
    });

  },
})