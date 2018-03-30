import React, { Component } from 'react';
import { connect } from 'react-redux'
import _isEmpty from 'lodash/isEmpty';
import axios from 'axios';
import List from './List.jsx';

const PAGE_SIZE = 8;

class Reader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      query: {
        order: 'newest',
        read_filter: 'unread',
        include_hidden: false,
        infrequent: false,
      },
    }

    this.fetchStories = this.fetchStories.bind(this);
    this.page = 1;
  }

  fetchStories({ startIndex, stopIndex }) {
    if (_isEmpty(Object.keys(this.props.feeds))) { return; }
    if (this.storiesFetching) { return; }
    this.storiesFetching = true;
    return axios.get('https://newsblur.com/reader/river_stories', { params: {
      feeds: Object.keys(this.props.feeds),
      ...this.state.query,
      page: this.page,
    } }).then(({ data: { stories, hidden_stories_removed } }) => {
      this.page += 1;
      this.storiesFetching = false;
      const hashToStories = stories.reduce((hs, story) => {
        hs[story.story_hash] = story;
        return hs;
      }, {});
      this.props.dispatch({ type: 'storiesLoad', payload: { stories: hashToStories } });
      if (startIndex + stories.length < stopIndex + 1 && hidden_stories_removed > 0) {
        return this.fetchStories({ startIndex: startIndex + stories.length, stopIndex });
      }
    });
  }

  render() {
    return (
      <div>
        <List feeds={Object.values(this.props.feeds)} stories={Object.values(this.props.stories)} fetchStories={this.fetchStories} />
      </div>
    );
  }
}

export default connect(({ feeds, stories }) => ({ feeds, stories }))(Reader);
