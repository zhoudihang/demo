var common = require('../../utils/common.js');
var host = getApp().data.services;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: '', // 账户信息
    imageList: [], // 图片集合
    count: 0, // 图片数量
    index: 0, // 当前正在上传的图片索引
    pictureIdList: [], // 传输给后台的图片ID集合
    sexList: ['男', '女'], // 性别
    gender: '', // 性别
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        var userInfo = res.data;
        switch (userInfo.gender) {
          case "MALE":
            userInfo.gender = '男';
            break;
          case "FEMALE":
            userInfo.gender = '女'
            break;
          default:
            userInfo.gender = '保密';
        }
        if(!userInfo.headUrl){
          userInfo.headUrl = "/images/default_head.png";
        }
        that.setData({
          userInfo: userInfo
        });
      }
    })
  },

  // 选择图片
  chooseImage() {
    var that = this;
    var num = 1 - this.data.count;
    var imageList = this.data.imageList;
    wx.chooseImage({
      count: num,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths

        // 图片上传至服务器
        that.uploadimg(tempFilePaths);
      }
    })
  },

  // 图片上传至服务器
  uploadimg(tempFilePaths) {
    wx.showLoading({
      mask: true
    });
    var that = this;
    var filename = new Date().getTime() + Math.floor(Math.random() * 90000) + 10000;
    var index = that.data.index;
    wx.uploadFile({
      url: host + '/upload2',
      method: 'post',
      filePath: tempFilePaths[index],
      name: 'file',
      header: {
        'type': 'USER_HEAD',
      },
      formData: {
        'filename': filename + '.jpg'
      },
      success: function(res) {
        var data = res.data
        var jsonData = JSON.parse(data)
        if (jsonData.code == 0) {
          var imageList = that.data.imageList.concat(tempFilePaths[index])
          that.setData({
            imageList: imageList,
            count: imageList.length,
            pictureIdList: that.data.pictureIdList.concat(jsonData.data.mediaId),
          })
        } else {
          wx.showToast({
            title: "上传失败",
            duration: 2000,
            image: '/images/error.png',
            mask: true,
          })
        }

      },
      complete: function(res) {
        index++
        if (index == tempFilePaths.length) {
          wx.hideLoading();
          that.setData({
            index: 0
          })
        } else {
          that.setData({
            index: index
          })
          that.uploadimg(tempFilePaths)
        }
      }

    })
  },

  // 更改性别
  changeGender() {
    var sexList = this.data.sexList;
    var that = this;
    wx.showActionSheet({
      itemList: sexList,
      itemColor: '#ff6b67',
      success: function(res) {
        that.setData({
          gender: sexList[res.tapIndex]
        })
      }
    })
  },

  // 提交
  formSubmit(e) {
    var data = e.detail.value;
    common.postJson({
      url: '/v2/user/account/update',
      data: data,
      success: function(res) {
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000,
          mask: true,
          success() {
            common.getUserInfo({
              cache: false
            })
            setTimeout(function(){
               wx.navigateBack();
            },1000)
          }
        })
      }
    });
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '是否退出登录',
      confirmColor: '#ff6b67',
      success: function(res) {
        if (res.confirm) {
          common.postJson({
            url: '/v2/user/account/logout',
            success: function(res) {
              wx.clearStorageSync()
              wx.switchTab({
                url: '../mine/mine',
              })
            }
          });
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  }
})