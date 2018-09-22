var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: '', // 订单详情
    lineHigh: '', // 线高度
    lineTop: '', // 线上边距
    lineLeft: '', // 线左边距
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var that = this;
    var orderId = options.orderId;
    // 接收order页面传过来的orderId

    // 调用获得订单详情接口
    common.postJson({
      url: '/v2/user/order/detail',
      data: {
        orderId: orderId
      },
      success: function(data) {
        var order = data.data;
        that.setData({
          order: order
        }, function() {
          that.queryMultipleNodes();
        });
      }
    });
  },

  queryMultipleNodes: function() {
    var that = this;
    var query = wx.createSelectorQuery();
    query.selectAll('.line_tips').boundingClientRect().exec(function(res) {
      that.setData({
        lineHigh: res[0][res[0].length - 1].top - res[0][0].top,
        lineLeft: res[0][0].left + 4,
        lineTop: res[0][0].top
      });
    })
  }
})