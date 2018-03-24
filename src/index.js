import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'
import { createStore } from 'redux';
import axios from 'axios';
import 'react-virtualized/styles.css'

axios.defaults.withCredentials = true;

const initialState = {
  login: false,
  stories: {},
  feeds: {},
  viewSettings: {}
};

function newsblur(state = initialState, action) {
  switch(action.type) {
    case 'login':
      return {
        ...state,
        login: true,
      };
    case 'feedsLoad':
      return {
        ...state,
        feeds: { ...state.feeds, ...action.payload.feeds },
      };
    case 'storiesLoad':
      return {
        ...state,
        stories: { ...state.stories, ...action.payload.stories },
      };
    case 'viewSettingLoad':
      return {
        ...state,
        viewSettings: { ...state.viewSettings, ...action.payload.viewSettings },
      };
    default:
      return state;
  }
}

const store = createStore(
  newsblur,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

ReactDOM.render(
  (
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  ),
  document.getElementById('root')
);
registerServiceWorker();
