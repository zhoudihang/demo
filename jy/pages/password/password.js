var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    focus: true, // 密码框焦点
    password: '', //已输入密码个数
    smscode: '', // 验证码
    type: '', // 密码事件类型
    wxUser: '', // 微信用户信息
    money: '', // 提现金额
    nickName: '', // 提现账号昵称
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    switch (options.type) {
      case 'set':
        wx.setNavigationBarTitle({
          title: '设置支付密码'
        })
        this.setData({
          type: options.type,
          smscode: options.smscode,
        });
        break;
      case 'bind':
        wx.setNavigationBarTitle({
          title: '输入支付密码'
        })
        this.setData({
          type: options.type,
          wxUser: JSON.parse(options.wxUser)
        });
        break;
      case 'transfer':
        wx.setNavigationBarTitle({
          title: '输入支付密码'
        })
        this.setData({
          type: options.type,
          money: options.money,
          nickName: options.nickName
        });
        break;
    }
  },

  // 密码框获取焦点
  getFocus() {
    if (this.data.focus) {
      return false;
    }
    this.setData({
      focus: true
    })
  },
  // 密码框失去焦点时
  inputblur() {
    this.setData({
      focus: false
    })
  },

  // 输入密码
  pushPassword(e) {
    if (e.detail.value.length === 6) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      this.setData({
        password: e.detail.value,
      })
      if (this.data.type == 'set') {
        this.updatePassword();
      } else if (this.data.type == 'bind') {
        this.bindAccount();
      } else if (this.data.type == 'transfer') {
        this.transferMoney();
      }
    } else {
      this.setData({
        password: e.detail.value,
      })
    }

  },

  // 更新支付密码
  updatePassword() {

    common.postJson({
      url: '/v2/user/account/updatePassword',
      data: {
        smscode: this.data.smscode,
        type: 'PAY',
        payPassword: this.data.password
      },
      success: function(res) {

        wx.showToast({
          title: '更改成功',
          icon: 'success',
          duration: 1000,
          mask: true,
          success() {
            setTimeout(function() {
              wx.navigateBack({
                delta: 2
              })
            }, 1000)
          }
        })
      },
      complete() {
        wx.hideLoading();
      }
    });
  },

  // 校验支付密码
  bindAccount() {
    common.postJson({
      url: '/v2/user/wallet/bindAccount',
      data: {
        payPassword: this.data.password,
        accountType: 'WEIXIN',
        wxUser: this.data.wxUser
      },
      success: function(res) {
        wx.navigateTo({
          url: '../transfer/transfer',
        })
      },
      complete() {
        wx.hideLoading();
      }
    });
  },

  // 转账
  transferMoney() {
    var account = this.data.nickName;
    common.postJson({
      url: '/v2/user/wallet/transfer',
      data: {
        payPassword: this.data.password,
        accountType: 'WEIXIN',
        money: this.data.money
      },
      success: function(res) {
        var charge = res.data.record.serviceCharge;
        wx.navigateTo({
          url: '../balanceResult/balanceResult?type=transfer&account=' + account + '&money=' + this.data.money + '&charge=' + charge,
        })
      },
      complete() {
        wx.hideLoading();
      }
    });
  }
})