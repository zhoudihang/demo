import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";


import SocketIo from 'socket.io-client';
// const socket = SocketIo('http://localhost:3000', {
//   path: '/about'
// });
// socket.on('connect', function(){
//  console.log('connect')
// });

// socket.on('news', function(data){
//    console.log(data)
//    socket.emit('event', {'event':'this is emit event'});
// });

// socket.on('disconnect', function(){});

var about = SocketIo.connect('http://localhost:3000/about');  
about.on('some event', function (data) {
      console.log(data);
});


class About extends React.Component {
  handleClick(e) {
      e.preventDefault();
      about.emit('my other event', { my: 'about data' });
      console.log('The link was clicked.');
  }
  render() {
    return (
      <div>
        <h2>About</h2>
        <input type="text" />
        <button onClick={this.handleClick}>button</button>
      </div>
    );
  }
}

export default About;
