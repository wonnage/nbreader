import React, { Component } from 'react';
import { CellMeasurer, CellMeasurerCache, List as VirtualizedList, WindowScroller, AutoSizer, InfiniteLoader } from 'react-virtualized';
import Story from './Story.jsx';
import _isEqual from 'lodash/isEqual';

export default class List extends Component {
  constructor(props) {
    super(props);
    this._cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 150,
    });
    this.rowRenderer = this.rowRenderer.bind(this);
    this.registerScroller = this.registerScroller.bind(this);
    this.isRowLoaded = this.isRowLoaded.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.state = {
      scrollTop: 0,
    };
  }

  rowRenderer({ index, key, parent, style }) {
    const { stories } = this.props;

    const story = stories[index];

    return (
      <CellMeasurer
        cache={this._cache}
        columnIndex={0}
        key={key}
        rowIndex={index}
        parent={parent}
      >
        {({ measure }) => (
          <div style={style}>
            {index == stories.length && <div>...</div>}
            {story &&
              <Story
                story={story}
                htmlRendered={measure}
                index={index}
                top={style.top}
                height={style.height}
                scrollTop={this.state.scrollTop}
              />
            }
          </div>
        )}
      </CellMeasurer>
    );
  }

  componentDidUpdate({ feeds: prevFeeds }) {
    if (!_isEqual(this.props.feeds, prevFeeds) && this.loader) {
      this.loader.resetLoadMoreRowsCache(true);
    }
  }

  registerScroller(list) {
    this.scroller = list;
    this._registerList(list);
  }

  isRowLoaded({ index }) {
    return index < this.props.stories.length;
  }

  onScroll(pos) {
    this._onChildScroll(pos);
    this.setState({ scrollTop: pos.scrollTop });
  }

  render() {
    const { stories, fetchStories } = this.props;
    return (
      <InfiniteLoader
        ref={(r) => this.loader = r}
        isRowLoaded={this.isRowLoaded}
        loadMoreRows={fetchStories}
        rowCount={stories.length + 1}
        threshold={3}
      >
         {({ onRowsRendered, registerChild }) => {
           this._registerList = registerChild;

           return (
             <WindowScroller>
              {({ height, isScrolling, scrollTop, onChildScroll }) => {
                this._onChildScroll = onChildScroll;
                return (
                  <AutoSizer disableHeight>
                    {({ width }) => (
                      <VirtualizedList
                        autoHeight
                        deferredMeasurementCache={this._cache}
                        height={height}
                        width={width}
                        overscanRowCount={1}
                        onRowsRendered={onRowsRendered}
                        scrollingResetTimeInterval={0}
                        isScrolling={false}
                        scrollTop={scrollTop}
                        onScroll={this.onScroll}
                        rowCount={stories.length + 1}
                        rowHeight={this._cache.rowHeight}
                        rowRenderer={this.rowRenderer}
                        ref={this.registerScroller}
                        containerStyle={{ overflow: 'visible' }}
                        style={{ overflowX: 'visible', overflowY: 'visible' }}
                      />
                    )}
                  </AutoSizer>
                );
              }}
            </WindowScroller>
          )}
         }
      </InfiniteLoader>
    );
  }
}
