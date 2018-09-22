//index.js
//获取应用实例
var app = getApp();
var common = require('../../utils/common.js');
var location = require('../../utils/location.js');

Page({
  data: {
    isFirstLoad: true, //判断是否是第一次加载
    //页面显示数据 //先加载缓存数据
    res: {},
    PullDownRefresht: 0, //下拉刷新间隔、小于3000ms 不刷新 时间戳
    star: 5, //店铺星星
    adcode: 440402, //设置默认adcode
    location: "22.223436,113.553569", //设置默认location
    cityName: '定位中...', //城市名
    page: 1, //加载页数
    isloading: false, //是否正在加载数据动作
    titletime: 1,
    isloaded: false //是否已经加载全部数据
  },
  // 生命周期函数--监听页面加载
  onLoad: function() {
    wx.showLoading({
      title: '加载中...',
    })
    var self = this;
    this.getData();
    // if (city && city != '') {
    //   this.reLoadJson(city);
    // } else {
    //   this.getData();
    // }
  },

  // 滚动到底部触发事件
  onReachBottom: function() {
    this.loadjsondata();
  },

  // 下拉刷新
  onPullDownRefresh: function() {
    var data = this.data;
    this.initload();
    this.loadjson(data.adcode, data.location, 1);
  },

  // 初始化加载数据变量
  initload: function() {
    this.setData({
      page: 1, //加载页数
      isloading: false, //是否正在加载数据动作
      isloaded: false //是否已经加载全部数据
    })
  },

  // 加载数据
  loadjsondata: function() {
    if (this.data.isloading || this.data.isloaded) {
      return false;
    }
    var page = 1 + this.data.page;
    this.setData({
      isloading: true,
      page: page
    })
    this.loadjson(this.data.adcode, this.data.location, page);
  },

  // 获取数据
  getData: function() {
    var self = this;
    // 再请求服务器
    // 获取定位
    location.getOrUpdateRegeoInfo({
      success: function(data) {
        self.setData({
          adcode: data.adcode,
          location: data.location,
          cityName: data.position
        });
        self.loadjson(data.adcode, data.location, 1); //加载数据
      },
      fail: function(err) {}
    })
  },

  // 重新加载数据
  reLoadJson: function(city) {
    this.initload();
    this.setData({
      adcode: city.adcode,
      location: city.location,
      cityName: city.name
    })
    this.loadjson(city.adcode, city.location, 1);
  },

  // 加载数据
  loadjson: function(adcode, location, page) {

    var self = this;
    var thisdata = this.data;
    var data = {
      adcode: adcode ? adcode : thisdata.adcode,
      location: location ? location : thisdata.location,
      free: true,
      pageNo: page ? page : thisdata.page
    }

    common.postJson({
      url: '/v2/user/shop/search',
      data: data,
      success: function(data) {
        if (data.code == 0) {
          var shopList = data.data.shopList;
          var len = shopList.length;
          for (var i = 0; i < len; i++) {
            if (shopList[i].free && shopList[i].freemeal.startTime) {
              shopList[i].freemeal.time = shopList[i].freemeal.startTime.split(' ')[1];
            }
          }
          if (page === 1) {
            var swiperList = [];
            var advertGroup = data.data.advertGroup;
            for (var i in advertGroup) {
              if (i != "COUNTRY") {
                for (var j = 0; j < advertGroup[i].length; j++) {
                  swiperList.push(advertGroup[i][j]);
                }
              }
            }
            self.setData({
              res: data.data,
              swiperList: swiperList
            });
          } else if (self.data.res.shopList) {
            var shopList = self.data.res.shopList;
            shopList = shopList.concat(data.data.shopList);
            self.setData({
              'res.shopList': shopList
            });
            // 关闭下拉刷新
            wx.stopPullDownRefresh();
          }
          // 下拉加载
          if (data.data.shopList.length < 20) {
            self.setData({
              isloaded: true
            });
          }
          // 加载动作完成
          self.setData({
            isloading: false
          });
        }
      },
      complete: function() {
        var wxhideLoading = setTimeout(function() {
          wx.hideLoading();
          clearTimeout(wxhideLoading);
        }, 1000)
      }
    })
  },

  navigateTo: function(e) {
    var target = e.currentTarget || e.target;
    if (!target.dataset.uri) {
      return false;
    }
    wx.navigateTo({
      url: target.dataset.uri,
    })
  },

})