import React from "react";
import ReactDom from 'react-dom';
import { HashRouter as Router, Switch, Route, Link, NavLink } from "react-router-dom";

import SubRoute from './routers/subRoute.js'
import Routes from './routers/index.js'

const Dom = () => (
    <Router>
        <div>
           {Routes.map((route, i) => <SubRoute key={i} {...route} />)} 
        </div>
    </Router>
  )

 ReactDom.render(
    <Dom />
    ,
   document.getElementById('root')
 )