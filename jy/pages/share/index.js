// pages/share/index.js
var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId:0,
    superVipInviteCount:1,
    res:{},
    optionsuserId:0,//推荐id
    disabled:false //是否可以点击页面分享按钮 true不可以  false可以
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    var self = this;
    // this.getwxaqrcode()
    if (options.userId){
      this.setData({
        optionsuserId: options.userId
      })
      if (wx.getStorageSync("token")){
          // wx.navigateBack();
        wx.showModal({
          title: '温馨提示',
          content: '你已经注册了，去首页逛逛吧',
          confirmText: '去逛逛',
          success: function (res) {
            if (res.confirm) {
              wx.navigateBack();
            } else if (res.cancel) {
              console.log('用户点击取消');
              self.getUserInfo();
            }
          }
        })
      }else{
          this.setData({
            disabled: true
          })
          // 隐藏分享按钮
          wx.hideShareMenu();
          wx.navigateTo({
            url: '/pages/phone/phone?type=login&userId='+options.userId
          })
      }
    }else{
      this.getUserInfo();
    }
  },
  getUserInfo(){
    var self = this;
    common.getUserInfo({
      success: function (res) {
        console.log('--------common.getUserInfo-------');
        console.log(res);
        self.setData({
          userId: res.id,
          superVipInviteCount: res.superVipInviteCount
        })
        self.getFriendRecord();
      }
    });
      
    
  },
  // 
  onShow:function(){
    var self = this;
    common.getAllRects('.successul', function (reacts){
      console.log(reacts)
      if (reacts.length!=0){
        var reactFirst = reacts[0];
        var reactLast = reacts[reacts.length-1];
      }
    })
    if (wx.getStorageSync("token")) {
      console.log('------wx.getStorageSync("token")-------')
      this.getUserInfo();
      this.setData({
        disabled: false
      })
      // 显示分享按钮
      wx.showShareMenu();
    }
  },
  // 获取邀请好友记录
  getFriendRecord(){
    var self = this;
    common.postJson({
      url:'/v2/user/account/inviteList2',
      success:function(res){
        console.log(res);
        self.setData({
          res:res.data
        })
      },
      fail:function(err){
         wx.showModal({
           title: '温馨提示',
           content: ''+(err.data?err.data:'网络去哪了？'),
         })
      }      
    })
  },
  showShareMenu(){
    console.log('-----shareButton')
    var disabled = this.data.disabled;
    if (!disabled || userId == 0){
      return false;
    }
    var userId = this.data.userId;
    var optionsuserId = this.data.optionsuserId;

    wx.showModal({
      title: '温馨提示',
      content: '你还没登录，请先登录',
      confirmText: '去登录',
      success: function (res) {
        if (res.confirm) {
          var loginUrl = '/pages/phone/phone?type=login';
          if (optionsuserId != 0) {
            loginUrl = loginUrl + '&userId=' + optionsuserId;
          }
          wx.navigateTo({
            url: loginUrl
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  },
  loginFree(){
    var optionsuserId = this.data.optionsuserId;    
    var loginUrl = '/pages/phone/phone?type=login';
    if (optionsuserId != 0) {
      loginUrl = loginUrl + '&userId=' + optionsuserId;
    }
    wx.navigateTo({
      url: loginUrl
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var userId = this.data.userId;  
    var shareUrl = encodeURIComponent('/pages/share/index?userId=' + userId)
    return {
      title: '邀请好友 一起免单',
      path: 'pages/index/index?navigateTo=' + shareUrl
    }
  }
})