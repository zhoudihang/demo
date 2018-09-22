var common = require('../../utils/common.js');
var interval = null // 倒计时函数
var unionid = ''; // 微信用户unionid
var app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    source:null,//页面来源
    mobile: '', // 电话文本框
    message: '', // 验证码文本框
    disabled: false, // 验证码按钮是否可触
    currentTime: 60, // 初始化时间，60秒
    time: '获取验证码', // 获取验证码&倒计时
    token: '', // 登录凭证
    type: '', // 页面类型
    display: true, // 其他登录方式隐藏
    inviteUserId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log(options);
    var mobile = options.mobile || null;
    var type = options.type || null;
    var inviteUserId = options.inviteUserId || 0
    var source = options.source ? options.source : null
    switch (type) {
      case 'login':
        wx.setNavigationBarTitle({
          title: '登录'
        })
        break;
      case 'bind':
        wx.setNavigationBarTitle({
          title: '绑定手机号'
        })
      
        break;
      case 'change':
        wx.setNavigationBarTitle({
          title: '更换手机号'
        })
        break;
      case 'password':
        wx.setNavigationBarTitle({
          title: '支付密码设置'
        })
        break;
    }


    this.setData({
      type: type,
      mobile: mobile,
      inviteUserId: inviteUserId
    });

  },
  // 用户服务协议
  user_protocol() {
    wx.navigateTo({
      url: "../h5/h5?src=" + host + "/v2/h5/agreement/agreement_user.html",
    })
  },

  //获取电话文本框输入的值
  input_mobile: function(e) {
    this.setData({
      mobile: e.detail.value
    })
  },
  //获取验证码文本框输入的值
  input_message: function(e) {
    this.setData({
      message: e.detail.value
    })
  },

  // 获取短信验证码
  getSmscode() {
    var that = this

    var mobile = that.data.mobile;

    var flag = that.validatemobile(mobile);
    if (!flag) {
      return;
    }
    that.setData({
      disabled: true
    });
    // 调用发送验证码接口
    common.postJson({
      url: '/v2/smscode/send',
      data: {
        mobile: that.data.mobile
      },
      success: function(res) {
        that.getCode();
        wx.showToast({
          title: '发送成功',
        });
      }
    });
  },

  // 验证手机号码
  validatemobile(mobile) {
    if (mobile == undefined || mobile.length == 0) {
      wx.showModal({
        title: '提示！',
        content: '请输入手机号',
        showCancel: false
      })
      return false;
    }

    if (mobile.length != 11) {
      wx.showModal({
        title: '提示！',
        content: '手机号长度有误！',
        showCancel: false
      })
      return false;
    }
    // 校验电话号码
    var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (!myreg.test(mobile)) {
      wx.showModal({
        title: '提示！',
        content: '手机号有误！',
        showCancel: false
      })
      return false;
    }
    return true;
  },

  // 倒计时计时器
  getCode(options) {
    var that = this;
    var currentTime = that.data.currentTime
    interval = setInterval(function() {
      currentTime--;
      that.setData({
        time: currentTime + 's后重新获取'
      })
      if (currentTime <= 0) {
        clearInterval(interval)
        that.setData({
          time: '重新发送',
          currentTime: 60,
          disabled: false
        })
        return;
      }
    }, 1000)
  },

  // 绑定登录
  login() {

    var that = this
    var mobile = that.data.mobile
    var message = that.data.message
    var token = that.data.token
    var inviteUserId = that.data.inviteUserId;
    if (mobile == undefined || mobile == "" || mobile.length != 11) {
      wx.showModal({
        title: '提示',
        content: '手机号应该为11位数字！',
        showCancel: false
      })
      return;
    }
    if (message == "" || message.length != 6) {
      wx.showModal({
        title: '提示',
        content: '验证码应该为6位数字！',
        showCancel: false
      })
      return;
    }
    var objData = {
      mobile: mobile,
      smscode: message
    };
    if (inviteUserId) {
      objData.inviteUserId = inviteUserId;
    }
    // 调用校验验证码接口
    common.postJson({
      url: '/v2/user/account/regAndLogin',
      data: objData,
      success: function(res) {
        token = res.data.utoken;
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1000,
          mask: true,
          success() {
            setTimeout(function() {
              var pages = getCurrentPages();
              var prevPage = pages[pages.length - 2]; //上一个页面
              prevPage.setData({
                autoJump: true
              });
              wx.navigateBack();
            }, 1000)
          }
        })
        // 把登陆后的token放入缓存中
        wx.setStorageSync("token", token);
      }
    });
  },

  // 更换手机号
  changeMobile() {
    common.postJson({
      url: '/v2/user/account/updateMobile',
      data: {
        mobile: this.data.mobile,
        smscode: this.data.message
      },
      success: function(res) {
        wx.showToast({
          title: '更换成功',
          icon: 'success',
          duration: 1000,
          mask: true,
          success() {
            common.getUserInfo({
              cache: false
            })
            setTimeout(function() {
              var pages = getCurrentPages();
              var prevPage = pages[pages.length - 2]; //上一个页面
              prevPage.setData({
                autoJump: true
              });
              wx.navigateBack();
            }, 1000)
          }
        })
      }
    });
  },

  // 更改支付密码
  changePassword() {

    wx.navigateTo({
      url: '../password/password?type=set&smscode=' + this.data.message,
    })

  },

  // 其他登录方式
  changeLogin() {
    this.setData({
      display: false
    });
  },


  // 获取微信用户信息
  bindGetUserInfo(e) {

    wx.login({
      success(res) {

        if (!e.detail.encryptedData || !e.detail.iv) {
          wx.showModal({
            title: '用户未授权',
            content: '如需正常使用微信登录，请不要拒绝微信授权。',
            showCancel: false
          })
          return;
        }

        common.postJson({
          url: '/wxpay/xcxGetUser',
          data: {
            code: res.code,
            encryptedData: e.detail.encryptedData,
            iv: e.detail.iv
          },
          success(results) {

            var user = JSON.parse(results.data)

            unionid = user.unionId;

            var wxUser = Object.create(null);
            wxUser.nickName = user.nickName
            wxUser.avatarUrl = user.avatarUrl
            wxUser.gender = user.gender == 1 ? "男" : "女"
            wxUser.city = user.city
            wxUser.province = user.province
            wxUser.country = user.country
            wxUser.language = user.language
            wxUser.unionid = user.unionId
            wxUser.openid = user.openId

            common.postJson({
              url: '/v2/user/third/checkThirdUser',
              data: {
                type: "WEIXIN",
                wxUser: wxUser
              },
              success(info) {
                if (Object.keys(info.data).length == 0) {
                  wx.navigateTo({
                    url: '../phone/phone?type=bind&source=phone',
                  })
                } else {
                  var token = info.data.utoken;
                  wx.showToast({
                    title: '登录成功',
                    icon: 'success',
                    duration: 1000,
                    mask: true,
                    success() {
                      setTimeout(function() {
                        wx.navigateBack({
                          delta: 1
                        })
                      }, 1000)
                    }
                  })
                  // 把登陆后的token放入缓存中
                  wx.setStorageSync("token", token);
                }
              }
            });


          }
        });
      }
    })
  },

  // 绑定手机号
  bindMobile() {
    var that = this
    var mobile = that.data.mobile
    var message = that.data.message
    var token = that.data.token
    if (message == "" || message.length != 6) {
      wx.showModal({
        title: '提示！',
        content: '验证码应该为6位数字！',
        showCancel: false
      })
      return;
    }
    // 调用校验验证码接口
    common.postJson({
      url: '/v2/user/third/bindThirdUser',
      data: {
        type: 'WEIXIN',
        mobile: mobile,
        smscode: message,
        unionid: unionid
      },
      success: function(res) {
        token = res.data.utoken;
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1000,
          mask: true,
          success() {
            var delta = 1;
            if (that.data.source === 'phone') {
              delta = 2;
            }  
            console.log('-delta-------------' + delta);
            setTimeout(function() {
              wx.navigateBack({
                delta: delta
              })
            }, 1000)
          }
        })
        // 把登陆后的token放入缓存中
        wx.setStorageSync("token", token);
      }
    });
  }

})