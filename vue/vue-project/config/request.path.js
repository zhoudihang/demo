'use strict'
const config = require('./')
class RequestPath {
      constructor(path){      	   

      }
      getApi(path){
               const HOST = process.env.HOST||'';
               if(process.env.NODE_ENV=="development"){
                     return HOST+'/api'+this.api()[path];
               }else{
                     return HOST+this.api()[path];
               }
      }
      api(){
	   return {
            "index_getArtList" : "/index/getArtList"
         }
      }
}

export default (path) => {return new RequestPath().getApi(path)}
