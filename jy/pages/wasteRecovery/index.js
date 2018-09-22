//index.js
//获取应用实例
var app = getApp();
var common = require('../../utils/common.js');
var { getOrUpdateRegeoInfo } = require('../../utils/location.js');
Page({
  data: {
    location: "22.223436,113.553569", //设置默认location
    type: null,
    iconWidth: 22,
    iconHeight: 25,
    iconPath: "../../images/position.png",
    iconSelectPath: "../../images/position_select.png",
    sort: 'DISTANCE',
    markers: [],
    markersRes: [],
    latitude: '',
    longitude: '',
    textData: {},
    city: '',
    isHasData:false
  },
  makertap: function(e) {
    var id = e.markerId;
    var markers = this.data.markers;
    var markersRes = this.data.markersRes;
    this.showMarkerInfo(markersRes, id);
    this.changeMarkerColor(markers, id);
  },
  showMarkerInfo: function(data, i) {
    var self = this;
    console.log(data);
    var obj = {
      textData: data[i]
    }
    obj.isHasData = true;
    if (data.length==0){
      obj.isHasData = false;
    }
    self.setData(obj)
  },
  changeMarkerColor: function(data, i) {
    var self = this;
    var markers = [];
    for (var j = 0; j < data.length; j++) {
      if (j == i) {
        data[j].iconPath = self.data.iconSelectPath;
      } else {
        data[j].iconPath = self.data.iconPath;
      }
      markers.push({
        id: data[j].id,
        latitude: data[j].latitude,
        longitude: data[j].longitude,
        iconPath: data[j].iconPath,
        width: data[j].width,
        height: data[j].height
      })
    }
    self.setData({
      markers: markers
    });
  },

  // 生命周期函数--监听页面加载
  onLoad: function(options) {
    this.setData({
      type: options.type
    })

  },
  // 页面加载完成触发
  onReady: function() {},
  // 页面显示时触发
  onShow: function(options) {
    this.loadjson();
  },
  // 加载数据
  loadjson: function() {
    var self = this;
    var data = this.data;
    var data = {
      location: data.location,
      type: data.type,
      sort: data.sort
    }
    common.postJson({
      url: '/v2/user/shop/search',
      data: data,
      success: function(data) {
        console.log('------------data----------------');
        console.log(data);
        var shopList = data.data.shopList;
        var len = shopList.length;
        var markers = [];
        // { "id": 0, "latitude": 22.267276, "longitude": 113.543522, "iconPath": "../../images/position_select.png", "width": 22, "height": 32 }
        for (var i = 0; i < len; i++) {
          var location = shopList[i].location.split(',');
          shopList[i].latitude = parseFloat(location[0]);
          shopList[i].longitude = parseFloat(location[1]);
          markers.push({
            storeId: shopList[i].id,
            id: i,
            latitude: parseFloat(location[0]),
            longitude: parseFloat(location[1]),
            iconPath: self.data.iconPath,
            width: self.data.iconWidth,
            height: self.data.iconHeight
          })
        }
        var textData = {};
        if (len > 0) {
          markers[0].iconPath = self.data.iconSelectPath;
          var markersId = markers[0].id;
          var markersRes = data.data.shopList;
          textData = data.data.shopList[0];
        }
        console.log('---markers--------');
        console.log(markers);
        if (markers.length){
          self.setData({
            markers: markers,
            markersRes: markersRes,
            textData: textData,
            isHasData:true,
            latitude: markers[0].latitude,
            longitude: markers[0].longitude
          })
        }else{
          // 获取定位
          getOrUpdateRegeoInfo({
            cache: false,
            success: function (data) {
              // console.log(data);
              var locationCity = data.amapData[0];
              self.setData({
                latitude: locationCity.latitude,
                longitude: locationCity.longitude
              })
            },
            fail:function(){
              var location = self.data.location.split(',');
              self.setData({
                latitude: location[0],
                longitude: location[1]
              })
            }
          })

        }        
      }
    })
  },
  // 地图导航
  mapMoveTo: function() {
    var obj = this.data.textData;
    // return false;
    wx.openLocation({
      latitude: obj.latitude,
      longitude: obj.longitude,
      name: obj.name,
      address: obj.address + obj.address2
    });
    // wx.openLocation({
    //   latitude: 23.362490,
    //   longitude: 116.715790,
    //   scale: 18,
    //   name: '华乾大厦',
    //   address: '金平区长平路93号'
    // })
  },
  // 拨打电话
  mapTelTo: function() {
    var obj = this.data.textData;
    wx.makePhoneCall({
      phoneNumber: obj.tel //仅为示例，并非真实的电话号码
    })

  },
  // 页面跳转到
  navigateTo: function(keyword) {
    wx.navigateTo({
      url: '../shopSearch/index?keyword=' + keyword
    })
  }
})