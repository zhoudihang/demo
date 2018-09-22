var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    money: 10, // 充值的金额
    other: false, // 自定义框
    userInfo: '', // 个人信息
    paySuccess:true,//支付成功
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;
    // 获得个人信息
    common.getUserInfo({

      success(userInfo) {

        userInfo.balance = (userInfo.balance + 0.00).toFixed(2);

        that.setData({
          userInfo: userInfo
        })

      }
    });
  },

  // 获取充值金额
  changeMoney(e) {
    var money = e.currentTarget.dataset.money;
    this.setData({
      money: money,
      other: false
    });
  },

  // 自定义金额
  changeOther() {
    this.setData({
      other: true,
      money: 0
    });
  },

  // 获取自定义金额
  input_money(e) {
    var money = e.detail.value;
    money = money.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符   
    money = money.replace(/\.{2,}/g, ".").replace(".", "$#$").replace(/\./g, "").replace("$#$", "."); //只保留第一个. 清除多余的 
    money = money.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
    if (money.indexOf(".") < 0 && money != "") { //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额  
      money = parseFloat(money);
    }
    this.setData({
      money: money
    })
  },

  // 充值
  topup() {
    if (!this.data.paySuccess){
        return false;
    }
    this.setData({
      paySuccess:false
    })
    var that = this;
    wx.login({
      success(res) {
        common.postJson({
          url: '/wxpay/xcxGetUser',
          data: {
            code: res.code
          },
          success(results) {
            var openid = results.data;
            common.postJson({
              url: '/v2/user/wallet/topup',
              data: {
                money: that.data.money,
                payType: 'WXAPP',
                openid: openid
              },
              success(info) {
                var package_ = info.data.xcxInfo.package;
                wx.requestPayment({
                  'timeStamp': info.data.xcxInfo.timeStamp,
                  'nonceStr': info.data.xcxInfo.nonceStr,
                  'package': package_,
                  'signType': info.data.xcxInfo.signType,
                  'paySign': info.data.xcxInfo.paySign,
                  'success': function(res) {

                    console.log(openid);
                    console.log(package_);
                    // 消息模板推送
                    that.push(openid, package_);

                    wx.showToast({
                      title: '充值成功',
                      icon: 'success',
                      duration: 2000,
                      success() {
                        wx.redirectTo({
                          url: '../balanceResult/balanceResult?type=topup&money=' + that.data.money
                        })
                      }
                    });
                  },
                  'fail': function(res) {
                    // 支付失败     
                  },
                  complete:function(){
                    that.setData({
                      paySuccess: true
                    })
                  }
                })
              }
            });
          }
        });
      }
    })
  },

  // 消息模板推送
  push(openid, package_) {
    package_ = package_.replace("prepay_id=", "");
    var that = this;
    common.postJson({
      url:'/wxpay/xcxAccessToken',
      success(res){
        wx.request({
          url: 'https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + res.data.xcxToken,
          method: 'POST',
          data: {
            "touser": openid,
            "template_id": "-wyRv8TT1cDLS4WU0MU8Q5q5lk3F4DV1XoDFYwIOVcI",
            "page": "pages/index/index",
            "form_id": package_,
            "data": {
              "keyword1": {
                "value": common.currentTime()
              },
              "keyword2": {
                "value": that.data.money
              }
            },
            "emphasis_keyword": "keyword2.DATA"
          },
          success: function (res) {
            console.log("发送成功");
          },
          fail: function (err) {
            // fail  
            console.log("push err")
            console.log(err);
          }
        })
      }
    });
  },
})