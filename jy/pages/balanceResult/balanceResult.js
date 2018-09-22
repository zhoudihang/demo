Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: '', // 金额
    type: '', // 动作类型：充值/提现
    account: '', // 提现账号昵称
    charge: '', // 手续费
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    switch (options.type) {
      case "topup":
        this.setData({
          type: options.type,
          money: options.money
        });
        break;
      case "transfer":
        this.setData({
          type: options.type,
          account: options.account,
          money: options.money,
          account: options.account,
          charge: options.charge
        });
        break;
    }

  },

  // 去首页
  gotoIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  // 去钱包记录
  gotoWalletList() {
    wx.navigateTo({
      url: '../walletList/walletList',
    })
  }
})