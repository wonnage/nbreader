import React, { Component } from 'react';
import { connect } from 'react-redux'
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import qs from 'qs';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };

    this.login = this.login.bind(this);
  }

  login(e) {
    e.preventDefault();
    const { username, password } = this.state;
    axios.post('https://newsblur.com/api/login', qs.stringify({
      username,
      password,
    })).then(({ data: { authenticated } }) => {
      if (authenticated) {
        this.props.dispatch({ type: 'login' });
      } else {
        throw 'authentication failure';
      }
    });
  }

  render() {
    const { login, redirect } = this.props;
    if (login) {
      return <Redirect to={{ pathname: redirect || '/' }} />
    }

    return (
      <form onSubmit={this.login} >
        <label>
          Username
          <input type="text" value={this.state.username} onChange={(e) => this.setState({ username: e.target.value })} />
        </label>
        <label>
          Password
          <input type="password" value={this.state.password} onChange={(e) => this.setState({ password: e.target.value })} />
        </label>
        <input type="submit" value="Login" />
      </form>
    );
  }
}

export default connect(({ login }) => ({ login }))(Login);
