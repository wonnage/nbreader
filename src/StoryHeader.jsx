import React from 'react';
import cx from 'classnames';

export default function StoryHeader({
  scrollTop,
  top,
  height,
  story,
  feed,
}) {
  const progressRatio = Math.min(1, Math.max(0, (scrollTop - top + window.innerHeight) / height));
  const feedColor = `#${feed.favicon_fade}`;

  return (
    <div
      className={cx('storyHeader', { read: story.read_status > 0 })}
    >
      <div>{feed.feed_title} &#8227; {new Date(story.story_timestamp * 1000).toLocaleString()}</div>
      <a href={story.story_permalink} style={{ color: 'black', textDecoration: 'none', display: 'block' }}>
        <div className="title">{story.story_title}</div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 3, background: 'black' }} >
          <div style={{ position: 'absolute', transition: 'width 0.20s', bottom: 0, left: 0, width: `${progressRatio * 100}%`, height: 3, background: feedColor }}  />
        </div>
      </a>
    </div>
  );
}
