import React from "react";
import { HashRouter as Router, Route, Link } from "react-router-dom";

import SubRoute from './routers/subRoute.js';
import Cart from './component/cart.js';

const RouteConfigExample = ({ routes }) => (
  <div>
    <ul>
      <li>
        <Link to="/tacos">Tacos</Link>
      </li>
      <li>
        <Link to="/sandwiches">Sandwiches</Link>
      </li>
    </ul>
    <Cart />
  </div>
);

export default RouteConfigExample;