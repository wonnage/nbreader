import React, { Component } from 'react';
import { connect } from 'react-redux'
import _isEqual from 'lodash/isEqual';
import _isEmpty from 'lodash/isEmpty';
import axios from 'axios';
import List from './List.jsx';

const PAGE_SIZE = 8;

class Reader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {
        page: 1,
        order: 'newest',
        read_filter: 'unread',
        include_hidden: false,
        infrequent: false,
      },
    }

    this.nextPage = this.nextPage.bind(this);
  }

  nextPage() {
    this.setState({ query: { ...this.state.query, page: this.state.query.page + 1 } });
  }

  componentDidMount() {
    this.fetchStories();
  }

  componentDidUpdate({ feeds: prevFeeds, stories: prevStories }, { query: prevQuery }) {
    if (!_isEqual(this.props.feeds, prevFeeds) ||
      !_isEqual(this.props.stories, prevStories) ||
      !_isEqual(this.state.query, prevQuery)
    ) {
      this.fetchStories();
    }
  }

  fetchStories() {
    if (_isEmpty(this.props.feeds)) { return; }
    axios.get('https://newsblur.com/reader/river_stories', { params: {
      feeds: Object.keys(this.props.feeds),
      ...this.state.query,
    } }).then(({ data: { stories, ps, nt } }) => {
      const hashToStories = stories.reduce((hs, story) => {
        hs[story.story_hash] = story;
        return hs;
      }, {});
      this.props.dispatch({ type: 'storiesLoad', payload: { stories: hashToStories } });
    });
  }

  render() {
    return (
      <div>
        <List stories={Object.values(this.props.stories)} fetchNextPage={this.nextPage} />
        <button onClick={this.nextPage}>GIVE ME MORE</button>
      </div>
    );
  }
}

export default connect(({ feeds, stories }) => ({ feeds, stories }))(Reader);
