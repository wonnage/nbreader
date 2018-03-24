import React, { Component } from 'react';
import { CellMeasurer, CellMeasurerCache, List as VirtualizedList, WindowScroller, AutoSizer } from 'react-virtualized';
import Story from './Story.jsx';

export default class List extends Component {
  constructor(props) {
    super(props);
    this._cache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: 150,
    });
    this.rowRenderer = this.rowRenderer.bind(this);
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
            <Story story={story} htmlRendered={measure} />
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

  render() {
    const { stories } = this.props;
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
                overscanRowCount={1}
                isScrolling={isScrolling}
                scrollTop={scrollTop}
                onScroll={onChildScroll}
                rowCount={stories.length}
                rowHeight={this._cache.rowHeight}
                rowRenderer={this.rowRenderer}
                ref={(l) => this.scroller = l}
              />
            )}
          </AutoSizer>
        )}
      </WindowScroller>
    );
  }
}
