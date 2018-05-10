// import $ from 'jquery';
// import SocketIo from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Main from './js/main';

// dom
import Index from './dom/Index';
import Home from './dom/Home';
import About from './dom/About';
import News from './dom/News';

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

// var socket = SocketIo('http://localhost:3000');
// socket.on('connect', function(){
// 	console.log('connect')
// });

// socket.on('news', function(data){
// 	  console.log(data)
// 	  socket.emit('event', {'event':'this is emit event'});
// });

// socket.on('disconnect', function(){});


const BasicExample = () => (
  <Router>
    <div>
      <ul>
        <li>
          <Link to="/">Index</Link>
        </li>
        <li>
          <Link to="/home">Home</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/news">News</Link>
        </li>
        
      </ul>

      <hr />
      <Route exact path="/" component={Index} />
      <Route exact path="/home" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/news" component={News} />
    </div>
  </Router>
);


ReactDOM.render(
  <BasicExample />,
  document.getElementById("app")
);