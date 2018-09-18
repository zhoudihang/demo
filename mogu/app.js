/**
 * 启动事件：
 * 1. 判断场景入口
 *    1047: 扫码小程序码，如果是“商家小程序码”则进入商家首页
 * 2. 正常入口时，启动第一页
 */
var prodordev = require('./utils/prodordev.js');
App({
  data: {
    version:'1.0.0',
    services: prodordev.services,
    aMapKey: '9e615d2bd9642d1176536bc3240ec11a' //高德地图Key
  },
  onLaunch(options) {
    // 场景判断
    //console.info("onLaunch", options);
  },
  onShow(options) {
    // 场景判断
    //console.info("onShow", options);
  },
  /*
  监听事件/添加监听事件
  options:
  name:监听名字 true
  callback:监听回调 true
  self:this指向 true/false
  demo:
  1、app.on('store',function(){
      this.setData({
        eventmsg:"app emit store"
      })
    }.bind(self))
  2、app.on('store',function(){
      this.setData({
        eventmsg:"app emit store"
      })
    },self)
  */ 
  listenerEvent:{},
  on: function (name, callback,self){
    var callbackobj = {
      callback:callback
    }
    if(self){
      callbackobj.self = self;
    }
    if(!this.listenerEvent[name]){
      this.listenerEvent[name] = [];
    };
    this.listenerEvent[name].push(callbackobj);
  },
  /*
    移除监听事件
    name:监听名称 true
  */ 
  remove:function(name){
    delete this.listenerEvent[name];
  },
  /*
  触发监听事件
  */ 
  emit:function(name,options){
    var eventname = this.listenerEvent[name]?this.listenerEvent[name]:[];
    var i=0;
    for(i;i<eventname.length;i++){
      if (typeof eventname[i].callback === 'function'){
        if (eventname[i].self){
           eventname[i].callback.call(eventname[i].self, options);
        }else{
          eventname[i].callback(options);
        }
      };
    }
  }
})

//动态加载字体
// wx.loadFontFace({
//   family: 'Bitstream Vera Serif Bold',
//   source: 'url("https://developer.mozilla.org/@api/deki/files/2934/=VeraSeBd.ttf")',
//   success: function (res) {
//     console.log(res.status) //  loaded
//   },
//   fail: function (res) {
//     console.log(res.status) //  error
//   },
//   complete: function (res) {
//     console.log(res.status);
//   }
// }); 