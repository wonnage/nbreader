import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Route, Redirect } from 'react-router-dom';
import axios from 'axios';
import { connect } from 'react-redux'
import Login from './Login.jsx';
import Reader from './Reader.jsx';

class App extends Component {
  componentDidMount() {
    axios.get('https://newsblur.com/reader/feeds?v=2&flat=true').then(({ data: { authenticated, feeds } }) => {
      if (authenticated) {
        this.props.dispatch({ type: 'login' });
        this.props.dispatch({ type: 'feedsLoad', payload: { feeds } });
      }
    });
  }
  render() {
    const { login } = this.props;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">NBREADER</h1>
        </header>
        <Route path="/login" component={Login} />
        {!login && <Redirect to={{ pathname: '/login' }} />}
        {login && <Reader />}
      </div>
    );
  }
}

export default connect(({ login }) => ({ login }))(App);
