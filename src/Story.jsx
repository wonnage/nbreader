import React, { Component } from 'react';
import axios from 'axios';
import _throttle from 'lodash/throttle';
import { connect } from 'react-redux'

export class Story extends Component {
  constructor(props) {
    super(props);
    this.htmlRendered = _throttle(this.htmlRendered.bind(this), 250);
    this.contentMounted = this.contentMounted.bind(this);
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
        this.setState({ fetchingText: false });
        dispatch({ type: 'storiesLoad', payload: { stories: { [story_hash]: { ...story, original_text } } } });
      });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.story !== this.props.story ||
      nextState.renderContent !== this.state.renderContent ||
      nextProps.viewSettings[nextProps.story.story_feed_id] !== this.props.viewSettings[nextProps.story.story_feed_id];
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
    const feedColor = `#${feed.favicon_color}`;
    return (
      <div
        ref={this.contentMounted}
        style={{
          textAlign: 'left',
        }}
      >
        <div
          className="storyHeader"
          style={{ borderTop: `4px solid ${feedColor}` }}
        >
          <div>{feed.feed_title}</div>
          <a href={story.story_permalink} style={{ color: 'black', textDecoration: 'none', display: 'block' }}>
            <div style={{ fontSize: '2em', fontWeight: 'bold' }}>{story.story_title}</div>
          </a>
        </div>
        {this.state.renderContent &&
          <div style={{ overflow: 'hidden', padding: '0 12px 4em' }} dangerouslySetInnerHTML={{ __html: content }} />
        }
      </div>
    );
  }
}

export default connect(({ viewSettings, feeds }) => ({ viewSettings, feeds }))(Story);
