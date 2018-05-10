import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import SocketIo from 'socket.io-client';


// var socket = SocketIo('http://localhost:3000');
// socket.on('connect', function(){
//  console.log('connect')
// });

// socket.on('news', function(data){
//    console.log(data)
//    socket.emit('event', {'event':'this is emit event'});
// });

 var In = SocketIo.connect('http://localhost:3000/');
  
In.on('msg', function (data) {
      console.log(data);
});

const Home = () => (
  <div>
    <h2>Index</h2>
  </div>
);

export default Home;
