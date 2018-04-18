// 根据时间删除文件
// 删除 css 或者 js 重复文件(保留最新文件)
var fs = require("fs")
var __dir = {
	path: 'D:\\nongpinhui\\nphapi.aijiaeg.com\\public\\vue\\dist\\css',//删除文件夹路径
	allDir: [],
	delDir: {}
}
function allDirFn(){
	for(var i=0;i<__dir.allDir.length;i++){
			for(var j=0;j<__dir.allDir.length;j++){
		         if(__dir.allDir[i].name==__dir.allDir[j].name&&__dir.allDir[i].atimeMs>__dir.allDir[j].atimeMs){
		         	  __dir.delDir[__dir.allDir[i].atimeMs] = __dir.path+'/'+__dir.allDir[i].path;
		         }
			}
	}
    for(var r in __dir.delDir){
    	// 删除文件
    	fs.unlink(__dir.delDir[r],function(err){if (err) throw err;});
    }
}
// 读取目录
fs.readdir(__dir.path,function(err, files){
   if (err) {
       return console.error(err);
   }
   files.forEach( function (file){
		fs.stat(__dir.path+'\\'+file, (err, stats) => {
		  if (err) throw err;
		  // console.log(file+'\n');
		  // console.log(`文件属性: ${JSON.stringify(stats)}\n`);
		  stats.path=file;
		  stats.name=file.split('.')?file.split('.')[0]+file.split('.')[file.split('.').length-1]:file;
		  __dir.allDir.push(stats);
		  if(__dir.allDir.length==files.length){
		  	   allDirFn()
		  }
		});		
   });
});
