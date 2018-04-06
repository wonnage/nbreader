import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import _throttle from 'lodash/throttle';
import _isEqual from 'lodash/isEqual';
import { connect } from 'react-redux'
import Waypoint from 'react-waypoint';
import qs from 'querystring';
import StoryHeader from './StoryHeader.jsx';

const propTypes = {
  viewSettings: PropTypes.shape({
    v: PropTypes.string
  }),
  story: PropTypes.shape({
    story_feed_id: PropTypes.number,
    original_text: PropTypes.string,
  }),
  dispatch: PropTypes.func.isRequired,
  feeds: PropTypes.object,
  scrollTop: PropTypes.number,
  top: PropTypes.number,
  height: PropTypes.number,
  htmlRendered: PropTypes.func,
};

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
    if (!viewSettings) {
      axios.post('https://newsblur.com/profile/get_view_setting', `feed_id=${story.story_feed_id}`)
        .then(({ data: { payload } }) => dispatch({ type: 'viewSettingLoad', payload: { viewSettings: { [story.story_feed_id]: payload } } }))
    } else {
      this.loadFullTextIfSetting();
    }
  }

  loadFullTextIfSetting() {
    const { viewSettings, story, dispatch } = this.props;
    const { fetchingText } = this.state;
    if (viewSettings && viewSettings.v == 'text' && !story.original_text && !fetchingText) {
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
    const { story, feeds, scrollTop, top, height } = this.props;
    const content = story.original_text || story.story_content;
    const feed = feeds[story.story_feed_id];
    return (
      <div
        ref={this.contentMounted}
        style={{
          textAlign: 'left',
          borderBottom: '1px solid black',
        }}
      >
        <StoryHeader
          scrollTop={scrollTop}
          top={top}
          height={height}
          story={story}
          feed={feed}
        />
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

Story.propTypes = propTypes;

export default connect(({ viewSettings, feeds }, { story }) => (
  { viewSettings: viewSettings[story.story_feed_id], feeds }
))(Story);
