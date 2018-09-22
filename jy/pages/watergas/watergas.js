var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultInfo: '' // 绑定信息
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    // 获得绑定信息
    common.postJson({
      url: '/v2/user/onekey/pull',
      success: function(res) {
        that.setData({
          defaultInfo: res.data
        });
      }
    });

  },

  // 解绑送水信息
  unbind(e) {
    wx.showModal({
      title: '提示',
      content: '您将要解除绑定',
      success(res) {
        if (res.confirm) {
          var type = e.currentTarget.dataset.type
          common.postJson({
            url: '/v2/user/onekey/unbind',
            data: {
              type: type
            },
            success: function(res) {
              wx.showToast({
                title: '解绑成功',
                icon: 'success',
                duration: 2000,
                mask: true,
                success() {
                  setTimeout(function() {
                    //返回之前页面
                    wx.navigateBack();
                  }, 2000)
                }
              })
            }
          });
        }
      }
    })
  },

  // 绑定水店
  bindWater() {
    wx.navigateTo({
      url: '../shopSearch/index?type=WATER',
    })
  },

  // 绑定气店
  bindGas() {
    wx.navigateTo({
      url: '../shopSearch/index?type=COALGAS',
    })
  }
})