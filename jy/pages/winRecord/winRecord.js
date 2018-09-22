var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recordList: [], // 中奖记录列表
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.getRecordList();
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.getRecordList();
    
  },

  // 获取中奖记录列表
  getRecordList() {
    var that = this;

    // 调用获取订单列表接口
    common.postJson({
      url: '/v2/user/freemeal/myrecord/pull',
      data: {
        onlyWinner: true
      },
      success: function(res) {
        wx.stopPullDownRefresh();
        var data = res.data;

        for (var i = 0; i < data.length; i++) {
          for (var j = 0; j < data[i].joinRecordList.length; j++) {
            data[i].joinRecordList[j].freemealProduct.pictureUrl = data[i].joinRecordList[j].freemealProduct.pictureUrl + "@scale200";
          }
        }

        console.log(data);

        that.setData({
          recordList: data,
        });
      }
    });
  },

  // 跳转到详情
  gotoDetail(e) {
    wx.navigateTo({
      url: '../winDetail/winDetail?freemealId=' + e.currentTarget.dataset.id,
    })
  },

  // 激活
  active(e) {
    wx.showModal({
      title: '提示',
      content: '是否激活该商品',
      cancelText: '取消',
      confirmText: '确定',
      success: function(res) {
        if (res.confirm) {
          common.postJson({
            url: '/v2/user/freemeal/myrecord/active',
            data: {
              freemealId: e.currentTarget.dataset.id
            },
            success() {
              wx.navigateTo({
                url: '../winDetail/winDetail?freemealId=' + e.currentTarget.dataset.id,
              })
            },
            fail:function(err){
                console.log(err)
              var failres = JSON.parse(err.data);
              if (failres.code===202){
                  wx.showModal({
                    title: '温馨提示',
                    content: '' + failres.msg,
                    cancelText: '取消',
                    confirmText: '去邀请',
                    success: function (res) {
                      if (res.confirm) {
                        wx.navigateTo({
                          url: '/pages/share/index',
                        })
                      }
                    }  
                  })
                }
            }

          });
        }
      }
    })
  },

  // 去兑换
  exchange(e) {
    wx.navigateTo({
      url: '../winDetail/winDetail?freemealId=' + e.currentTarget.dataset.id,
    })
  }
})