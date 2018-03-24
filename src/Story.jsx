import React, { Component } from 'react';
import _throttle from 'lodash/throttle';

export default class Story extends Component {
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
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.story !== this.props.story ||
      nextState.renderContent !== this.state.renderContent;
  }

  componentDidUpdate() {
    this.htmlRendered();
  }

  htmlRendered() {
    if (this._unmounted) { return; }
    console.log('rendered');
    this.props.htmlRendered();
  }

  contentMounted(node) {
    if (!node) { this._unmounted = true; return; }
    node.addEventListener('load', this.htmlRendered, true);
  }

  render() {
    const { story } = this.props;
    return (
      <div
        ref={this.contentMounted}
        style={{
          textAlign: 'left',
          padding: 20,
          borderBottom: '1px solid #eee',
        }}
      >
        <a href={story.story_permalink} style={{ color: 'black', textDecoration: 'none' }}>
          <h2>{story.story_title}</h2>
        </a>
        {this.state.renderContent &&
          <div dangerouslySetInnerHTML={{ __html: story.story_content }} />
        }
      </div>
    );
  }
}
