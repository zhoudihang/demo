var common = require('../../utils/common.js');
var QRCode = require('../../utils/weapp-qrcode.js')
var qrcode;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    record: '', // 中奖记录详情
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var that = this;

    that.getRecordDetail(options.freemealId, function() {
      qrcode = new QRCode('canvas', {
        text: that.data.record.code,
        width: 150,
        height: 150,
        colorDark: "black",
        colorLight: "white",
        correctLevel: QRCode.CorrectLevel.H,
      });
    });
  },

  // 获取中奖详情
  getRecordDetail(freemealId, callback) {
    var that = this;

    // 调用获取订单列表接口
    common.postJson({
      url: '/v2/user/freemeal/myrecord/detail',
      data: {
        freemealId: freemealId
      },
      success: function(res) {
        var data = res.data;

        console.log(data);

        that.setData({
          record: data,
        });

        callback();
      }
    });
  }
})