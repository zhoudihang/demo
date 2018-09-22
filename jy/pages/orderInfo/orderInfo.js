var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order: '', // 订单详情
    goodsList_show: '', // 显示的订单货物列表
    goodsList_hide: '', // 隐藏的订单货物列表
    display: true, // 隐藏订单列表
    goto: 'back' // 默认返回上一级
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getOrderInfo(options);
  },

  onUnload() {
    if (this.data.goto == 'index') {
      wx.switchTab({
        url: '../index/index',
      })
    }
  },

  getOrderInfo(options) {
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
        var goodsList = data.data.goodsList;
        var goodsList_show = [];
        var goodsList_hide = [];
        if (goodsList.length <= 5) {
          goodsList_show = goodsList;
        } else {
          for (var i = 0; i < 5; i++) {
            goodsList_show.push(goodsList[i]);
          }
          for (var i = 5; i < goodsList.length; i++) {
            goodsList_hide.push(goodsList[i]);
          }
        }

        if (order.gender == 'FEMALE') {
          order.gender = '女士';
        } else {
          order.gender = '先生';
        }

        if (order.payType == 'CASH') {
          order.payType = '现金支付';
        } else if (order.payType == 'ALIPAY') {
          order.payType = '支付宝支付';
        } else if (order.payType == 'WEIXIN') {
          order.payType = '微信支付';
        } else if (order.payType == 'WXAPP') {
          order.payType = '小程序支付';
        } else if (order.payType == 'BALANCE') {
          order.payType = '余额支付';
        }

        if (order.remark == '') {
          order.remark = '无';
        }

        if (order.shop.logoUrl) {
          order.shop.logoUrl = order.shop.logoUrl + '@scale200';
        }else{
          order.shop.logoUrl = '/images/default_logo.png';
        }

        if (order.user.headUrl) {
          order.user.headUrl = order.user.headUrl + '@scale200';
        }else{
          order.user.headUrl = '/images/default_logo.png';
        }

        console.log(order);

        that.setData({
          order: order,
          goodsList_show: goodsList_show,
          goodsList_hide: goodsList_hide,
          goto: options.goto
        });
      }
    });
  },

  // 显示所有订单
  showAllOrder() {
    this.setData({
      display: false
    });
  },

  // 隐藏隐藏订单
  hideOrder() {
    this.setData({
      display: true
    });
  },

  // 呼叫电话
  callPhone(e) {
    var phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone,
      success: function() {},
      fail: function() {}
    })
  },

  // 再来一单
  gotoShop(e) {
    var shopId = e.currentTarget.dataset.shopid
    wx.navigateTo({
      url: '../store/index?id=' + shopId,
    })
  }
})