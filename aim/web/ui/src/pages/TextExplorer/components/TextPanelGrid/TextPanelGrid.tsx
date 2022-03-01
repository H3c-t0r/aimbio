import * as React from 'react';
import { Link as RouteLink } from 'react-router-dom';
import { merge } from 'lodash-es';

import { Link } from '@material-ui/core';

import { Badge } from 'components/kit';

import COLORS from 'config/colors/colors';
import { PathEnum } from 'config/enums/routesEnum';

import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';

import { isSystemMetric } from 'utils/isSystemMetric';
import { formatSystemMetricName } from 'utils/formatSystemMetricName';
import alphabeticalSortComparator from 'utils/alphabeticalSortComparator';

function getTablePanelColumns(
  metricsColumns: any,
  runColumns: string[] = [],
  order: { left: string[]; middle: string[]; right: string[] },
  hiddenColumns: string[],
): ITableColumn[] {
  let columns: ITableColumn[] = [
    {
      key: 'steps',
      content: <span>Steps</span>,
      topHeader: 'Steps',
      pin: order?.left?.includes('steps')
        ? 'left'
        : order?.middle?.includes('steps')
        ? null
        : order?.right?.includes('steps')
        ? 'right'
        : 'left',
    },
    {
      key: 'index',
      content: <span>Index</span>,
      topHeader: 'Index',
      pin: order?.left?.includes('index')
        ? 'left'
        : order?.middle?.includes('index')
        ? null
        : order?.right?.includes('index')
        ? 'right'
        : 'left',
    },
  ].concat(
    Object.keys(metricsColumns).reduce((acc: any, key: string) => {
      const systemMetric: boolean = isSystemMetric(key);
      const systemMetricsList: ITableColumn[] = [];
      const metricsList: ITableColumn[] = [];
      Object.keys(metricsColumns[key]).map((metricContext) => {
        const columnKey = `${systemMetric ? key : `${key}_${metricContext}`}`;
        let column = {
          key: columnKey,
          content: systemMetric ? (
            <span>{formatSystemMetricName(key)}</span>
          ) : (
            <Badge
              size='small'
              color={COLORS[0][0]}
              label={metricContext === '' ? 'Empty context' : metricContext}
            />
          ),
          topHeader: systemMetric ? 'System Metrics' : key,
          pin: order?.left?.includes(columnKey)
            ? 'left'
            : order?.right?.includes(columnKey)
            ? 'right'
            : null,
        };
        systemMetric
          ? systemMetricsList.push(column)
          : metricsList.push(column);
      });
      acc = [
        ...acc,
        ...metricsList.sort(alphabeticalSortComparator({ orderBy: 'key' })),
        ...systemMetricsList.sort(
          alphabeticalSortComparator({ orderBy: 'key' }),
        ),
      ];
      return acc;
    }, []),
    runColumns.map((param) => ({
      key: param,
      content: <span>{param}</span>,
      topHeader: 'Params',
      pin: order?.left?.includes(param)
        ? 'left'
        : order?.right?.includes(param)
        ? 'right'
        : null,
    })),
  );

  columns = columns.map((col) => ({
    ...col,
    isHidden: hiddenColumns.includes(col.key),
  }));

  const columnsOrder = order?.left.concat(order.middle).concat(order.right);
  columns.sort((a, b) => {
    if (a.key === 'actions') {
      return 1;
    }
    if (!columnsOrder.includes(a.key) && !columnsOrder.includes(b.key)) {
      return 0;
    } else if (!columnsOrder.includes(a.key)) {
      return 1;
    } else if (!columnsOrder.includes(b.key)) {
      return -1;
    }
    return columnsOrder.indexOf(a.key) - columnsOrder.indexOf(b.key);
  });

  return columns;
}

function textsTablePanelRowRenderer(
  rowData: any,
  groupHeaderRow = false,
  columns: string[] = [],
) {
  if (groupHeaderRow) {
    const row: { [key: string]: any } = {};
    for (let i = 0; i < columns.length; i++) {
      const col = columns[i];
      if (Array.isArray(rowData[col])) {
        row[col] = {
          content: (
            <Badge
              size='small'
              color={COLORS[0][0]}
              label={`${rowData[col].length} values`}
            />
          ),
        };
      }
    }

    return merge({}, rowData, row);
  } else {
    const row = {
      experiment: rowData.experiment,
      run: {
        content: (
          <Link
            to={PathEnum.Run_Detail.replace(':runHash', rowData.runHash)}
            component={RouteLink}
          >
            {rowData.run}
          </Link>
        ),
      },
      actions: {
        content: null,
      },
    };

    return merge({}, rowData, row);
  }
}

export { getTablePanelColumns, textsTablePanelRowRenderer };
