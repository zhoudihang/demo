var common = require('../../utils/common.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
      myrecord:[],
      postmyrecord:{},
      isuseFree:false,//true 不使用优惠券
      shopId:10816,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    /*
  兑换状态
  NOTYET=未兑换
  EXCHANGED=已兑换
  INVALID=已过期
    */ 
    console.log(options);
    var self = this;
    // var  postmyrecord = "%7B%22shopId%22%3A10816%2C%22goodsList%22%3A%5B%7B%22productId%22%3A11100%2C%22number%22%3A1%2C%22specV1List%22%3A%5B%7B%22name%22%3A%22%E8%A7%84%E6%A0%BC%22%2C%22itemList%22%3A%5B%7B%22label%22%3A%226%E5%AF%B8%22%7D%5D%7D%5D%7D%2C%7B%22productId%22%3A11100%2C%22number%22%3A1%2C%22specV1List%22%3A%5B%7B%22name%22%3A%22%E8%A7%84%E6%A0%BC%22%2C%22itemList%22%3A%5B%7B%22label%22%3A%228%E5%AF%B8%22%7D%5D%7D%5D%7D%2C%7B%22productId%22%3A11100%2C%22number%22%3A1%2C%22specV1List%22%3A%5B%7B%22name%22%3A%22%E8%A7%84%E6%A0%BC%22%2C%22itemList%22%3A%5B%7B%22label%22%3A%2210%E5%AF%B8%22%7D%5D%7D%5D%7D%2C%7B%22productId%22%3A14710%2C%22number%22%3A1%2C%22specV1List%22%3A%5B%5D%7D%2C%7B%22productId%22%3A16832%2C%22number%22%3A1%2C%22specV1List%22%3A%5B%5D%7D%5D%7D";
    // options.postmyrecord = postmyrecord ;
    // 
    if(options.postmyrecord){
      var postmyrecord = decodeURIComponent(options.postmyrecord);
      var couponId = options.couponId;
      console.log(postmyrecord);
      console.log('couponId--------------'+couponId);
      postmyrecord = JSON.parse(postmyrecord);
      common.postJson({
        url: '/v2/user/freemeal/myrecord/win',
        data:postmyrecord,
        success:function(res){
          console.log('------------优惠券');
          console.log(res);
          var data = res.data;
          var shopId = postmyrecord.shopId;
          var i=0;
          for(i;i<data.length;i++){
            data[i].active = false;
            if(data[i].id==couponId){
              data[i].active = true;
            }
          }
          self.setData({
            postmyrecord:postmyrecord,
            myrecord:data,
            isuseFree:couponId==0?true:false
          })
        }
      })

    }
  },
  // 不使用优惠券
  noUseFree(){
    wx.setStorage({
      key:"free",
      data:{
        goodsid:0,
        couponId:0,
        isuse:false,
      },
      success:function(){
         wx.navigateBack();
      },
      fail:function(){
        wx.showModal({
          title:'温馨提示',
          content:"选择失败，请重新选择",
          success:function(res){
            if (res.cancel) {
              wx.navigateBack();
            }
          }
        })        
      }
    })     
  },
  // 选中免单券
  chooseFree(e){
    var dataset = e.currentTarget.dataset;
    console.log(dataset);
     // NOTYET=未兑换
      // EXCHANGED=已兑换
        // INVALID=已过期
        // 已激活 
    switch(dataset.activestatus){
      case 'ACTIVE':

      break;
      case 'NOTYET':
        wx.showModal({
          title:'温馨提示',
          content:"该免费券还没有激活，请去激活",
          success:function(res){
             if(res.confirm){
                 wx.navigateTo({
                  url:'/pages/winRecord/winRecord'
                 })
             }
          }
        })
        return false;
      break;
      case 'EXCHANGED':
        wx.showModal({
          title:'温馨提示',
          confirmText:'取消',
          showCancel:false,
          content:"该免费券已兑换"
        })
        return false;
      break;
      case 'INVALID':
        wx.showModal({
          title:'温馨提示',
          confirmText:'取消',
          showCancel:false,
          content:"该免费券已过期",
          success:function(res){
             
          }
        })
        return false;
      break;
    }
    // console.log(dataset);
    // return false;
    wx.setStorage({
      key:"free",
      data:{
        goodsid:dataset.goodsid,
        couponId:dataset.couponid,
        isuse:true
      },
      success:function(){
         wx.navigateBack();
      },
      fail:function(){
        wx.showModal({
          title:'温馨提示',
          content:"选择失败，请重新选择",
          success:function(res){
            if (res.cancel) {
              wx.navigateBack();
            }
          }
        })        
      }
    })
  },
  // 进店使用
  toStore(e){
    var dataset = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/store/index?id=' + dataset.shopid,
    })
  }

})