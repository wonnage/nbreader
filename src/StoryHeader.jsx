import React, { Component } from 'react';
import cx from 'classnames';
import _debounce from 'lodash/debounce';

export default class StoryHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: false,
    }

    this.updateCollapse = _debounce(this.updateCollapse.bind(this), 50, { leading: true, trailing: true });
  }

  componentWillReceiveProps({ scrollTop, top, height }) {
    if (scrollTop > top + height - 100) { return; }
    this.updateCollapse({ scrollTop, top });
  }

  updateCollapse({ scrollTop: nextScrollTop, top: nextTop }) {
    if (nextScrollTop < this.props.scrollTop) {
      if (this.state.collapse) {
        this.setState({ collapse: false });
      }
    } else if (nextScrollTop > nextTop && nextScrollTop > this.props.scrollTop) {
      if(!this.state.collapse) {
        this.setState({ collapse: true });
      }
    }
  }

  render() {
    const {
      scrollTop,
      top,
      height,
      story,
      feed,
    } = this.props;
    const progressRatio = Math.min(1, Math.max(0, (scrollTop - top + window.innerHeight) / height));
    const feedColor = `#${feed.favicon_fade}`;

    return (
      <div
        className={cx('storyHeader', { read: story.read_status > 0 })}
      >
        <div>{feed.feed_title} &#8227; {new Date(story.story_timestamp * 1000).toLocaleString()}</div>
        <a href={story.story_permalink} style={{ color: 'black', textDecoration: 'none', display: 'block' }}>
          <div className={cx('title', { collapse: this.state.collapse })}>{story.story_title}</div>
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 3, background: 'black', overflow: 'hidden' }} >
            <div style={{ position: 'absolute', transition: 'right 0.10s', width: '100%', bottom: 0, right: `${100 - progressRatio * 100}%`, height: 3, background: feedColor }}  />
          </div>
        </a>
      </div>
    );
  }
}

