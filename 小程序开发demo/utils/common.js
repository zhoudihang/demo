var host = getApp().data.services;
var apiKey = getApp().data.serviceApiKey;
var md5 = require('../libs/md5.js');

/** 将obj对象的非null非undefiend属性 覆盖 到src对象 */
function merge(src, obj) {
  for (var i in obj) {
    if (obj[i] != null && obj[i] != undefined) {
      src[i] = obj[i];
    }
  }
}

/**
 * 递归深层复制对象
 * src  被复制的对象
 * dest 合并到这个对象，留空表示全新复制
 */
function deepCopy(src, dest) {
  var dest = dest || ((Object.prototype.toString.call(src) === '[object Array]') ? [] : {});
  for (var i in src) {
    if (typeof src[i] === 'object') {
      dest[i] = (Object.prototype.toString.call(src[i]) === '[object Array]') ? [] : {};
      deepCopy(src[i], dest[i]);
    } else {
      dest[i] = src[i];
    }
  }
  return dest;
}


/** 发送json请求（参数详见代码注释） */
function postJson(options) {
  options.dataType = "application/json";
  post(options);
}

/** 发送urlencode请求（参数详见代码注释） */
function postForm(options) {
  options.dataType = "application/x-www-form-urlencoded";
  post(options);
}

/** 发送POST请求（参数详见代码注释） */
function post(options) {

  // 默认参数
  var opts = {
    url: '', // 请求URL，基于API服务接口，以“/”开头
    data: null, // 请求数据
    dataType: '', // 请求类型
    needlogin: false, // 是否要求登录，如果传入true，在缓存没有token时直接调用nologin

    /**
     * 【可覆盖】成功响应时执行的业务逻辑
     *   data   业务数据结果：resp.data
     *   resp   请求响应结果：{
     *            statusCode: HTTP响应代码
     *            header:     响应头
     *            errMsg:     错误信息
     *            data:       响应内容：{code: 业务结果代码, data: 业务数据, err: 业务错误提示 }）
     */
    success: function(data, resp) {
      // log.info("请求成功，响应结果：", resp);
    },

    /**
     * 【可覆盖】请求失败时（连接失败、业务失败等）执行的业务逻辑
     *   resp   请求响应结果（参见success的注释）
     *   title  错误提示标题
     *   errmsg 错误提示内容
     */
    fail: function(resp, title, errmsg) {
      // 通用对话框
      wx.showModal({
        title: title,
        content: errmsg,
        showCancel: false
      });
    },

    /**
     * 【可覆盖】未登录时执行的逻辑
     */
    nologin: function() {
      console.warn("用户未登录");
      wx.showModal({
        title: '需要登录',
        content: '您未登录，或登录超时',
        cancelText: '关闭',
        confirmText: '登录',
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '/pages/phone/phone?type=login'
            })
          } else {
            wx.navigateBack({
              delta: 1
            })
          }
        }
      })
    },

    /**
     * 【可覆盖】请求完成后（无论成功与否）执行的逻辑
     */
    complete: function() {}

  };

  // 合并自定义参数到默认参数
  merge(opts, options);

  // 清理undefined字段
  console.info("清理前", opts.data);
  if (opts.data) {
    for (var i in opts.data) {
      if (opts.data[i] == undefined || opts.data[i] == null) {
        delete opts.data[i];
      }
    }
  }
  // console.info("清理后", opts.data);

  // 检查是否登录
  if (opts.needlogin) {
    if (!wx.getStorageSync("token")) {
      opts.nologin();
      return;
    }
  }

  // 生成签名
  var chars = "1234567890abcdefghijklmnopqrstuvwxyz".split("");
  var nonce = "";
  for (var i = 0; i < 12; i++) {
    nonce += chars[parseInt(Math.random() * chars.length)];
  }
  var timestamp = parseInt(new Date().getTime() / 1000);
  var signtype = "MD5";
  var str = nonce + "&" + timestamp + "&" + apiKey + "&" + signtype;
  var signature = md5.hexMD5(str);

  // 准备请求头
  var header = {
    jy_nonce: nonce,
    jy_timestamp: timestamp,
    jy_signtype: signtype,
    jy_signature: signature,
    jy_platform: "WXAPP",
    jy_deviceId: "1234567890",
    jy_utoken: wx.getStorageSync("token"),
    "content-type": opts.dataType
  };

  // 代理success成功响应回调函数
  var success2 = function(resp) {
    // resp.statusCode   响应代码
    // resp.header       响应头
    // resp.errMsg       错误信息
    // resp.data         返回数据
    // console.info("服务器响应", resp);

    switch (resp.statusCode) {
      case 200:
        break;
      case 404:
        opts.fail(resp, "请求出错", "接口不存在，请尝试其他功能");
        return;
      case 503:
        opts.fail(resp, "临时维护", "非常抱歉！为更好提升服务质量，服务器正在临时维护，请几分钟后再试~");
        return;
      default:
        opts.fail(resp, "请求出错", "代码=" + resp.statusCode + "，信息：" + resp.errMsg);
        return;
    }

    // 转换为json结果
    var data;
    try {
      data = JSON.parse(resp.data);
    } catch (e) {
      console.error("转换JSON错误，是否调用了错误的接口？", e);
      opts.fail(resp, "请求错误", e);
      return;
    }

    // 正常响应
    if (data.code == 0) {
      opts.success(data, resp);
      return;
    }

    // 分别处理例外结果
    console.warn("例外响应：", data);
    switch (data.code) {
      case -1: //系统繁忙，请稍后再试（一般为后台出现错误）
        opts.fail(resp, "系统繁忙，请稍后再试", "非常抱歉！服务器临时出现故障，请再试一次。如果问题依然存在，请过一段时间再试一次。谢谢！");
        break;
      case 101: //接口不存在
      case 102: //参数错误
      case 104: //签名错误
        opts.fail(resp, "接口异常，请稍后再试", data.msg);
        break;
      case 103: //时间戳相差太大
        opts.fail(resp, "手机时间可能不正确", "您的手机时间与服务器时间相差太大，请确认手机时间是否为互联网时间。");
        break;
      case 202: // 业务异常
        opts.fail(resp, "提示", data.msg);
        break;
      case 201: //用户未登录或token已过期
        opts.nologin(resp);
        break;
      default:
        {
          opts.fail(resp, "请求错误", resp.data);
        }
    }
  };

  // 默认fail请求失败回调函数
  var fail2 = function(err) {
    console.error("请求出错", err.errMsg);
    opts.fail(err, "通讯失败，请重试", err.errMsg);
  }

  // 发起请求
  var options2 = {
    url: host + opts.url, // 开发者服务器接口地址
    data: opts.data, // 请求的参数 Object/String/ArrayBuffer
    header: header, // 设置请求的 header，header 中不能设置 Referer。
    method: "POST", // （需大写）有效值：OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    dataType: opts.dataType, // 如果设为json，会尝试对返回的数据做一次 JSON.parse
    responseType: undefined, // 设置响应的数据类型。合法值：text、arraybuffer
    success: success2, // 收到开发者服务成功返回的回调函数
    fail: fail2, // 接口调用失败的回调函数
    complete: opts.complete // 接口调用结束的回调函数（调用成功、失败都会执行）
  };
  console.info("发起请求", options2);
  wx.request(options2);
}

// 获得个人信息并存入缓存
function getUserInfo(options) {
  var opts = {

    cache: true, // 是否使用缓存，false时获取最新用户信息

    /**
     * 获取到用户信息时执行的逻辑
     */
    success: function(userInfo) {
      console.info("获取到用户信息:", userInfo);
    },

    /**
     * 用户未登录时执行的逻辑，模式使用post方法默认提供的fail方法
     */
    fail: undefined,

    /**
     * 用户未登录时执行的逻辑，模式使用post方法默认提供的nologin方法
     */
    nologin: undefined

  };
  merge(opts, options);

  // 尝试从缓存获取用户信息
  if (opts.cache) {
    var userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      opts.success(userInfo);
      return;
    }
  }

  // 从服务器请求用户信息
  this.postJson({
    url: '/v2/user/account/detail',
    data: {
      loadDefaultInfo: false
    },
    success: function(res) {
      var userInfo = res.data;
      wx.setStorageSync("userInfo", userInfo);
      opts.success(userInfo);
    },
    needlogin: true, // 声明要求登录
    fail: opts.fail,
    nologin: opts.nologin
  })

}

//btn按钮点击后1秒钟之后才允许
function disabledBtn(data) {
  data.setData({
    disabled: true
  });
  setTimeout(function() {
    data.setData({
      disabled: false
    })
  }, 1000);
}

/**
 * 检查是否登录
 */
function wasLogin() {
  if (wx.getStorageSync("token")) {
    return true;
  }
  return false;
}

/**
 * 获取手机数据
 */
function getSystemInfo() {
  var res = wx.getSystemInfoSync()
  return res;
  // var model = res.model;
  // var pixelRatio = res.pixelRatio;
  // var windowWidth = res.windowWidth;
  // var windowHeight = res.windowHeight;
  // var language = res.language;
  // var version = res.version;
  // var platform = res.platform;
}

// 判断是否登录了；jump=》是否跳转 默认不登录则跳转到登录页面  
function hasLogin(jump) {
  function nologin() {
    console.warn("用户未登录");
    wx.showModal({
      title: '需要登录',
      content: '您未登录，或登录超时',
      cancelText: '关闭',
      confirmText: '登录',
      success: function(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/phone/phone?type=login'
          })
        }
      }
    })
  }
  if (wx.getStorageSync("token")) {
    return wx.getStorageSync("token");
  }
  if (jump !== false) {
    nologin();
  }
  return false;
}

// 跳转页面
function navigateTo(uri){
  if (!uri || global.isNavigateTo) {
     return false
   }
  global.isNavigateTo = true;
  setTimeout(function () {
    global.isNavigateTo = false;
  }, 1500)
  wx.navigateTo({
    url: uri
  })
}
// 获取元素
function getAllRects(className, callback) {
  wx.createSelectorQuery().selectAll(className).boundingClientRect(function (rects) {
    callback(rects);
  }).exec()
}

// 获取时间
function currentTime() {
  var now = new Date();

  var year = now.getFullYear(); //年
  var month = now.getMonth() + 1; //月
  var day = now.getDate(); //日

  var hh = now.getHours(); //时
  var mm = now.getMinutes(); //分
  var ss = now.getSeconds(); //秒

  var clock = year + "-";

  if (month < 10)
    clock += "0";

  clock += month + "-";

  if (day < 10)
    clock += "0";

  clock += day + " ";

  if (hh < 10)
    clock += "0";

  clock += hh + ":";
  if (mm < 10) clock += '0';
  clock += mm + ":";

  if (ss < 10) clock += '0';
  clock += ss;

  return (clock);
}

// module.exports.merge = merge;
// module.exports.deepCopy = deepCopy;
// module.exports.getUserInfo = getUserInfo;
// module.exports.postJson = postJson;
// module.exports.postForm = postForm;
// module.exports.disabledBtn = disabledBtn;
// module.exports.wasLogin = wasLogin;
// module.exports.getSystemInfo = getSystemInfo;
// module.exports.hasLogin = hasLogin;

module.exports = {
  merge: merge,
  deepCopy: deepCopy,
  getUserInfo: getUserInfo,
  postJson: postJson,
  postForm: postForm,
  disabledBtn: disabledBtn,
  wasLogin: wasLogin,
  getSystemInfo: getSystemInfo,
  hasLogin: hasLogin,
  navigateTo: navigateTo,
  currentTime: currentTime,
  getAllRects: getAllRects
}