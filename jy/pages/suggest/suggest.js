var common = require('../../utils/common.js');
var host = getApp().data.services;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageList: [], // 图片集合
    count: 0, // 图片数量
    index: 0, // 当前正在上传的图片索引
    pictureIdList: [], // 传输给后台的图片ID集合
  },

  // 提交意见反馈
  formSubmit(e) {
    var data = e.detail.value;
    data.pictureIdList = data.pictureIdList.split(",");
    common.postJson({
      url: '/v2/user/suggest/add',
      data: data,
      success: function(res) {
        wx.showToast({
          title: '提交成功',
          icon: 'success',
          duration: 2000,
          mask: true,
          success() {
            setTimeout(function() {
              //返回之前页面
              wx.navigateBack();
            }, 2000)
          }
        })
      }
    });
  },

  // 选择图片
  chooseImage() {
    var that = this;
    var num = 3 - this.data.count;
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
        'type': 'SUGGEST_PICTURE',
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

  // 删除图片
  deleteImage(e) {
    wx.showLoading({
      mask: true
    })
    var index = e.currentTarget.dataset.id;
    var pictures = this.data.imageList;
    pictures.splice(index, 1);
    var count = pictures.length;
    this.setData({
      imageList: pictures,
      count: count
    })
    wx.hideLoading();
  },

  // 预览图片
  checkImage(e) {
    var that = this;
    //获取当前图片的下表
    var index = e.currentTarget.dataset.id;
    //数据源
    var pictures = [];
    pictures.push(this.data.imageList[index]);
    wx.previewImage({
      current: pictures[index],
      //数据源
      urls: pictures
    })
  }
})