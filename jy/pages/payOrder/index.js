var common = require('../../utils/common.js');
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  /*
  CASH=货到付款/现金支付
  WXAPP=微信支付
  BALANCE=余额
  */
  data: {
    isNoPay: true,
    payType: 'BALANCE', //支付类型 、默认余额
    payList: [
      {
        name: '余额',
        payType: 'BALANCE'
      },
      {
        name: '微信支付',
        payType: 'WXAPP'
      },
      {
        name: '货到付款',
        payType: 'CASH'
      }
    ],
    payPassword: '', //已输入密码个数
    price: 0,
    orderId: 0,
    focus: true,
    passwordIsShow: false,
    order: '', // 订单信息，发推送时使用
    storename:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('-------options----------');
    console.log(options);
    this.setData({
      price: options.fee,
      orderId: options.orderId,
      storename:options.storename
    })
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
  choosePayType(e) {
    var peytype = e.currentTarget.dataset.type;
    this.setData({
      payType: peytype
    })
  },
  // 关闭密码输入框
  closePassword() {
    this.setData({
      passwordIsShow: false
    })
  },
  // 输入密码
  pushPassword(e) {
    if (e.detail.value.length === 6) {
      wx.showLoading({
        title: '支付中...',
        mask: true
      })
      this.setData({
        payPassword: e.detail.value,
        passwordIsShow: false
      })
      this.payPost(e.detail.value);
    } else {
      this.setData({
        payPassword: e.detail.value,
      })
    }

  },
  /*
  CASH=货到付款/现金支付
  WXAPP=微信支付
  BALANCE=余额
  */
  // 用户下单 去结算
  submitOrder() {
    var payType = this.data.payType;
    switch (payType) {
      case 'BALANCE': //余额支付
        this.setData({
          passwordIsShow: true,
          focus: true
        })
        break;
      case 'CASH': //货到付款/现金支付
        this.payPost('CASH');
        break;
      case 'WXAPP': //微信支付
        this.wxPay();
        break;
    }
  },
  // 
  wxPay() {
    var that = this;
    wx.login({
      success(res) {

        common.postJson({
          url: '/wxpay/xcxGetUser',
          data: {
            code: res.code
          },
          success(results) {
            var openid = results.data;
            common.postJson({
              url: '/v2/user/order/pay',
              data: {
                orderId: that.data.orderId,
                payType: that.data.payType,
                openid: openid
              },
              success(info) {
                var package_ = info.data.xcxInfo.package;
                wx.requestPayment({
                  'timeStamp': info.data.xcxInfo.timeStamp,
                  'nonceStr': info.data.xcxInfo.nonceStr,
                  'package': package_,
                  'signType': info.data.xcxInfo.signType,
                  'paySign': info.data.xcxInfo.paySign,
                  'success': function(res) {

                    // 消息推送
                    that.push(openid, package_);

                    wx.showToast({
                      title: '支付成功',
                      icon: 'success',
                      duration: 2000,
                      success() {
                        wx.redirectTo({
                          url: '../orderInfo/orderInfo?goto=index&orderId=' + that.data.orderId
                        })
                      }
                    });
                  },
                  'fail': function(res) {}
                })
              }
            });
          }
        });
      }
    })
  },
  // v2/user/order/pay
  //  密码支付 
  payPost(payPassword) {
    var orderId = this.data.orderId;
    var payType = this.data.payType;
    var payPassword = payPassword ? payPassword : this.data.payPassword;
    this.setData({
      payPassword: ''
    })
    var obj = {
      orderId: orderId,
      payType: payType,
      payPassword: payPassword
    };
    if (payPassword === 'CASH') {
      delete obj.payPassword;
    }
    common.postJson({
      url: '/v2/user/order/pay',
      data: obj,
      success: function(data) {
        console.log('--------------data-------------------');
        console.log(data)
        wx.hideLoading();
        wx.redirectTo({
          url: '../orderInfo/orderInfo?goto=index&orderId=' + orderId
        })
      },
      fail: function(err) {
        console.log('--------------err-------------------');
        console.log(err)
        wx.hideLoading();
        wx.showModal({
          title: '温馨提示',
          content: JSON.parse(err.data).msg,
          confirmText:'去充值',
          success:function(res){
            if(res.confirm){
               wx.navigateTo({
                 url:'/pages/wallet/wallet'
               })
            }
          }
        })
      }
    })
  },
  // 弹出并返回上一个页面
  showModal(content, callback) {
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false,
      complete: function() {
        wx.navigateBack({
          delta: 1
        })
      }
    });
  },
  // 页面跳转到
  navigateTo(e) {
    var target = e.currentTarget || e.target;
    if (!target.dataset.uri) {
      return false;
    }
    wx.navigateTo({
      url: target.dataset.uri,
    })
  },

  // 消息模板推送
  push(openid, package_) {
    package_ = package_.replace("prepay_id=", "");
    var order = '';
    var that = this;
    // 获取订单信息进行推送
    common.postJson({
      url: '/v2/user/order/detail',
      data: {
        orderId: this.data.orderId
      },
      success: function(data) {
        order = data.data;
        common.postJson({
          url:'/wxpay/xcxAccessToken',
          success(res){
            wx.request({
              url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + res.data.xcxToken,
              method: 'POST',
              data: {
                "touser": openid,
                "template_id": "T_kFkcvRmjg7G8F2Z1SG6Je3CH6ndQIKDgW4vWbTIE8",
                "page": "pages/index/index",
                "form_id": package_,
                "data": {
                  "keyword1": {
                    "value": (order.fee + 0.00).toFixed(2)
                  },
                  "keyword2": {
                    "value": order.name
                  },
                  "keyword3": {
                    "value": order.address + order.address2
                  },
                  "keyword4": {
                    "value": order.number
                  },
                  "keyword5": {
                    "value": order.orderTime
                  }
                },
              },
              success: function (res) {
                console.log("发送成功");
              },
              fail: function (err) {
                // fail  
                console.log("push err")
                console.log(err);
              }
            })
          }
        });
      },
    });

  },
})