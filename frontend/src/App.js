import React, { Component } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import MainNavigation from './components/MainNavigation/MainNavigation';

import Auth from './pages/Auth';
import Events from './pages/Events';
import Bookings from './pages/Bookings';

import './App.css';

class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <MainNavigation />
          <main className="main-content">
            <Switch>
              <Redirect from="/" to="/auth" exact />
              <Route path="/auth" component={Auth} />
              <Route path="/events" component={Events} />
              <Route path="/bookings" component={Bookings} />
            </Switch>
          </main>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
