import App from '../app.js';
import Sandwiches from '../component/sandwiches.js';
import Tacos from '../component/tacos.js';
import Bus from '../component/bus.js';
import Cart from '../component/cart.js';

const routes = [
  {
    path: "/",
    component: App,
    exact:true
  },
  {
    path: "/sandwiches",
    component: Sandwiches
  },
  {
    path: "/tacos",
    component: Tacos,
    routes:[
	  {
	    path: "/tacos/bus",
	    component: Bus
	  },
	  {
	    path: "/tacos/cart",
	    component: Cart
	  }
    ]
  }
];

export default routes;