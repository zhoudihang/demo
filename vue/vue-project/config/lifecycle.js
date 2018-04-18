'use strict'
// Template version: 1.3.1
// see http://vuejs-templates.github.io/webpack for documentation.

const path = require('path')

function npmLifecycleEvent(){
	 return process.env.npm_lifecycle_event.indexOf('dev_')>-1
	 ?process.env.npm_lifecycle_event.replace('dev_',''):process.env.npm_lifecycle_event.indexOf('test_')>-1
	 ?process.env.npm_lifecycle_event.replace('test_',''):process.env.npm_lifecycle_event;
}

module.exports = {
   event:npmLifecycleEvent(),
   app:{
       template: 'app.html',
       entry: 'app.js'
   },
   index:{
       template: 'index.html',
       entry: 'index.js'
   }
}
