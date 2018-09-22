var host = getApp().data.services;
var amapFile = require('../../libs/amap-wx.js');
var locationLib = require('../../utils/location.js');
var myAmapFun;
var key = getApp().data.aMapKey;
var token = '';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    longitude: '',
    latitude: '',
    position_city: '定位中',
    circles: [],
    hide: 0,
    hotList: [],
    cityGroup: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    //高德地图key
    myAmapFun = new amapFile.AMapWX({
      key: key
    });
    wx.showLoading({
      title: '加载中...',
    })

    wx.getSystemInfo({ // 系统API,获取系统信息，比如设备宽高
      success: (res) => {
        var height = res.windowHeight * 0.45;
        that.setData({
          // 定义控件数组，可以在data对象初始化为[],也可以不初始化，取决于是否需要更好的阅读
          controls: [{
              id: 1, // 给控件定义唯一id
              iconPath: '/images/location.png', // 控件图标
              position: {
                left: res.windowWidth / 2 - 23,
                top: height / 2 - 5,
                width: 50,
                height: 50
              },
              clickable: false
            },
            {
              id: 2, // 给控件定义唯一id
              iconPath: '/images/getcenter.png', // 控件图标
              position: { // 控件位置
                left: 20,
                top: height,
                width: 30,
                height: 30
              },
              clickable: true // 是否可点击，默认为true,可点击
            }
          ],
          circles: [{
            radius: 0
          }]
        })
      }
    })

    var location = options.location;
    if (location != undefined && location != '') {
      var nlocation = location.split(',');
      var latitude = nlocation[0];
      var longitude = nlocation[1];
      that.setData({
        latitude: latitude,
        longitude: longitude,
        circles: [{
          radius: 0
        }]
      });
      that.getLocation(longitude + ',' + latitude);
      return;
    }

    wx.getLocation({
      type: 'gcj02',
      success: function(res) {
        var latitude = res.latitude;
        var longitude = res.longitude;
        that.getLocation(longitude + ',' + latitude);
        that.setData({
          latitude: latitude,
          longitude: longitude,
          circles: [{
            radius: 0
          }]
        });
      },
      fail: function(info) {
        locationLib.reAuthLocation();
        wx.navigateBack();
      }
    })
  },

  // 获取定位的地址信息
  getLocation(location) {
    var that = this;
    myAmapFun.getRegeo({
      location: location,
      success: function(data) {
        var list = data[0].regeocodeData.pois;
        var position_city = data[0].regeocodeData.addressComponent.city;
        var citycode = data[0].regeocodeData.addressComponent.citycode;
        if (position_city == '') {
          position_city = data[0].regeocodeData.addressComponent.province;
        }
        that.setData({
          position_city: position_city,
          list: list,
          citycode: citycode
        })
        wx.hideLoading();
      },
      fail: function(info) {
        locationLib.reAuthLocation();
        wx.navigateBack();
      }
    })
  },

  // 定位函数，移动位置到地图中心
  movetoPosition: function() {
    this.mapCtx.moveToLocation();
  },

  bindcontroltap(e) {
    // 点击控件 e.controlId代表控件的id
    switch (e.controlId) {
      // 点击定位控件
      case 2:
        this.movetoPosition();
        break;
    }
  },

  // 获取定位的地址列表
  getLocationMsg(e) {
    var id = e.currentTarget.dataset.id;
    var list = this.data.list;
    var addressMsg = [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id == id) {
        addressMsg = list[i];
      }
    }
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    prevPage.setData({
      addressMsg: addressMsg
    });
    wx.navigateBack();
  },

  // 搜索地址
  searchMap(e) {
    var value = e.detail.value;
    var that = this;
    var hide = 0;
    if (value != '') {
      var hide = 1;
      var location = this.data.location;
      var citycode = this.data.citycode;
      this.searchAddress({
        value: value,
        location: location,
        citycode: citycode,
        limit: 100
      });
    }
    that.setData({
      hide: hide
    })
  },

  // 去高德地图搜索地址
  searchAddress(data) {
    myAmapFun.getInputtips({
      keywords: data.value,
      location: data.location,
      city: data.citycode,
      citylimit: true,
      limit: data.limit,
      success: (data) => {
        if (data && data.tips) {
          var list = data.tips;
          this.setData({
            list: list
          })
        }
      }
    })
  },

  // 地图有变化更新地图信息
  bindregionchange(e) {
    var that = this;
    var type = e.type;
    if (type == 'end') {

      this.mapCtx.getCenterLocation({
        success: function(res) {
          var latitude = res.latitude;
          var longitude = res.longitude;
          that.getLocation(longitude + ',' + latitude);
        },
        fail: function(info) {
          wx.showModal({
            title: info.errMsg
          })
        }
      })

    }
  },

  // 页面显示
  onShow: function() {
    this.mapCtx = wx.createMapContext("map");
  },

})