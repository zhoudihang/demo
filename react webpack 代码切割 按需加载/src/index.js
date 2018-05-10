// import $ from 'jquery';
// import SocketIo from 'socket.io-client';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

// 代码分割 按需加载
import Loadable from 'react-loadable';
import Loading from './Loading';


// import Main from './js/main';
const LoadableComponent = Loadable({
  loader: () => import('./dom/News'),
  loading: Loading,
})
export default class News extends React.Component {
  render() {
    return <LoadableComponent />;
  }
}

const AboutComponent = () => {
	  return Loadable({
		  loader: () => import('./dom/About'),
		  loading: Loading,
		})
}

// dom
import Index from './dom/Index';
// import Home from './dom/Home';
// import About from './dom/About';
// import News from './dom/News';

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
      <Route exact path="/home" component={Loadable({loader: () => import('./dom/LComponent'),loading: Loading,})} />
      <Route path="/about" component={AboutComponent()} />
      <Route path="/news" component={News} />
    </div>
  </Router>
);


ReactDOM.render(
  <BasicExample />,
  document.getElementById("app")
);