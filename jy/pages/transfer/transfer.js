var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '', // 个人信息
    transferMoney: '', // 提现金额
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    // 获得个人信息
    common.getUserInfo({

      cache: false,

      success(userInfo) {

        userInfo.balance = (userInfo.balance + 0.00).toFixed(2);

        if (!userInfo.hasPayPassword){
          wx.showModal({
            title: '提示',
            content: '您未设置支付密码',
            success: function (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../phone/phone?type=password&mobile='+userInfo.mobile,
                })
              } else if (res.cancel) {
                wx.navigateBack();
              }
            }
          })
        }

        that.setData({
          userInfo: userInfo
        })

      }
    });
  },

  // 获取微信用户信息
  getUserInfo(e) {

    wx.login({
      success(res) {

        if (!e.detail.encryptedData || !e.detail.iv) {
          wx.showModal({
            title: '用户未授权',
            content: '如需正常使用微信登录，请不要拒绝微信授权。',
            showCancel: false
          })
          return;
        }

        common.postJson({
          url: '/wxpay/xcxGetUser',
          data: {
            code: res.code,
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv
          },
          success(results) {
            var wxUserJson = JSON.parse(results.data);
            wxUserJson.openid = wxUserJson.openId;
            wxUserJson.unionid = wxUserJson.unionId;
            wx.navigateTo({
              url: '../password/password?type=bind&wxUser=' + JSON.stringify(wxUserJson),
            })
          }
        });
      }
    })
  },

  //获取验证码文本框输入的值
  input_money: function(e) {
    var money = e.detail.value;
    money = money.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符   
    money = money.replace(/\.{2,}/g, ".").replace(".", "$#$").replace(/\./g, "").replace("$#$", "."); //只保留第一个. 清除多余的 
    money = money.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
    if (money.indexOf(".") < 0 && money != "") { //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额  
      money = parseFloat(money);
    }
    this.setData({
      transferMoney: money
    })
  },

  // 全部提现
  getAll() {
    this.setData({
      transferMoney: this.data.userInfo.balance
    });
  },

  // 提现
  transfer() {
    var that = this;
    var transferMoney = that.data.transferMoney
    if (transferMoney == '') {
      wx.showModal({
        title: '提示',
        content: '请输入提现金额',
        showCancel: false
      })
      return;
    }
    if (transferMoney < 10) {
      wx.showModal({
        title: '提示',
        content: '提现金额必须大于10元',
        showCancel: false
      })
      return;
    }
    wx.showModal({
      title: '提示',
      content: '提现需要收取一定手续费' + that.data.userInfo.userRaxRate + '%，手续费由第三方收取，免啦不收取任何手续费，望周知！',
      success: function(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '../password/password?type=transfer&money=' + transferMoney + '&nickName=' + that.data.userInfo.wxUser.nickName,
          })
        } else if (res.cancel) {}
      }
    })
  }
})