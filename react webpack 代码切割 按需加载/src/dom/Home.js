import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import SocketIo from 'socket.io-client';
// const socket = SocketIo('http://localhost:3000', {
//   path: '/home'
// });
// socket.on('connect', function(){
//  console.log('connect')
// });

// socket.on('news', function(data){
//    console.log(data)
//    socket.emit('event', {'event':'this is emit event'});
// });


 var chat = SocketIo.connect('http://localhost:3000/chat');

chat.on('some event', function (data) {
      console.log(data);
});

class Home extends React.Component {
  handleClick(e) {
      e.preventDefault();
      chat.emit('my other event', { my: 'chat data' });
      console.log('The link was Home.');
  }
  render() {
    return (
      <div>
        <h2>Home</h2>
        <input type="text" />
        <button onClick={this.handleClick}>button</button>
      </div>
    );
  }
}

export default Home;
