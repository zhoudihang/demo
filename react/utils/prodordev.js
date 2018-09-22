// 开发配置
// 线上/生产环境
var prod = {
    services: 'https://api.jianyiapp.cn'
}
// 预览环境/线上测试
var preview = {
  services: 'https://api.preview.jianyiapp.cn'
}
// 测试环境
var dev = {
    services: 'http://192.168.1.110:8080/jianyi-web-api'
}
module.exports = preview;