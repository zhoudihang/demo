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

 var news = SocketIo.connect('http://localhost:3000/news');
  
news.on('some event', function (data) {
      console.log(data);
});

class News extends React.Component {
  handleClick(e) {
      e.preventDefault();
      news.emit('my other event', { my: 'news data' });
      console.log('The link was news.');
  }
  render() {
    return (
      <div>
        <h2>news</h2>
        <input type="text" />
        <button onClick={this.handleClick}>button</button>
      </div>
    );
  }
}

export default News;
