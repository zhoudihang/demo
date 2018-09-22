//index.js
//获取应用实例
var app = getApp();
var common = require('../../utils/common.js');
var location = require('../../utils/location.js');

Page({
  data: {
    //页面显示数据 //先加载缓存数据
    res: {},
    shopId:0,//店铺id
    roomId: 0, // 房间id
    storename: '',
    startTimestamp: 0, //开始时间戳
    sysTimestamp: 0, //服务器系统倒计时时间戳
    freeCountDownNun: '00:00:00', //活动倒计时
    isWinShowAni: false, //是否开启中奖加载动画,
    isWinShowAniEnd: false, //抽奖动画结束
    winPopup: false, //中奖弹框
    countDown: false, //开启倒计时
    countDownNun: 10, //倒计时数
    hallOrDraw: true, //大厅还是抽奖 大厅true 抽奖false
    onlineOrWinning: 'online', //在线人数 online  中奖名单 winning 
    onlineUserList: [], //在线用户
    winnerList: [], //中奖名单
    winnerListIndex: 0, //执行动画中奖名单到第几个
    aniScrollTop: 0, //中奖动画指中那个 就是中奖的那个用户到当前可视区域顶部位置
    userWxmlLi: 60, //单个用户的高度
    winPopupData: {}, //中奖弹窗信息
    animationData: {}, //中奖动画
    location:''
  },
  // 生命周期函数--监听页面加载
  onLoad: function(options) {
    var self = this;
    if(options.shopId){
      this.setData({
        shopId:options.shopId
      })
    }
    // 再请求服务器
    // 获取定位
    location.getOrUpdateRegeoInfo({
      cache: false,
      success: function (data) {
        console.log(data);
        self.setData({
          roomId: options.roomId,
          location: data.location,
          storename: options.storename
        }, function () {
          self.getRoomData();
          global.getRoomDataInterval = setInterval(self.getRoomData, 15000);
        })
      },
      fail: function (err) {
        self.setData({
          roomId: options.roomId,
          storename: options.storename
        }, function () {
          self.getRoomData();
          global.getRoomDataInterval = setInterval(self.getRoomData, 15000);
        })
       }
    })
   },
  onUnload:function(){
    clearInterval(global.getRoomDataInterval);    
    clearInterval(global.winnerSetInterval);
  },
  // 获取大厅数据
  getRoomData() {
    var self = this;
    var obj = {
      roomId: self.data.roomId,
      joinin: true
    }
    if (self.data.location!=''){
      obj.location = self.data.location;
    }
    common.postJson({
      url: '/v2/user/freemeal/into',
      data: obj,
      success: function(result) {
        console.log(result);
        // 如果拿到获奖名单后清除定时器
        if (result.data.winnerList && result.data.winnerList.length != 0) {
          self.setData({
            isWinShowAni: true,
            onlineOrWinning: 'online'
          })
          clearInterval(global.getRoomDataInterval);
        }
        var obj = {
          res: result.data,
          onlineUserList: result.data.onlineUserList
        };
        var selfdata = self.data;
        if (selfdata.sysTimestamp === 0) {
          obj.sysTimestamp = result.data.sysTimestamp;
        }
        if (selfdata.startTimestamp === 0) {
          var startTime = result.data.freemeal.startTime;
          startTime = startTime.replace(/-/g,'/');
          startTime = new Date(startTime).getTime();
          obj.startTimestamp = startTime;
          self.activeStartCountDownTime(obj.startTimestamp, obj.sysTimestamp);
        }
        for (var i = 0; i < obj.onlineUserList.length; i++) {
          obj.onlineUserList[i].index = i + 1;
        }
        self.setData(obj);
      },
      fail: function(err) {
        if (err.data) {
          var data = JSON.parse(err.data);
          if (data.msg) {
            self.showModal(data.msg)
          }
        } else {
          self.showModal('请求超时，数据断开了')
        }
      }
    })
  },
  // 如果用户超过倒计时30秒后才进来并且用户不在中奖记录中 提示活动已结束
  tipActiveEnd(winnerList, userId) {
    var tipEnd = true;
    for (var i = 0; i < winnerList.length; i++) {
      if (winnerList.user.id === userId) {
        tipEnd = false;
      }
    }
    wx.showModal({
      title: '温馨提示',
      content: '活动已结束',
      success: function() {

      }
    })
  },
  // 弹出并返回上一个页面
  showModal: function(content, callback) {
    if (!callback) {
      callback = function() {
        wx.navigateBack({
          delta: 1
        })
      }
    }
    wx.showModal({
      title: '提示',
      content: content,
      showCancel: false,
      complete: callback
    });
  },
  // 修改在线人数或者中奖名单状态
  changeOnlineOrWinning(e) {
    var isWinShowAniEnd = this.data.isWinShowAniEnd;
    if (!isWinShowAniEnd) {
      wx.showToast({
        title: '还没开始抽奖！请耐心等待 ~',
      })
      return false;
    }
    var onlineOrWinning = e.currentTarget.dataset.onlineorwinning;
    if (onlineOrWinning == this.data.onlineOrWinning) {
      return false;
    }
    this.setData({
      onlineOrWinning: onlineOrWinning
    })
  },
  // 切换大厅或者抽奖
  changeHallOrDraw: function() {
    var hallOrDraw = this.data.hallOrDraw;
    var isWinShowAni = this.data.isWinShowAni;
    if (isWinShowAni){
      return false;
    }
    this.setData({
      hallOrDraw: !hallOrDraw
    })
  },
  // 显示中奖商品
  showWinProduct() {
    this.setData({
      winPopup: true, //中奖弹框
      countDown: false //开启倒计时
    })
  },
  // 切换到抽奖页面/在线人数
  changeDraw() {
    var self = this;
    var winnerList = this.data.winnerList;
    var winnerTimeInterval = this.data.res.winnerTimeInterval;
    this.setData({
      hallOrDraw: false,
      countDown: false,
      onlineOrWinning: 'online'
    }, function() {
      // 执行抽奖动画
      // 定时调用抽奖动画
      var winnerIndex = 1;
      var aniScrollTop = self.data.aniScrollTop;
      if (aniScrollTop === 0) {
        self.clientUserHeight(function(obj) {
          // 执行动画
          winnerList = obj.winnerList;
          this.drawAnimation(obj.winnerList[0].scrollTop);
          this.setData({
            winPopupData: obj.winnerList[0]
          })
        }.bind(self))
      }
      global.winnerSetInterval = setInterval(function() {
        if (winnerIndex >= winnerList.length) {
          self.setData({
            isWinShowAni: false,
            isWinShowAniEnd: true
          })
          clearInterval(global.winnerSetInterval);
          var shopId = self.data.shopId;
          app.emit('freeActivityEnd_'+shopId);
          return false;
        }
        self.setData({
          winPopup: false //关闭中奖弹框
        })
        self.drawAnimation(winnerList[winnerIndex].scrollTop);
        self.setData({
          winPopupData: winnerList[winnerIndex]
        })
        winnerIndex++;
      }, winnerTimeInterval)

    })
  },
  // 初始化抽奖动画
  initDrawAnimation() {
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 0,
      timingFunction: "linear",
      delay: 0
    })
    animation.translateY(0).step()
    this.setData({
      animationData: animation.export()
    });
  },
  // 执行抽奖动画
  drawAnimation(scrollTop) {
    var self = this;
    var duration = 2500;
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: duration,
      timingFunction: "ease-out",
      delay: 0
    })
    animation.translateY(-scrollTop).step()
    this.setData({
      animationData: animation.export()
    }, function() {
      // 显示中奖人
      setTimeout(function() {
        self.showWinProduct();
        self.initDrawAnimation();
      }, duration + 200)
    })
  },
  // 倒计时 10秒
  countDownTime(countDownNun) {
    var self = this;
    var countDownNun = countDownNun?countDownNun:this.data.countDownNun;
    var countDownInterval = setInterval(function() {
      countDownNun--;
      // 倒计时小于3秒 取消店铺中的免费餐按钮
      if(countDownNun<3){
        var shopId = self.data.shopId;
        app.emit('freeActivityEnd_'+shopId);
      }
      if (countDownNun <= 0) {
        self.changeDraw();
        clearInterval(countDownInterval);
        return false;
      }
      self.setData({
        countDownNun: countDownNun
      })
    }, 1000)
    // 准备抽奖数据
    self.handleActiveData();
  },
  // 计算用户显示可视高的
  clientUserHeight(callback) {
    var self = this;
    var winnerList = this.data.res.winnerList;
    var onlineUserList = this.data.res.onlineUserList;
    var len = onlineUserList.length;
    var wLen = winnerList.length;
    var forIndex = this.data.onlineUserList.length;
    var userWxmlLi = this.data.userWxmlLi;
    var thisCallback = callback;
    self.queryMultipleNodes('#onlineUserList', function(res) {
      // 处理抽奖记录
      var userWxmlLi = self.data.userWxmlLi;
      var aniScrollTop = (res[0].height - userWxmlLi) / 2;
      for (var i = 0; i < len; i++) {
        // newOnlineUserList.concat(newOnlineUserList,);
        for (var j = 0; j < wLen; j++) {
          if (winnerList[j].user.id == onlineUserList[i].userId) {
            winnerList[j].scrollTop = (forIndex / 2 + i) * userWxmlLi - aniScrollTop;
          }
        }
      }
      self.setData({
        aniScrollTop: aniScrollTop,
        winnerList: winnerList
      }, function() {
        if (thisCallback) {
          thisCallback({
            aniScrollTop: aniScrollTop,
            winnerList: winnerList
          })
        }
      })
    })
  },
  // 准备抽奖数据
  handleActiveData() {
    var self = this;
    var onlineUserList = JSON.parse(JSON.stringify(self.data.onlineUserList));
    var newOnlineUserList = [];
    var len = onlineUserList.length;
    var ceil = Math.ceil(len / 5);
    var forIndex = 2;
    switch (ceil) {
      case 1:
        forIndex = 20;
        break;
      case 2:
        forIndex = 16;
        break;
      case 3:
        forIndex = 10;
        break;
      case 4:
        forIndex = 6;
        break;
      case 5:
        forIndex = 4;
        break;
    }
    for (var i = 0; i < forIndex; i++) {
      // newOnlineUserList.concat(newOnlineUserList,);
      for (var j = 0; j < len; j++) {
        newOnlineUserList.push(onlineUserList[j]);
      }
    }
    // 

    this.setData({
      onlineUserList: newOnlineUserList
    })
    //  var onl
  },
  // 活动开始倒计时
  activeStartCountDownTime(startTimestamp, sysTimestamp) {
    var self = this;
    var startTimestamp = startTimestamp ? startTimestamp : this.data.startTimestamp;
    var sysTimestamp = sysTimestamp ? sysTimestamp : this.data.sysTimestamp;
    if (startTimestamp - sysTimestamp < 1000) {
      //进入10秒倒计时 或者活动已结束 
      var shopId = self.data.shopId;
      app.emit('freeActivityEnd_'+shopId);
      wx.showModal({
        title:'温馨提示',
        content:'活动已结束，是否逛逛附近其他免费餐活动',
        confirmText:'去逛逛',
        success:function(res){
          if(res.confirm){
            wx.navigateTo({
              url:"/pages/nearbyGourmet/index"
            })
          }
        }
      })
      return false;
    }
    var activeCountDown = setInterval(function() {
      sysTimestamp += 1000;
      var timeDiffer = startTimestamp - sysTimestamp;
      if (timeDiffer < 11000) {
        clearInterval(activeCountDown);
        // 开始执行倒计时动画
        self.setData({
          countDown: true,
          hallOrDraw:false,
          freeCountDownNun:'00:00:00'
        })
        var countDownTime = parseInt(timeDiffer/1000);
        self.countDownTime(countDownTime);
        return false;
      }

      function addZieo(num) {
        return num > 9 ? num : '0' + num
      }
      var freeCountDownTime = self.handleActiveCountDownTime(timeDiffer);
      var freeCountDownNun = addZieo(freeCountDownTime.hours) + ':' + addZieo(freeCountDownTime.minute) + ':' + addZieo(freeCountDownTime.seconds)
      self.setData({
        freeCountDownNun: freeCountDownNun
      })
    }, 1000)

  },
  // 处理 活动开始倒计时
  handleActiveCountDownTime(timeDiffer) {
    return {
      hours: parseInt(timeDiffer / 1000 / 60 / 60 % 24),
      minute: parseInt(timeDiffer / 1000 / 60 % 60),
      seconds: parseInt(timeDiffer / 1000 % 60)
    }
  },
  // 
  queryMultipleNodes: function(selectId, callback) {
    var query = wx.createSelectorQuery()
    query.select(selectId).boundingClientRect()
    query.selectViewport().scrollOffset()
    query.exec(function(res) {
      if (callback) {
        callback(res)
      }
      // res[0].top       // #the-id节点的上边界坐标
      // res[1].scrollTop // 显示区域的竖直滚动位置
    })
  },
  // 关闭中奖弹窗
  closeWinnerPopup() {
    this.setData({
      winPopup: false //中奖弹框
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
  getPhoneNumber: function(e) { 
		console.log(e.detail.errMsg) 
		console.log(e.detail.iv) 
		console.log(e.detail.encryptedData) 
	} 

})