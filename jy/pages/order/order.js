var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0, // 顶部页签选择
    pageNo: 1, // 当前页数
    type: '', // 查看订单类型
    display: true, // 判断上拉是否还有订单&&隐藏下拉刷新
    noData: false, // 判断是否有返回数据
    orderList: [], // 订单列表 
    cancelList: ['其他', '商家不接单', '不小心点错了', '商家配送太慢'], // 取消订单的原因
    orderId: '', // 订单id
    reason: '', // 取消原因
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onShow: function() {
    this.setData({
      currentTab: 0, // 顶部页签选择
      pageNo: 1, // 当前页数
      type: '', // 查看订单类型
      display: true, // 判断上拉是否还有订单&&隐藏下拉刷新
      noData: false, // 判断是否有返回数据
      orderList: [], // 订单列表 
      cancelList: ['其他', '商家不接单', '不小心点错了', '商家配送太慢'], // 取消订单的原因
      orderId: '', // 订单id
      reason: '', // 取消原因
    })
    var pageNo = 1;
    var type = this.switchType();
    wx.showLoading({
      title: '加载中',
    })

    this.getOrderList(pageNo, type);

    setTimeout(function() {
      wx.hideLoading();
    }, 1000);
  },

  //滑动切换
  swiperTab: function(e) {

    var that = this;
    that.setData({
      currentTab: e.detail.current,
      orderList: []
    });
    var pageNo = 1;
    var type = this.switchType();
    wx.showLoading({
      title: '加载中',
      mask: true
    })

    this.getOrderList(pageNo, type);

    setTimeout(function() {
      wx.hideLoading();
    }, 1000);
  },
  //点击切换
  clickTab: function(e) {

    var that = this;
    if (this.data.currentTab === e.currentTarget.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.currentTarget.dataset.current,
        orderList: []
      })
      var pageNo = 1;
      var type = this.switchType();
      wx.showLoading({
        title: '加载中',
      })

      this.getOrderList(pageNo, type);

      setTimeout(function() {
        wx.hideLoading();
      }, 1000);
    }
  },




  // 取消订单
  cancelOrder(e) {

    var that = this;
    var cancelList = that.data.cancelList;
    wx.showActionSheet({
      itemList: cancelList,
      itemColor: '#ff6b67',
      success: function(res) {
        that.setData({
          reason: cancelList[res.tapIndex],
          orderId: e.currentTarget.dataset.orderid
        })

        var reason = that.data.reason
        var orderId = that.data.orderId;
        // 调用取消订单接口
        common.postJson({
          url: '/v2/user/order/cancel',
          data: {
            orderId: orderId,
            reason: reason
          },
          success: function(res) {
            wx.showToast({
              title: '订单取消成功',
              icon: 'success',
              mask: true
            })
            var pageNo = 1;
            var type = that.switchType();
            wx.showLoading({
              title: '加载中',
            })

            that.getOrderList(pageNo, type);

            setTimeout(function() {
              wx.hideLoading();
            }, 1000);
          }
        });

      }
    })


  },

  // 识别查看订单类型
  switchType() {
    var type;
    switch (this.data.currentTab) {
      case 0:
      case "0":
        type = 'ALL';
        break;
      case 1:
      case "1":
        type = 'EVAL'
        break;
      case 2:
      case "2":
        type = 'REFUND'
        break;
    }
    return type;
  },

  // 获取订单列表
  getOrderList(pageNo, type) {
    var that = this;

    // 调用获取订单列表接口
    common.postJson({
      url: '/v2/user/order/pull',
      data: {
        pageNo: pageNo,
        type: type
      },
      success: function(res) {

        var data = res.data;
        var timestamp1 = new Date().getTime();
        for (var i = 0; i < data.length; i++) {
          var finishTime = data[i].finishTime;
          if (finishTime != null) {
            var date = finishTime.replace(/-/g, '/');
            var timestamp2 = new Date(date).getTime();
            if (timestamp2 + 7 * 24 * 3600 * 1000 > timestamp1) {
              data[i].ableGrade = true;
            } else {
              data[i].ableGrade = false;
            }
          }
        }

        console.log(data);

        // 如果没有数据，则展示无数据引导图
        if (pageNo == 1 && data.length == 0) {
          that.setData({
            noData: true
          })
        }

        // 如果返回结果没有数据了，则弹窗提示
        if (pageNo != 1 && data.length == 0) {
          that.setData({
            display: false
          })
        }

        // 将上拉刷新返回的数据拼接在一起
        if (pageNo != 1) {
          data = that.data.orderList.concat(data);
        }

        that.setData({
          pageNo: pageNo + 1, // 每次成功调用后，行号＋1（与后台统一，页面大小为20）
          orderList: data,
        });

      },
      fail() {
        that.setData({
          noData: true
        })
      },
      nologin() {
        that.setData({
          noData: true
        })
        wx.showModal({
          title: '需要登录',
          content: '您未登录，或登录超时',
          cancelText: '关闭',
          confirmText: '登录',
          success: function(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/phone/phone?type=login'
              })
            }
          }
        })
      }
    });
  },

  // 去逛逛
  gotoIndex() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  // 触底
  lower() {

    if (!this.data.display) {
      return;
    }

    // 显示loading效果
    wx.showLoading({
      title: '加载中'
    })
    // 0.5秒去掉loading效果
    setTimeout(function() {
      wx.hideLoading()
    }, 500)
    // 触底上拉再次调用获取订单列表接口
    var pageNo = this.data.pageNo;
    var type = this.switchType();
    this.getOrderList(pageNo, type);
  },

  // 下拉刷新
  top() {
    var that = this;
    wx.showNavigationBarLoading();
    that.setData({
      display: false
    });
    setTimeout(function() {
      var pageNo = 1;
      var type = that.switchType();
      that.getOrderList(pageNo, type);
      that.setData({
        display: true
      });
      wx.hideNavigationBarLoading();
    }, 2000)
  },

  // 跳转到订单详情
  orderDetail(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../orderInfo/orderInfo?goto=back&orderId=' + id,
    })
  },

  // 再来一单
  gotoShop(e) {
    var shopId = e.currentTarget.dataset.shopid
    wx.navigateTo({
      url: '../store/index?id=' + shopId,
    })
  },

  // 评价
  gotoComment(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../comment/comment?orderId=' + id,
    })
  },

  // 退款详情
  gotoRefund(e) {
    var id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../refund/refund?orderId=' + id,
    })
  }
})