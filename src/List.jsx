import React, { Component } from 'react';
import { CellMeasurer, CellMeasurerCache, List as VirtualizedList, WindowScroller, AutoSizer, InfiniteLoader } from 'react-virtualized';
import Story from './Story.jsx';

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
            {index == stories.length && <div style={style}>...</div>}
            {story && <Story story={story} htmlRendered={measure} />}
          </div>
        )}
      </CellMeasurer>
    );
  }

  componentDidUpdate({ currentPageStart: prevStart }) {
    if (prevStart !== this.props.currentPageStart && this.scroller) {
      this.scroller.scrollToRow(this.props.currentPageStart);
    }
  }

  registerScroller(list) {
    this.scroller = list;
    this._registerList(list);
  }

  isRowLoaded({ index }) {
    return index < this.props.stories.length;
  }

  render() {
    const { stories, fetchNextPage } = this.props;
    return (
      <InfiniteLoader
        isRowLoaded={this.isRowLoaded}
        loadMoreRows={fetchNextPage}
        rowCount={stories.length + 1}
      >
         {({ onRowsRendered, registerChild }) => {
           this._registerList = registerChild;

           return (
            <WindowScroller>
              {({ height, isScrolling, scrollTop, onChildScroll }) => (
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <VirtualizedList
                      autoHeight
                      deferredMeasurementCache={this._cache}
                      height={height}
                      width={width}
                      overscanRowCount={3}
                      onRowsRendered={onRowsRendered}
                      isScrolling={isScrolling}
                      scrollTop={scrollTop}
                      onScroll={onChildScroll}
                      rowCount={stories.length + 1}
                      rowHeight={this._cache.rowHeight}
                      rowRenderer={this.rowRenderer}
                      ref={this.registerScroller}
                      containerStyle={{ overflow: 'visible' }}
                      style={{ overflowX: 'visible', overflowY: 'visible' }}
                    />
                  )}
                </AutoSizer>
              )}
            </WindowScroller>
          )}
         }
      </InfiniteLoader>
    );
  }
}
