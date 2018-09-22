var app = getApp();
var common = require('../../utils/common.js');
var location = require('../../utils/location.js');
Page({
  data: {
    //页面显示数据 //先加载缓存数据
    res: {},
    isInitload:true,//是否初始化
    position: '定位中...', //定位地址
    circular: true, //设置轮播图数据
    indicatorDots: true, //设置轮播图数据
    autoplay: true, //设置轮播图数据
    interval: 3000, //设置轮播图数据
    duration: 300, //设置轮播图数据
    PullDownRefresht: 0, //下拉刷新间隔、小于3000ms 不刷新 时间戳
    star: 5, //店铺星星
    adcode: 440402, //设置默认adcode
    location: "22.223436,113.553569", //设置默认location
    page: 1, //加载页数
    isloading: false, //是否正在加载数据动作
    titletime: 1,
    isloaded: false, //是否已经加载全部数据
    isPosition: false, //点击地区重新获取定位并且加载数据
    oneKeyOrderInfo: {}, //一键下单信息
  },
  // 生命周期函数--监听页面加载
  onLoad: function(options) {
    console.log(options);
      // decodeURIComponent(options.navigateTo)
    if(options.navigateTo){
      var onavigateTo = setTimeout(function(){
        wx.navigateTo({
          url: decodeURIComponent(options.navigateTo)
        })
        clearTimeout(onavigateTo);
      },300)
    }
    wx.showLoading({
      title: '加载中...',
    })
    this.getData();
  },

  onShow: function(options) {
    console.log('onshow');
    console.log(options);
    var self = this;
    // location.getOrUpdateRegeoInfo({
    //   success: function (data) {
    //   },
    //   fail: function (err) {
    //   }
    // })
    // 如果选择地区adcode不一样；请求新的数据
    // var newadcode = wx.getStorageSync('region_adcode');
    // var newlocation = wx.getStorageSync('region_location');
    // if (newadcode && newlocation && self.data.adcode != newadcode ){
    //     this.initload();
    //     this.loadjson(newadcode, newlocation, 1);//加载数据
    // }
  },

  // 滚动到底部触发事件
  onReachBottom: function() {
    this.loadjsondata();
  },
  // 下拉刷新
  onPullDownRefresh: function() {
    this.initload();
    this.loadjson();
    setTimeout(function(){
      wx.stopPullDownRefresh();
    },3000)
  },
  // 初始化加载数据变量
  initload: function() {
    this.setData({
      page: 1, //加载页数
      isInitload:true,
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
  // 重新定位=》点击地址按钮
  rePosition: function() {
    this.setData({
      isPosition: true
    })
    this.initload();
    this.getData();
  },
  // 获取数据
  getData: function() {
    var self = this;
    // 再请求服务器
    // 获取定位
    location.getOrUpdateRegeoInfo({
      cache: false,
      success: function(data) {
        self.setData({
          adcode: data.adcode,
          location: data.location,
          position: data.position
        });
        self.loadjson(data.adcode, data.location, 1); //加载数据
      },
      fail: function(err) {}
    })
  },
  // 加载数据
  loadjson: function(adcode, location, page) {
    var self = this;
    var thisdata = this.data;
    var isPosition = thisdata.isPosition;
    var postdata = {
      adcode: adcode ? adcode : thisdata.adcode,
      location: location ? location : thisdata.location,
      page: page ? page : thisdata.page,
    }
    common.postJson({
      url: '/v2/user/index/pull',
      data: postdata,
      success: function(data) {
        console.log(data);
        // 关闭下拉刷新
        wx.stopPullDownRefresh();
        if (postdata.page === 1) {
          self.setData({
            res: data.data
          });
        } else if (self.data.res.shopList) {
          var shopList = self.data.res.shopList;
          shopList = shopList.concat(data.data.shopList);
          self.setData({
            'res.shopList': shopList
          });
          
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
        if (isPosition) {
          self.setData({
            isPosition: false
          });
        }      
      },
      complete: function() {
        wx.hideLoading();
      }
    })
  },
  menuClick: function(e) {
    var dataset = e.currentTarget.dataset;
    switch (dataset.type) {
      case 'WATER': //送水
        this.OnekeyOrder('WATER');
        break;
      case 'COALGAS': //送气
        this.OnekeyOrder('COALGAS');
        break;
      case 'FOOD': //餐饮
        this.navigateToShopSearch('FOOD');
        break;
      case 'RECYCLE': //废品回收
        wx.navigateTo({
          url: '../wasteRecovery/index?type=RECYCLE',
        })
        break;
    }

  },
  // 一键送水送气
  OnekeyOrder: function(TYPE) {
    var self = this;
    common.postJson({
      url: '/v2/user/onekey/preview',
      data: {
        type: TYPE
      },
      success: function(result) {
        var oneKeyOrderInfo = self.data.oneKeyOrderInfo;
        var data = result.data;
        var goodsList = data.goodsList[0];
        // CASH = 货到付款
        // ALIPAY = 支付宝
        // WEIXIN = 微信支付
        // BALANCE = 余额
        // 支付类型
        function payType(TYPE) {
          switch (TYPE) {
            case 'CASH':
              return '货到付款'
              break;
            case 'ALIPAY':
              return '支付宝'
              break;
            case 'WEIXIN':
              return '微信支付'
              break;
            case 'BALANCE':
              return '余额'
              break;
          }
        }
        // 加价费用
        function priceIncrease(user) {
          var itemList = [];
          if (user['defaultWaterProductSpecV1List'] && user['defaultWaterProductSpecV1List'].itemList) {
            itemList = user['defaultWaterProductSpecV1List'].itemList;
          }
          if (user['defaultCoalgasProductSpecV1List'] && user['defaultCoalgasProductSpecV1List'].itemList) {
            itemList = user['defaultCoalgasProductSpecV1List'].itemList;
          }

          var price = 0;
          var label = '';
          var len = itemList.length;
          if (!len || len === 0) {
            return {
              price: price,
              label: label,
              itemList: []
            };
          }
          for (var i = 0; i < len; i++) {
            price += itemList[i].price
            label = label + ' ' + itemList[i].label;
          }
          return {
            price: price,
            label: label,
            itemList: itemList
          }
        }
        var priceIncreaseObj = priceIncrease(data.user);
        oneKeyOrderInfo.name = data.name;
        oneKeyOrderInfo.sex = data.gender === "MALE" ? '先生' : '女士';
        oneKeyOrderInfo.tel = data.tel;
        oneKeyOrderInfo.goodsname = goodsList.product.name;
        oneKeyOrderInfo.payType = payType(data.payType);
        oneKeyOrderInfo.payPrice = goodsList.number * (priceIncreaseObj.price + goodsList.price);
        oneKeyOrderInfo.type = TYPE;
        oneKeyOrderInfo.itemListLabel = priceIncreaseObj.label;
        oneKeyOrderInfo.itemList = priceIncreaseObj.itemList;
        oneKeyOrderInfo.remark = '';
        oneKeyOrderInfo.isShow = true;
        Object.assign(data, oneKeyOrderInfo);
        self.setData({
          oneKeyOrderInfo: data
        })
      },
      fail: function(err) {
        self.navigateToShopSearch(TYPE);
        // if (err.data) {
        //   var data = JSON.parse(err.data);
        //   wx.showModal({
        //     title: '温馨提示',
        //     content: data.msg,
        //   })
        // }
      }
    })
  },
  closeOneKeyOrderInfo: function() {
    var oneKeyOrderInfo = this.data.oneKeyOrderInfo;
    this.setData({
      "oneKeyOrderInfo.isShow": false
    })
  },
  // 处理一键下单提交数据
  handleOneKeyOrderDate: function() {
    var oneKeyOrderInfo = this.data.oneKeyOrderInfo;
    var obj = {
      "shopId": oneKeyOrderInfo.shop.id,
      "addressId": oneKeyOrderInfo.addressId,
      "remark": oneKeyOrderInfo.remark,
      "goodsList": [{
        "productId": oneKeyOrderInfo.goodsList[0].product.id,
        "number": oneKeyOrderInfo.goodsList[0].number
      }]
    }
    if (oneKeyOrderInfo.itemList.length != 0) {
      obj.goodsList[0].specV1List = [{
        "name": oneKeyOrderInfo.itemListLabel,
        "itemList": oneKeyOrderInfo.itemList
      }]
    }
    return obj;
  },
  submitOneKeyOrderInfo: function() {
    var self = this;
    wx.showLoading({
      title: '下单中...',
    })
    var oneKeyOrderInfo = this.data.oneKeyOrderInfo;
    var data = self.handleOneKeyOrderDate();
    common.postJson({
      url: '/v2/user/order/add',
      data: data,
      success: function(result) {
        wx.showToast({
          title: '下单成功',
        })
      },
      fail: function(err) {
        wx.hideLoading();
        wx.showModal({
          title: '温馨提示',
          content: '下单失败，' + JSON.parse(err.data).msg + '',
        })
      },
      complete: function() {
        self.setData({
          "oneKeyOrderInfo.isShow": false
        })
      }
    })
  },
  // 修改备注信息
  oneKeyOrderInfoRemark: function(e) {
    this.setData({
      "oneKeyOrderInfo.remark": e.detail.value
    })
  },
  navigateToShopSearch: function(TYPE) {
    wx.navigateTo({
      url: '../shopSearch/index?type=' + TYPE,
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
  // 点击轮播图
  /*
    广告点击动作
    SHOP=跳转到商家主页
    PRODUCT=跳转到商品详情页
    URL=跳转到网页
    NONE=无动作
  */ 
  SelectedItem(e){
    var item = e.currentTarget.dataset.item;
    item = JSON.parse(item);
    if (!item.key || item.key == '') {
      return false;
    }
    switch (item.action){
      case 'SHOP':
        var id = item.key.split(':')[0];
        wx.navigateTo({
          url: '/pages/store/index?id='+id,
        })
        break;
      case 'URL':
        wx.navigateTo({
          url: '/pages/h5/h5?src=' + encodeURIComponent(item.key),
        })
        break;
    }
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    return {
      path: 'pages/index/index'
    }
  }
})