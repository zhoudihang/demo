import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";


import Here from './here.js';
import Far from './far.js';
import Near from './near.js';
// first our route components
const Nearby = () => (
  <Router>
   <div>
      <h2>Nearby</h2>
      <ul>
          <li>
                <Link exact="true" to="/nearby/here">here</Link>
          </li>
          <li>
                <Link to="/nearby/far">far</Link>
          </li>
          <li>
                <Link to="/nearby/near">near</Link>
          </li>
      </ul>
      <Here />
   </div>
   </Router>
);

export default Nearby;