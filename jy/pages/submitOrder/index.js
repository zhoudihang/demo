var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    display: true,
    goodsOrderInfo: {},// 获取从店铺页面下单的数据
    resAddress:{},
    thisRoute:'',
    ghideNum:1,
    storeType:'',
    isShowTextarea:true,//是否显示备注信息
    orderType:'GENERAL',//订单类型 GENERAL=普通订单(默认) BOOK=预定订单(bookTime必须传) 
    bookTime:'',//预定时间
    showBook:false,//是否显示预订时间
    bookTimeArray:[],//预定时间点
    bookMonth:'',//预定日期 
    bookTimeIndex:1111111111,
    amount:0,//总金额
    couponId:0,//免单券id
    postmyrecord:'',//请求优惠券data
    myrecord: [], //我的优惠券 /v2/user/freemeal/myrecord/win
    hasWinCord:false, //是否可使用免单券
    toUseNum:0,//可用优惠券个数
    isuse:'' // 是否使用优惠券
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    
    var setData = {};
    if(options.orderType){
       setData.orderType = options.orderType;
    }
    if(options.storeType){
       setData.storeType = options.storeType;
    }
    this.setData(setData);

    wx.showLoading();
    var self = this;
    if (!common.hasLogin()) {
      wx.hideLoading();
      return false;
    };
    // 获取从店铺页面下单的数据
    // if (options.source && options.source=="pages/store/index"){
    if (true) {
      // 获取从店铺页面下单的数据
      wx.getStorage({
        key: 'goodsOrderInfo',
        success: function(res) {
            self.handleStoreGoodsData(res.data);
        },
        fail: function() {
          if (options.goodsOrderInfo) {
            var goodsOrderInfo = decodeURIComponent(options.goodsOrderInfo);
            self.handleStoreGoodsData(goodsOrderInfo);
          } else {
            wx.hideLoading();
            wx.showModal({
              title: '温馨提示',
              content: '数据还在异次元,还没传过来',
              complete: function() {
                wx.navigateBack()
              }
            })
          }
        }
      })
    } else {
      // 根据店铺ID获取下单的数据
      // this.getOrderInfo(options);
    }

    var free = wx.getStorageSync('free');
    if(free){
      wx.removeStorageSync('free')
    }
    
  },
  // 获取店铺传过来的信订单息
  handleStoreGoodsData(data){
    var self = this;
    var goodsOrderInfo = JSON.parse(data);
    // 拉取优惠券
    self.getmyrecord(goodsOrderInfo);
    // 计算总金额
    var amount = this.countAmount({goodsOrderInfo:goodsOrderInfo});
    // 拉取收货地址
    self.getAddress(goodsOrderInfo.id);
    goodsOrderInfo.remarks = ''; //备注
    var ghideNum = self.data.ghideNum;
    for (var i = 0; i < goodsOrderInfo.goodsList.length; i++) {
      if (i <= ghideNum) {
        goodsOrderInfo.goodsList[i].isShow = true;
      } else {
        goodsOrderInfo.goodsList[i].isShow = false;
      }
    }
    var amountShippingFee = parseFloat(goodsOrderInfo.amount) + parseFloat(goodsOrderInfo.shippingFee);
    goodsOrderInfo.amountShippingFee = amountShippingFee.toFixed(2);
    self.setData({
      goodsOrderInfo: goodsOrderInfo,
      amount:amount,
      thisRoute: encodeURIComponent(self.route)
    }, function() {}) 
   },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var self = this;
    var shopId = this.data.goodsOrderInfo.id;
    if (shopId) {
      this.getAddress(shopId);
    } else {
      var getShopIdTimeout = setInterval(function() {
        var shopId = self.data.goodsOrderInfo.id;
        if (shopId) {
          self.getAddress(shopId);
        }
        clearTimeout(getShopIdTimeout);
      }, 1000)
    }
    // 获取免单券
    var free = wx.getStorageSync('free');
    if(free){
        var amount = this.countAmount({
          free:{
            id:free.goodsid
          }
        });
        this.setData({
          amount:amount,
          couponId:free.couponId,
          isuse:free.isuse
        },function(){
        })
    }
  },
  // 获取优惠券列表
  getmyrecord(obj){
    var self = this;
    console.log('获取优惠券列表');
    console.log(obj);
    var postData = {
      shopId: obj.id,
      goodsList:[]
    };
    var i=0;
    for (i; i < obj.goodsList.length;i++){
      var goodsList = {
        productId: obj.goodsList[i].id,
        number: obj.goodsList[i].addnum,
        specV1List:[]
      }
      var j=0;
      for (j; j < obj.goodsList[i].specV1List.length;j++){
        var specV1List = {
          name: obj.goodsList[i].specV1List[j].name,
          itemList:[]
        };
        var k=0;
        for (k; k < obj.goodsList[i].specV1List[j].itemList.length;k++){
          if (obj.goodsList[i].specV1List[j].itemList[k].isSelect){
            var itemList = {
              label: obj.goodsList[i].specV1List[j].itemList[k].label
            };
            specV1List.itemList.push(itemList)
          }
        }
        goodsList.specV1List.push(specV1List)
      }
      postData.goodsList.push(goodsList)
    }
    console.log(JSON.stringify(postData));
    // return false;
    common.postJson({
      url: '/v2/user/freemeal/myrecord/win',
      data:postData,
      success:function(res){
        var hasWinCord = false;
        console.log('------------优惠券');
        console.log(res);
        var i=0;
        var toUseNum = 0 ;//可用优惠券个数
        for(i;i<res.data.length;i++){
          if(res.data[i].ableToUse){
            hasWinCord = true;
            toUseNum += 1;
          }
        }
        self.setData({
          myrecord:res.data,
          hasWinCord:hasWinCord,
          postmyrecord:postData,
          toUseNum:toUseNum
        })
      }
    })
  },
  onUnload(){
    wx.removeStorageSync('free');
  },
  // 用户下单 去结算
  toSettle() {
    var self = this;
    wx.removeStorageSync('free');
    var goodsOrderInfo = this.data.goodsOrderInfo;
    var resAddress = this.data.resAddress;
    var couponId = this.data.couponId;
    var shopId = this.data.goodsOrderInfo.id;
    var route = '/pages/address/address?shopId='+shopId+'&source=' + encodeURIComponent(this.route);
    // return false;
    if (!resAddress.id) {
      // if(true){
      wx.showModal({
        title: '温馨提示',
        content: '你还没添加收货地址，请添加收货地址',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: route,
            })
          }
        }
      })
      return false;
    }
    var orderType = this.data.orderType;
    // 处理数据格式
    var data = Object.create(null);
    data.shopId = goodsOrderInfo.id;
    data.addressId = resAddress.id;
    data.remark = goodsOrderInfo.remarks;
    data.orderType = orderType;
    if(orderType==='BOOK'){
      data.bookTime = this.data.bookTime;
    }
    if(data.bookTime==''){
      // self.showModalTip('请选择预定时间');
      wx.showModal({
        title:'温馨提示',
        content:'请选择预订时间',
        success:function(res){
          if(res.confirm){
             self.handleBookTime();
          }
        }
      })
      return false;
    }
    if(couponId){
      data.couponId = couponId;
    }
    data.goodsList = [];
    console.log(goodsOrderInfo);
    for (var i = 0; i < goodsOrderInfo.goodsList.length; i++) {
      var goodsList = Object.create(null);
      goodsList.productId = goodsOrderInfo.goodsList[i].id;
      goodsList.number = goodsOrderInfo.goodsList[i].addnum;
      goodsList.specV1List = [];
      for (var j = 0; j < goodsOrderInfo.goodsList[i].specV1List.length; j++) {
        var specV1List = Object.create(null);
        specV1List.name = goodsOrderInfo.goodsList[i].specV1List[j].name;
        specV1List.itemList = [];
        for (var k = 0; k < goodsOrderInfo.goodsList[i].specV1List[j].itemList.length; k++) {
          if (goodsOrderInfo.goodsList[i].specV1List[j].itemList[k].isSelect) {
            var itemList = Object.create(null);
            console.log(goodsOrderInfo.goodsList[i].specV1List[j].itemList[k]);
            itemList.label = goodsOrderInfo.goodsList[i].specV1List[j].itemList[k].label;
            specV1List.itemList.push(itemList)
            break;
          }
        }
        goodsList.specV1List.push(specV1List);
      }
      data.goodsList.push(goodsList);
    }
    // console.log(data);
    // return false;

    common.postJson({
      url: '/v2/user/order/add',
      data: data,
      success: function(result) {
        console.log(result);
        var storeType = self.data.storeType;
        var storename = self.data.goodsOrderInfo.name;
        // 送水或者送水
        if (storeType == "COALGAS" || storeType == "WATER"){
          self.showModal('下单成功');
        }else{
          wx.redirectTo({
              url: '/pages/payOrder/index?fee=' + result.data.fee + '&orderId=' + result.data.id+ '&storename=' + storename
          })
        }
        // 
 
      },
      fail: function(err) {
        var data = JSON.parse(err.data);
        if (data.msg) {
          self.showModal(data.msg);
        } else {
          self.showModal('连接超时,提交失败');
        }
      }
    })
  },
  // 备注输入
  textbindinput(e){
    console.log(e);
    var value = e.detail.value;
    this.setData({
        'goodsOrderInfo.remarks':value
    })
  },
  // 拉取收货地址
  getAddress(shopId) {
    var self = this;
    common.postJson({
      url: '/v2/user/address/list',
      data: {
        shopId: shopId
      },
      success: function(result) {
        console.log(data);
        var data = result.data;
        var addressId = 0;
        try {
          addressId = wx.getStorageSync('addressId');
        } catch (e) {
          // Do something when catch error
        }
        var resAddress = Object.create(null);
        if (addressId) {
          for (var i = 0; i < data.length; i++) {
            if (data[i].id == addressId) {
              resAddress = data[i];
              break;
            }
          }
        } else {
          resAddress = data[0];
        }
        self.setData({
          resAddress: resAddress
        })

        wx.hideLoading();
      },
      fail: function(err) {
        wx.hideLoading();
        self.showModal('连接超时,网络走丢了')
      }
    })
  },
  // 弹出并返回上一个页面
  showModal(content, callback) {
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false,
      complete: function() {
        wx.navigateBack({
          delta: 1
        })
      }
    });
  },
  showModalTip(content){
    wx.showModal({
      title: '温馨提示',
      content: content,
      confirmText:'知道了',
      showCancel: false
    });
  },

  // 计算合计/总金额
  countAmount(params){
    console.log(params);
      var goodsOrderInfo = params&&params.goodsOrderInfo?params.goodsOrderInfo:this.data.goodsOrderInfo;
      var goodsList = goodsOrderInfo.goodsList;
      console.log(goodsOrderInfo);
      var self = this;
      if(!goodsList||!goodsList.length){
         return false;
      }
      var amount = 0;
      var packageFee = 0;
      var i=0;
      for (i; i < goodsList.length;i++){
        var j=0;
        var gamount = goodsList[i].price;
        // 使用免费券
        if(params&&params.free&&params.free.id==goodsList[i].id){
           gamount = 0;
           delete params.free;//一张订单只能用一张优惠券
        }
        
        for (j; j < goodsList[i].specV1List.length;j++){
          var spaciPrice = 0;//规格价格
          var k=0;
          for (k; k < goodsList[i].specV1List[j].itemList.length;k++){
            if (goodsList[i].specV1List[j].itemList[k].isSelect){
                spaciPrice += goodsList[i].specV1List[j].itemList[k].price
            }
          }
          console.log('spaciPrice---------------'+spaciPrice);;
          gamount += spaciPrice;
        }
        console.log('gamount-------------'+gamount)
        amount += gamount;
        packageFee += goodsList[i].packageFee*goodsList[i].addnum;
      }
      console.log('amount------'+(amount+packageFee+goodsOrderInfo.shippingFee))
      return amount + packageFee + goodsOrderInfo.shippingFee;
  },
  // true 显示 false 隐藏
  showOrHide(bool) {
    var goodsOrderInfo = this.data.goodsOrderInfo;
    var ghideNum = this.data.ghideNum;
    for (var i = 0; i < goodsOrderInfo.goodsList.length; i++) {
      if (bool) {
        goodsOrderInfo.goodsList[i].isShow = true;
      } else {
        if (i <= ghideNum) {
          goodsOrderInfo.goodsList[i].isShow = true;
        } else {
          goodsOrderInfo.goodsList[i].isShow = false;
        }
      }
    }
    return goodsOrderInfo.goodsList;
  },
  // 显示所有订单
  showAllOrder() {
    this.setData({
      display: false,
      'goodsOrderInfo.goodsList': this.showOrHide(true)
    });
  },

  // 隐藏隐藏订单
  hideOrder() {
    this.setData({
      display: true,
      'goodsOrderInfo.goodsList': this.showOrHide(false)
    });
  },

  // 呼叫电话
  callPhone(e) {
    var phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone,
      success: function() {},
      fail: function() {}
    })
  },
  // 去选优惠券
  toFree(){
    var free = this.data.myrecord.length;
    var postmyrecord =  this.data.postmyrecord;
    var couponId = this.data.couponId;
    var isuse = this.data.isuse;
    if(free===0||postmyrecord==''){
      return false;
    }
    var url = '/pages/free/index?couponId='+couponId+'&postmyrecord='+encodeURIComponent(JSON.stringify(postmyrecord));
    wx.navigateTo({
      url: url,
    })
  },
  // 免费券说明
  toFreemsg(){
    wx.navigateTo({
      url: '/pages/h5/h5?&src='+encodeURIComponent('https://api.jianyiapp.cn/v2/h5/agreement/agreement_coupon.html'),
    })
  },
  nothingtotap(){
    return false;
  },
  // 隐藏预定时间弹框
  isHideBook(){
    this.setData({
        showBook:false,
        isShowTextarea:true
      })
  },
  // 处理预定时间点
  handleBookTime(){
    var bookTimeArray = this.data.bookTimeArray;
    if(bookTimeArray[0]){
      this.setData({
        showBook:true,
        isShowTextarea:false
      })
      return false;
    }
    var openTime = this.data.goodsOrderInfo.openTime;
    var closeTime = this.data.goodsOrderInfo.closeTime;
    function getMonthDateDay(dayNum){
      var getTime = new Date().getTime();
      var date = new Date(getTime + (dayNum * 24 * 60 * 60 * 1000));//明天送
      var getMonth = date.getMonth() + 1;
      var getDate = date.getDate();
      var day = date.getDay();
      console.log(getMonth + '---' + getDate + '---' + day);
      var daymsg = '';
      switch (day) {
        case 1:
          daymsg = '星期一';
          break;
        case 2:
          daymsg = '星期二';
          break;
        case 3:
          daymsg = '星期三';
          break;
        case 4:
          daymsg = '星期四';
          break;
        case 5:
          daymsg = '星期五';
          break;
        case 6:
          daymsg = '星期六';
          break;
        default:
          daymsg = '星期天';
      }
      return {
        getMonth: getMonth,
        getDate: getDate,
        daymsg: daymsg
      }
    }

    // console.log(getMonth+'---'+getDate+'---'+day);

    // console.log(openTime+'----------'+closeTime);

    var openTimeSplit = openTime.split(':');
    var closeTimeSplit = closeTime.split(':');

    var openTimeStamp = parseInt(openTimeSplit[0]*60) + parseInt(openTimeSplit[1]);
    var closeTimeStamp = parseInt(closeTimeSplit[0]*60) + parseInt(closeTimeSplit[1]);

    var rarr = {};//返回的对象

    
    console.log('------closeTimeStamp---------------' + closeTimeStamp);
    // 营业时间跨天
    // 开店延时一个小时 关店提前一个小时
    var timeStamp = {
      openTimeStamp: openTimeStamp + 60,
      closeTimeStamp: (closeTimeStamp > openTimeStamp ? closeTimeStamp : (1440 + closeTimeStamp)) - 60
    };
    console.log(timeStamp);
    // 算时间 openTimeStamp closeTimeStamp
    // 如果开始时间接近15的
    var nowTimeStamp = parseInt(timeStamp.openTimeStamp % 15) > 0 ? timeStamp.openTimeStamp - parseInt(timeStamp.openTimeStamp % 15) + 15 : timeStamp.openTimeStamp;
    
    // 返回时间
    var returnTime = [];
    function addZiro(ziro){
      return ziro < 10 ? '0' + ziro : ziro;
    }
    function transfromTiem(time){
      return {
        hours: parseInt(time / 60),
        minute: parseInt(time % 60),
        time: addZiro(parseInt(time / 60)) + ':' + addZiro(parseInt(time % 60)),
        trueTime: addZiro(parseInt(time / 60) >= 24 ? parseInt(time / 60) - 24 : parseInt(time / 60)) + ':' + addZiro(parseInt(time % 60)),
        active:false
      }
    }

    handleTime();
    function handleTime(){
      // 如果小于15 开始时间取接近15的
      var TimeStampTransfromTiem = timeStamp.closeTimeStamp > nowTimeStamp ? nowTimeStamp : timeStamp.closeTimeStamp;
      var transfromTiemStamp = transfromTiem(TimeStampTransfromTiem);
      var arrpush = Object.assign({ nowTimeStamp: nowTimeStamp }, transfromTiemStamp);
      console.log(transfromTiemStamp);
      var tI = parseInt(transfromTiemStamp.hours / 24);
      function hasTi(){
        if (!rarr[tI]) {
          var bookMonth = getMonthDateDay(tI + 1).getMonth + '月' + getMonthDateDay(tI + 1).getDate + '日(' + getMonthDateDay(tI + 1).daymsg + ')';
          rarr[tI] = {
            bookMonth: bookMonth,
            index: tI,
            active:false,
            dayTime: []
          };
        }
      }
      if (timeStamp.closeTimeStamp >= nowTimeStamp){
        hasTi();
        rarr[tI].dayTime.push(arrpush);
        nowTimeStamp = nowTimeStamp + (parseInt(nowTimeStamp % 15) > 0 ? 15 - parseInt(nowTimeStamp % 15):0) + 15;
        handleTime();
      } 
      // 因为取整 所以不是最后不是整数的不取 比如59
      // else if (closeTimeStamp != nowTimeStamp){
      //   hasTi();
      //   rarr[tI].dayTime.push(arrpush);
      // }
    }
    

    console.log('-----------rarr------------');
    console.log(rarr);
    for (var i in rarr){
      rarr[i].active = true;
      break;
    }
    this.setData({
      bookTimeArray:rarr,
      showBook:true,
      isShowTextarea:false
    })
    return rarr;      
  },
  chooseBookTime(e){
    var dataset = e.currentTarget.dataset;
    console.log('-------dataset----------');
    console.log(dataset);
    var gtime = dataset.gitem;
    var gindex = dataset.gindex;
    var index = dataset.index;
    var bookTimeArray = this.data.bookTimeArray;
    var self = this;
    // console.log(time);
    // var bookTime = gitem.time.time;
    for (var i in bookTimeArray){
      var j=0;
      var len = bookTimeArray[i].dayTime.length;
      for (j; j < len;j++){
        bookTimeArray[i].dayTime[j].active = false;
      }
    }
    console.log(bookTimeArray[index].dayTime[gindex]);
    console.log(bookTimeArray[index].dayTime);
    bookTimeArray[index].dayTime[gindex].active = true;

    this.setData({
      bookTimeArray: bookTimeArray,
      bookMonth: bookTimeArray[index].bookMonth,
      bookTime: bookTimeArray[index].dayTime[gindex].trueTime,
      bookTimeIndex:index,
      isShowTextarea:true,
      showBook:false
    },function(){
        var bookTime = this.data.bookTime;
        var bookMonth = this.data.bookMonth;
        this.showModalTip('您选择的菜品为预定餐， 商家将于 ' + bookMonth +' '+bookTime+' 送达');
    }.bind(self))
  },
  // 修改预定日期
  changeydday(e){
    var dataset = e.currentTarget.dataset;
    var bookTimeArray = this.data.bookTimeArray;
    var len = bookTimeArray.length;
    for (var i in bookTimeArray){
      bookTimeArray[i].active = false;
    }
    bookTimeArray[dataset.index].active = true;
    this.setData({
      bookTimeArray: bookTimeArray
    })
  },
  // 页面跳转到
  navigateTo(e) {
    var target = e.currentTarget || e.target;
    if (!target.dataset.uri) {
      return false;
    }
    wx.navigateTo({
      url: target.dataset.uri,
    })
  }
})