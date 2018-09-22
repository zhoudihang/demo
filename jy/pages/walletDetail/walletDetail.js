var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    record: '', //记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    common.postJson({
      url: '/v2/user/wallet/detail',
      data: {
        recordId: options.recordId
      },
      success: function(res) {
        var record = res.data;
        console.log(record);
        // console.log('------------------record----------------');
        // return false;
        // 在线支付/余额提现/账号充值/提现退款/订单退款
        switch (record.type) {
          case "INCOME":
            record.type = '收入'
            break;
          case "EXPEND":
            record.type = '支出'
            break;
          case "REFUND":
            record.type = '退款'
            break;
          case "TOPUP":
            record.type = '充值'
            break;
        }

        switch (record.payType) {
          case "ALIPAY":
            record.payremrk = '支付宝'
            break;
          case "WEIXIN":
            record.payremrk = '微信支付'
            break;
          case "WXAPP":
            record.payremrk = '小程序'
            break;
          case "BALANCE":
            record.payremrk = '余额'
            break;
          default:
            record.payremrk = record.remark;
            break;
        }

        record.moneyAfter = (record.moneyAfter + 0.00).toFixed(2);
        record.money = (record.money + 0.00).toFixed(2);
        if (record.money > 0) {
          record.money = '+' + record.money;
        }

        that.setData({
          record: record
        });

      }
    });
  },

})