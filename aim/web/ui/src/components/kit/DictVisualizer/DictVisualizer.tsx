import * as React from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import CopyToClipBoard from 'components/CopyToClipBoard/CopyToClipBoard';

import { formatValue } from 'utils/formatValue';
import { encode } from 'utils/encoder/encoder';
import { toType, typeToColor } from 'utils/valueToType/valueToType';

import Text from '../Text';
import Icon from '../Icon';

import {
  IDictVisualizerProps,
  DictVisualizerRowType,
  IDictVisualizerRowProps,
} from './DictVisualizer.d';

import './DictVisualizer.scss';

const ROW_SIZE = 22;

function DictVisualizer(props: IDictVisualizerProps) {
  const [collapsedItems, setCollapsedItems] = React.useState<{
    [key: string]: boolean;
  }>({});

  // Convert the dict to a list of key-value pairs
  const flattenDict = React.useCallback(
    (
      dict: { [key: string]: unknown } | unknown[],
      level: number = 0,
      parentKey: string = 'root',
    ) => {
      let rows: DictVisualizerRowType[] = [];

      // Add top level brackets
      if (level === 0) {
        if (Array.isArray(dict)) {
          let nestedItemsLength = dict.length;
          rows.push({
            id: parentKey,
            root: nestedItemsLength > 0,
            level,
            key: null,
            value: `[${
              nestedItemsLength === 0
                ? ']'
                : collapsedItems[parentKey]
                ? '...]'
                : ''
            }`,
            sub: `${nestedItemsLength} item${
              nestedItemsLength === 1 ? '' : 's'
            }`,
            color: typeToColor('array'),
            copyContent: formatValue(dict),
          });
        } else {
          let nestedItemsLength = Object.keys(dict).length;
          rows.push({
            id: parentKey,
            root: nestedItemsLength > 0,
            level,
            key: null,
            value: `{${
              nestedItemsLength === 0
                ? '}'
                : collapsedItems[parentKey]
                ? '...}'
                : ''
            }`,
            sub: `${nestedItemsLength} item${
              nestedItemsLength === 1 ? '' : 's'
            }`,
            color: typeToColor('object'),
            copyContent: formatValue(dict),
          });
        }
      }
      if (!collapsedItems[parentKey]) {
        for (let key in dict) {
          let item: unknown = Array.isArray(dict) ? dict[+key] : dict[key];
          let type = toType(item);
          let color = typeToColor(type);
          let id = encode({
            parent: parentKey,
            key,
          });
          const value = formatValue(item);
          if (Array.isArray(item)) {
            // Add array subtree
            rows.push({
              id,
              root: item.length > 0,
              level,
              key: formatValue(key),
              value: `[${
                item.length === 0 ? ']' : collapsedItems[id] ? '...]' : ''
              }`,
              sub: `${item.length} item${item.length === 1 ? '' : 's'}`,
              color: typeToColor('array'),
              copyContent: value,
            });
            if (!collapsedItems[id] && item.length > 0) {
              rows.push(...flattenDict(item as unknown[], level + 1, id));
              rows.push({
                id,
                level,
                key: null,
                value: ']',
                sub: null,
                color: typeToColor('array'),
              });
            }
          } else if (typeof item === 'object' && item !== null) {
            // Add dict subtree
            let nestedItemsLength = Object.keys(item).length;
            rows.push({
              id,
              root: nestedItemsLength > 0,
              level,
              key: formatValue(key),
              value: `{${
                nestedItemsLength === 0 ? '}' : collapsedItems[id] ? '...}' : ''
              }`,
              sub: `${nestedItemsLength} item${
                nestedItemsLength === 1 ? '' : 's'
              }`,
              color: typeToColor('object'),
              copyContent: value,
            });
            if (!collapsedItems[id] && nestedItemsLength > 0) {
              rows.push(
                ...flattenDict(
                  item as { [key: string]: unknown },
                  level + 1,
                  id,
                ),
              );
              rows.push({
                id,
                level,
                key: null,
                value: '}',
                sub: null,
                color: typeToColor('object'),
              });
            }
          } else {
            // Add row for primitive values
            rows.push({
              id,
              level,
              key: Array.isArray(dict) ? +key : formatValue(key),
              value,
              sub: type === '' ? null : type,
              color,
              copyContent: value,
            });
          }
        }

        // Add top level closing brackets
        if (level === 0) {
          if (Array.isArray(dict)) {
            rows.push({
              id: parentKey,
              level,
              key: null,
              value: ']',
              sub: null,
              color: typeToColor('array'),
            });
          } else {
            rows.push({
              id: parentKey,
              level,
              key: null,
              value: '}',
              sub: null,
              color: typeToColor('object'),
            });
          }
        }
      }

      return rows;
    },
    [collapsedItems],
  );

  const rows = React.useMemo(() => {
    return flattenDict(props.src as { [key: string]: unknown });
  }, [props.src, flattenDict]);

  function collapseToggler(id: string) {
    setCollapsedItems((cI) => ({
      ...cI,
      [id]: !cI[id],
    }));
  }

  return (
    <ErrorBoundary>
      <div
        style={{
          ...props.style,
          height: props.autoScale
            ? Math.min(ROW_SIZE * rows.length, props.style!.height! as number)
            : props.style?.height,
        }}
        className='DictVisualizer'
      >
        <AutoSizer>
          {({ width, height }) => (
            <List
              width={width}
              height={height}
              itemCount={rows.length}
              itemSize={ROW_SIZE}
            >
              {({ index, style }: ListChildComponentProps) => {
                const row = rows[index];
                return (
                  <DictVisualizerRow
                    row={row}
                    index={index}
                    style={style}
                    collapseToggler={collapseToggler}
                    isCollapsed={collapsedItems[row.id]}
                    rowsCount={rows.length}
                  />
                );
              }}
            </List>
          )}
        </AutoSizer>
      </div>
    </ErrorBoundary>
  );
}

function DictVisualizerRow(props: IDictVisualizerRowProps) {
  const { row, style, index, collapseToggler, isCollapsed, rowsCount } = props;

  return (
    <div key={row.key} className='DictVisualizer__row' style={style}>
      {index !== 0 &&
        index !== rowsCount - 1 &&
        Array(row.level + 1)
          .fill('_')
          .map((_, i) => (
            <div key={i} className='DictVisualizer__row__indent' />
          ))}
      {row.root && (
        <div
          className='DictVisualizer__row__collapseToggler'
          onClick={() => collapseToggler(row.id)}
        >
          <Icon
            name={isCollapsed ? 'arrow-right' : 'arrow-down'}
            fontSize={9}
          />
        </div>
      )}
      <div className='DictVisualizer__row__content'>
        {row.key !== null && (
          <Text size={16} className='DictVisualizer__row__content__key'>
            {row.key}:
          </Text>
        )}
        {row.sub !== null && (
          <Text
            size={12}
            className='DictVisualizer__row__content__sub'
            style={{ color: row.color }}
          >
            {row.sub}
          </Text>
        )}
        <Text
          size={16}
          className='DictVisualizer__row__content__value'
          style={{
            color: row.color,
            cursor: isCollapsed ? 'pointer' : '',
          }}
          onClick={isCollapsed ? () => collapseToggler(row.id) : undefined}
        >
          {row.value as string}
        </Text>
      </div>
      {row.copyContent && (
        <CopyToClipBoard
          className='DictVisualizer__row__copy'
          iconSize='xxSmall'
          copyContent={row.copyContent}
        />
      )}
    </div>
  );
}

DictVisualizer.displayName = 'DictVisualizer';

export default React.memo<IDictVisualizerProps>(DictVisualizer);
