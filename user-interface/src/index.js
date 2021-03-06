import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';


//import NameForm from './NameForm';
//import * as serviceWorker from './serviceWorker';

/*const routing = (
   <Router>
      <div>
         <ul>
            <li>
               <Link to="/">Home</Link>
            </li>
         </ul>
         <Route exact path="/" component={HomePage} />
         <Route path="/order-lookup" component={OrderLookup} />
         <Route path="/signup" component={CreateAccount} />
         <Route path="/login" component={Login} />
         <Route path="/products" component={Products} />
         <Route path="/delivery-form" component={DeliveryInfo} />
      </div>
   </Router>
)


ReactDOM.render(
  routing,
  document.getElementById('root')
);*/

ReactDOM.render(
    <Router>
        <App />
    </Router>, 
    document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();


