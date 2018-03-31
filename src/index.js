import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux'
import { createStore, compose } from 'redux';
import persistState from 'redux-localstorage';
import axios from 'axios';
import 'react-virtualized/styles.css'

axios.defaults.withCredentials = true;
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(
  persistState(['feeds', 'viewSettings']),
);

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
    case 'logout':
      return {
        ...state,
        login: false,
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
    case 'activeStoryIndex':
      return {
        ...state,
        activeStoryIndex: action.payload,
      };
    default:
      return state;
  }
}

const store = createStore(
  newsblur,
  initialState,
  enhancer,
);

ReactDOM.render(
  (
    <Provider store={store}>
      <BrowserRouter basename="/nbreader">
        <App />
      </BrowserRouter>
    </Provider>
  ),
  document.getElementById('root')
);
registerServiceWorker();
