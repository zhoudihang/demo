
var amapFile = require('../libs/amap-wx.js');
var common = require('common.js');

var STORE_LOCATION = "jy_user_location";  // 位置坐标缓存名称
var STORE_GEOINFO = "jy_geo_info";  // 位置信息缓存名称
var autoCleanInterval;               // 自动清除定位信息计时器
var autoCleanTimeout = 60 * 1000;    // 位置信息保留时间，单位：毫秒
var amap = new amapFile.AMapWX({ key: getApp().data.aMapKey }); // 高德地图API

// 获取珠海定位位置、、默认定位到珠海总部
var defaultOptions = {
  adcode: "440402",
  latitude: "22.223436",
  longitude: "113.553569"
}
function getDefaultLocationInfo(){
  return defaultOptions;
}
/**
 * 获取当前位置
 * 
 * cache     Boolean              是否从缓存获取
 * callback  Function(location)   业务回调函数
 *              location 参数为定位获得的原生对象，并增加getLatLon（服务器用）和getLonLat（高德用）方法
 */
function getLocation(cache, callback) {
  var location;

  // 查询缓存缓存值
  if (cache) {
    location = wx.getStorageSync(STORE_LOCATION);
  }

  if (location) {
    // 如果有缓存，则调用业务逻辑
    callback(location);
    return;
  }

  // 无缓存，则进行定位
  wx.getLocation({
    type: 'gcj02',
    success: (res) => {
      location = res;
      // 提供一个与服务器协商一致的坐标格式转换器：纬度(6位小数),经度(6位小数)
      location.getLatLon = function () {
        return this.latitude.toFixed(6) + "," + this.longitude.toFixed(6);
      }
      location.getLonLat = function () {
        return this.longitude.toFixed(6) + "," + this.latitude.toFixed(6);
      }
      // 存入缓存
      wx.setStorageSync(STORE_LOCATION, location);
      // 调用业务逻辑
      callback(location);
      // 自动清理
      clearTimeout(autoCleanInterval);
      autoCleanInterval = setTimeout(function () {
        console.info("自动清理定位信息", STORE_LOCATION);
        wx.removeStorage({
          key: STORE_LOCATION
        });
      }, autoCleanTimeout);
    },
    fail: (err) => {
      console.warn("定位失败", err);
      // 定位失败时，默认定位到珠海总部，且不缓存
      location = {
        latitude: 22.223436,
        longitude: 113.553569,
        speed: -1,
        accuracy: 65,
        altitude: 0,
        verticalAccuracy: 65,
        horizontalAccuracy: 65,
        getLatLon: function () {
          return this.latitude.toFixed(6) + "," + this.longitude.toFixed(6);
        },
        getLonLat: function () {
          return this.longitude.toFixed(6) + "," + this.latitude.toFixed(6);
        }
      };
      // 调用业务逻辑
      callback(location);
      reAuthLocation();
    }
  });

}

/** 
 * 定位或更新地理位置信息
 *   data:{
 *     location: "服务器固定坐标（纬度,经度）",
 *     position: "位置名称",
 *     adcode:   "地区编码",
 *     amapData: 高德原始数据
 *   }
 */
function getOrUpdateRegeoInfo(options) {
  var opts = {
    cache: true,
    data: undefined,          // 直接更新为这个数据对象，而不通过高德查询
    success: function (data) { /*逻辑业务*/ },
    fail: function (data) { /*逻辑业务*/ }
  };
  common.merge(opts, options);
 
  // 直接更新
  if (opts.data) {
    // 存入缓存
    wx.setStorageSync(STORE_GEOINFO, opts.data);
    // 调用业务逻辑
    opts.success(data);
    return;
  }

  // 尝试从缓存获取
  if (opts.cache) {
    var data = wx.getStorageSync(STORE_GEOINFO);
    if (data) {
      // 调用业务逻辑
      opts.success(data);
      return;
    }
  }

  // 定位
  getLocation(false, function (location) {
    // 向高德服务器请求数据
    amap.getRegeo({
      location: location.getLonLat(),
      success: (amapData) => {
        var data;
        if (amapData[0].regeocodeData.pois.length == 0) {
          data = {
            adcode: '',
            position: '未知区域',
            location: location.getLatLon(),
            amapData: amapData
          };
        } else {
          data = {
            adcode: amapData[0].regeocodeData.addressComponent.adcode,
            position: amapData[0].regeocodeData.pois[0].name,
            location: location.getLatLon(),
            amapData: amapData
          };
        }
        // 存入缓存
        wx.setStorageSync(STORE_GEOINFO, data);
        // 调用业务逻辑
        opts.success(data);
      },
      fail: function (err) {
        console.warn("获取附近的信息失败", err);
        data = {
          adcode: '',
          position: '未知区域',
          location: '',
          amapData: undefined
        };
        opts.fail(data);
      }
    })

  });


}

/** 没有授权定位，重新申请  // 获取授权设置页面 */
function reAuthLocation(){
  wx.openSetting({
    success: function (data) {
      
    },
    fail: function () {
      console.info("设置失败返回数据");

    }
  });
}

module.exports.getLocation = getLocation;
module.exports.getOrUpdateRegeoInfo = getOrUpdateRegeoInfo;
module.exports.reAuthLocation = reAuthLocation;
module.exports.getDefaultLocationInfo = getDefaultLocationInfo;
