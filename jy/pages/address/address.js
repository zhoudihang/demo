var common = require('../../utils/common.js');
var location = require('../../utils/location.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [], // 地址列表
    addressListOnline:[],//在配送范围内
    addressListUnline:[], //不在配送范围内
    sourceRouter: '', //判断上一个页面来源
    location:null,
    adcode:null,
    position:null,
    shopId:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var self = this;
    console.log(options);
    console.log('---------options----------')
    // 获取上一个页面来源；根据来源判断处理
    console.log(decodeURIComponent(options.source));
    console.log(decodeURIComponent(options.source) == "pages/submitOrder/index");
    if (options.source && decodeURIComponent(options.source) == "pages/submitOrder/index") {
      console.log('options.shopId-------'+options.shopId);
      this.setData({
        shopId:options.shopId,
        sourceRouter: "pages/submitOrder/index",
      })
    }
    // 获取定位
    location.getOrUpdateRegeoInfo({
      cache: false,
      success: function(data) {
        self.setData({
          adcode: data.adcode,
          location: data.location,
          position: data.position
        },function(){
          console.log(this.data);
          this.getAddress();
        }.bind(self));
      },
      fail: function(err) {}
    })
  },



  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function(options) {
    this.getAddress();
  },


  getAddress() {
    // 获取地址列表
    var that = this;
    var postdata = {};
    if(this.data.location){
      postdata.location = this.data.location;
    }
    if(this.data.shopId){
      postdata.shopId = this.data.shopId;
    }
    console.log(postdata);
    console.log(this.data);
    common.postJson({
      url: '/v2/user/address/list',
      data: postdata,
      success: function(res) {
        console.log(res);
        var address = res.data;
        var addressListOnline = [];
        var addressListUnline=[];
        for (var i = 0; i < address.length; i++) {
          var olocation = address[i].location;
          var nlocation = olocation.split(',');
          var lat = nlocation[0];
          var lon = nlocation[1];
          address[i].location = lon + ',' + lat;
          var addressJsonStr = JSON.stringify(address[i]);
          address[i].addressJsonStr = addressJsonStr;
          if(address[i].withinRange){
            addressListOnline.push(address[i]);
          }else{
            addressListUnline.push(address[i]);
          }
        }
        that.setData({
          addressList: address,
          addressListOnline:addressListOnline,
          addressListUnline:addressListUnline
        })
      }
    });
  },
  chooseAddress(e) {
    var target = e.currentTarget || e.target;
    var id = target.dataset.id;
    var addressjsonstr = target.dataset.addressjsonstr;
    var sourceRouter = this.data.sourceRouter;
    switch (sourceRouter){
      case "pages/submitOrder/index":
        wx: wx.setStorage({
          key: 'addressId',
          data: id,
          complete: function (res) {
            wx.navigateBack()
          }
        })
      break;
      default:
        wx.navigateTo({
          url: '../editAddress/editAddress?address=' + addressjsonstr
        })
    }

  },
  clickUnline(){
    wx.showToast({
      title: '超出配送地址',
      icon: 'none',
      duration: 2000
    })
  },
  addAddress() {
    wx.navigateTo({
      url: '../editAddress/editAddress',
    })
  }
})