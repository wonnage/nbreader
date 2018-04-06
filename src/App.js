import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { withRouter } from 'react-router';
import { Route, Redirect } from 'react-router-dom';
import axios from 'axios';
import { connect } from 'react-redux'
import Login from './Login.jsx';
import Reader from './Reader.jsx';

class App extends Component {
  componentDidMount() { this.initialLoginAndLoad(); }

  componentDidUpdate({ login: prevLogin }) {
    if (this.props.login !== prevLogin && this.props.login) {
      this.initialLoginAndLoad();
    }
  }

  initialLoginAndLoad() {
    axios.get('https://newsblur.com/reader/feeds?v=2&flat=true').then(({ data: { authenticated, feeds } }) => {
      if (authenticated) {
        this.props.dispatch({ type: 'login' });
        this.props.dispatch({ type: 'feedsLoad', payload: { feeds } });
      } else {
        this.props.dispatch({ type: 'logout' });
      }
    }).catch(() => this.props.dispatch({ type: 'logout' }));
  }

  render() {
    const { login } = this.props;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">NBREADER</h1>
        </header>
        {!login && <Redirect to={{ pathname: '/login' }} />}
        <Route path="/login" component={Login} />
        <div style={{ maxWidth: '750px', marginLeft: 'auto', marginRight: 'auto' }}>
          {login && <Reader />}
        </div>
      </div>
    );
  }
}

export default withRouter(connect(({ login }) => ({ login }))(App));
