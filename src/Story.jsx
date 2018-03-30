import React, { Component } from 'react';
import axios from 'axios';
import _throttle from 'lodash/throttle';
import _isEqual from 'lodash/isEqual';
import { connect } from 'react-redux'
import Waypoint from 'react-waypoint';
import cx from 'classnames';
import qs from 'querystring';

export class Story extends Component {
  constructor(props) {
    super(props);
    this.htmlRendered = _throttle(this.htmlRendered.bind(this), 250);
    this.contentMounted = this.contentMounted.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.state = {
      renderContent: false,
    };
  }

  componentDidMount() {
    this.setState({ renderContent: true });
    const { viewSettings, story, dispatch } = this.props;
    const settings = viewSettings[story.story_feed_id];
    if (!settings) {
      axios.post('https://newsblur.com/profile/get_view_setting', `feed_id=${story.story_feed_id}`)
        .then(({ data: { payload } }) => dispatch({ type: 'viewSettingLoad', payload: { viewSettings: { [story.story_feed_id]: payload } } }))
    } else {
      this.loadFullTextIfSetting();
    }
  }

  loadFullTextIfSetting() {
    const { viewSettings, story, dispatch } = this.props;
    const { fetchingText } = this.state;
    const settings = viewSettings[story.story_feed_id];
    if (settings && settings.v == 'text' && !story.original_text && !fetchingText) {
      this.setState({ fetchingText: true });
      axios.get('https://newsblur.com/rss_feeds/original_text', {
        params: {
          story_hash: story.story_hash,
        },
      }).then(({ data: { original_text, story_hash } }) => {
        if (original_text) {
          dispatch({ type: 'storiesLoad', payload: { stories: { [story_hash]: { ...story, original_text } } } });
        }

        if (this._unmounted) { return; }
        if (original_text) {
          this.setState({ fetchingText: false });
        } else {
          this.setState({ fetchingText: 'failed' });
        }
      });
    }
  }

  markAsRead() {
    const { dispatch, story } = this.props;
    if (story.read_status == 0) {
      dispatch({ type: 'storiesLoad', payload: { stories: { [story.story_hash]: { ...story, read_status: 1 } } } });
      axios.post('https://newsblur.com/reader/mark_story_hashes_as_read', qs.stringify({ story_hash: story.story_hash }));
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !_isEqual(this.props, nextProps) || !_isEqual(this.state, nextState);
  }

  componentWillReceiveProps() {
    this.loadFullTextIfSetting();
  }

  componentDidUpdate() {
    this.htmlRendered();
  }

  htmlRendered() {
    if (this._unmounted) { return; }
    this.props.htmlRendered();
  }

  contentMounted(node) {
    if (!node) { this._unmounted = true; return; }
    node.addEventListener('load', this.htmlRendered, true);
  }

  render() {
    const { story, feeds } = this.props;
    const content = story.original_text || story.story_content;
    const feed = feeds[story.story_feed_id];
    const feedColor = `#${feed.favicon_fade}`;
    const progressRatio = Math.min(1, Math.max(0, (this.props.scrollTop - this.props.top + window.innerHeight) / this.props.height));
    return (
      <div
        ref={this.contentMounted}
        style={{
          textAlign: 'left',
          borderBottom: '1px solid black',
        }}
      >
        <Waypoint onEnter={this.markAsActive} topOffset="-40%" />
        <div
          className={cx('storyHeader', { read: story.read_status > 0 })}
        >
          <div>{feed.feed_title} &#8227; {new Date(story.story_timestamp * 1000).toLocaleString()}</div>
          <a href={story.story_permalink} style={{ color: 'black', textDecoration: 'none', display: 'block' }}>
            <div className="title">{story.story_title}</div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 3, background: 'black' }} >
              <div style={{ position: 'absolute', transition: 'width 0.25s', bottom: 0, left: 0, width: `${progressRatio * 100}%`, height: 3, background: feedColor }}  />
            </div>
          </a>
        </div>
        {this.state.renderContent &&
          <div style={{ overflow: 'hidden', padding: '0 12px 4em' }} dangerouslySetInnerHTML={{ __html: content }} />
        }
        {this.contentMounted &&
          <Waypoint
            onEnter={this.markAsRead}
            topOffset="-40%"
          />
        }
      </div>
    );
  }
}

export default connect(({ viewSettings, feeds }) => ({ viewSettings, feeds }))(Story);
