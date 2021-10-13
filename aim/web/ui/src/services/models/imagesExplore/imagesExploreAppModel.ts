import React, { ChangeEvent } from 'react';

import _, { isEmpty } from 'lodash-es';
import createModel from '../model';
import { decode, encode } from 'utils/encoder/encoder';
import getObjectPaths from 'utils/getObjectPaths';
import getUrlWithParam from 'utils/getUrlWithParam';
import getStateFromUrl from 'utils/getStateFromUrl';
import {
  adjustable_reader,
  decode_buffer_pairs,
  decodePathsVals,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';
import { RowHeightSize } from 'config/table/tableConfigs';

// Types
import {
  GroupNameType,
  IAppData,
  IDashboardData,
  IGroupingSelectOption,
  IMetricsCollection,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  SortField,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IMetricTrace, IRun } from 'types/services/models/metrics/runModel';
import { IBookmarkFormState } from 'types/components/BookmarkForm/BookmarkForm';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';
import { getItem, setItem } from 'utils/storage';
import { ResizeModeEnum, RowHeightEnum } from 'config/enums/tableEnums';
import * as analytics from 'services/analytics';
import imagesExploreMockData from './imagesExploreMockData';
import appsService from 'services/api/apps/appsService';
import dashboardService from 'services/api/dashboard/dashboardService';
import {
  getImagesExploreTableColumns,
  imagesExploreTableRowRenderer,
} from 'pages/ImagesExplore/components/ImagesExploreTableGrid/ImagesExploreTableGrid';
import JsonToCSV from 'utils/JsonToCSV';
import moment from 'moment';
import { ITableColumn } from 'types/pages/metrics/components/TableColumns/TableColumns';
import { formatValue } from 'utils/formatValue';
import { IImagesExploreAppConfig } from 'types/services/models/imagesExplore/imagesExploreAppModel';
import filterMetricData from 'utils/filterMetricData';

const model = createModel<Partial<any>>({
  requestIsPending: false,
});

function getConfig(): IImagesExploreAppConfig {
  return {
    grouping: {
      groupBy: [],
      reverseMode: {
        groupBy: false,
      },
      isApplied: {
        groupBy: true,
      },
    },
    images: {
      stepSlice: [1, 10],
      indexSlice: [1, 10],
    },
    select: {
      metrics: [],
      query: '',
      advancedMode: false,
      advancedQuery: '',
    },
    table: {
      resizeMode: ResizeModeEnum.Resizable,
      rowHeight: RowHeightSize.md,
      sortFields: [],
      hiddenMetrics: [],
      hiddenColumns: [],
      columnsWidths: {},
      columnsOrder: {
        left: [],
        middle: [],
        right: [],
      },
      height: '',
    },
  };
}

let appRequestRef: {
  call: () => Promise<IAppData>;
  abort: () => void;
};

function initialize(appId: string): void {
  model.init();
  model.setState({
    refs: {
      tableRef: { current: null },
    },
    groupingSelectOptions: [],
  });
  if (!appId) {
    setDefaultAppConfigData();
  }
}

function setDefaultAppConfigData() {
  const grouping: IImagesExploreAppConfig['grouping'] =
    getStateFromUrl('grouping') || getConfig().grouping;
  const select: IImagesExploreAppConfig['select'] =
    getStateFromUrl('select') || getConfig().select;
  const tableConfigHash = getItem('imagesExploreTable');
  const table = tableConfigHash
    ? JSON.parse(decode(tableConfigHash))
    : getConfig().table;
  const configData = _.merge(getConfig(), {
    grouping,
    select,
    table,
  });

  model.setState({
    config: configData,
  });
}

let imagesRequestRef: {
  call: (
    exceptionHandler: (detail: any) => void,
  ) => Promise<ReadableStream<IRun<IMetricTrace>[]>>;
  abort: () => void;
};

function resetModelOnError(detail?: any) {
  model.setState({
    data: [],
    params: [],
    imagesData: {},
    tableData: [],
    tableColumns: [],
    requestIsPending: false,
  });

  setTimeout(() => {
    const tableRef: any = model.getState()?.refs?.tableRef;
    tableRef.current?.updateData({
      newData: [],
      newColumns: [],
    });
  }, 0);
}

function exceptionHandler(detail: any) {
  let message = '';

  if (detail.name === 'SyntaxError') {
    message = `Query syntax error at line (${detail.line}, ${detail.offset})`;
  } else {
    message = detail.message || 'Something went wrong';
  }

  onNotificationAdd({
    id: Date.now(),
    severity: 'error',
    message,
  });

  // reset model
  resetModelOnError(detail);
}
// @TODO Have to implement getting data from api after backend will provide it.
function getImagesData() {
  if (imagesRequestRef) {
    imagesRequestRef.abort();
  }
  const modelState: any = model.getState();
  const configData = modelState?.config;
  // const metric = configData?.chart.alignmentConfig.metric;
  // let query = getQueryStringFromSelect(configData?.select);
  // imagesRequestRef = metricsService.getMetricsData({
  //   q: query,
  //   ...(metric && { x_axis: metric }),
  // });
  return {
    call: async () => {
      // if (query === '') {
      //   model.setState({
      //     requestIsPending: false,
      //     queryIsEmpty: true,
      //   });
      // } else {
      model.setState({
        requestIsPending: true,
        queryIsEmpty: false,
      });
      // const stream = await metricsRequestRef.call(exceptionHandler);
      // const runData = await getRunData(stream);
      if (configData) {
        setModelData(imagesExploreMockData, configData);
      }
      // }
    },
    // abort: imagesRequestRef.abort,
    abort: () => {},
  };
}

function getAppConfigData(appId: string) {
  if (appRequestRef) {
    appRequestRef.abort();
  }
  appRequestRef = appsService.fetchApp(appId);
  return {
    call: async () => {
      const appData = await appRequestRef.call();
      const configData: any = _.merge(getConfig(), appData.state);
      model.setState({
        config: configData,
      });
    },
    abort: appRequestRef.abort,
  };
}

function processData(data: IRun<IMetricTrace>[]): {
  data: IMetricsCollection<IMetric>[];
  params: string[];
} {
  const configData = model.getState()?.config;
  let metrics: any[] = [];
  let params: string[] = [];

  data.forEach((run: any) => {
    params = params.concat(getObjectPaths(run.params, run.params));

    run.images.forEach((imageData: any) => {
      const { steps, epochs, timestamps } = filterMetricData({
        steps: [...new Float64Array(imageData.iters.blob)],
        epochs: [...new Float64Array(imageData.epochs?.blob)],
        timestamps: [...new Float64Array(imageData.timestamps.blob)],
      });
      imageData.values.forEach((stepData: any, stepIndex: number) => {
        stepData.forEach((image: any) => {
          const metricKey = encode({
            runHash: run.hash,
            metricName: imageData.metric_name,
            traceContext: imageData.context,
            index: image.index,
            step: stepIndex + 1,
          });
          metrics.push({
            step: stepIndex + 1,
            index: image.index,
            src: image.blob,
            metric_name: imageData.name,
            context: imageData.context,
            run: _.omit(run, 'images'),
            key: metricKey,
            data: {
              steps: [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                18, 19, 20, 21, 22, 23, 24, 25, 26,
              ],
              epochs: [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                18, 19, 20, 21, 22, 23, 24, 25, 26,
              ],
              timestamps: [
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                18, 19, 20, 21, 22, 23, 24, 25, 26,
              ].map((timestamp) => Math.round(timestamp * 1000)),
            },
          });
        });
      });
    });
  });
  const processedData = groupData(
    _.orderBy(
      metrics,
      configData?.table?.sortFields?.map(
        (f: any) =>
          function (metric: any) {
            return _.get(metric, f[0], '');
          },
      ) ?? [],
      configData?.table?.sortFields?.map((f: any) => f[1]) ?? [],
    ),
  );
  const uniqParams = _.uniq(params);

  // setTooltipData(processedData, uniqParams);
  return {
    data: processedData,
    params: uniqParams,
  };
}

function setModelData(rawData: any[], configData: IImagesExploreAppConfig) {
  console.log(rawData);
  const sortFields = model.getState()?.config?.table.sortFields;
  const { data, params } = processData(rawData);
  const tableData = getDataAsTableRows(data, params, false, configData);

  model.setState({
    requestIsPending: false,
    rawData,
    config: configData,
    params,
    data,
    imagesData: getDataAsImageSet(data),
    // chartTitleData: getChartTitleData(data),
    tableData: tableData.rows,
    tableColumns: getImagesExploreTableColumns(
      params,
      data[0]?.config,
      configData.table.columnsOrder!,
      configData.table.hiddenColumns!,
      sortFields,
      // onSortChange,
    ),
    sameValueColumns: tableData.sameValueColumns,
    groupingSelectOptions: [...getGroupingSelectOptions(params)],
  });
}

function updateModelData(
  configData: IImagesExploreAppConfig = model.getState()!.config!,
  shouldURLUpdate?: boolean,
): void {
  const { data, params } = processData(model.getState()?.rawData);
  const tableData = getDataAsTableRows(data, params, false, configData);
  const tableColumns = getImagesExploreTableColumns(
    params,
    data[0]?.config,
    configData.table.columnsOrder!,
    configData.table.hiddenColumns!,
    configData.table.sortFields,
    // onSortChange,
  );
  const groupingSelectOptions = [...getGroupingSelectOptions(params)];
  const tableRef: any = model.getState()?.refs?.tableRef;
  tableRef.current?.updateData({
    newData: tableData.rows,
    newColumns: tableColumns,
    hiddenColumns: configData.table.hiddenColumns!,
  });

  if (shouldURLUpdate) {
    updateURL(configData);
  }

  model.setState({
    config: configData,
    data: model.getState()?.data,
    imagesData: getDataAsImageSet(data),
    // chartTitleData: getChartTitleData(data),
    tableData: tableData.rows,
    tableColumns,
    sameValueColumns: tableData.sameValueColumns,
    groupingSelectOptions,
  });
}

function getFilteredGroupingOptions(grouping: any): string[] {
  const { reverseMode, isApplied } = grouping;
  const groupingSelectOptions: any = model.getState()?.groupingSelectOptions;
  if (groupingSelectOptions) {
    const filteredOptions = [...groupingSelectOptions]
      .filter((opt: any) => grouping['groupBy'].indexOf(opt.value) === -1)
      .map((item) => item.value);
    return isApplied['groupBy']
      ? reverseMode['groupBy']
        ? filteredOptions
        : grouping['groupBy']
      : [];
  } else {
    return [];
  }
}

function getGroupingSelectOptions(
  params: string[] = [],
): IGroupingSelectOption[] {
  const paramsOptions: IGroupingSelectOption[] = params?.map((param) => ({
    value: `run.params.${param}`,
    group: 'params',
    label: param,
  }));

  return [
    ...paramsOptions,
    {
      group: 'Other',
      label: 'run.hash',
      value: 'run.hash',
    },
    {
      group: 'Other',
      label: 'step',
      value: 'step',
    },
    {
      group: 'Other',
      label: 'index',
      value: 'index',
    },
  ];
}

function groupData(data: IMetric[]): any {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()!.config;
  const grouping = configData!.grouping;
  const groupingFields = getFilteredGroupingOptions(grouping);

  if (groupingFields.length === 0) {
    return [
      {
        config: null,
        chartIndex: 0,
        data: data,
      },
    ];
  }

  const groupValues: {
    [key: string]: any;
  } = {};

  for (let i = 0; i < data.length; i++) {
    const groupValue: { [key: string]: string } = {};
    groupingFields.forEach((field) => {
      groupValue[field] = _.get(data[i], field);
    });
    const groupKey = encode(groupValue);
    if (groupValues.hasOwnProperty(groupKey)) {
      groupValues[groupKey].data.push(data[i]);
    } else {
      groupValues[groupKey] = {
        key: groupKey,
        config: groupValue,
        data: [data[i]],
      };
    }
  }
  return Object.values(groupValues);
}

function setComponentRefs(refElement: React.MutableRefObject<any> | object) {
  const modelState = model.getState();
  if (modelState?.refs) {
    modelState.refs = Object.assign(modelState.refs, refElement);
    model.setState({ refs: modelState.refs });
  }
}

function onGroupingSelectChange({
  groupName,
  list,
}: IOnGroupingSelectChangeParams) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = { ...configData.grouping, [groupName]: list };
    // resetChartZoom(configData);
    // setAggregationEnabled(configData);
    updateModelData(configData, true);
  }
  analytics.trackEvent(`[MetricsExplorer] Group by ${groupName}`);
}

function onGroupingModeChange({
  groupName,
  value,
}: IOnGroupingModeChangeParams): void {
  const configData = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping.reverseMode = {
      ...configData.grouping.reverseMode,
      groupBy: value,
    };
    updateModelData(configData, true);
  }
  analytics.trackEvent(
    `[MetricsExplorer] ${
      value ? 'Disable' : 'Enable'
    } grouping by groupBy reverse mode`,
  );
}

function onGroupingReset(groupName: GroupNameType) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.grouping) {
    const { reverseMode, isApplied } = configData.grouping;
    configData.grouping = {
      ...configData.grouping,
      reverseMode: { ...reverseMode, [groupName]: false },
      [groupName]: [],
      isApplied: { ...isApplied, [groupName]: true },
    };
    updateModelData(configData, true);
  }
  analytics.trackEvent('[MetricsExplorer] Reset grouping');
}

function onGroupingApplyChange(): void {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      isApplied: {
        ...configData.grouping.isApplied,
        groupBy: !configData.grouping.isApplied['groupBy'],
      },
    };
    updateModelData(configData, true);
  }
}

/**
 * function updateURL has 2 major functionalities:
 *    1. Keeps URL in sync with the app config
 *    2. Stores updated URL in localStorage if App is not in the bookmark state
 * @param {IImagesExploreAppConfig} configData - the current state of the app config
 */
function updateURL(configData = model.getState()!.config!) {
  const { grouping, select } = configData;
  const url: string = getUrlWithParam(
    ['grouping', 'select'],
    [encode(grouping), encode(select)],
  );

  if (url === `${window.location.pathname}${window.location.search}`) {
    return;
  }

  const appId: string = window.location.pathname.split('/')[2];
  if (!appId) {
    setItem('imagesExploreUrl', url);
  }

  window.history.pushState(null, '', url);
}

function onResetConfigData(): void {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData) {
    configData.grouping = {
      ...getConfig().grouping,
    };
    updateModelData(configData, true);
  }
}

async function getRunData(stream: ReadableStream<IRun<IMetricTrace>[]>) {
  let gen = adjustable_reader(stream);
  let buffer_pairs = decode_buffer_pairs(gen);
  let decodedPairs = decodePathsVals(buffer_pairs);
  let objects = iterFoldTree(decodedPairs, 1);

  const runData = [];
  for await (let [keys, val] of objects) {
    runData.push({
      ...(val as any),
      hash: keys[0],
    });
  }
  return runData;
}

function getDataAsImageSet(data: any) {
  if (!isEmpty(data)) {
    const configData: IImagesExploreAppConfig | undefined =
      model.getState()?.config;
    const imageSetData: any = {};
    const groupFields = configData?.grouping?.groupBy;
    data.forEach((group: any) => {
      const path = groupFields?.reduce((acc: any, field: any) => {
        acc.push(`${field}=${_.get(group.data[0], field)}`);
        return acc;
      }, [] as any);
      _.set(imageSetData, path, group.data);
    });
    return isEmpty(imageSetData) ? data[0].data : imageSetData;
  } else {
    return {};
  }
}

function getDataAsTableRows(
  processedData: IMetricsCollection<IMetric>[],
  paramKeys: string[],
  isRawData: boolean,
  config: IImagesExploreAppConfig,
  dynamicUpdate?: boolean,
): { rows: any[] | any; sameValueColumns: string[] } {
  if (!processedData) {
    return {
      rows: [],
      sameValueColumns: [],
    };
  }

  const rows: any[] | any = processedData[0]?.config !== null ? {} : [];

  let rowIndex = 0;
  const sameValueColumns: string[] = [];
  processedData.forEach((metricsCollection: IMetricsCollection<IMetric>) => {
    const groupKey = metricsCollection.key;
    const columnsValues: { [key: string]: string[] } = {};

    if (metricsCollection.config !== null) {
      const groupHeaderRow = {
        meta: {
          // chartIndex:
          //   config.grouping.chart.length > 0 ||
          //   config.grouping.reverseMode.chart
          //     ? metricsCollection.chartIndex + 1
          //     : null,
          // color: metricsCollection.color,
          dasharray: null,
          itemsCount: metricsCollection.data.length,
        },
        key: groupKey!,
        groupRowsKeys: metricsCollection.data.map((metric) => metric.key),
        experiment: '',
        run: '',
        metric: '',
        context: [],
        // value: '',
        // step: '',
        // epoch: '',
        // time: '',
        children: [],
      };

      rows[groupKey!] = {
        data: groupHeaderRow,
        items: [],
      };
    }

    metricsCollection.data.forEach((metric: IMetric) => {
      // const closestIndex =
      //   xValue === null
      //     ? null
      //     : getClosestValue(metric.data.xValues as number[], xValue as number)
      //         .index;
      const rowValues: any = {
        rowMeta: {
          color: metricsCollection.color ?? metric.color,
        },
        key: metric.key,
        runHash: metric.run.hash,
        isHidden: metric.isHidden,
        index: rowIndex,
        color: metricsCollection.color ?? metric.color,
        dasharray: metricsCollection.dasharray ?? metric.dasharray,
        experiment: metric.run.props.experiment ?? 'default',
        run: metric.run.props.name,
        metric: metric.metric_name,
        context: Object.entries(metric.context).map((entry) => entry.join(':')),
        // value:
        //   closestIndex === null
        //     ? '-'
        //     : `${metric.data.values[closestIndex] ?? '-'}`,
        // step: metric.data.steps[metric.data.steps.length - 1],
        // epoch: metric.data.epochs[metric.data.steps.length - 1],
        // time:
        //   closestIndex !== null ? metric.data.timestamps[closestIndex] : null,
        parentId: groupKey,
      };
      rowIndex++;

      [
        'experiment',
        'run',
        'metric',
        'context',
        'step',
        'epoch',
        'time',
      ].forEach((key) => {
        if (columnsValues.hasOwnProperty(key)) {
          if (
            _.findIndex(columnsValues[key], (value) =>
              _.isEqual(rowValues[key], value),
            ) === -1
          ) {
            columnsValues[key].push(rowValues[key]);
          }
        } else {
          columnsValues[key] = [rowValues[key]];
        }
      });

      if (!dynamicUpdate) {
        paramKeys.forEach((paramKey) => {
          const value = _.get(metric.run.params, paramKey, '-');
          rowValues[paramKey] = formatValue(value);
          if (columnsValues.hasOwnProperty(paramKey)) {
            if (
              _.findIndex(columnsValues[paramKey], (paramValue) =>
                _.isEqual(value, paramValue),
              ) === -1
            ) {
              columnsValues[paramKey].push(value);
            }
          } else {
            columnsValues[paramKey] = [value];
          }
        });
      }
      if (metricsCollection.config !== null) {
        rows[groupKey!].items.push(
          isRawData
            ? rowValues
            : imagesExploreTableRowRenderer(rowValues, {
                toggleVisibility: (e) => {
                  e.stopPropagation();
                  onRowVisibilityChange(rowValues.key);
                },
              }),
        );
      } else {
        rows.push(
          isRawData
            ? rowValues
            : imagesExploreTableRowRenderer(rowValues, {
                toggleVisibility: (e) => {
                  e.stopPropagation();
                  onRowVisibilityChange(rowValues.key);
                },
              }),
        );
      }
    });

    for (let columnKey in columnsValues) {
      if (columnsValues[columnKey].length === 1) {
        sameValueColumns.push(columnKey);
      }

      if (metricsCollection.config !== null) {
        rows[groupKey!].data[columnKey] =
          columnsValues[columnKey].length === 1
            ? columnsValues[columnKey][0]
            : columnsValues[columnKey];
      }
    }
    if (metricsCollection.config !== null && !isRawData) {
      rows[groupKey!].data = imagesExploreTableRowRenderer(
        rows[groupKey!].data,
        {},
        true,
        ['value'].concat(Object.keys(columnsValues)),
      );
    }
  });
  return { rows, sameValueColumns };
}

function onNotificationDelete(id: number) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData].filter((i) => i.id !== id);
  model.setState({ notifyData });
}

function onNotificationAdd(notification: INotification) {
  let notifyData: INotification[] | [] = model.getState()?.notifyData || [];
  notifyData = [...notifyData, notification];
  model.setState({ notifyData });
  setTimeout(() => {
    onNotificationDelete(notification.id);
  }, 3000);
}

async function onBookmarkCreate({ name, description }: IBookmarkFormState) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData) {
    const app: IAppData | any = await appsService
      .createApp({ state: configData, type: 'images-explore' })
      .call();
    if (app.id) {
      const bookmark: IDashboardData = await dashboardService
        .createDashboard({ app_id: app.id, name, description })
        .call();
      if (bookmark.name) {
        onNotificationAdd({
          id: Date.now(),
          severity: 'success',
          message: BookmarkNotificationsEnum.CREATE,
        });
      } else {
        onNotificationAdd({
          id: Date.now(),
          severity: 'error',
          message: BookmarkNotificationsEnum.ERROR,
        });
      }
    }
  }
  analytics.trackEvent('[ImagesExplore] Create bookmark');
}

function onBookmarkUpdate(id: string) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData) {
    appsService
      .updateApp(id, { state: configData, type: 'images-explore' })
      .call()
      .then((res: IDashboardData | any) => {
        if (res.id) {
          onNotificationAdd({
            id: Date.now(),
            severity: 'success',
            message: BookmarkNotificationsEnum.UPDATE,
          });
        }
      });
  }
  analytics.trackEvent('[ImagesExplore] Update bookmark');
}

function updateColumnsWidths(key: string, width: number, isReset: boolean) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.table && configData?.table?.columnsWidths) {
    let columnsWidths = configData?.table?.columnsWidths;
    if (isReset) {
      columnsWidths = _.omit(columnsWidths, [key]);
    } else {
      columnsWidths = { ...columnsWidths, [key]: width };
    }
    const table = {
      ...configData.table,
      columnsWidths,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('imagesExploreTable', encode(table));
    updateModelData(config);
  }
}

// internal function to update config.table.sortFields and cache data
function updateSortFields(sortFields: SortField[]) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      sortFields,
    };
    const configUpdate = {
      ...configData,
      table,
    };
    model.setState({
      config: configUpdate,
    });

    setItem('imagesExploreTable', encode(table));
    updateModelData(configUpdate);
  }
  analytics.trackEvent(
    `[ImagesExplorer][Table] ${
      isEmpty(sortFields) ? 'Reset' : 'Apply'
    } table sorting by a key`,
  );
}

// set empty array to config.table.sortFields
function onSortReset() {
  updateSortFields([]);
}

/**
 * function onSortChange has 3 major functionalities
 *    1. if only field param passed, the function will change sort option with the following cycle ('asc' -> 'desc' -> none -> 'asc)
 *    2. if value param passed 'asc' or 'desc', the function will replace the sort option of the field in sortFields
 *    3. if value param passed 'none', the function will delete the field from sortFields
 * @param {String} field  - the name of the field (i.e params.dataset.preproc)
 * @param {'asc' | 'desc' | 'none'} value - 'asc' | 'desc' | 'none'
 */
function onSortChange(field: string, value?: 'asc' | 'desc' | 'none') {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  const sortFields = configData?.table.sortFields || [];

  const existField = sortFields?.find((d: SortField) => d[0] === field);
  let newFields: SortField[] = [];

  if (value && existField) {
    if (value === 'none') {
      // delete
      newFields = sortFields?.filter(
        ([name]: SortField) => name !== existField[0],
      );
    } else {
      newFields = sortFields.map(([name, v]: SortField) =>
        name === existField[0] ? [name, value] : [name, v],
      );
    }
  } else {
    if (existField) {
      if (existField[1] === 'asc') {
        // replace to desc
        newFields = sortFields?.map(([name, value]: SortField) => {
          return name === existField[0] ? [name, 'desc'] : [name, value];
        });
      } else {
        // delete field
        newFields = sortFields?.filter(
          ([name]: SortField) => name !== existField[0],
        );
      }
    } else {
      // add field
      newFields = [...sortFields, [field, 'asc']];
    }
  }
  updateSortFields(newFields);
}

function onExportTableData(e: React.ChangeEvent<any>): void {
  const { data, params, config } = model.getState() as any;
  const tableData = getDataAsTableRows(data, params, true, config);
  const tableColumns: ITableColumn[] = getImagesExploreTableColumns(
    params,
    data[0]?.config,
    config?.table.columnsOrder!,
    config?.table.hiddenColumns!,
  );

  const excludedFields: string[] = ['#', 'actions'];
  const filteredHeader: string[] = tableColumns.reduce(
    (acc: string[], column: ITableColumn) =>
      acc.concat(
        excludedFields.indexOf(column.key) === -1 && !column.isHidden
          ? column.key
          : [],
      ),
    [],
  );

  let emptyRow: { [key: string]: string } = {};
  filteredHeader.forEach((column: string) => {
    emptyRow[column] = '--';
  });

  const groupedRows: any[][] =
    data.length > 1
      ? Object.keys(tableData.rows).map(
          (groupedRowKey: string) => tableData.rows[groupedRowKey].items,
        )
      : [tableData.rows];

  const dataToExport: { [key: string]: string }[] = [];

  groupedRows.forEach((groupedRow: any[], groupedRowIndex: number) => {
    groupedRow.forEach((row: any) => {
      const filteredRow: any = getFilteredRow(filteredHeader, row);
      dataToExport.push(filteredRow);
    });
    if (groupedRows.length - 1 !== groupedRowIndex) {
      dataToExport.push(emptyRow);
    }
  });

  const blob = new Blob([JsonToCSV(dataToExport)], {
    type: 'text/csv;charset=utf-8;',
  });
  saveAs(blob, `metrics-${moment().format('HH:mm:ss · D MMM, YY')}.csv`);
  analytics.trackEvent('[MetricsExplorer] Export runs data to CSV');
}

function onRowVisibilityChange(metricKey: string) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.table) {
    let hiddenMetrics = configData?.table?.hiddenMetrics || [];
    if (hiddenMetrics?.includes(metricKey)) {
      hiddenMetrics = hiddenMetrics.filter(
        (hiddenMetric: any) => hiddenMetric !== metricKey,
      );
    } else {
      hiddenMetrics = [...hiddenMetrics, metricKey];
    }
    const table = {
      ...configData.table,
      hiddenMetrics,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('imagesExploreTable', encode(table));
    updateModelData(config);
  }
}

function getFilteredRow(
  columnKeys: string[],
  row: any,
): { [key: string]: string } {
  return columnKeys.reduce((acc: { [key: string]: string }, column: string) => {
    let value = row[column];
    if (Array.isArray(value)) {
      value = value.join(', ');
    } else if (typeof value !== 'string') {
      value = value || value === 0 ? JSON.stringify(value) : '-';
    }

    if (column.startsWith('params.')) {
      acc[column.replace('params.', '')] = value;
    } else {
      acc[column] = value;
    }

    return acc;
  }, {});
}

function onTableResizeEnd(tableHeight: string) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      height: tableHeight,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('imagesExploreTable', encode(table));
  }
}

function onSelectRunQueryChange(query: string) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, query },
    };

    updateURL(newConfig);

    model.setState({
      config: newConfig,
    });
  }
}

function onTableResizeModeChange(mode: ResizeModeEnum): void {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      resizeMode: mode,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('imagesExploreTable', encode(table));
  }
  analytics.trackEvent(
    `[ImagesExplorer][Table] Set table view mode to "${mode}"`,
  );
}

function onSearchQueryCopy(): void {
  const selectedMetricsData = model.getState()?.config?.select;
  let query = getQueryStringFromSelect(selectedMetricsData);
  navigator.clipboard.writeText(query);
  onNotificationAdd({
    id: Date.now(),
    severity: 'success',
    message: 'Run Expression Copied',
  });
}

function getQueryStringFromSelect(
  selectData: IImagesExploreAppConfig['select'],
) {
  let query = '';
  if (selectData !== undefined) {
    if (selectData.advancedMode) {
      query = selectData.advancedQuery;
    } else {
      query = `${
        selectData.query ? `${selectData.query} and ` : ''
      }(${selectData.metrics
        .map((metric) =>
          metric.value.context === null
            ? `(metric.name == "${metric.value.metric_name}")`
            : `${Object.keys(metric.value.context).map(
                (item) =>
                  `(metric.name == "${metric.value.metric_name}" and metric.context.${item} == "${metric.value.context[item]}")`,
              )}`,
        )
        .join(' or ')})`.trim();
    }
  }

  return query;
}

function onSelectAdvancedQueryChange(query: string) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, advancedQuery: query },
    };

    updateURL(newConfig);

    model.setState({
      config: newConfig,
    });
  }
}

function onImagesExploreSelectChange(data: any[]) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: { ...configData.select, metrics: data },
    };

    updateURL(newConfig);

    model.setState({
      config: newConfig,
    });
  }
}

function toggleSelectAdvancedMode() {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.select) {
    const newConfig = {
      ...configData,
      select: {
        ...configData.select,
        advancedMode: !configData.select.advancedMode,
      },
    };

    updateURL(newConfig);

    model.setState({
      config: newConfig,
    });
  }
  analytics.trackEvent(
    `[ImagesExplorer] Turn ${
      !configData?.select.advancedMode ? 'on' : 'off'
    } the advanced mode of select form`,
  );
}

function onColumnsOrderChange(columnsOrder: any) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      columnsOrder: columnsOrder,
    };
    const config = {
      ...configData,
      table,
    };

    model.setState({
      config,
    });
    setItem('imagesExploreTable', encode(table));
    updateModelData(config);
  }
  if (
    isEmpty(columnsOrder?.left) &&
    isEmpty(columnsOrder?.middle) &&
    isEmpty(columnsOrder?.right)
  ) {
    analytics.trackEvent('[ImagesExplorer][Table] Reset table columns order');
  }
}

function onColumnsVisibilityChange(hiddenColumns: string[]) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  const columnsData = model.getState()!.tableColumns!;
  if (configData?.table) {
    const table = {
      ...configData.table,
      hiddenColumns:
        hiddenColumns[0] === 'all'
          ? columnsData.map((col: any) => col.key)
          : hiddenColumns,
    };
    const configUpdate = {
      ...configData,
      table,
    };
    model.setState({
      config: configUpdate,
    });
    setItem('imagesExploreTable', encode(table));
    updateModelData(configUpdate);
  }
  if (hiddenColumns[0] === 'all') {
    analytics.trackEvent('[ImagesExplorer][Table] Hide all table columns');
  } else if (isEmpty(hiddenColumns)) {
    analytics.trackEvent('[ImagesExplorer][Table] Show all table columns');
  }
}

function onTableDiffShow() {
  const sameValueColumns = model.getState()?.sameValueColumns;
  if (sameValueColumns) {
    onColumnsVisibilityChange(sameValueColumns);
  }
  analytics.trackEvent('[ImagesExplorer][Table] Show table columns diff');
}

function onRowHeightChange(height: RowHeightSize) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.table) {
    const table = {
      ...configData.table,
      rowHeight: height,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('metricsTable', encode(table));
  }
  analytics.trackEvent(
    `[ImagesExplorer][Table] Set table row height to "${RowHeightEnum[
      height
    ].toLowerCase()}"`,
  );
}

function onImageVisibilityChange(metricsKeys: string[]) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  const processedData = model.getState()?.data;
  if (configData?.table && processedData) {
    const table = {
      ...configData.table,
      hiddenMetrics:
        metricsKeys[0] === 'all'
          ? Object.values(processedData)
              .map((metricCollection: any) =>
                metricCollection.data.map((metric: any) => metric.key),
              )
              .flat()
          : metricsKeys,
    };
    const config = {
      ...configData,
      table,
    };
    model.setState({
      config,
    });
    setItem('imagesExploreTable', encode(table));
    updateModelData(config);
  }
  analytics.trackEvent(
    `[ImagesExplorer][Table] ${
      metricsKeys[0] === 'all'
        ? 'Visualize all hidden metrics from table'
        : 'Hide all metrics from table'
    }`,
  );
}

function onStepSliceChange(
  event: ChangeEvent<{}>,
  newValue: number | number[],
) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.images) {
    const images = {
      ...configData.images,
      stepSlice: newValue,
    };
    const config = {
      ...configData,
      images,
    };
    model.setState({
      config,
    });
  }
}

function onIndexSliceChange(
  event: ChangeEvent<{}>,
  newValue: number | number[],
) {
  const configData: IImagesExploreAppConfig | undefined =
    model.getState()?.config;
  if (configData?.images) {
    const images = {
      ...configData.images,
      indexSlice: newValue,
    };
    const config = {
      ...configData,
      images,
    };
    model.setState({
      config,
    });
  }
}

const imagesExploreAppModel = {
  ...model,
  initialize,
  getImagesData,
  setComponentRefs,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingReset,
  onGroupingApplyChange,
  onNotificationDelete,
  onNotificationAdd,
  onResetConfigData,
  updateURL,
  updateModelData,
  onBookmarkUpdate,
  onBookmarkCreate,
  getAppConfigData,
  setDefaultAppConfigData,
  updateColumnsWidths,
  onSortChange,
  onSortReset,
  onExportTableData,
  onRowVisibilityChange,
  onTableResizeEnd,
  onTableResizeModeChange,
  onSearchQueryCopy,
  getQueryStringFromSelect,
  onSelectRunQueryChange,
  onSelectAdvancedQueryChange,
  onImagesExploreSelectChange,
  toggleSelectAdvancedMode,
  onColumnsOrderChange,
  onColumnsVisibilityChange,
  onTableDiffShow,
  onRowHeightChange,
  onImageVisibilityChange,
  onStepSliceChange,
  onIndexSliceChange,
};

export default imagesExploreAppModel;
