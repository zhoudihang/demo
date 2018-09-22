var common = require('../../utils/common.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    gender: 'MALE',
    addressMsg: [],
    addressName: '',
    location: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 判断添加还是更改收货地址
    if (options.address == undefined) {
      return;
    }
    // 渲染要更改的收货地址的数据
    var address = JSON.parse(options.address);
    var id = address.id;
    var name = address.name;
    var gender = address.gender;
    var tel = address.tel;
    var olocation = address.location;
    var nlocation = olocation.split(',');
    var lat = nlocation[1];
    var lon = nlocation[0];
    var location = lat + ',' + lon;
    var addressName = address.address;
    var address2 = address.address2;
    this.setData({
      id: id,
      name: name,
      gender: gender,
      tel: tel,
      location: location,
      addressName: addressName,
      address2: address2
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 如果收货地址1有数据，则将数据渲染，并格式化经纬度
    var addressMsg = this.data.addressMsg;
    if (addressMsg != '') {
      var address = '';
      address += addressMsg.name;
      var hlocation = addressMsg.location;
      var nlocation = hlocation.split(',');
      var lon = nlocation[0];
      var lat = nlocation[1];
      this.setData({
        addressName: address,
        location: lat + ',' + lon
      })
    }
  },

  // 提交数据
  formSubmit(e) {
    var data = e.detail.value;
    common.postJson({
      url: '/v2/user/address/update',
      data: data,
      success: function(res) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000,
          mask: true,
          success() {
            setTimeout(function() {
              //返回之前页面
              wx.navigateBack();
            }, 2000)
          }
        })
      }
    });
  },

  // 删除地址
  deleteAddress(e) {
    var that = this;
    wx.showModal({
      title: '是否确认删除该地址',
      content: '删除之后无法恢复',
      cancelText: '取消',
      confirmText: '确认',
      confirmColor: '#FF6B67',
      success: function(res) {
        if (res.confirm) {
          var id = e.currentTarget.dataset.id
          common.postJson({
            url: '/v2/user/address/delete',
            data: {
              id: id
            },
            success: function(res) {
              wx.showModal({
                content: '删除成功',
                showCancel: false,
                confirmText: '确认',
                confirmColor: '#FF6B67',
                success: function() {
                  wx.navigateBack();
                }
              })
            }
          });
        } else if (res.cancel) {
          return;
        }
      },
    })
  }
})