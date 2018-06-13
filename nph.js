// 
// 

!(function(w){
     w.nph={};
     var _self=w.nph;

     nph.eval=function(value){
         return eval("("+value+")");
     };
     nph.ready=function(fn){
         if(typeof window!=='undefined'&&window != null){
              if(window.addEventListener){
                    window.addEventListener('DOMContentLoaded',fn,false);
              }else{
                   window.attachEvent('onload',fn)
              }
         }
     };   

      /*
         获取html元素
     */
     nph.html=function(){
          return document.getElementsByTagName('html')[0];
     };
      /*
         获取head元素
     */
     nph.head=function(){
          return document.getElementsByTagName('head')[0];
     };
      /*
         获取body元素
     */
     nph.body=function(){
          return document.getElementsByTagName('body')[0];
     };
      /*
         获取当前URL
     */
     nph.url=function(){
          return window.location.href;
     };
      /*
         获取函数名
     */
     nph.FnName=function(fn){
            Function.prototype.getName = function(){
                return this.name || this.toString().match(/function\s*([^(]*)\(/)[1];
            };
            return fn.getName();
     };
      /*
        修改跳转链接方式
     */
     nph.locationReplace=function(url){
            if(window.location.replace){
                    window.location.replace(url);
            }else{
                    window.location.href = url;
            }
     };
    /*
         给html添加rem
     */
    nph.maxFontSize=0;
    nph.minFontSize=0;
    nph.nowFontSize=0;
    /*
         给页面加载js
         obj 必须为数组
         obj 只支持三种种传参
         第一种
         ['index','demo','test'];
         第二种
         ['index',fn,'test'];//可以写function ；不过function是立即执行的而且要写在nph.loadingJs(obj)前面要不无法调用
         第三种
         ['index',fn,{src:'test',id:'test',callback:callback}];

        nph.loadingJs([
                      'index',
                      'demo',
                      'test'
                ])
        注意 : 如果用到这个方法页面不能再写基于obj中的脚本了。如需要写脚本可以加入obj中
     */
    nph.loadingJs=function(obj){
                      if(obj.length==0){
                            console.log('没有js可加载');
                            return false;
                      };
                      var script=nph.createEl('script');
                      if(typeof obj[0] == 'string'){
                         obj[0]();
                      };
                      if(typeof obj[0] == 'string'){
                            script.src=obj[0].replace('.js','')+'.js';
                      }else{
                            script.src=obj[0].src.replace('.js','')+'.js';
                            if(script.id){
                                  script.id=obj[0].id;
                            }
                      };
                      document.getElementsByTagName("head")[0].appendChild(script);
                      script.onload=function(){
                            if(obj.length>1){
                                    if(typeof obj[0] != 'string' && typeof obj[0].callback == 'function'){
                                          obj[0].callback();
                                    }
                                    obj.splice(0,1);
                                    nph.loadingJs(obj);
                            }
                      };
    };
    //
    nph.replaceUrl=function(url){
         window.location.replace(url);
    };
    //刷新页面
    //
    //
    nph.refresh=function(){
          if(window.localStorage.getItem('refresh')!=null){
                 if(window.localStorage.getItem('refresh')==1){
                        window.localStorage.removeItem('refresh');
                 }else{
                       nph.setRefresh(window.localStorage.getItem('refresh')-1);
                 }                 
                 window.location.reload();
          }
    };
    //设置刷新页面
    //time=>刷新数次/默认刷新一次
    nph.setRefresh=function(time){
           if(time==null){
                time=1;
           }
           window.localStorage.setItem('refresh',time);   
    };
    nph.reRem=function(maxFontSize,minFontSize){
                   var mFontSize=64;
                   var sFontSize=32;
                   if(maxFontSize){
                         mFontSize=maxFontSize;
                   }
                   if(minFontSize){
                         sFontSize=minFontSize;
                   }
                   _self.addEventListener(window,'load',html_change_px);
                   _self.addEventListener(window,'resize',html_change_px);
                  function html_change_px()
                  {         
                           var htmlW=0;
                           //获取设备宽度
                           var windW=document.documentElement.clientWidth||document.body.clientWidth;
                           if(windW > mFontSize*10){
                                 htmlW=mFontSize;
                                 document.getElementsByTagName('html')[0].style.fontSize=htmlW+"px";
                           }else if(windW < sFontSize*10){
                                 htmlW=sFontSize;
                                 document.getElementsByTagName('html')[0].style.fontSize=sFontSize+"px";
                           }else{
                                 htmlW=windW/10;
                                 document.getElementsByTagName('html')[0].style.fontSize=htmlW+"px";
                                 document.getElementsByTagName('html')[0].style.width="100%";
                           }
                          _self.maxFontSize=mFontSize;
                          _self.minFontSize=sFontSize;
                          _self.nowFontSize=htmlW;
                  }
        };
    /*
         复制文本
         obj=>文本的HTML对象
     */  
    nph.copyText=function(obj,callback){
           if(obj.nodeName.toUpperCase()!=='TEXTAREA'){
                    var TEXTAREA_id='copyText_TEXTAREA';                    
                    if( nph.getId('copyText_TEXTAREA') ){
                         if(nph.getId('copyText_TEXTAREA').nodeName.toUpperCase()==='TEXTAREA'){
                                var textarea = this.getId('copyText_TEXTAREA');
                         }else{
                                var textarea = this.createEl('textarea');
                                TEXTAREA_id = copyText_TEXTAREA+Math.random().toString().replace(/\./g,'');
                         }
                    }else{
                         var textarea = this.createEl('textarea');
                    }
                    textarea.id=TEXTAREA_id;
                    textarea.value=obj.innerHTML;
                    textarea.style.position='fixed';
                    textarea.style.left='-99999px';
                    textarea.style.zIndex='-1';
                    nph.body().appendChild(textarea);
                    textarea.select();document.execCommand('Copy');                    
                    textarea.blur();
                    if(callback){
                          callback();
                    }
           }
    };
     /*
         根据 h5 本地存储localStorage中读取有getGoBack 就返回历史记录
         params.num==>回跳历史记录 =>go(num) (选填)
         params.beforeCallback==>在跳转前执行 这个必须有返回值TRUE (选填)
         params.afterCallback==>跳转完页面后执行 (选填)
         params.after==>默认是没有；如果为TRUE的话就是有成功回调方法 (选填)
         daleyedTime:当页面返回成功后多少毫秒再执行(默认为 1 秒) (选填)
         params={
              num:1,
              beforeCallback:function(){console.log('beforeCallback')},
              afterCallback:function(){console.log('afterCallback')},
              daleyedTime:1000,
         }
     */  
    nph.localStorageGoBack=function(params){             
             if(window.localStorage.getItem('goback')){//获取返回并执行
                       params=JSON.parse(window.localStorage.getItem('goback'));
                       if(params.after&&params.afterCallback){
                              var daleyedTime=params.daleyedTime?params.daleyedTime:1000;
                              nph.ready(function(){
                                      nph.daleyedFn(function(){
                                            var afterCallback=params.afterCallback;
                                            params.afterCallback=nph.eval(afterCallback);
                                            params.afterCallback();
                                            window.localStorage.removeItem('goback');
                                      },daleyedTime);
                              });
                              return true;
                       }
                       if(params.beforeCallback){
                              // var beforeCallback=params.beforeCallback;
                              var beforeCallback=params.beforeCallback.slice(0,params.beforeCallback.length-1)+' return true;}';
                              params.beforeCallback=nph.eval(beforeCallback);
                              if(params.beforeCallback()){
                                    var num=params.num;
                                    if(params.afterCallback){
                                          params.after=true;
                                          params=JSON.stringify(params);
                                          window.localStorage.setItem('goback',params);
                                          window.history.go(-num);
                                    }else{
                                          window.localStorage.removeItem('goback');
                                          window.history.go(-num);
                                    }                              
                              }
                              return true;
                       }
                       var num=params.num;
                       if(params.afterCallback){
                             params.after=true;
                             params=JSON.stringify(params);
                             window.localStorage.setItem('goback',params);
                             window.history.go(-num);
                       }else{
                             window.localStorage.removeItem('goback');
                             window.history.go(-num);
                       } 
                       return true;

             }else{//添加返回事件
                     if(!params){return true;};
                     if(params.beforeCallback){
                              params.beforeCallback=params.beforeCallback.toString();
                     }
                     if(params.afterCallback){
                              params.afterCallback=params.afterCallback.toString();
                     }
                     if(!params.num){
                              params.num=1;
                     }
                     params=JSON.stringify(params);
                     console.log('goback');
                     window.localStorage.setItem('goback',params); 
                     console.log('localStorageGoBack');
                     // nph.localStorageGoBack();
                     return true;
             }           
    };
    /*
         检测url变化
     */  
    nph.popstate=function(fn){
          window.addEventListener('popstate', function(event) {  
                 if(fn){
                      fn(event);
                 }
          });  
    };

    /*
         根据 h5 本地存储localStorage中是否有redefineUrl=>再根据后面的路重新跳转页面
         window.localStorage.getItem('redefineUrl') => 绝对路径
     */  
    nph.localStorageRedefineUrl=function(){
           if(window.localStorage.getItem('redefineUrl')){
                  window.location.href=window.localStorage.getItem('redefineUrl');
                  window.localStorage.removeItem('redefineUrl');
           }           
    };
    /*
         根据 url 中是否有redefineUrl=>再根据后面的路重新跳转页面
     */  
    nph.redefineUrl=function(){
           if(nph.getUrlPar('redefineUrl')){
                  window.location.href=nph.getUrlPar('redefineUrl');
           }           
    };
    /*
         console.log()
         console:必填
         style:选填(有默认值)
     */  
    nph.log=function(console,style){
        if(console==null){
             return false;
        }
        if(typeof console=="object"){
             console=JSON.stringify(console);
        }
        if(style==null){
             style='font-size:16px;color:red;';
        }
        w.console.log('%c'+console,style);         
    };
    /*
         console.log()
         console:必填
         style:选填(有默认值)
     */  
    nph.alert=function(console){
        if(typeof console=="object"){
             console=JSON.stringify(console);
        }
        alert(console);         
    };
    /*
         url=>绝对路径
         给URL添加/替换参数（key/value）
         如果有这个参数就覆盖（默认）
         不考虑修改hash后面的参数
         返回全新的URL
              hash:""
              host:"nphapi.aijiaeg.com"
              hostname:"nphapi.aijiaeg.com"
              href:"http://nphapi.aijiaeg.com/html/view/member_addSuggestion.html"
              origin:"http://nphapi.aijiaeg.com"
              pathname:"/html/view/member_addSuggestion.html"
              port:""
              search:"?abc=1&a=0"
     */  
    nph.addUrlParams=function(url,key,value){
              var hash="";
              var urlHost="";
              var search="";
              var query=[];
             
              if(url.indexOf('?')>-1){
                        urlHost=url.split('?')[0];
                        search=url.split('?')[1];

                        if(url.indexOf('#')!=-1){
                                search=search.split('#')[0];
                                hash=url.split('#')[1];
                        }  
                        if(url.indexOf('&')!=-1){
                        // http://www.nph.com?a=123&b=abc#/a?abc=123
                              query=search.split('&');
                        }else{
                        // http://www.nph.com?a=123#/a?abc=123
                              query.push(search);                       
                        }

                         // ["a=1", "b=2", "c=3"]
                        for(var i=0;i<query.length;i++){
                               query[i]=query[i].split('=');
                        }  
                        // -------
                        var hasKey=false;
                        for(var i=0;i<query.length;i++){
                                   if(query[i][0]==key){
                                        query[i][1]=value;
                                        hasKey=true;
                                   }
                                   if(i==0){
                                         search=query[i][0]+'='+query[i][1];
                                   }else{
                                         search=search+'&'+query[i][0]+'='+query[i][1];
                                   }
                        } 
                        if(!hasKey){
                             search=search+'&'+key+'='+value;
                        }
                        hasKey=null;
                        if(url.indexOf('#')!=1){
                                return urlHost+'?'+search+'#'+hash; 
                        }else{
                               return urlHost+'?'+search; 
                        } 
              }else{
                   return url+'?'+key+'='+value;
              }
    };
    /*
         获取url参数?后面的参数；不包括#/后面的参数
     */
    nph.getUrlPar=function(name){
                 var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
                 var r = window.location.search.substr(1).match(reg);
                 if(r!=null)return  decodeURI(r[2]); return null;
        };

    /*
         获取hash参数?后面的参数；不包括#/后面的参数
     */
    // nph.getHashParMatch=function(name){
    //              var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    //              var hash=window.location.hash.split('?')[1]?window.location.hash.split('?')[1]:'';
    //              var r = hash.match(reg);
    //              if(r!=null)return r; return null;
    //     }
    nph.getHashPar=function(name){
                 var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
                 var hash=window.location.hash.split('#')[1]?window.location.hash.split('#')[1]:'';
                 var r = hash.match(reg);
                 if(r!=null)return  decodeURI(r[2]); return null;
        };
    /*
         我hash 我定义
         url=>绝对路径
         给hash后面添加/替换参数（key/value） {key:value,key:value}
         如果有这个参数就覆盖（默认）
         给当前页面添加hash或者修改hash
              hash:""
              host:"nphapi.aijiaeg.com"
              hostname:"nphapi.aijiaeg.com"
              href:"http://nphapi.aijiaeg.com/html/view/member_addSuggestion.html"
              origin:"http://nphapi.aijiaeg.com"
              pathname:"/html/view/member_addSuggestion.html"
              port:""
              search:"?abc=1&a=0"
              protocol:"https:"

        @params obj

        obj===》
        {
            url:url,//如果传入url 表示把这个URL的hash 改变；如果没有则表示当前页面的hash值改变
            params:[] //String/Object string==>'/string' object ==> {key:value,key:value}
            isAdd:是否直接加载到hash上
        }
     */  
    nph.addHashParams=function(obj){
           var location = {};
           obj.isAdd = obj.isAdd ? obj.isAdd : false;
           if(!(obj.params&&obj.params.length!=0&&nph.isArray(obj.params))){
                   if(obj.url){
                        return obj.url;
                   }else{
                        return window.location.href;
                   }
           }           
           // 处理成window.localtion形式
           if(obj.url){
                 location = nph.urlLocation(obj.url);
           }else{
                 location = window.location;
           }

           // 处理添加hash逻辑
           
           if(obj.isAdd){
                 window.location.hash=nph.analysisHash(location.hash,obj.params).newHash;
           }else{
                 return nph.analysisHash(location.hash,obj.params);
           }
    };
    /*
      @params hash  把hash解析成数组 ['abc',{key:'key',value:'value'}]
      newHash 格式 #/a/abc&key=value
      newHash 格式 ['abc',{key:'key',value:'value'},'c']
      newObj  格式 {abc:'',c:'',key:value}
      return返回格式 
      {
           array:['abc','c',{key:'key',value:'value'}],
           href:'a/abc&key=value',
           newHash:'#/a/abc&key=value',
           _hash:'#/',
           index:3   
      }
             
     */
    nph.analysisHash=function(oldHash,newHash){
                 // 处理添加hash逻辑
                 //  #/a/abc&key=value 处理后  a/abc&key=value
                var _hash = '#';
                var hash = oldHash.indexOf('#/')!=-1?oldHash.split('#/')[1]:(oldHash.indexOf('#')!=-1?oldHash.split('#')[1]:'');
                if(oldHash.indexOf('#/')!=-1){
                         _hash='#/';
                }
                // var newHash = '#/';
                var newObj = {};
                if(hash==''){
                          for(var i=0;i<newHash.length;i++){
                                   if(nph.objType(newHash[i])=='string'){
                                         newObj[newHash[i]] = '';
                                   }
                                   if(nph.objType(newHash[i])=='object'){
                                         newObj[newHash[i].key] = newHash[i].value;
                                   }
                          }
                }else{
                          if(hash.indexOf('/')!=-1){
                                hash = hash.split('/');
                                // ['a&key=value','c']
                                var newArr_hash = [];
                                var newObj_hash = [];
                                // 处理传入old中hash
                                for(var i=0;i<hash.length;i++){
                                        if(hash.indexOf('&')!=-1){
                                              hash[i] = hash[i].split('&');  
                                              if(hash[i][1].indexOf('=')!=-1){
                                                      //处理成{key:'',value:''}
                                                      hash[i][1] = {
                                                           key:hash[i][1].split('=')[0],
                                                           value:hash[i][1].split('=')[1]
                                                      }
                                              }
                                        }
                                }
                                for(var i=0;i<hash.length;i++){
                                        if(nph.isArray(hash[i])){
                                             for(var j=0;j<hash[i].length;j++){
                                                  if(nph.objType(hash[i][j])=='string'){
                                                        newArr_hash.push(hash[i][j]);
                                                  }
                                                  if(nph.objType(hash[i][j])=='object'){
                                                        newObj_hash.push(hash[i][j]);
                                                  }
                                             } 
                                        }else{
                                             newArr_hash.push(hash[i]);
                                        }
                                }
                                //处理传入 new  中 hash
                                for(var i=0;i<newHash.length;i++){
                                        if(nph.objType(newHash[i])=='string'){
                                              newArr_hash.push(newHash[i]);
                                        }
                                        if(nph.objType(newHash[i])=='object'){
                                              newObj_hash.push(newHash[i]);
                                        }
                                }

                                // 把old和new组成新的 hashArr
                                for(var i=0;i<newObj_hash.length;i++){
                                     newArr_hash.push(newObj_hash[i]);
                                }
                                for(var i=0;i<newArr_hash.length;i++){
                                         if(nph.objType(newArr_hash[i])=='string'){
                                               newObj[newArr_hash[i]] = '';
                                         }
                                         if(nph.objType(newArr_hash[i])=='object'){
                                               newObj[newArr_hash[i].key] = newArr_hash[i].value;
                                         }
                                }

                          }else{
                                hash = hash.indexOf('&')!=-1?hash.split('&'):hash;
                                if(nph.isArray(hash)){
                                      for(var i=0;i<hash.length;i++){
                                            hash[i].indexOf('=')!=-1?hash[i]={key:hash[i].split('=')[0],value:hash[i].split('=')[1]}:hash[i];
                                      }
                                }else{
                                     hash = Array.call([],hash);
                                }
                                for(var i=0;i<hash.length;i++){
                                         if(nph.objType(hash[i])=='string'){
                                               newObj[hash[i]] = '';
                                         }
                                         if(nph.objType(hash[i])=='object'){
                                               newObj[hash[i].key] = hash[i].value;
                                         }
                                }
                                for(var i=0;i<newHash.length;i++){
                                         if(nph.objType(newHash[i])=='string'){
                                               newObj[newHash[i]] = '';
                                         }
                                         if(nph.objType(newHash[i])=='object'){
                                               newObj[newHash[i].key] = newHash[i].value;
                                         }
                                }
                          }
                };

                //把数组 [{key:'key',value:'value'},'abc'] 处理成 ['abc',{key:'key',value:'value'}]
                var newHashArr = [];

                for(var i in newObj){
                        if(newObj[i]===''){
                             newHashArr.push(i);   
                        }
                }
                for(var i in newObj){
                        if(newObj[i]!==''){
                             newHashArr.push({
                                 key:i,
                                 value:newObj[i]
                             });                                          
                        }
                }
                var href = '';
                var href_i = 1; 

                for(var i=0;i<newHashArr.length;i++){
                       if(nph.objType(newHashArr[i])=='string'){
                             if(href_i==1){
                                 href+=newHashArr[i];
                             }else{
                                 href=href+'/'+newHashArr[i];
                             }
                       }
                       if(nph.objType(newHashArr[i])=='object'){
                             newObj[newHashArr[i].key] = newHashArr[i].value;
                             if(href_i==1){
                                 href+=newHashArr[i].key+'='+newHashArr[i].value;
                             }else{
                                 href=href+'&'+newHashArr[i].key+'='+newHashArr[i].value;
                             }
                       }
                       href_i++;
                }
                return {
                     arr:newHashArr,
                     newHash:href,
                     newHash:_hash+href,
                     _hash:_hash,
                     index:href_i
                };
    };
    /*
      @params url  把URL解析成
                  hash:""
                  host:"nphapi.aijiaeg.com"
                  hostname:"nphapi.aijiaeg.com"
                  href:"http://nphapi.aijiaeg.com/html/view/member_addSuggestion.html"
                  origin:"http://nphapi.aijiaeg.com"
                  pathname:"/html/view/member_addSuggestion.html"
                  port:""(暂无)
                  search:"?abc=1&a=0"
                  protocol:"https:"

          .com/.net/.cn/.org/.info/.com.cn/.net.cn/.name/.mobi/.wang/.club/.ac/.cn/.在线/.中国/.中文网/.xyz
     */
    nph.urlLocation=function(url){
              var last = ['.com.cn','.net.cn','.com','.net','.cn','.org','.info','.name','.mobi','.wang','.club','.ac','.cn','.在线','.中国','.中文网','.xyz'];
              function host(paramsUrl){
                    var paramsUrl = paramsUrl.split('://')[1];
                    for(var i=0;i<last.length;i++){
                          if(paramsUrl.indexOf(last[i])!=-1){
                               return paramsUrl.split(last[i])[0]+last[i];
                          }
                    }
              }
              function pathname(paramsUrl){
                      var paramsUrl = paramsUrl.split(host(paramsUrl))[1];
                      return paramsUrl.indexOf('?')>-1 ? paramsUrl.split('?')[0] : paramsUrl;
              }
              function search(paramsUrl){
                    var paramsUrl = paramsUrl.indexOf('?')!=-1 ? paramsUrl.split('?')[1]:'';
                    if(paramsUrl==''){
                          return '';
                    }
                    var paramsUrl = paramsUrl.indexOf('#')!=-1 ? paramsUrl.split('#')[0]:'';
                    return '?'+paramsUrl;
              }
              return {
                              hash:url.indexOf('#')>-1 ? '#'+url.split('#')[1] :'',
                              host:host(url),
                              hostname:host(url),
                              href:url,
                              origin:url.split('://')[0]+'://'+host(url),
                              pathname:pathname(url),
                              search:search(url),
                              protocol:url.indexOf('https')>-1 ? 'https' :'http',
                      }
    };

    /*
         获取屏幕分辨率宽度
     */
    nph.wWidth=window.screen.width;
    /*
         获取屏幕分辨率高度
     */
    nph.wHeight=window.screen.height;

    /*
         获取id
     */
    nph.getId=function(id){
         return document.getElementById(id);
     };
     /*
         获取TagName
     */
    nph.getTagName=function(gel,pel){
           if(pel){
                 return pel.getElementsByTagName(gel);
           }else{
                 return document.getElementsByTagName(gel);
           }         
     };
     /*
         获取ClassName
     */
     nph.getClassName=function(className,pel){
           var el,
               i=0,
               arr=[],
               doc = document;
           if(pel){
                 doc = pel;
           }    
           el = doc.getElementsByTagName('*'); 
           for(i;i<el.length;i++){
               if(nph.hasClass(el[i],className)){
                   arr.push(el[i])
               }
           } 
           return arr;
     };
     /*
         创建元素
     */
     nph.createEl=function(el){
              //创建元素
          return document.createElement(el);
      };

    /*
         监听事件
     */
     nph.addEventListener=function(obj,ev,fn){
            if(obj.attachEvent){
                  return obj.attachEvent('on'+ev,fn);
            }else{
                  return obj.addEventListener(ev,fn,false);
            }
     };
    /*
         获取样式
     */
    nph.getStyle=function(el,type,removePX){
            if(el==null){
               return false;
            }
            if(el.currentStyle){
                 if(removePX){
                      return parseInt(el.currentStyle[type].indexOf('px')<0?el.currentStyle[type]:el.currentStyle[type].split('px')[0]);
                 }else{
                      return el.currentStyle[type];
                 }                  
            }else{
                 if(removePX){
                      return parseInt(window.getComputedStyle(el,false)[type].indexOf('px')<0?window.getComputedStyle(el,false)[type]:window.getComputedStyle(el,false)[type].split('px')[0]);
                 }else{
                      return window.getComputedStyle(el,false)[type];
                 }  
                 
            }
    };
    /*
                    封装hasClass 判断这个document对象是否有这个className
     */
    nph.hasClass=function(obj,className){
           var cName=obj.className;
           if(!className){
                return false;
           }
           if(!cName){
                return false;
           }
           /*
                处理className
            */

           var CNArr=cName.split(' ');
           for(var i=0;i<CNArr.length;i++){
                    if(CNArr[i]==className){
                         return true;
                    }
           }

           return false;           
    };
    /*
                    封装addClass
     */
    nph.addClass=function(obj,className){
           var cName=obj.className;
           if(!className){
           	    return false;
           }
           /*
                处理className
            */
           if(cName==''){
           	    obj.className=className;  
           }else{
           	    obj.className=cName+' '+className;
           }
           var CNArr=obj.className.split(' ');
           var classNameArr=[];
           var classObj={};
           for(var i=0;i<CNArr.length;i++){
                  if(!classObj[CNArr[i]]){
                        classNameArr.push(CNArr[i]);
                        classObj[CNArr[i]]=1;
                  } 
           }
           obj.className=classNameArr.join(' ');
           CNArr=null;
           classNameArr=null;
           classObj=null;
    };
    /*
                    封装removeClass
     */
    nph.removeClass=function(obj,className){
           var cName=obj.className;
           if(!className){
           	    return false;
           }
           /*
                处理className
            */
           if(cName.indexOf(' ')){
                   var cNameArr=cName.split(' ');
                   var cSpliceI=[];
                   for(var i=0;i<cNameArr.length;i++){
                         if(cNameArr[i]==''){
                               cSpliceI.unshift(i);
                         }
                   }
                   for(var i=0;i<cSpliceI.length;i++){
                          cNameArr.splice(cSpliceI[i],1);
                   }
           }else{
                 if(cName==className){
                      obj.className='';
                 }
           }

           if(className.indexOf(' ')){
                   var nameArr=className.split(' ');
                   var spliceI=[];
                   for(var i=0;i<nameArr.length;i++){
                         if(nameArr[i]==''){
                               spliceI.unshift(i);
                         }
                   }
                   for(var i=0;i<spliceI.length;i++){
                          nameArr.splice(spliceI[i],1);
                   }
                   removeC();
           }else{
                 removeC();  
           }

           function removeC(){
               for(var i=0;i<cNameArr.length;i++){
                     for(var r=0;r<nameArr.length;r++){
                            if(cNameArr[i]==nameArr[r]){
                                  cNameArr.splice(i,1);
                                  removeC();
                                  break;
                            }
                     }
               }
           }

           obj.className=cNameArr.join(' ');
           nameArr=null;
           spliceI=null;   
           cNameArr=null;
           cSpliceI=null;          
    };
      /*
         appendChild()
      */
       nph.appendChild=function(obj,arr,callback){
             for(var i=0;i<arr.length;i++){
                     if(typeof arr[i]==='string'){
                         obj.appendChild(eval(arr[i]));   
                     }else{
                         obj.appendChild(arr[i]);
                     }                     
             }
             if(callback){
                  callback();
             }
       };
        /*
           obj ==> node
        */
       nph.removeSelfNode=function(obj,callback){
             if(obj&&obj.parentNode){
                   obj.parentNode.removeChild(obj);
             }
             if(callback){
                  callback();
             }
       };
       /*
           removeChild()
           obj ==> parentNode
        */
       nph.removeChild=function(obj,arr,callback){
             for(var i=0;i<arr.length;i++){
                     if(typeof arr[i]==='string'){
                         obj.removeChild(eval(arr[i]));   
                     }else{
                         obj.removeChild(arr[i]);
                     }                     
             }
             if(callback){
                  callback();
             }
       };
       /* 
            报错提示
        */
       nph.error=function(msg){
               throw new Error(msg);
       };
       /* 
            清除默认行为
        */
       nph.removeDefault=function(e){
                e.preventDefault();
                e.stopPropagation();
                return false;
      };
      /* 
          覆盖参数(参数只有一层)
      */
       nph.coverParams=function(oldObj,newObj){
              for(var i in newObj){
                   oldObj[i]=newObj[i];   
              }        
              return oldObj;
      };
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
        nph.ajax=function(parameter){
                    var obj={
                            url:null,
                            type:'get',
                            data:null,
                            dataType:'JSON',
                    };
                    for(var i in parameter){
                          obj[i]=parameter[i];
                    };

                    //创建xhr对象
                    var xhr={};
                    if(window.XMLHttpRequest){
                         xhr=new XMLHttpRequest();
                    }else{
                         xhr=new ActiveXObject('Microsoft.XMLHTTP');
                    };
                    /*                    
                          +    URL 中+号表示空格                      %2B  replace(/\+/g,'%2B') 
                          空格 URL中的空格可以用+号或者编码           %20  
                          /   分隔目录和子目录                        %2F  replace(/\+/g,'%2F')   
                          ?    分隔实际的URL和参数                    %3F  replace(/\?/g,'%3F')   
                          %    指定特殊字符                           %25  replace(/\%/g,'%25')   
                          #    表示书签                               %23  replace(/\#/g,'%23')   
                          &    URL 中指定的参数间的分隔符             %26  replace(/\&/g,'%26')   
                          =    URL 中指定参数的值                     %3D  replace(/=/g,'%3D')
                    */
                    //序列化参数
                    function params(obj) {
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
                    };
                    obj.data = params(obj.data);
                    //连接服务器
                    if(obj.type.toUpperCase()=='GET'){
                          xhr.open('GET',obj.url+"?t=" + Math.random()+'&source=1'+'&'+obj.data,true);
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
          };
       // 倒计时多少天（向上取整）
       // value=>是否是时间戳戳（毫秒）(默认bool false)
       nph.dayCountdown=function(value,bool) {
            var date = new Date().getTime();
            if(bool){
                 value = Math.ceil((value-parseInt(date/1000))/60/60/24);
            }else{
                 value = Math.ceil((value*1000-date)/1000/60/60/24);
            }
            return value;
       };
       // 两个时间戳对比时间
       // value=>是否是时间戳戳（毫秒）(默认bool false)
       // oldORnew=>true : 还有多少时间；false : 已经过去多少时间；默认FALSE
       nph.pastTimes=function(value,bool,oldORnew) {
                  var date = Date.now();
                  if(!bool){
                       value = value*1000;
                  }
                  
                  if(oldORnew!=null){
                       var timer=value - date;//传入的减去当前的
                  }else{
                       var timer=date - value;//当前的减去传入的
                  }
                  // console.log(date);
                  // console.log(value);
                  // console.log(timer);
                  var Y=parseInt(timer/1000/60/60/24/365);//年(默认365天一个年)
                  var M=parseInt(timer/1000/60/60/24/30);//月(默认30天一个月)
                  var D=parseInt(timer/1000/60/60/24);//天
                  var h=parseInt(timer/1000/60/60%24);//小时
                  var m=parseInt(timer/1000/60%60);//分钟
                  var s=parseInt(timer/1000%60);//秒
                  return {
                        Y:Y,
                        M:M,
                        D:D,
                        h:h,
                        m:m,
                        s:s
                  }               

       };
      //时间戳转时间 timeStamp时间戳 isMillisecond是否是毫秒  digit位数 1>年 2年月 3年月日 4年月日小时 5年月日小时分钟 6年月日小时分钟秒  format:连接格式
      //common_fn.time_stamp(timeStamp,isMillisecond,digit,ymd_format,hms_format)
      nph.time_stamp=function(timeStamp,isMillisecond,digit,ymd_format,hms_format){
                    if(!isMillisecond){
                      timeStamp=timeStamp*1000;
                    }
                    ymd_format=ymd_format ? ymd_format : '-';
                    hms_format=hms_format ? hms_format : ':';

                    digit=digit ? parseInt(digit) : 6;

                    // debugger;
                    // var data=new Date(timeStamp);
                     var data = new Date();
                    data.setTime(timeStamp);

                    var Y=data.getFullYear();
                    var M=data.getMonth()+1;
                    var D=data.getDate();
                    var H=data.getHours()>9?data.getHours():'0'+data.getHours();
                    var m=data.getMinutes()>9?data.getMinutes():'0'+data.getMinutes();
                    var S=data.getSeconds()>9?data.getSeconds():'0'+data.getSeconds();
                    switch(digit){
                            case 1:
                                  return Y;
                            break;
                            case 2:
                                  return Y+ymd_format+M;
                            break;
                            case 3:
                                  return Y+ymd_format+M+ymd_format+D;
                            break;
                            case 4:
                                  return Y+ymd_format+M+ymd_format+D+' '+H;
                            break;
                            case 5:
                                  return Y+ymd_format+M+ymd_format+D+' '+H+hms_format+m;
                            break;
                            case 6:
                                  return Y+ymd_format+M+ymd_format+D+' '+H+hms_format+m+hms_format+S;
                            break;
                    }
                    
        };

        //倒计时 时间戳转时间 timeStamp时间戳 isMillisecond是否是毫秒  ymd_format:年月日 连接格式 hms_format：时分秒 连接格式
        nph.to_end_time=function(timeStamp,isMillisecond,ymd_format,hms_format){
                    if(!isMillisecond){
                      timeStamp=timeStamp;
                    }
                    ymd_format=ymd_format ? ymd_format : '-';
                    hms_format=hms_format ? hms_format : ':';
                    var data=new Date().getTime();

                    var timer=timeStamp-parseInt(data/1000);

                    var d=parseInt(timer/60/60/24);
                    var h=parseInt(timer/60/60%24);
                    var m=parseInt(timer/60%60);
                    var s=parseInt(timer%60);
                    if(m<10){
                        m='0'+m;
                    }
                    if(s<10){
                        s='0'+s;
                    }
                    return {
                          d:d,
                          h:h,
                          m:m,
                          s:s
                    }
                    
        };
         /* 
            _el 当前元素
            pel 找到想要的上级元素
        */
        nph.getParentNode=function(_el,pel){

             /* 获取上级元素 */ 
             var pNode=_el.parentNode;
             function getPNodes(){                   
                   if(pel.indexOf('#')>=0){
                        var _data=pNode.id;
                   }else if(pel.indexOf('.')>=0){
                        var _pel=pel.replace(/\./,'');
                        var _data = this.hasClass(pNode,_pel);                       
                   }else{
                        var _data=pNode.getAttribute(pel);
                   }
                   if(!_data){
                       pNode=pNode.parentNode;
                       getPNodes();
                   }
             }
             getPNodes();
             _pel=null;
             _data=null;
             return pNode;

        };  
        /* 
            Intercept picture center 图片居中截取
        */
        nph.pictureCenter=function(_el){

                 /* 获取上级元素 */ 
                 var pNode=this.getParentNode(_el,'data-fn-pictureCenter');
                 pNode.style.textAlign='center';
                 
      	         var pelWidth = this.getStyle(pNode,'width').replace('px','');
      	         var pelHeight = this.getStyle(pNode,'height').replace('px','');
                 var imgWidth = this.getStyle(_el,'width').replace('px','');
                 var imgHeight = this.getStyle(_el,'height').replace('px','');                         
                 if(Math.abs(pelWidth-imgWidth)<Math.abs(pelHeight-imgHeight)){
                       _el.style.width=this.getStyle(pNode,'width');    
                 }else{
                       _el.style.height=this.getStyle(pNode,'height');
                 }

                 pNode.style.display='-webkit-box';
                 pNode.style.display='-webkit-flex';
                 pNode.style.display='flex';
                 pNode.style.WebkitBoxAlign='center';
                 pNode.style.WebkitAlignItems='center';
                 pNode.style.alignItems='center';
                 pNode.style.WebkitBoxPack='center';
                 pNode.style.WebkitJustifyContent='center';
                 pNode.style.justifyContent='center';

                 pelWidth=null;
                 pelHeight=null;
                 imgWidth=null;
                 imgHeight=null;
             
        };        
        /* 
            nph.bigImg(img_url)//单个图片放大
        */
        nph.bigImg=function(img_url){
                 var _self=this;
                 var w_width=document.documentElement.clientWidth||document.body.clientWidth;
                 var w_height=document.documentElement.clientHeight||document.body.clientHeight;
                 var s_height=window.screen.height;
                 var body=document.getElementsByTagName('body')[0];
                 var div=document.createElement('div');
                 var img=document.createElement('img');
                 div.style.position='fixed';
                 div.style.top='0';
                 div.style.left='0';
                 div.style.right='0';
                 div.style.bottom='0';
                 div.style.zIndex='21500000';
                 // div.style.height='100%';
                 // div.style.width='100%';
                 div.style.overflowY='scroll';
                 div.style.background='rgba(0,0,0,0.7)';
                 div.style.opacity=0;


                 img.src=img_url;
                 img.style.width='100%';
                 img.onload=function(){
                           var img_height=_self.getStyle(img,'height',true);

                           if(parseInt(img_height)<parseInt(s_height)){
                                   div.style.display='-webkit-box';
                                   div.style.display='-webkit-flex';
                                   div.style.display='flex';
                                   div.style.WebkitBoxAlign='center';
                                   div.style.WebkitAlignItems='center';
                                   div.style.alignItems='center';
                                   div.style.WebkitBoxPack='center';
                                   div.style.WebkitJustifyContent='center';
                                   div.style.justifyContent='center';
                           }
                           img_h=null;
                           img_height=null;
                 };

                 nph.addEventListener(div,'click',function(){
                        var Opacity=100;
                        var divTimer=setInterval(function(){
                              Opacity=Opacity-5;
                              if(Opacity>10){
                                    div.style.opacity=Opacity/100;
                              }else{
                                    clearInterval(divTimer);
                                    body.removeChild(div);
                                    body.style.overflowY='auto';
                                    Opacity=null;
                                    divTimer=null;
                              }
                              
                        },5);
                 });
                 
                 body.style.overflowY='hidden';
                 div.appendChild(img);
                 body.appendChild(div);
                 
                 var OpacityInter=0;       
                 var divTimeInter=setInterval(function(){
                              OpacityInter=OpacityInter+5;
                              if(OpacityInter<100){
                                    div.style.opacity=OpacityInter/100;
                              }else{
                                    div.style.opacity=1;
                                    clearInterval(divTimeInter);
                                    OpacityInter=null;
                                    divTimeInter=null;
                              }                              
                        },5);
        };

        //size 大于还是小于 '>'=>大于 '<'=>小于 '=' => 等于
        //sTop滚动距离顶部多少触发callback 参数为false  和123456789数字 0=>表示到顶部
        //sbottom滚动距离顶部多少触发callback 参数为false  和123456789数字 0=>表示到底部
        //callback=>回调函数  nph.scroll_fn('=',false,'0',scroll_callback);
        nph.scroll_fn=function(size,s_top,s_bottom,callback){
                  window.addEventListener('scroll',function(){
                      // console.log('scroll');
                      var sTop=document.documentElement.scrollTop||document.body.scrollTop;
                      var cHeight=window.screen.height||document.documentElement.clientHeight||document.body.clientHeight;
                      var sHeight=document.documentElement.scrollHeight||document.body.scrollHeight;
                      // nph.getTagName('title')[0].innerHTML=sHeight-cHeight-sTop;
                      // console.log(sTop);
                      // console.log(cHeight);
                      // console.log(sHeight);
                      // console.log('-------------');
                      if(size=='='){
                              if(s_top==0||s_top){
                                      if(sHeight-cHeight-sTop == s_top){
                                                if(callback){
                                                     callback(sTop);
                                                }                                                
                                      }
                              }
                              if(s_bottom==0||s_bottom){
                                      if(sHeight-cHeight-sTop == s_bottom){
                                               if(callback){
                                                     callback(sTop);
                                                     // console.log('callback');
                                                }  
                                      }
                               }
                                return false;
                      }
                      if(size=='>'){
                             if(s_top==0||s_top){
                                    if(sHeight-cHeight-sTop > s_top){
                                                if(callback){
                                                     callback(sTop);
                                                }  
                                    }
                             }
                             if(s_bottom==0||s_bottom){
                                    if(sHeight-cHeight-sTop > s_bottom){
                                               if(callback){
                                                     callback(sTop);
                                                }  
                                    }
                             }
                             return false;
                      }
                      if(size=='<'){
                            if(s_top==0||s_top){
                                  if(sHeight-cHeight-sTop < s_top){
                                              if(callback){
                                                   callback(sTop);
                                              }  
                                  }
                            }
                            if(s_bottom==0||s_bottom){
                                  if(sHeight-cHeight-sTop < s_bottom){
                                           if(callback){
                                                 callback(sTop);
                                           }  
                                  }
                            }
                            return false;
                      }
                  },false);
        };

        /*
            头条
            el=>这个为id
        */
        nph.headlines=function(el,slideI,slideTime){
                 var el=document.getElementById(el);
                 var el_li=el.getElementsByTagName('li');
                 if(el_li.length>0){
                       var slideTop = nph.getStyle(el_li[0],'height',true)*slideI;
                 }
                 if(el_li.length<=slideI){
                      return false;
                 }
                 var i=0;
                 el.style.top='0px';
                 var eSlideTime=3000;
                 if(slideTime){
                       eSlideTime=slideTime;
                 }
                 var elTimer=setInterval(function(){
                       i++;
                       if(i>parseInt(el_li.length/slideI-1)){
                             el.style.top='0px';
                             i=0;
                       }
                       el.style.top=-slideTop*i+'px';
                       
                 },eSlideTime);
        } ;
        /*
            轮播图
                nph.swiper({
                     touchId:'swiper',//(必填)//最外层盒子
                     swiperId:'swiper_ul',//(必填)//滚动li盒子
                     spot:false,//是否显示 点点点(选填)默认false
                     loop:false,//是否循环播放(选填)默认false
                     loopTime:3000,//多久播放下个(毫秒)(选填)默认3000
                });
        */
      nph.swiper=function(obj,callback){
                       var _nph=this;
                       if(!obj){
                              _nph.error('没有传入参数！！！');
                              return false;
                       }
                       var parameter={
                                 touchEl:_nph.getId(obj.touchId),//最外层盒子
                                 swiperEl:_nph.getId(obj.swiperId),//滚动盒子 
                                 swiperLi:null,//滚动盒子 所有li 
                                 spot:true,//是否显示 点点点
                                 spotBox:null,// 点点点 容器
                                 spotSpan:[],// 点点点
                                 spot_bg:'none',//点点背景颜色(选填)默认3000
                                 spot_borderColor:'#FFF',//点点背景颜色(选填)默认3000
                                 spot_active:'#FFF',//点点选中颜色(选填)默认3000
                                 slideRange:0.3,// 滑动多少开始执行下一个                          
                                 loop:false,//是否循环播放
                                 loopTime:3000,//多久播放下个(毫秒)
                                 loopInterval:null,//循环播放定时器
                                 touchstartX:null,//开始触摸Y轴位置
                                 touchmoveX:null,//移动触摸Y轴位置
                                 touchendX:null,//结束触摸Y轴位置
                                 swiperX:0,//记录滚动盒子滑动的距离
                                 swiperI:0,//记录滚动盒子滑动的个数
                                 swiperMaxI:0,//记录滚动盒子滑动的最大个数
                                 clickTimerI:0,//检测是否是点击还是滑动事件（默认600ms就离开触摸是点击事件）
                                 clickTimer:null,//检测是否是点击还是滑动事件（默认600ms就离开触摸是点击事件）=> 定时器
                                 transitionTime:0.3,// 滑动时间
                       };                       
                       parameter=_nph.coverParams(parameter,obj);//用传入参数替代默认参数
                       parameter.swiperLi=_nph.getTagName('li',parameter.swiperEl);
                       if(parameter.loop){
                                parameter.swiperMaxI=parameter.swiperLi.length+2;
                       }else{
                                parameter.swiperMaxI=parameter.swiperLi.length;
                       };

                       if(parameter.spot){
                                parameter.touchEl.style.position='relative';
                                parameter.spotBox = _nph.createEl('div');
                                if(parameter.loop){
                                          var len=parameter.swiperMaxI-2;
                                }else{
                                          var len=parameter.swiperMaxI;
                                 }
                                parameter.spotBox.id='spotBox';
                                parameter.spotBox.style.position='absolute';
                                parameter.spotBox.style.bottom='1%';
                                parameter.spotBox.style.length='0px';
                                parameter.spotBox.style.textAlign='center';
                                parameter.spotBox.style.width='100%';
                                parameter.spotBox.style.padding='10px 0';

                                for(var i=0;i<len;i++){
                                     var spotSpan = _nph.createEl('span');
                                     spotSpan.style.display='inline-block';
                                     spotSpan.style.width='7px';
                                     spotSpan.style.height='7px';
                                     spotSpan.style.borderRadius='50%';
                                     spotSpan.style.border='1px solid '+parameter.spot_borderColor;
                                     spotSpan.style.margin='0 1px';
                                     parameter.spotBox.appendChild(spotSpan);
                                     parameter.spotSpan.push(spotSpan);
                                }
                                parameter.spotSpan[0].style.background=parameter.spot_active;
                                parameter.touchEl.appendChild(parameter.spotBox);
                       }; 

                         

                       if(parameter.loop){
                                 
                                 var firstLi = parameter.swiperLi[0].cloneNode(true);
                                 var lastLi =  parameter.swiperLi[parameter.swiperLi.length-1].cloneNode(true);
                                 _nph.getId(obj.swiperId).insertBefore(lastLi,parameter.swiperLi[0]);
                                 _nph.getId(obj.swiperId).appendChild(firstLi);
                       };

                       _nph.addEventListener(parameter.touchEl,'touchstart',function(e){

                                clearInterval(parameter.clickTimer);
                                clearInterval(parameter.loopInterval);
                                parameter.loopInterval=null;
                                parameter.clickTimer=setInterval(function(){
                                          parameter.clickTimerI++;
                                          if(parameter.clickTimerI>300){
                                                  parameter.touchEl.removeEventListener('touchstart',function(){
                                                        _nph.removeDefault(e);
                                                  },false);
                                                  parameter.clickTimerI=0;
                                                  clearInterval(parameter.clickTimer);
                                                  parameter.clickTimer=null;  
                                          };
                                },1);

                                
                                parameter.swiperLiWidth=_nph.getStyle(parameter.swiperLi[0],'width',true);
                                parameter.swiperEl.style.width=parameter.swiperMaxI*parameter.swiperLiWidth+'px';
                                if(parameter.touchstartY){
                                      return false;
                                }
                                nph.transition(parameter.swiperEl,0); 
                                parameter.touchstartX=e.changedTouches[0].clientX;
                                _nph.removeDefault(e);//清除默认事件

                       });
                       _nph.addEventListener(parameter.touchEl,'touchmove',function(e){
                                parameter.touchmoveX=e.changedTouches[0].clientX;
                                nph.translateX(parameter.swiperEl,parameter.swiperX+parameter.touchmoveX-parameter.touchstartX);
                                _nph.removeDefault(e);//清除默认事件
                       });
                       _nph.addEventListener(parameter.touchEl,'touchend',function(e){
                                parameter.touchendX=e.changedTouches[0].clientX;
                                var touchX=parameter.touchstartX-parameter.touchendX;
                                nph.transition(parameter.swiperEl,parameter.transitionTime);
                                if(touchX>0){
                                        console.log('向左');
                                       if(Math.abs(touchX)/_nph.wWidth>parameter.slideRange){
                                                   if(parameter.loop){
                                                         parameter.swiperI<parameter.swiperMaxI-1?parameter.swiperI++:parameter.swiperI=2;
                                                         parameter.swiperX=-parameter.swiperLiWidth*parameter.swiperI;
                                                   }else{
                                                         parameter.swiperI<parameter.swiperMaxI-1?parameter.swiperI++:parameter.swiperI=parameter.swiperMaxI-1;
                                                         parameter.swiperX=-parameter.swiperLiWidth*parameter.swiperI;
                                                         console.log('======'+parameter.swiperI);
                                                         console.log('======'+parameter.swiperMaxI);
                                                   }
                                       };
                                        
                                       nph.translateX(parameter.swiperEl,parameter.swiperX);

                                      if(parameter.loop&&parameter.swiperI==parameter.swiperMaxI-1){
                                              parameter.swiperI = 1;
                                              parameter.swiperX = -parameter.swiperLiWidth;
                                              setTimeout(function(){
                                                      nph.transition(parameter.swiperEl,0);
                                                      nph.translateX(parameter.swiperEl,-parameter.swiperLiWidth);
                                              },parameter.transitionTime*1000)
                                      };

                                }else{
                                       console.log('向右');
                                       if(Math.abs(Math.abs(touchX)/_nph.wWidth)>parameter.slideRange){
                                                   if(parameter.loop){
                                                         parameter.swiperI>0?parameter.swiperI--:0;
                                                         parameter.swiperX=-parameter.swiperLiWidth*parameter.swiperI;
                                                   }else{
                                                         parameter.swiperI>0?parameter.swiperI--:0;
                                                         parameter.swiperX=-parameter.swiperLiWidth*parameter.swiperI;
                                                   }
                                       }
                                       nph.translateX(parameter.swiperEl,parameter.swiperX);

                                       if(parameter.loop&&parameter.swiperI==0){
                                                parameter.swiperI = parameter.swiperMaxI-2;
                                                parameter.swiperX = -parameter.swiperLiWidth*parameter.swiperI;
                                                setTimeout(function(){
                                                        nph.transition(parameter.swiperEl,0);
                                                        nph.translateX(parameter.swiperEl,parameter.swiperX);
                                                },parameter.transitionTime*1000)
                                       };
                                }
                                 // 如果点击不超过600ms并且移动距离不超过5px 默认为点击事件；判断是否有链接跳转；如果有链接就跳转
                                if(Math.abs(touchX)<5&&parameter.clickTimerI!=0){
                                      for(var i=0;i<_nph.getTagName('*',parameter.swiperLi[parameter.swiperI]).length;i++){
                                             if(_nph.getTagName('*',parameter.swiperLi[parameter.swiperI])[i].href){
                                                  window.location.href=_nph.getTagName('*',parameter.swiperLi[parameter.swiperI])[i].href
                                             }
                                      }
                                }
                                if(callback){
                                       callback(parameter.swiperLi[parameter.swiperI])
                                }
                                if(parameter.loop){
                                      parameter.loopInterval=setInterval(loopFn,parameter.loopTime)
                                }
                                loopSpot(parameter.swiperI);
                               
                       });

                       function loopSpot(spotI){
                                 if(parameter.loop){
                                        spotI>parameter.swiperMaxI-2?spotI=0:spotI=spotI-1;
                                 }
                                 if(parameter.spot){
                                          for(var i=0;i<parameter.spotSpan.length;i++){
                                               parameter.spotSpan[i].style.background=parameter.spot_bg;
                                          }
                                          parameter.spotSpan[spotI].style.background=parameter.spot_active;
                                 }  
                                 
                       };

                       // 循环播放
                       function loopFn(){
                                

                                parameter.swiperLiWidth=_nph.getStyle(parameter.swiperLi[0],'width',true);
                                parameter.swiperEl.style.width=parameter.swiperMaxI*parameter.swiperLiWidth+'px';

                                parameter.swiperI<parameter.swiperMaxI-1?parameter.swiperI++:parameter.swiperI=2;
                                parameter.swiperX=-parameter.swiperLiWidth*parameter.swiperI;

                                nph.transition(parameter.swiperEl,parameter.transitionTime);
                                nph.translateX(parameter.swiperEl,parameter.swiperX);

                                if(parameter.swiperI==parameter.swiperMaxI-1){
                                        setTimeout(function(){
                                                nph.transition(parameter.swiperEl,0);
                                                nph.translateX(parameter.swiperEl,-parameter.swiperLiWidth);
                                        },parameter.transitionTime*1000)
                                }
                                loopSpot(parameter.swiperI);

                       };
                       if(parameter.loop){
                                parameter.swiperMaxI=parameter.swiperLi.length;
                                parameter.swiperEl.style.display='none';
                                parameter.loopInterval = setTimeout(function(){
                                       
                                       parameter.swiperLiWidth=_nph.getStyle(parameter.swiperLi[0],'width',true);
                                       clearTimeout(parameter.loopInterval);
                                       parameter.loopInterval=null;
                                       parameter.swiperI=1;
                                       parameter.swiperX=-parameter.swiperLiWidth;
                                       nph.transition(parameter.swiperEl,0);
                                       nph.translateX(parameter.swiperEl,-parameter.swiperLiWidth);

                                       parameter.swiperEl.style.display='block';
                                       parameter.loopInterval=setInterval(loopFn,parameter.loopTime)
                                },300);                                
                       }

         };
        nph.translateX=function(el,tx,px){
                  if(!px){
                     var px='px';
                  }
                  el.style['-ms-transform']='translateX('+tx+px+')';
                  el.style['-moz-transform']='translateX('+tx+px+')';
                  el.style['-webkit-transform']='translateX('+tx+px+')';
                  el.style['-o-transform']='translateX('+tx+px+')';
                  el.style['transform']='translateX('+tx+px+')';
       };
       nph.transition = function(el,time){
                  el.style['-ms-transition']="all "+time+"s ease-in-out "+time*0.1+"s";
                  el.style['-moz-transition']="all "+time+"s ease-in-out "+time*0.1+"s";
                  el.style['-webkit-transition']="all "+time+"s ease-in-out "+time*0.1+"s";
                  el.style['-o-transition']="all "+time+"s ease-in-out "+time*0.1+"s";
                  el.style['transition']="all "+time+"s ease-in-out "+time*0.1+"s";
       };
        /*
            reg正则验证
        */
        nph.reg={
                    removeSpace:function(value){//去掉空格
                          return value.replace(/\s/g,'');
                    },
                    rspace:function(value){//去掉右边空格
                          return value.replace(/\s+$/g,'');
                    },
                    lspace:function(value){//去掉左边空格
                          return value.replace(/^\s+/g,'');
                    },
                    phone:function(phone){//手机
                          var reg=/^1[3,4,5,6,7,8]\d{9}$/;
                          // var reg=/^((\+?86)|(\+86))?(13[012356789][0-9]{8}|15[012356789][0-9]{8}|18[02356789][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/;
                          return reg.test(phone);
                    },
                    Landline:function(Landline){//座机
                          // var reg=/([0-9]{3,4}-)?[0-9]{7,8}/;
                          var reg=/^(0[0-9]{2,3}-)?([2-9][0-9]{6,7})+(-[0-9]{1,4})?$/;
                          return reg.test(Landline);
                    },
                    number:function(number){//纯数字
                          var reg=/[0-9]/g;
                          return reg.test(number);
                    },
                    money:function(money){//金额
                          var reg=/(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/;
                          if(money=='0.'){
                               return true;
                          }
                          return reg.test(money);
                    },
                    ID_NUMBER:function(ID_NUMBER){//身份证
                          if(ID_NUMBER.length>15){
                              var reg=/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
                          }else{
                             var reg=/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;
                          }
                          return reg.test(ID_NUMBER);
                    },
                    email:function(value){
                             var Email = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
                             return Email.test(value);
                    },
                    carriage_return:function(value){//回车符
                             var R=/\r/g; //匹配一个回车符。等价于\x0d和\cM。
                             return R.test(value);
                    },
                    //将文本中的链接转成链接
                    link:function(value,onclick){
                         var reg = /((http:\/\/|https:\/\/))((\w|=|\?|\.|\/|&|-)+)/g;
                         if(onclick){
                             return value.replace(reg, "<a href='$2$3' onclick=\""+onclick+"('$2$3');return false;\">$2$3</a>").replace(/\n/g, "<br />");
                         }
                         value = value.replace(reg, "<a href='$2$3'>$2$3</a>").replace(/\n/g, "<br />");
                         return value;
                    }
                    
        };
        /*
            reg正则验证
        */

       /*
            倒计时(以秒为单位)
            time=>时间
               
        */
       nph.countdown=function(time,sCallback,eCallback){
              var timeI=time;
              var sTime=setInterval(function(){
                     if(timeI > 1){
                              timeI--;
                              if(sCallback){
                                   sCallback(timeI);
                              }
                        }else{
                          if(eCallback){
                               eCallback();
                          }
                          clearInterval(sTime);
                          timeI=null;
                          sTime=null;
                     }
              },1000);
         }  ;       
         /*
              历史返回                
          */
         nph.timeoutGoBack=function(num,time){
              if(num==null||isNaN(num)){
                   num=1;
              }
              if(time==null||isNaN(time)){
                   time=3000;
              }
              var tgb=setTimeout(function(){
                    window.history.go(-num)
              },time);
         };
         /*
                深度拷贝   
                正常->深度拷贝 ->normal (默认)
                序列化->深度拷贝(纯json才可以) ->serialize 
                obj=>必须
                method=>可选
          */
         nph.cloneObj=function(obj,method){
                method==null? method='normal':method;
                if(method=='serialize'){
                      var newObj=JSON.stringify(obj);
                      return JSON.parse(newObj);
                }
                if(method=='normal'){
                      var newObj={};
                      function cloneFn(obj,newObj){
                             for(var i in obj){
                                    if(obj[i].constructor==Object){
                                         newObj[i]={};
                                         cloneFn(obj[i],newObj[i]);
                                    }else{
                                        newObj[i] = obj[i]; 
                                    }
                             }
                      };
                      cloneFn(obj,newObj);
                      return newObj;
                }
         };
       // 超出的图片以当前div宽度100%
       // <div id="overImg_100"></div>
       // nph.overImg_100();默认不传
       // params.num 判断是否有这个id=>overImg_100(默认六秒内)
       // params.imgNum 判断这个id=>overImg_100下是否有img(默认六秒内)
       // 
       // params.index ==> params.i ===>判断是否相等；如果相等就调用了
       nph.overImg_100=function(params){
               if(!params){params={}};
               var overImg_100=nph.getId('overImg_100');
               if(!overImg_100){
                    if(params._nulli >= 5){
                         clearTimeout(_nulli);
                         return false;
                    }
                    if(!params._nulli){
                         params._nulli=1;
                    }
                    var _nulli = setTimeout(function(){

                         nph.overImg_100({_nulli:params._nulli++});
                         console.log(params._nulli);
                         clearTimeout(_nulli);
                    },300);
                    return false;
               }
               if(params.num>30){return false;}
               if(!params.num){params.num=1};
               if(!overImg_100){                   
                     params.num++;                   
                     var timeOverImg_100=setTimeout(function(params){
                          nph.overImg_100(params);
                     },200);                   
                     return false;  
               }
               if(timeOverImg_100){
                    clearTimeout(timeOverImg_100);
               }
               var img = nph.getTagName('img',overImg_100);
               if(params.imgNum>30){return false;}
               if(!params.imgNum){params.imgNum=1};
               if(img.length==0){
                     params.imgNum++;                   
                     var timeOverImg_100img=setTimeout(function(params){
                          nph.overImg_100(params);
                     },200);                   
                     return false;  
               }
               if(timeOverImg_100img){
                    clearTimeout(timeOverImg_100img);
               }
               var imgWidth = nph.getStyle(overImg_100,'width',true)<nph.wWidth?nph.getStyle(overImg_100,'width'):nph.wWidth+'px';
               for(var i=0;i<img.length;i++){
                    // console.log(nph.getStyle(img[i],'width',true));
                    // console.log(nph.getStyle(overImg_100,'width',true));
                    // console.log(nph.getStyle(img[i],'width',true) > nph.getStyle(overImg_100,'width',true));
                    //  console.log(img[i].src);
                    // console.log('---------------------------------------------------------------------------------')
                    if(nph.getStyle(img[i],'width',true) > nph.getStyle(overImg_100,'width',true)){
                           img[i].style.width = imgWidth;
                           img[i].style.height='auto';
                    }
               }
               overImg_100.style.overflow="hidden";
               
               if(params==undefined){
                    var params={};
               }
               params.index=10;
               params.i=params.i||1;
               var this_timeOverImg_100=setTimeout(function(){
                     if(params.index<=params.i){
                             clearTimeout(this_timeOverImg_100);
                             return false;
                     } 
                     params.i++;
                     nph.overImg_100(params);
               },500);                   
             return false;  
       };
         /*
             延时执行函数
          */
         nph.daleyedFn=function(fn,time){
                 if(fn==null){
                     return false;
                 }
                 if(time==null){
                     time=3000;
                 }
                 var fnTimer=setTimeout(function(){
                       fn();
                       clearTimeout(fnTimer);
                 },time);
         };
         // 只区分浏览器，不考虑版本
         // type=>Opera FF Chrome Safari IE
         // callback
         nph.myBrowser=function(type,callback){
                      var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
                      var isOpera = userAgent.indexOf("Opera") > -1;
                      if(type==null){
                           type='';
                      }
                      if (isOpera) {
                          if(type.toLowerCase()=='opera'&&callback!=null){
                                callback();
                          }
                          return "Opera"
                      }; //判断是否Opera浏览器
                      if (userAgent.indexOf("Firefox") > -1) {
                          if(type.toLowerCase()=='ff'&&callback!=null){
                                callback();
                          }
                          return "FF";
                      } //判断是否Firefox浏览器
                      if (userAgent.indexOf("Chrome") > -1){
                           if(type.toLowerCase()=='chrome'&&callback!=null){
                                callback();
                           }
                           return "Chrome";
                      }
                      if (userAgent.indexOf("Safari") > -1) {
                           if(type.toLowerCase()=='safari'&&callback!=null){
                                callback();
                           }
                           return "Safari";
                      } //判断是否Safari浏览器
                      if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
                           if(type.toLowerCase()=='ie'&&callback!=null){
                                callback();
                           }
                           return "IE";
                      }; //判断是否IE浏览器
          };
          // 把回车符转成<br/>
          nph.carriage_return=function(value){
                   return value.replace(/\r/g,'<br/>');
          };
          nph.isArray=function(o){
               return Object.prototype.toString.call(o)=='[object Array]';
          };
          nph.objType=function(o){
              return Object.prototype.toString.call(o).split(' ')[1].split(']')[0].toLowerCase();
              // 
          };
          nph.addVersion =function(src,id){
                  var scriptEl =  nph.createEl('script');
                  scriptEl.src=src+'?v='+Math.random().toString(16).substr(2);
                  nph.body().appendChild(scriptEl);
                  if(id){
                       nph.body().removeChild(nph.getId(id));
                  }
                  alert(nph.body().innerHTML);
          };


         // 
// 结束
})(window);



nph.redefineUrl();

// nph.localStorageGoBack();

// nph.getGoBack();
nph.localStorageRedefineUrl();
//刷新页面
nph.refresh();
