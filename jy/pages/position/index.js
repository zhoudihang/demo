// pages/position/index.js
var common = require('../../utils/common.js');
var { getOrUpdateRegeoInfo} = require('../../utils/location.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    res: {},
    isShow: false, //是否显示
    inputSearch: false, //是否显示输入框
    inputCityText: '', //输入城市名字
    mune: [ //右侧导航（）
      {
        value: '区县',
        index: 'county'
      },
      {
        value: '定位',
        index: 'dingwei'
      },
      {
        value: '热门',
        index: 'remen'
      }
    ],
    isShowSearchCityList: false, // 是否显示搜索页面
    noCity: false,
    searchCityList: {}, // 城市列表
    cityIndexScrollTop: [],
    cityName: '', //定位/当前访问
    locationname: '', //当前位置
    locationCityName:'定位中...',//当前定位
    locationAdcode:0,//
    adcode: 0,
    localtionInfo: 0, //当前信息
    isShowDisCounty: false, //是否显示区域城市
    districtCounty: [], // 当前位置区县
    isShowAllDisCounty: false
  },

  // { "id": 2149, "adcode": "440105", "name": "海珠区", "center": "113.317443,23.083788", "provinceId": 19, "cityId": 234, "level": "DISTRICT" }
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.showLoading({
      title: '加载中...',
    })
    if (options.cityName) {
      this.setData({
        cityName: options.cityName,
        adcode: options.adcode
      })
    }
    var self = this;
    var position = '';
    try {
      position = wx.getStorageSync('position');
    } catch (e) {
      wx.getStorage({
        key: 'position',
        success: function(res) {
          var obj = JSON.parse(res);
          self.showPosition(obj);
        },
        fail: function() {
          self.loadJson();
        }
      })
    }
    if (position && position != '') {
      var obj = JSON.parse(position);
      this.showPosition(obj);
    } else {
      this.loadJson();
    }
    // 获取定位
    getOrUpdateRegeoInfo({
      cache: false,
      success: function (data) {
        // console.log(data);
        var locationCityName = data.amapData[0].regeocodeData.addressComponent.city;
        var adcode = ''+data.adcode.substring(0,4) +'00';
        // console.log(adcode);
        self.setData({
          locationCityName: locationCityName,//当前定位
          locationAdcode: adcode
        })
        // absolutePosition(data);
        // self.loadjson(data.adcode, data.location, 1);//加载数据
      },
    })
  },

  // 渲染定位地址数据
  showPosition(obj) {
    var self = this;
    this.setData({
      res: obj.res,
      mune: obj.mune,
      isShow: true
    }, function() {
      self.showDisCounty(); //当前定位/切换区县
      var complete = setTimeout(function() {
        wx.hideLoading();
        clearTimeout(complete);
      }, 1500)
      // self.getSubPinyi();
    })
  },
  // 加载数据
  loadJson() {
    var self = this;
    common.postJson({
      url: '/v2/opendata/getCityGroup',
      data: {},
      success: function(result) {
        var i = 0;
        var mune = [];
        for (var j in result.data.cityGroup) {
          i++;
          mune.push({
            value: j,
            index: j
          });
        }
        var selfmune = self.data.mune.concat(mune);
        result.data.cityGroupLength = i;
        self.showPosition({
          res: result.data,
          mune: selfmune
        })
        // self.setData({
        //   res: result.data,
        //   mune: selfmune,
        //   isShow: true
        // }, function () {
        //   self.getSubPinyi();
        // })
        var position = JSON.stringify({
          res: result.data,
          mune: selfmune,
          getTime: new Date().getTime()
        })
        wx.setStorage({
          key: 'position',
          data: position
        })
      },
      fail: function(err) {
        var complete = setTimeout(function() {
          wx.hideLoading();
          clearTimeout(complete);
        }, 1500)
      }
    })
  },
  chooseMune(e) {
    var isShowSearchCityList = this.data.isShowSearchCityList;
    if (isShowSearchCityList) {
      return false;
    }
    
    var index = e.currentTarget.dataset.index;
    if(index==0){
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 0
      })
      return false;
    }
    this.getAllRects('.cityIndex', function (rects) {
      var scrolltop = 0;
      for (var i = 0; i < rects.length; i++) {
        if(i<index){
           scrolltop += rects[i].height;
        }
      }
      wx.pageScrollTo({
        scrollTop: scrolltop,
        duration: 0
      })
    })
  },
  inputSearchFalse() {
    this.setData({
      inputSearch: true
    })
  },
  inputSearchBlur(e) {
    var self = this;
    this.setData({
      inputSearch: false
    })
  },
  // 输入关键字、城市名
  inputSearchKeyWord(e) {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
    var keyword = e.detail.value;
    if (keyword == '') {
      this.setData({
        isShowSearchCityList: false
      })
      return false;
    }
    var cityGroup = this.data.res.cityGroup;
    var len = cityGroup.length;
    var noCity = false;
    var searchCityList = {}; // 城市列表
    for (var i in cityGroup) {
      searchCityList[i] = [];
      var lenj = cityGroup[i].length;
      for (var j = 0; j < lenj; j++) {
        if (cityGroup[i][j].name.indexOf(keyword) != -1) {
          searchCityList[i].push(cityGroup[i][j]);
          noCity = true;
        }
      }
      if (searchCityList[i].length == 0) {
        delete searchCityList[i];
      }
    }
    this.setData({
      noCity: noCity,
      isShowSearchCityList: true,
      searchCityList: searchCityList
    })
    // noCity
  },
  // 显示隐藏当前城市区县
  showOrHideCityLocation() {
    var isShowAllDisCounty = this.data.isShowAllDisCounty;
    this.setData({
      isShowAllDisCounty: !isShowAllDisCounty
    })
  },
  // 选择城市 附近定位缓存
  chooseCity(e) {
    var city = e.currentTarget.dataset.city;
    city = JSON.parse(city);
    var center = city.center.split(',');
    city.location = center[1] + ',' + center[0];
    var data = JSON.stringify(city);
    this.storageLocation(data);
    // this.nearbyLocalStorage(dataset.city);
  },
  // 缓存附近城市定位数据
  storageLocation(data){
    try {
      wx.setStorageSync('nearbyLocalStorage', data);
    } catch (e) {
      wx.setStorage({
        key: 'nearbyLocalStorage',
        data: data
      })
    }
    setTimeout(function () {
      wx.navigateBack();
    }, 300)
  },
  // 查找所以字母的位置
  // getSubPinyi() {
  //   var self = this;
  //   this.getAllRects('.cityIndex', function(rects) {
  //     self.setData({
  //       cityIndexScrollTop: rects
  //     })
  //   })
  // },
  // 获取元素
  getAllRects: function(className, callback) {
    wx.createSelectorQuery().selectAll(className).boundingClientRect(function(rects) {
      callback(rects);
    }).exec()
  },
  // 处理当前县域
  showDisCounty() {
    var adcode = this.data.adcode;
    var thiscityGroup = this.data.res.cityGroup;
    var thishotList = this.data.res.hotList;
    var cityGroup = Object.assign({}, thiscityGroup, {
      "thishotList": thishotList
    });
    var arr = [];
    var obj = {};
    var allDisCounty = {};
    for (var i in cityGroup) {
      var len = cityGroup[i].length;
      var breakFor = false;
      for (var j = 0; j < len; j++) {
        if (adcode == cityGroup[i][j].adcode) {
          obj = cityGroup[i][j];
          breakFor = true;
          break;
        }
      }
      if (breakFor) {
        break;
      }
    }
    // 
    var cityid = 0;
    var provinceId = 0;
    var level = obj.level;
    var locationname = '';
    switch (level) {
      case "PROVINCE":
        provinceId = obj.id;
        break;
      case "CITY":
        cityid = obj.id;
        break;
      case "DISTRICT":
        cityid = obj.cityId;
        locationname = obj.name;
        break;
    }
    for (var i in cityGroup) {
      var len = cityGroup[i].length;
      for (var j = 0; j < len; j++) {
        if (level === "PROVINCE") { //点击直辖市时 直辖市的id为省
          if (provinceId == cityGroup[i][j].provinceId) {
            arr.push(cityGroup[i][j]);
          } else if (provinceId == cityGroup[i][j].id) {
            allDisCounty = cityGroup[i][j];
          }
        } else {
          if (cityid == cityGroup[i][j].cityId) {
            arr.push(cityGroup[i][j]);
          } else if (cityid == cityGroup[i][j].id) {
            allDisCounty = cityGroup[i][j];
          }
        }
      }
    }
    // { "id": 1151, "adcode": "310115", "name": "浦东新区", "center": "121.544379,31.221517", "provinceId": 9, "cityId": 107, "level": "DISTRICT" }
    arr.unshift(allDisCounty);
    locationname = allDisCounty.name + locationname;
    this.setData({
      districtCounty: arr,
      locationname: locationname
    })
  },
  // 点击当前定位
  locationCity() {
    // console.log(this.data.res)
    var cityGroup = this.data.res.cityGroup;
    var locationAdcode = this.data.locationAdcode;
    for (var i in cityGroup){
      var len = cityGroup[i].length;
      for(var j=0;j<len;j++){
        if (locationAdcode === cityGroup[i][j].adcode){
          // console.log();
          var data = JSON.stringify(cityGroup[i][j]);
          this.storageLocation(data);
          break;
        }
      }
    }
    // wx.navigateBack();
  },
  // 搜索
  search(e) {

  }

})