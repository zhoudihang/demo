import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import App from './src/app';
import Demo from './src/demo';


class Index extends Component {
      render(){
      	   return (
                <div>
                     <App />
                     <Demo />
                </div>
      	   	)
      }
}

ReactDOM.render(<Index />,document.getElementById('root'))


