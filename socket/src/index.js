import Main from './js/main';
import $ from 'jquery';
import SocketIo from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';
// import io from '../public/socket.io/socket.io.js';

// $(function(){
// 	    $.ajax({
// 	    	url:'http://localhost:3000/api',
// 	    	type:"GET",
// 	    	success:function(data){
// 	    		  console.log(data)
// 	    	},
// 	    	error:function(data){
// 	    		  console.log(data);
// 	    	}
// 	    })
// })

var socket = SocketIo('http://localhost:3000');
  socket.on('connect', function(){
  	console.log('connect')
  });
  
  socket.on('news', function(data){
  	  console.log(data)
  	  socket.emit('event', {'event':'this is emit event'});
  });
  
  socket.on('disconnect', function(){});



ReactDOM.render(
  <h1>Hello, world!</h1>,
  document.getElementById('app')
);