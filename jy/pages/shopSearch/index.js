//index.js
//获取应用实例
var app = getApp();
var { postJson, navigateTo} = require('../../utils/common.js');
var location = require('../../utils/location.js');
Page({
  data: {
    //页面显示数据
    res: {},
    location: "22.223436,113.553569", //设置默认location
    keyword: '', //搜索关键字
    inputKeyword: '', //输入关键字,
    type: null,
    pageNo: 1,
    sort: 'DISTANCE',
    page: 1, //加载页数
    isloading: false, //是否正在加载数据动作
    isloaded: false //是否已经加载全部数据
  },
  // 生命周期函数--监听页面加载
  onLoad: function(options) {
    var self = this;
    switch (options.type) {
      case 'WATER': //一键送水
        wx.setNavigationBarTitle({
          title: '一键送水',
        })
        break;
      case 'COALGAS': //一键送气
        wx.setNavigationBarTitle({
          title: '煤气速送',
        })
        break;
      case 'FOOD': //精品外卖
        wx.setNavigationBarTitle({
          title: '精品外卖',
        })
        break;
    }
    console.log('keyword---------'+options.keyword);
    this.setData({
      keyword: options.keyword||'',
      inputKeyword: options.keyword || '',
      type: options.type||null
    })
    // 获取定位
    location.getOrUpdateRegeoInfo({
      success: function(data) {
        self.setData({
          location: data.location
        })
      }
    })
  },
  onReady: function() {
    this.loadjson();
  },

  // 滚动到底部触发事件
  onReachBottom: function() {
    if (this.data.isloading || this.data.isloaded) {
      return false;
    }
    var page = 1 + this.data.page;
    this.setData({
      isloading: true,
      page: page
    })
    this.loadjson();
  },
  // 初始化加载数据变量
  initload: function() {
    this.setData({
      page: 1, //加载页数
      isloading: false, //是否正在加载数据动作
      isloaded: false //是否已经加载全部数据
    })
  },
  // 获取数据
  getData: function() {
    var self = this;
  },
  // 加载数据
  loadjson: function() {
    var self = this;
    var data = this.data;
    var data = {
      location: data.location,
      type: data.type,
      keyword: data.keyword,
      pageNo: data.page,
      sort: data.sort
    }

    postJson({
      url: '/v2/user/shop/search',
      data: data,
      success: function(data) {
        if (data.code == 0) {
          var resdata = data.data;
          var i = 0;
          for (i; i < resdata.shopList.length; i++) {
            resdata.shopList[i].showMore = false;
            resdata.shopList[i].distince = resdata.shopList[i].distince > 1 ? resdata.shopList[i].distince.toFixed(2) + ' km' : parseInt(resdata.shopList[i].distince * 1000) + ' m';
          }
          if (self.data.res.shopList) {
            resdata.shopList = self.data.res.shopList.concat(resdata.shopList);
            self.setData({
              'res.shopList': resdata.shopList
            })
          } else {
            self.setData({
              res: resdata
            })
          }
          var loadjsontimeout = setTimeout(function() {
            wx.hideLoading();
          }, 1000)
          // 下拉加载
          if (data.data.shopList.length < 20) {
            self.setData({
              isloaded: true
            });
            return false;
          }
          // 加载动作完成
          self.setData({
            isloading: false
          });
        }
      }
    })
  },
  // 搜索
  search: function() {
    var reg = /^\s|\s$/g;
    var self = this;
    // 如果搜索的关键字一样就不发送请求
    if (this.data.inputKeyword.replace(reg, '') === this.data.keyword.replace(reg, '')) {
      return false;
    }
    wx.showLoading({
      title: '加载中...',
    })
    var keyword = this.data.inputKeyword;
    this.setData({
      keyword: keyword,
      res: {}
    });
    this.initload();
    this.loadjson();
    if (keyword.replace(/^\s|\s$/g, '') === '') {
      return false;
    }
    // 存储历史记录
    try {
      // 获取历史记录
      var value = wx.getStorageSync('search_history');
      if (value) {
        value = JSON.parse(value);
        for (var i = 0; i < value.length; i++) {
          if (value[i] == self.data.inputKeyword) {
            value.splice(i, 1);
          }
        }
        value.unshift(self.data.inputKeyword);
        // 存储历史记录
        wx.setStorageSync('search_history', JSON.stringify(value))
        // Do something with return value
      } else {
        wx.setStorageSync('search_history', JSON.stringify([keyword]))
      }
    } catch (e) {
      wx.setStorageSync('search_history', JSON.stringify([keyword]))
      // Do something when catch error
    }
  },
  // 输入关键字
  inputStoreGoodsName: function(e) {
    this.setData({
      inputKeyword: e.detail.value
    })
  },
  goodsShowOrHideMore: function(e, bool) {
    var target = e.target || e.currentTarget;
    var index = target.dataset.index;
    var storeLists = this.data.res.shopList;
    storeLists[index].showMore = bool;;
    this.setData({
      "res.shopList": storeLists
    })
  },
  showMore: function(e) {
    this.goodsShowOrHideMore(e, true);
  },
  hideMore: function(e) {
    this.goodsShowOrHideMore(e, false);
  },
  // 页面跳转到
  navigateTo: function(e) {
    var target = e.currentTarget;
    navigateTo(target.dataset.uri);
  }
})