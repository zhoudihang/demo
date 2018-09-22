//index.js
//获取应用实例
var app = getApp();
var common = require('../../utils/common.js');

// var location = require('../../utils/location.js');
Page({
  data: {
    res: {}, //请求获取数据
    eventmsg:'',
    copyRes: {}, //备份res
    feeList: [], //免费餐数据
    isShowFixedButtom: true, //是否显示底部固定 
    isBook:false,//判断是否点击预定餐
    shopMsg: false, //点击店铺logo 显示
    closeStore: false, //暂停开店；/店铺打烊了
    shouHoursTime: { // 店铺时间对象
      isShopHours: true, //判断是否是营业时间 true=>营业中 false 本店打烊啦/休息中
      startTime: 0, //店铺开始营业时间戳
      endTime: 0 //店铺结束营业时间戳
    },
    meneSwiperLessHeight: 790, //中部滑块减去的高度 》中间滑块距离顶部的距离
    isShowFeeStart: true, //是否显示提示免费餐
    menu: ['点菜', '免费餐', '商家'], //菜单栏
    menuCurrent: 0, //选中 0菜单 1免费餐 2商家
    menuli: 0, //点菜菜单列表选中第几个 
    menuInfo: {}, //存放点菜右侧商品的信息
    shopId: 0, //店铺ID
    goodsMenuList: [], //点菜商品分类列表
    MenuList: [], //点菜分类列表
    goodsListScrollTop: 0,
    allChooseGoodList: [], //所有选择的商品列表（加入购物车）
    isShowFoodSafetyArchives: false, //是否显示食品安全档案 
    spaci: { // 选规格
      isShow: false,
      packageFee: 0, //包装费
      goods: []
    },
    selectGoods: { //所有已选商品
      isShow: false,
      goods: []
    },
    goodsInfo: {}, //点击商品显示商品详情goodsInfo
    animationData:{},//走马灯动画
    marquee:false,//是否开启走马灯
  },
  // 生命周期函数--监听页面加载
  onLoad: function(options) {
    var self = this;
    this.onNetworkStatusChange();
    global.selectGoods = { //所有已选商品
      isShow: false,
      goods: []
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.setData({
      shopId: options.id
    })
  },
  // 页面加载完成触发
  onReady: function() {
    var self = this;
    this.getStoreData();
    var shopId = this.data.shopId;
    // 监听免费餐活动结束后触发
    app.on('freeActivityEnd_'+shopId,function(){
       this.setData({
          feeList: [],
          'res.free':false
        })
    }.bind(self))
  },
  onUnload:function(){
    var shopId = this.data.shopId;
    // 页面销毁移除事件监听
    app.remove('freeActivityEnd_'+shopId);

  },

  // 滑动切换动画结束后触发
  menuSwiperFinish: function(e) {
    var current = e.detail.current;
    this.loadfeedata(current);
    this.setData({
      menuCurrent: current
    })
  },
  // 点击菜单栏切换tabcontnen
  menutap: function(e) {
    var target = e.currentTarget || e.target;
    var current = target.dataset.current;
    this.setData({
      menuCurrent: current
    })
  },
  // 是否加载免费餐数据
  loadfeedata: function(current) {
    if (current == 1 && this.data.res.free && this.data.feeList.length === 0) {
      this.getFeeList();
    }
  },
  // 点击切换菜单列表
  chooseMenu: function(e) {
    // 点击菜单列表 菜单
    global.isChooseMenu = true;
    var target = e.currentTarget || e.target;
    var goodsMenuList = this.data.goodsMenuList[target.dataset.index];
    this.toGoodsList(target.dataset.index, goodsMenuList['scrolltop']);
  },
  // 点菜商品列表滚动触发
  goodsListScroll: function(e) {
    if (global.isChooseMenu) {
      return false;
    }
    var scrollTop = e.detail.scrollTop;
    this.goodsSubMenuScrollTop(scrollTop);
  },
  // 商品小菜单滚动到swiper顶部触发
  goodsSubMenuScrollTop: function(scrollTop) {
    var self = this;
    var thisdata = this.data;
    var goodsMenuList = thisdata.goodsMenuList;
    var MenuList = thisdata.MenuList;
    var menuli = this.data.menuli;
    // return false;
    // 检测滚动触发到第几个
    function testing(scrollTop) {
      var i = 0;
      var len = goodsMenuList.length;
      for (i; i < len; i++) {
        var scrtop = goodsMenuList[i].scrolltop;
        if (scrollTop < scrtop) {
          return i - 1;
        } else if (scrollTop > scrtop && i === len - 1) {
          return i;
        }
      }
    }
    var topi = testing(scrollTop);
    // wx.setNavigationBarTitle({ title: scrollTop + '-' + goodsMenuList[topi].scrolltop + '-' + (goodsMenuList[topi].scrolltop + goodsMenuList[topi].height) + '-' + topi + '-' + (topi === this.data.menuli)})
    console.log(topi + ' === ' + menuli);
    if (topi === menuli) {
      return false;
    }
    // wx.setNavigationBarTitle({
    //   title: ''+topi
    // })
    console.log('--------开始渲染------------------');
    // console.time('渲染')
    this.setData({
      menuli: topi
    }, function() {
      // console.timeEnd('渲染');
      console.log('--------渲染结束------------------');      
    })
  },
  // 菜单跳转到对应的商品
  toGoodsList: function(index, goodsListScrollTop) {
    clearTimeout(global.isChooseMenuTimeout);
    var self = this;
    this.setData({
      menuli: index,
      goodsListScrollTop: goodsListScrollTop
    }, function() {
      clearTimeout(global.isChooseMenuTimeout);
      global.isChooseMenuTimeout = setTimeout(function() {
        global.isChooseMenu = false;
        clearTimeout(global.isChooseMenuTimeout);
      }, 100)
    }.bind(self))
  },
  // 获取店铺首页信息
  getStoreData: function() {
    var self = this;
    var shopId = this.data.shopId;
    if (shopId === 0) {
      return false;
    }
    common.postJson({
      url: '/v2/user/shop/detail',
      data: {
        shopId: shopId
      },
      success: function(result) {
        console.log(result);
        
          // <!--自己新增字段 addListnum 添加数量 默认为0-- >
          //   <!--自己新增字段 addnum 添加数量 默认为0-- >
          //   <!--自己新增字段 allAddCartNum 添加所有数量 默认为0-- >
          //   <!--自己新增字段 amount 消费总金额 默认为0-- >
          //   <!--自己新增字段 originalAmount 消费原价总金额 默认为0-- >
          //   <!--自己新增字段 isSelect 规格是否选中 默认为false-- >
          //   <!--自己新增字段 spaciPrice 规格费用 默认为0-- >

          var i = 0,
          rdata = result.data;
          wx.setNavigationBarTitle({
            title: rdata.name
          })
          rdata.allAddCartNum = 0;
          rdata.amount = 0;
          rdata.originalAmount = 0;
          // 判断店铺是否在营业时间段 （暂时不需要）
          // self.shopHours("14:57", "15:00");
          // self.shopHours(rdata.openTime,rdata.closeTime);

          for (i; i < rdata.sortList.length; i++) {

            var addListnum = 0;
           // 判断是否是预定star-----------
            rdata.sortList[i].isBook = false;
            if(rdata.sortList[i].sortType=='BOOK'){
              rdata.sortList[i].isBook = true;
            }
            // 判断是否是预定end-------
            for (var j = 0; j < rdata.sortList[i].productList.length; j++) {
              // 判断是否是预定star-----------
              rdata.sortList[i].productList[j].isBook = false;
              if(rdata.sortList[i].isBook){
                rdata.sortList[i].productList[j].isBook = true;
                rdata.sortList[i].productList[j].bookOriginalPrice = rdata.sortList[i].productList[j].price;//把价格改成预定原价
                rdata.sortList[i].productList[j].price = rdata.sortList[i].productList[j].bookPrice; //把预订价改成价格
              }
              // 判断是否是预定end-------
              rdata.sortList[i].productList[j].addnum = 0;
              // 如果缓存中有数据 则添加到数据中
              if (rdata.sortList[i].productList[j].addnum != 0) {
                addListnum += parseFloat(rdata.sortList[i].productList[j].addnum);
              }
              rdata.sortList[i].productList[j].spaciPrice = 0;
              // 如果有规格处理规格
              if (rdata.sortList[i].productList[j].specV1List.length != 0) {
                for (var s = 0; s < rdata.sortList[i].productList[j].specV1List.length; s++) {
                  for (var il = 0; il < rdata.sortList[i].productList[j].specV1List[s].itemList.length; il++) {
                    rdata.sortList[i].productList[j].specV1List[s].itemList[il].isSelect = false;
                  }
                }
              }
            }
            rdata.sortList[i].addListnum = addListnum;
          }
          self.setData({
            res: rdata,
            copyRes: common.deepCopy(rdata)
          }, function() {
            wx.hideLoading();
            this.shopStatus(rdata.status);
            this.ajaxLoaded();
          }.bind(self))
        
      },
      fail: function(err) {
        wx.hideLoading();
        // self.showModal('数据异常,网络走丢了');
        wx.redirectTo({
          url: '../error/index?msg=数据异常,网络走丢了',
        })
      },
      complete: function(complete) {}
    })
  },
  // 加载数据完成后 需要调用的方法
  ajaxLoaded: function() {
    // 获取节点
    var self = this;
    var data = {};
    var dataTimeout = null;
    // 添加数据
    function addDate(name, value) {
      console.log('---------------addDate----------');
      clearTimeout(dataTimeout);
      data[name] = value;
      dataTimeout = setTimeout(function () {
        console.log('---------------addDate--------setTimeout------');
        self.setData(data);
        data = {};
        clearTimeout(dataTimeout);        
      }, 1000)
    }
    wx.getSystemInfo({
      success: function(res) {
        var windowHeight = res.windowHeight;
        var query = wx.createSelectorQuery()
        query.select('#order_dishes').boundingClientRect()
        query.exec(function(res) {
          addDate('meneSwiperLessHeight', windowHeight - res[0].top);
        })
      },
      fail: function() {
        var query = wx.createSelectorQuery()
        query.select('.windowScreen').boundingClientRect()
        query.exec(function(res) {
          var windowHeight = res[0].height;
          var query = wx.createSelectorQuery()
          query.select('#order_dishes').boundingClientRect()
          query.exec(function(res) {
            addDate('meneSwiperLessHeight', windowHeight - res[0].top);
          })
        })
      }
    })
    // 点菜商品列表
    this.getAllRects('.swiperGoodsLi', function(rects) {
      for (var i = 0; i < rects.length; i++) {
        rects[i].scrolltop = rects[i].top - rects[0].top;
      }
      addDate('goodsMenuList', common.deepCopy(rects));
    });
  
    // 点菜菜单列表
    this.getAllRects('.swiperSubMenuLi', function (rects) {
      for (var i = 0; i < rects.length; i++) {
        rects[i].scrolltop = rects[i].top - rects[0].top;
      }
      addDate('MenuList', common.deepCopy(rects));
    });
    // 公告走马灯
    common.getAllRects('#storedescriptionBox',function(box){
      console.log(box);
      if (!box[0]){
        return false;
      }
      var margueeWidth = box[0].width;
      common.getAllRects('#storedescription', function (merquee) {
        var length = merquee[0].width;
        if (length >= margueeWidth) {
          self.setData({
            marquee:true
          })
          length += 50;
          var distance = length;
          var duration = distance * 20;
          self.marsquee(duration, -distance);
          setInterval(function () {
            self.marsquee(0, 0, function () {
              self.marsquee(duration, -distance);
            });
          }, duration+50)
        }
      })
    })
    // return false;
  },
  // 公告走马灯
  marsquee(duration, distance,callback){
    callback = callback||function(){};
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: duration,
      timingFunction: "linear",
      delay: 0
    })
    animation.translate(distance).step();
    this.setData({
      animationData: animation.export()
    }, callback)
  },
  // 点击 + 加入购物车
  changeAddToCart: function(e) {
    console.log('------changeAddToCart--------')
    // 判断时间打烊了
    var closeStore = this.data.closeStore;
    if (closeStore) {
      wx.showToast({
        title: '店铺打烊了',
      })
      return false;
    }
    var self = this;
    this.toCartIsEmptySelectGoods();
    // 防止点击太快 端数据还没更新
    console.log(global.isToCart);
    if (global.isToCart) {
      return false;
    }
    global.isToCart = true;
    var e = e.currentTarget || e.target;
    var dataset = e.dataset;
    var spaciindex = dataset.spaciindex;
    console.log(dataset);
    // 处理选预定餐和普通餐
    var sortList = this.data.res.sortList[dataset.index];
    var globalGoods = global.selectGoods.goods
    console.log(globalGoods);
    if(globalGoods.length!=0&&sortList.isBook!=globalGoods[0].isBook){
        wx.showModal({
          title:'温馨提示',
          content:'预定商品和普通商品只能选择一种，是否取消'+(globalGoods[0].isBook?'预定':'普通')+'商品？',
          cancelText:'否',
          confirmText:'是',
          success:function(res){
            if(res.confirm){
                self.emptySelectGoods(function(){
                  addToCart.call(self)
                });
            }
          },
          complete:function(){
            global.isToCart = false;
          }
        })
        return false;
    }
    addToCart.call(this);
    function addToCart(){
      console.log(this);
      if (spaciindex){
        var productList = sortList.productList;
        var specV1List = productList[dataset.gindex].specV1List;
        productList[dataset.gindex].spaciIndex = dataset.spaciindex;
        productList[dataset.gindex].spaciMsg = dataset.spacimsg;
        productList[dataset.gindex].spaciPrice = dataset.spaciprice;
        var setGproductList = 'res.sortList[' + dataset.index + '].productList[' + dataset.gindex + ']';
        // 处理规格
        var spaciindexArr = [];
        console.log(spaciindex);
        console.log(typeof spaciindex);
        if (spaciindex.indexOf(',') == -1) {
          spaciindexArr.push(spaciindex);
        } else {
          spaciindexArr = spaciindex.split(',');
        }
        for (var i = 0; i < specV1List.length; i++) {
          for (var j = 0; j < specV1List[i].itemList.length; j++) {
            specV1List[i].itemList[j].isSelect = false;
          }
        }
        for (var i = 0; i < spaciindexArr.length; i++) {
          spaciindexArr[i] = spaciindexArr[i].split('_');
          specV1List[spaciindexArr[i][0]].itemList[spaciindexArr[i][1]].isSelect = true;
        }
        console.log(productList[dataset.gindex]);
        console.log('00000');
        this.setData({
          [setGproductList]: productList[dataset.gindex]
        })
      }
      
      console.log(this.data.res.sortList[0]);
      this.changeShopCart(dataset.index, dataset.gindex, true);  
    }
    
  },
  // 点击 - 移除购物车
  changeLessToCart: function(e) {
    // 防止点击太快 数据还没更新
    if (global.isToCart) {
      return false;
    }
    global.isToCart = true;
    var e = e.currentTarget || e.target;
    var dataset = e.dataset;
    var spaciindex = dataset.spaciindex;
    if (dataset.addnum == 0) {
      return false;
    }
    console.log(this.data.res.sortList[dataset.index].productList[dataset.gindex]);
    console.log('---------------->');
    this.changeShopCart(dataset.index, dataset.gindex, false);
  },
  // 修改店铺购物车
  // bool true+ false-
  changeShopCart: function(index, gindex, bool) {
    var self = this;
    var shopId = this.data.shopId;
    var sortList = this.data.res.sortList;
    console.log('-------changeShopCart-------------');
    console.log(sortList);
    var productList = sortList[index].productList[gindex];
    // 加减算法
    productList.addnum = bool ? ++productList.addnum : productList.addnum != 0 ? --productList.addnum : 0;
    var countGoodsNum = this.countGoodsNum();

    this.pushOrShiftSelectGoods(index, gindex, productList, 1, bool); //添加到已选商品

    var obj = Object.create(null);
    var countAmount = self.countAmount();
    obj['res.amount'] = parseFloat(countAmount.price + countAmount.packageFee).toFixed(2);
    obj['res.originalAmount'] = parseFloat(countAmount.originalPrice + countAmount.packageFee).toFixed(2);
    obj['res.allAddCartNum'] = countGoodsNum['res.allAddCartNum'];
    obj['res.sortList[' + index + '].addListnum'] = countGoodsNum['res.sortList'][index].addListnum;
    obj['res.sortList[' + index + '].productList[' + gindex + ']'] = countGoodsNum['res.sortList'][index].productList[gindex];
    this.setData(obj, function() {
      // 防止点击太快 数据还没更新 end
      global.isToCart = false;
    })
  },
  // 计算选中商品数量
  countGoodsNum: function(sortList) {
    if (sortList) {
      var sortList = sortList;
    } else {
      var sortList = this.data.res.sortList;
    }
    var allAddCartNum = 0;
    for (var i = 0; i < sortList.length; i++) {
      var addListnum = 0;
      for (var j = 0; j < sortList[i].productList.length; j++) {
        addListnum += sortList[i].productList[j].addnum;
      }
      sortList[i].addListnum = addListnum;
      allAddCartNum += addListnum;
    };
    return {
      'res.allAddCartNum': allAddCartNum,
      'res.sortList': sortList
    }
  },
  // 计算总金额
  countAmount: function () {
    var selectGoods = global.selectGoods.goods;
    var len = selectGoods.length;
    var countAmount = {
      originalPrice: 0,
      price: 0,
      packageFee:0
    };
    if (len==0) {
      return countAmount;
    }
    var i = 0;
    for(i;i<len;i++){
      countAmount.price += (selectGoods[i].addnum * (selectGoods[i].price + selectGoods[i].spaciPrice));
      countAmount.originalPrice += (selectGoods[i].addnum * (selectGoods[i].originalPrice + selectGoods[i].spaciPrice));
      countAmount.packageFee += (selectGoods[i].addnum * selectGoods[i].packageFee);
    }
    return countAmount;
  },
  // 显示规格
  showSpaci: function(e) {
    // 判断时间打烊了
    var self = this;
    var closeStore = this.data.closeStore;
    if (closeStore) {
      wx.showToast({
        title: '店铺打烊了',
      })
      return false;
    }

    var target = e.currentTarget || e.target;
    var index = target.dataset.index;
    var gindex = target.dataset.gindex;
    // 
    var sortList = this.data.res.sortList[index];
    // 处理选预定餐和普通餐
    var globalGoods = global.selectGoods.goods
    if(globalGoods.length!=0&&sortList.isBook!=globalGoods[0].isBook){
        wx.showModal({
          title:'温馨提示',
          content:'预定商品和普通商品只能选择一种，是否取消'+(globalGoods[0].isBook?'预定':'普通')+'商品？',
          cancelText:'否',
          confirmText:'是',
          success:function(res){
            if(res.confirm){
                self.emptySelectGoods(function(){
                  showGoodsSpaci.call(self)
                });
            }
          },
          complete:function(){
            global.isToCart = false;
          }
        })
        return false;
    }
    // 
    showGoodsSpaci.call(this);
    function showGoodsSpaci(){
        var goods = sortList.productList[gindex];
        var msg = '';
        var spaciPrice = 0;
        for (var i = 0; i < goods.specV1List.length; i++) {
          for (var j = 0; j < goods.specV1List[i].itemList.length; j++) {
            goods.specV1List[i].itemList[j].isSelect = false; //默认选中每项第一个
          }
          goods.specV1List[i].isSelect = false;
          goods.specV1List[i].itemList[0].isSelect = true; //默认选中每项第一个
          msg = msg + '   ' + goods.specV1List[i].itemList[0].label;
          spaciPrice += parseFloat(goods.specV1List[i].itemList[0].price);
        }
        this.setData({
          "spaci.isShow": true,
          "spaci.addnum": 1,
          "spaci.goods": goods,
          'spaci.goods.spaciMsg': msg,
          'spaci.goods.spaciPrice': spaciPrice,
          "spaci.index": index,
          "spaci.gindex": gindex
        })     
    }

  },
  // 关闭选规格
  closeSpaci: function() {
    this.setData({
      "spaci.isShow": false
    })
  },
  // 选规格
  chooseSpaci: function(e) {
    var target = e.currentTarget || e.target;
    var spindex = target.dataset.spindex;
    var spinx = target.dataset.spinx;
    var goods = this.data.spaci.goods;
    var specV1List = goods.specV1List;
    var msg = '';
    var spaciPrice = 0;
    for (var i = 0; i < specV1List[spindex].itemList.length; i++) {
      specV1List[spindex].itemList[i].isSelect = false;
    }
    specV1List[spindex].itemList[spinx].isSelect = true;
    for (var i = 0; i < specV1List.length; i++) {
      for (var j = 0; j < specV1List[i].itemList.length; j++) {
        if (specV1List[i].itemList[j].isSelect) {
          msg = msg + '   ' + specV1List[i].itemList[j].label;
          spaciPrice += parseFloat(specV1List[i].itemList[j].price);
          break;
        }
      }
    }
    this.setData({
      "spaci.goods.specV1List": specV1List,
      'spaci.goods.spaciMsg': msg,
      'spaci.goods.spaciPrice': spaciPrice
    })
  },
  // 选规格 选好了
  chooseSpaciOk: function() {
    this.toCartIsEmptySelectGoods();
    var self = this;
    var spaci = this.data.spaci;
    console.log('-----------spaci--------');
    // 添加规格费用
    var sortList = this.data.res.sortList;
    // 选出选中规格编号
    var spaciIndex = '';
    var specV1List = spaci.goods.specV1List;
    for (var i = 0; i < specV1List.length; i++) {
      for (var j = 0; j < specV1List[i].itemList.length; j++) {
        if (specV1List[i].itemList[j].isSelect) {
          if (spaciIndex == '') {
            spaciIndex = i + '_' + j;
          } else {
            spaciIndex = spaciIndex + ',' + i + '_' + j;
          }
          break;
        }
      }
    }
    // 
    sortList[spaci.index].productList[spaci.gindex].spaciPrice = spaci.goods.spaciPrice;
    sortList[spaci.index].productList[spaci.gindex].addnum += spaci.addnum;
    sortList[spaci.index].productList[spaci.gindex].spaciIndex = spaciIndex; //新增字段 规格下标
    sortList[spaci.index].productList[spaci.gindex].specSelectList = []; //新增字段 选中规格组
    sortList[spaci.index].productList[spaci.gindex].spaciMsg = spaci.goods.spaciMsg; //新增字段 规格描述
    // 
    sortList[spaci.index].productList[spaci.gindex].specV1List = spaci.goods.specV1List; //规格
    // console.log('规格0---------');
    // console.log(spaci);
    // 计算数量
    var countGoodsNum = this.countGoodsNum();
    // 
    var productList = sortList[spaci.index].productList[spaci.gindex];
    this.pushOrShiftSelectGoods(spaci.index, spaci.gindex, productList, spaci.addnum, true);
    var newSortList = 'sortList[' + spaci.index + '].productList[' + spaci.gindex + ']';
    // 计算金额
    console.log('计算金额');
    console.log(sortList);
    var obj = Object.create(null);
    var countAmount = self.countAmount();
    obj['res.amount'] = parseFloat(countAmount.price + countAmount.packageFee).toFixed(2);
    obj['res.originalAmount'] = parseFloat(countAmount.originalPrice + countAmount.packageFee).toFixed(2);
    obj[newSortList] = productList;
    obj["spaci.isShow"] = false;
    obj['res.allAddCartNum'] = countGoodsNum['res.allAddCartNum'];
    obj['res.sortList[' + spaci.index + '].addListnum'] = countGoodsNum['res.sortList'][spaci.index].addListnum;
    obj['res.sortList[' + spaci.index + '].productList[' + spaci.gindex + ']'] = countGoodsNum['res.sortList'][spaci.index].productList[spaci.gindex];
   console.log('-------obj----------');
    console.log(obj);
    this.setData(obj)
  },
  // 选规格数量加 
  changeSpaciNumAdd: function() {
    // 判断时间打烊了
    var closeStore = this.data.closeStore;
    if (closeStore) {
      wx.showToast({
        title: '店铺打烊了',
      })
      return false;
    }
    var addnum = this.data.spaci.addnum;
    addnum++;
    this.setData({
      "spaci.addnum": addnum
    })
  },
  // 选规格数量减 
  changeSpaciNumLess: function() {
    var addnum = this.data.spaci.addnum;
    if (addnum == 1) {
      return false;
    }
    addnum--;
    this.setData({
      "spaci.addnum": addnum
    })
  },
  //所有已选商品
  // 处理已选商品 bool true+ false-
  handleSelectGoods: function() {
    var selectArray = [];
    var selectObject = Object.create(null);
    var goods = global.selectGoods.goods;
    console.log('--------goods-------');
    console.log(goods);
    for (var i = 0; i < goods.length; i++) {
      var idspaciIndex = goods[i].id + '/' + goods[i].spaciIndex;
      if (selectObject[idspaciIndex]) {
        selectObject[idspaciIndex].push(goods[i]);
      } else {
        selectObject[idspaciIndex] = [goods[i]];
      }
    }

    for (var i in selectObject) {
      if (selectObject[i].length > 1) {
        var addnum = 0;
        var priceSpciNum = 0;
        for (var j = 0; j < selectObject[i].length; j++) {
          addnum += selectObject[i][j].addnum;
          priceSpciNum += (parseFloat(selectObject[i][j].price) + parseFloat(selectObject[i][j].spaciPrice)) * selectObject[i][j].addnum;
        }
        var jsonNewSobj = common.deepCopy(selectObject[i][0]);
        jsonNewSobj.addnum = addnum;
        jsonNewSobj.priceSpciNum = parseFloat(priceSpciNum).toFixed(2);
        jsonNewSobj.AllPackageFee = parseFloat(jsonNewSobj.packageFee * jsonNewSobj.addnum).toFixed(2);
        selectArray.push(jsonNewSobj);
      } else {
        var jsonNewSobj = common.deepCopy(selectObject[i][0]);
        var priceSpciNum = (parseFloat(jsonNewSobj.price) + parseFloat(jsonNewSobj.spaciPrice)) * jsonNewSobj.addnum;
        jsonNewSobj.priceSpciNum = parseFloat(priceSpciNum).toFixed(2);
        // 包装费用
        jsonNewSobj.AllPackageFee = parseFloat(parseFloat(jsonNewSobj.packageFee) * jsonNewSobj.addnum).toFixed(2);
        selectArray.push(jsonNewSobj);
      }
    }
    return selectArray;
  },
  // 添加或删除到已选商品 bool true+ false-
  pushOrShiftSelectGoods: function(index, gindex, productList, addnum, bool) {
    console.log('-------添加或删除到已选商品-------------');
    console.log(productList);
    var JSONproductList = common.deepCopy(productList);
    JSONproductList.index = index;
    JSONproductList.gindex = gindex;
    JSONproductList.addnum = addnum;
    var goods = global.selectGoods.goods;
    console.log('-----------JSONproductList----------')
    console.log(JSONproductList);
    if (bool) {
      goods.push(JSONproductList);
    } else {
      for (var i = 0; i < goods.length; i++) {
        if (JSONproductList.id == goods[i].id) {
          if (goods[i].addnum > 1 && goods[i].addnum > addnum) {
            goods[i].addnum -= addnum;
          } else {
            goods.splice(i, 1);
          }
          break;
        }
      }
    }
  },
  // 显示关闭已选商品 isShow 'close'
  showCloseSelectGoods: function(isShow, callback) {
    var self = this;
    var goods = self.handleSelectGoods();
    console.log(goods);
    console.log('---------goods;;;;;;;;;')
    var packageFee = 0;
    for (var i = 0; i < goods.length; i++) {
      packageFee += (goods[i].packageFee * goods[i].addnum);
    }
    var obj = Object.create(null);

    if (isShow !== 'close') {
      var isShow = this.data.selectGoods.isShow;
      obj["selectGoods.isShow"] = !isShow;
    }
    obj["selectGoods.goods"] = goods;
    obj["selectGoods.packageFee"] = packageFee;
    console.log('-------callback---------');
    console.log(goods);
    if (callback) {
      callback({
        goods: goods,
        packageFee: packageFee
      })
    }
    console.log(obj);
    this.setData(obj)
  },
  // 利用冒泡处理购物车数据
  changChoosCart: function(e) {
    this.showCloseSelectGoods('close');
  },
  // 已选商品 加
  SelectGoodsAddLessBtn: function() {

  },
  // 已选商品 减
  SelectGoodsAddLessBtn: function() {

  },
  // 遍历所有已加入购物车的商品 赋给新的变量  selectGoods
  eachGoodsCart: function() {

  },
  // 如果是送水送气 只能选一件商品 所以先清空购物车再选商品
  toCartIsEmptySelectGoods: function() {
    var type = this.data.res.type;
    // var goods = global.selectGoods.goods;
    if (type === 'WATER' || type === 'COALGAS') {
      // if (goods.length)
      this.emptySelectGoods();
    }
  },
  // 清空选中的的商品
  emptySelectGoods: function(callback) {
    var goods = global.selectGoods.goods
    callback = callback||function(){};
    console.log(callback);
    if (goods.length == 0) {
      return false;
    }
    global.selectGoods.goods = [];
    this.showCloseSelectGoods('close');
    var copyRes = this.data.copyRes;
    this.setData({
      res: copyRes
    },callback)
  },
  //点击商品显示商品详情goodsInfo
  clickGoods: function(e) {
    var target = e.currentTarget || e.target;
    var dataset = target.dataset;
    var sortList = this.data.res.sortList;

    sortList[dataset.index].productList[dataset.gindex].index = dataset.index;
    sortList[dataset.index].productList[dataset.gindex].gindex = dataset.gindex;
    this.setData({
      goodsInfo: sortList[dataset.index].productList[dataset.gindex]
    })
  },
  // \ 关闭商品显示商品详情goodsInfo
  closeGoodsInfo: function() {
    this.setData({
      goodsInfo: {}
    })
  },
  // 给商家打电话
  tel: function() {
    var tel = this.data.res.tel;
    wx.makePhoneCall({
      phoneNumber: tel
    })
  },
  // 点击关闭免费餐提示
  closeShowFeeTip: function() {
    this.setData({
      isShowFeeStart: false
    })
  },
  // 缓存店铺购物车
  // addnum = 》当前的数量
  storageShopCart: function(index, gindex, addnum) {

  },
  // 没意义
  catchtopGoods: function() {
    return false;
  },
  // 如果店铺已经关闭
  shopStatus: function(status) {
    // NOTYET = 未开店
    // AUDITING = 审核中
    // REJECT = 被驳回
    // OPEN = 正常开店
    // CLOSE = 暂停开店
    // CLOSEX = 停业整改
    var self = this;
    var wxnavigateBack = function() {
      wx.navigateBack({
        delta: 1
      })
    }
    switch (status) {
      case 'NOTYET':
        self.showModal('未开店', wxnavigateBack)
        break;
      case 'AUDITING':
        self.showModal('审核中', wxnavigateBack)
        break;
      case 'REJECT':
        self.showModal('被驳回', wxnavigateBack)
        break;
      case 'OPEN':
        // showModal('营业中...')
        break;
      case 'CLOSE':
        self.setData({
          closeStore: true
        })
        // self.showModal('暂停开店/店铺打烊了', wxnavigateBack)
        break;
      case 'CLOSEX':
        self.showModal('停业整改', wxnavigateBack)
        break;
    }
  },
  // 弹出并返回上一个页面
  showModal: function(content, callback) {
    wx.showModal({
      title: '温馨提示',
      content: content,
      showCancel: false,
      complete: function() {
        wx.navigateBack({
          delta: 1
        })
      }
    });
  },
  //图片预览 
  previewImage: function(current, urls) {
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: urls // 需要预览的图片http链接列表
    })
  },
  // 位置图片预览
  locationPreviewImage: function(e) {
    var target = e.currentTarget || e.target;
    var dataset = target.dataset;
    var urls = this.data.res.pictureUrlSet.photosList;
    this.previewImage(dataset.current, urls)
  },
  // 食品安全档案图片预览
  foodPreviewImage: function(e) {
    var target = e.currentTarget || e.target;
    var dataset = target.dataset;
    var pictureUrlSet = this.data.res.pictureUrlSet;
    if (!pictureUrlSet.licenceList) {
      pictureUrlSet.licenceList = [];
    }
    pictureUrlSet.licenceList.unshift(pictureUrlSet.businessLicence, pictureUrlSet.foodLicence);
    this.previewImage(dataset.current, pictureUrlSet.licenceList)
  },
  showOrHideFoodSafetyArchives: function() {
    this.setData({
      isShowFoodSafetyArchives: !this.data.isShowFoodSafetyArchives
    })
  },
  // 获取元素
  getAllRects: function(className, callback) {
    wx.createSelectorQuery().selectAll(className).boundingClientRect(function(rects) {
      callback(rects);
    }).exec()
  },
  // isShopHours判断是否是营业时间 /本店打烊啦
  shopHours: function(start, end) {
    var self = this;
    var date = new Date();
    var obj = Object.create(null);
    obj.getTime = date.getTime();
    obj.getFullYear = date.getFullYear();
    obj.getMonth = date.getMonth() + 1;
    obj.getDate = date.getDate();
    obj.getHours = date.getHours();
    obj.getMinutes = date.getMinutes();
    obj.getSeconds = date.getSeconds();
    var startTime = obj.getFullYear + '/' + obj.getMonth + '/' + obj.getDate + ' ' + start + ':00';
    var endTime = obj.getFullYear + '/' + obj.getMonth + '/' + obj.getDate + ' ' + end + ':00';
    var setObj = Object.create(null);
    setObj.startTime = new Date(startTime).getTime();
    setObj.endTime = new Date(endTime).getTime();
    if (obj.getTime > setObj.startTime && obj.getTime < setObj.endTime) {
      setObj.isShopHours = true;
    } else {
      setObj.isShopHours = false;
    }
    this.setData({
      shouHoursTime: setObj
    })
    // 每隔30miao钟监听一下店铺是否打烊或者开店
    var shopOpenOrCloseInterval = setInterval(function() {
      var getTime = new Date().getTime();
      // 开门
      if (getTime > setObj.startTime && getTime < setObj.endTime && setObj.isShopHours === false) {
        self.setData({
          'shouHoursTime.isShopHours': true
        })
      }
      // 打烊
      if ((getTime < setObj.startTime || getTime > setObj.endTime) && setObj.isShopHours === true) {
        self.setData({
          'shouHoursTime.isShopHours': false
        })
      }
    }, 30000)
  },
  // 关闭 点击店铺logo出现的view
  showOrCloseShopMsg: function() {
    this.setData({
      shopMsg: !this.data.shopMsg
    })
  },
  // 提交订单
  submitOrder: function() {
    var data = this.data;
    if (!common.hasLogin()) {
      return false;
    };
    var self = this;
    var obj = common.deepCopy(data.res);
    this.showCloseSelectGoods('close', function(selectGoods) {
      console.log('----close---selectGoods----');
      console.log(selectGoods);
      if (selectGoods.goods.length === 0) {
        return false;
      }
      obj.goodsList = selectGoods.goods;
      obj.packageFee = selectGoods.packageFee;
      delete obj.sortList;
      delete obj.pictureIdSet;
      delete obj.pictureUrlSet;
      var data = JSON.stringify(obj);
      //订单类型 GENERAL=普通订单(默认) BOOK=预定订单
      
      var orderType = selectGoods.goods[0].isBook?'BOOK':'GENERAL';

      // console.log(obj);
      // return false;
      wx.setStorage({
        key: 'goodsOrderInfo',
        data: data,
        // encodeURIComponent
        // decodeURIComponent
        success: function() {
          var TYPE = self.data.res.type;
          wx.navigateTo({
            // url: '../orderInfo/orderInfo?source=' + self.route + '&goodsOrderInfo=' + encodeURIComponent(JSON.stringify(obj)),
            url: '../submitOrder/index?storeType=' + TYPE+'&orderType='+orderType+'&source=' + self.route,
          })
        },
        fail: function() {
          wx.navigateTo({
            // decodeURIComponent
            url: '../submitOrder/index?storeType=' + TYPE+'&orderType='+orderType+'&source=' + self.route + '&goodsOrderInfo=' + encodeURIComponent(JSON.stringify(obj)),
          })
        }
      })
    })
  },
  // 获取免费餐列表
  getFeeList() {
    var shopId = this.data.shopId;
    var self = this;
    common.postJson({
      url: '/v2/user/freemeal/last',
      data: {
        shopId: shopId
      },
      success: function(result) {
        console.log('--------获取免费餐列表--------');
        console.log(result);
        var data = result.data;
        var feeList = [];
        var dataType = Object.prototype.toString.call(data);
        var selfFeeList = self.data.feeList;
        if (dataType === "[object Array]") {
          for (var i = 0; i < data.length; i++) {
            // if (data.status == 'CANCEL' && data.status == 'END') {                           
            feeList.push(data[i]);
            // }
          }
          selfFeeList = selfFeeList.concat(feeList);
        } else {
          // if (data.status == 'CANCEL' && data.status == 'END') {
          selfFeeList.push(data);
          // }
        }
        /*
          NOTYET=未开始
          DRAWING=抽奖中
          PUBLISH=已发布
          END=已结束
          CANCEL=已取消
        */

        self.setData({
          feeList: selfFeeList
        })
      }
    })
  },
  // 点击进入大厅
  toFeeActive: function(e, roomid, storename) {
    if (!common.hasLogin()) {
      return false;
    };
    if (e) {
      var dataset = e.currentTarget.dataset;
      var storename = this.data.res.name;
      var roomid = dataset.roomid;
    }
    var shopId = this.data.shopId;
    if (!roomid||!shopId) {
      return false;
    }
    wx.navigateTo({
      url: '../feeActivityHall/index?shopId='+shopId+'&roomId=' + roomid + '&storename=' + storename,
    })
  },
  // 显示免费餐详情
  seeFeeInfo: function(e) {
    var dataset = e.currentTarget.dataset;
    var feeList = this.data.feeList;
    var product = feeList[dataset.feeindex].productList[dataset.feegindex];
    product.isFee = true;
    product.id = feeList[dataset.feeindex].id;
    product.room1Id = feeList[dataset.feeindex].room1Id;
    product.room2Id = feeList[dataset.feeindex].room2Id;
    product.room3Id = feeList[dataset.feeindex].room3Id;
    this.setData({
      goodsInfo: product
    })
  },
  // 点击免费餐轮播图跳转到免费餐大厅
  goFreeHall() {
    var feeList = this.data.feeList[0];
    var roomId = 0;
    var storename = this.data.res.name;
    if (feeList.numberOfRoom1 < 90) {
      roomId = feeList.room1Id;
    } else if (feeList.numberOfRoom2 < 90) {
      roomId = feeList.room2Id;
    } else if (feeList.numberOfRoom3 < 99) {
      roomId = feeList.room3Id;
    } else {
      wx.showModal({
        title: '温馨提示',
        content: '这次活动已经满人了，请参加下次活动',
      })
      return false;
    }
    this.toFeeActive(null, roomId, storename)
  },
  // 网络监听
  onNetworkStatusChange() {
    var route = this.route;
    var options = this.options;
    var j = 0;
    for (var i in options) {
      if (j == 0) {
        route = route + '?' + i + '=' + options[i]
      } else {
        route = route + '&' + i + '=' + options[i]
      }
      j++;
    }
    route = encodeURIComponent(route);
    wx.onNetworkStatusChange(function(res) {
      global.isConnected = null;
      if (res.isConnected) {
        clearTimeout(global.isConnected);
      } else {
        global.isConnected = setTimeout(function() {
          console.log('没有网络了')
        }, 30000)
        // wx.redirectTo({
        //   url: '../error/index?route=' + route.replace('pages', '..') +'&redirectTo=true&msg=数据异常,网络走丢了',
        // })
      }
    })
  },
  // 页面跳转到
  navigateTo: function(e) {
    var target = e.currentTarget || e.target;
    if (!target.dataset.uri) {
      return false;
    }
    wx.navigateTo({
      url: target.dataset.uri,
    })
  },
  /**
 * 用户点击右上角分享
 */
  onShareAppMessage: function () {
    var storename = this.data.res.name;
    console.log(this);
    console.log(storename);
    var shopId = this.data.shopId;
    var shareUrl = encodeURIComponent('/pages/store/index?id=' + shopId)
    if (storename){
      return {
        title: storename,
        path: 'pages/index/index?navigateTo=' + shareUrl
      }
    }
  }
})