import React from "react";
import { HashRouter as Router, Route, Link } from "react-router-dom";

import SubRoute from '../routers/subRoute.js';

const Tacos = ({ routes }) => (
  <div>
    <h2>Tacos</h2>
    <ul>
      <li>
        <Link to="/tacos/bus">Bus</Link>
      </li>
      <li>
        <Link to="/tacos/cart">Cart</Link>
      </li>
    </ul>

    {routes.map((route, i) => <SubRoute key={i} {...route} />)}
  </div>
);


export default Tacos