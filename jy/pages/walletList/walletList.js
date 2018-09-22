var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    walletList: [], // 钱包流水列表
    lastId: 0, // 最后一条记录ID
    isloaded:false,//是否加载完成
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function(lastId) {
    this.pullWalletList(this.data.lastId);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showLoading({
      title: '加载中'
    })
    // 0.5秒去掉loading效果
    setTimeout(function() {
      wx.hideLoading()
    }, 500)
    this.pullWalletList(0);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    wx.showLoading({
      title: '加载中'
    })
    // 0.5秒去掉loading效果
    setTimeout(function() {
      wx.hideLoading()
    }, 500)
    this.pullWalletList(this.data.lastId);
  },

  pullWalletList(lastId) {
    var that = this;
    common.postJson({
      url: '/v2/user/wallet/pull',
      data: {
        onlyTopup: false,
        lastId: lastId
      },
      success: function(res) {
        wx.stopPullDownRefresh();
        var data = res.data.list;
        console.log(data);
        console.log('---------data----------------');
        for (var i = 0; i < data.length; i++) {
          switch (data[i].type) {
            case "INCOME":
              data[i].type = '收入'
              break;
            case "EXPEND":
              data[i].type = '支付'
              break;
            case "REFUND":
              data[i].type = '退款'
              break;
            case "TOPUP":
              data[i].type = '充值'
              break;
          }
          switch (data[i].payType) {
          case "ALIPAY":
            data[i].payremrk = '支付宝'
            break;
          case "WEIXIN":
            data[i].payremrk = '微信支付'
            break;
          case "WXAPP":
            data[i].payremrk = '小程序'
            break;
          case "BALANCE":
            data[i].payremrk = '余额'
            break;
          default:
            data[i].payremrk = data[i].remark;
            break;
        }
          data[i].moneyAfter = (data[i].moneyAfter + 0.00).toFixed(2);
          data[i].money = (data[i].money + 0.00).toFixed(2);
          if (data[i].money > 0) {
            data[i].money = '+' + data[i].money;
          }
        }


        // 如果返回结果没有数据了，则弹窗提示
        // if (lastId != 0 && data.length == 0) {
        // }

        // 将上拉刷新返回的数据拼接在一起
        if (lastId != 0) {
          data = that.data.walletList.concat(data);
        }
        var obj = {
          walletList: data,
          lastId: data.length ? data[data.length - 1].id : 0
        }
        if(!data.length){
          obj.isloaded = true;
        }
        that.setData(obj);

      }
    });
  }
})