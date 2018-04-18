'use strict'
/*
  var parameter={
      url:'http://newapi.aijiaeg.com/home/Category/index.html',//请求路径 必填
      type:'GET',//请求类型 默认get  必填 ( post 也可以但有待调试 )
      data:{token:ajaxUrl.token,source:ajaxUrl.source},//post类型请求参数 选填
      dataType:'JSON',//暂时只支持json  选填 默认JSON
      sCallback:sCallback,//请求成功回调函数 responseText返回服务器返回数据 选填 obj.sCallback(responseText);
      eCallback:eCallback //请求成功回调函数 传两个参数 一个是xhr所有数据 一个是responseText返回服务器返回数据 选填 obj.eCallback(xhr,xhr.responseText);
  }
  ajax(parameter);
*/
class Ajax {
	 constructor(parameter){
        var obj={
                url:null,
                type:'get',
                data:null,
                dataType:'JSON',
        };
        Object.assign(obj,parameter);
        var xhr={};
        if(window.XMLHttpRequest){
             xhr=new XMLHttpRequest();
        }else{
             xhr=new ActiveXObject('Microsoft.XMLHTTP');
        };
        this.handler(obj,xhr);
	 }
	 params(obj) {
          var arr = [];
          for(var i in obj) {
                  if(typeof obj[i]==='object'){
                       var str = i + "=" + JSON.stringify(obj[i]).replace(/\+/g,'%2B');
                  }else if(typeof obj[i] === 'string'){
                       var str = i + "=" + obj[i].replace(/\+/g,'%2B');
                  }else{
                       var str = i + "=" + obj[i];
                  }
                  arr.push(str);
          }
          return arr.join("&");
    }
    handler(obj,xhr){
        obj.data = this.params(obj.data);
        //连接服务器
        if(obj.type.toUpperCase()=='GET'){
              xhr.open('GET',obj.url+"?t=" + Math.random()+'&'+obj.data,true);
              //发送请求
              xhr.send();
        };
        if(obj.type.toUpperCase()=='POST'){
              xhr.open('POST',obj.url,true);
              xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
              //发送请求
              var sendData=obj.data;
              // console.log(sendData);
              xhr.send(sendData);
              sendData=null;
        };
        //接收数据
        xhr.onreadystatechange=function(){
              if(xhr.readyState==4){
                      if(xhr.status==200){
                            var responseText=xhr.responseText;
                            if(!obj.dataType||obj.dataType.toUpperCase()=='JSON'){
                                    try{
                                          responseText=JSON.parse(responseText);
                                    }catch(e){
                                          responseText=eval('('+responseText+')');
                                    }                                              
                            }
                            if(obj.sCallback){
                                 obj.sCallback(responseText,xhr);
                            }
                      }else{
                            if(obj.eCallback){
                                 obj.eCallback(xhr,xhr.responseText);
                            }
                      }
              }
        };
    }
}

export default (params) => {new Ajax(params)}