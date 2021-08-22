import React from 'react';
import * as _ from 'lodash-es';

import COLORS from 'config/colors/colors';
import metricsService from 'services/api/metrics/metricsService';
import createModel from '../model';
import createMetricModel from './metricModel';
import { createRunModel } from './runModel';
import { decode, encode } from 'utils/encoder/encoder';
import getClosestValue from 'utils/getClosestValue';
import { SmoothingAlgorithmEnum } from 'utils/smoothingData';
import getObjectPaths from 'utils/getObjectPaths';
import getTableColumns from 'pages/Metrics/components/TableColumns/TableColumns';
import DASH_ARRAYS from 'config/dash-arrays/dashArrays';
import appsService from 'services/api/apps/appsService';
import dashboardService from 'services/api/dashboard/dashboardService';
import getUrlWithParam from 'utils/getUrlWithParam';
import getStateFromUrl from 'utils/getStateFromUrl';
import {
  aggregateGroupData,
  AggregationAreaMethods,
  AggregationLineMethods,
} from 'utils/aggregateGroupData';
import {
  adjustable_reader,
  decodePathsVals,
  decode_buffer_pairs,
  iterFoldTree,
} from 'utils/encoder/streamEncoding';

// Types
import {
  GroupingSelectOptionType,
  GroupNameType,
  IAggregatedData,
  IAggregationConfig,
  IAppData,
  IDashboardData,
  IGetGroupingPersistIndex,
  IMetricAppConfig,
  IMetricAppModelState,
  IMetricsCollection,
  IMetricTableRowData,
  IOnGroupingModeChangeParams,
  IOnGroupingSelectChangeParams,
  ITooltipData,
} from 'types/services/models/metrics/metricsAppModel';
import { IMetric } from 'types/services/models/metrics/metricModel';
import { IMetricTrace, IRun } from 'types/services/models/metrics/runModel';
import { ILine } from 'types/components/LineChart/LineChart';
import { IOnSmoothingChange } from 'types/pages/metrics/Metrics';
import { IAxesScaleState } from 'types/components/AxesScalePopover/AxesScalePopover';
import { IActivePoint } from 'types/utils/d3/drawHoverAttributes';
import { CurveEnum, ScaleEnum, XAlignmentEnum } from 'utils/d3';
import { IBookmarkFormState } from 'types/pages/metrics/components/BookmarkForm/BookmarkForm';
import { INotification } from 'types/components/NotificationContainer/NotificationContainer';
import { HighlightEnum } from 'components/HighlightModesPopover/HighlightModesPopover';
import { BookmarkNotificationsEnum } from 'config/notification-messages/notificationMessages';
import { ISelectMetricsOption } from 'types/pages/metrics/components/SelectForm/SelectForm';
import getSmoothenedData from 'utils/getSmoothenedData';

const model = createModel<Partial<IMetricAppModelState>>({});
let tooltipData: ITooltipData = {};

function getConfig() {
  return {
    grouping: {
      color: [],
      style: [],
      chart: [],
      // TODO refactor boolean value types objects into one
      reverseMode: {
        color: false,
        style: false,
        chart: false,
      },
      isApplied: {
        color: true,
        style: true,
        chart: true,
      },
      persistence: {
        color: false,
        style: false,
      },
      seed: {
        color: 10,
        style: 10,
      },
      paletteIndex: 0,
      selectOptions: [],
    },
    chart: {
      highlightMode: HighlightEnum.Off,
      displayOutliers: true,
      zoomMode: false,
      axesScaleType: { xAxis: ScaleEnum.Linear, yAxis: ScaleEnum.Linear },
      curveInterpolation: CurveEnum.Linear,
      smoothingAlgorithm: SmoothingAlgorithmEnum.EMA,
      smoothingFactor: 0,
      alignmentConfig: {
        metric: '',
        type: XAlignmentEnum.Step,
      },
      aggregationConfig: {
        methods: {
          area: AggregationAreaMethods.MIN_MAX,
          line: AggregationLineMethods.MEAN,
        },
        isApplied: false,
        isEnabled: false,
      },
      focusedState: {
        active: false,
        key: null,
        xValue: null,
        yValue: null,
        chartIndex: null,
      },
    },
    select: {
      metrics: [],
      query: '',
    },
  };
}

let appRequestRef: {
  call: () => Promise<IAppData>;
  abort: () => void;
};

function initialize() {
  model.init();
  model.setState({
    refs: {
      tableRef: { current: null },
      chartPanelRef: { current: null },
    },
  });
}

function setDefaultAppConfigData() {
  const grouping: IMetricAppConfig['grouping'] =
    getStateFromUrl('grouping') || getConfig().grouping;
  const chart: IMetricAppConfig['chart'] =
    getStateFromUrl('chart') || getConfig().chart;
  const select: IMetricAppConfig['select'] =
    getStateFromUrl('select') || getConfig().select;
  const configData: IMetricAppConfig = _.merge(getConfig(), {
    chart,
    grouping,
    select,
  });

  model.setState({
    config: configData,
  });
}

function getAppConfigData(appId: string) {
  if (appRequestRef) {
    appRequestRef.abort();
  }
  appRequestRef = appsService.fetchApp(appId);
  return {
    call: async () => {
      const appData = await appRequestRef.call();
      const configData: IMetricAppConfig = _.merge(getConfig(), appData);
      model.setState({
        config: configData,
      });
    },
    abort: appRequestRef.abort,
  };
}

let metricsRequestRef: {
  call: () => Promise<ReadableStream<IRun<IMetricTrace>[]>>;
  abort: () => void;
};

function getMetricsData() {
  if (metricsRequestRef) {
    metricsRequestRef.abort();
  }
  metricsRequestRef = metricsService.getMetricsData({
    q: 'metric_name == "bleu"',
  });
  return {
    call: async () => {
      const stream = await metricsRequestRef.call();
      let gen = adjustable_reader(stream);
      let buffer_pairs = decode_buffer_pairs(gen);
      let decodedPairs = decodePathsVals(buffer_pairs);
      let objects = iterFoldTree(decodedPairs, 1);

      const runData: IRun<IMetricTrace>[] = [];
      for await (let [keys, val] of objects) {
        runData.push(val as any);
      }

      const { data, params } = processData(runData);
      const configData = model.getState()?.config;
      if (configData) {
        configData.grouping.selectOptions = [
          ...getGroupingSelectOptions(params),
        ];
        setAggregationEnabled(configData);
      }

      model.setState({
        rawData: runData,
        config: configData,
        params,
        data,
        lineChartData: getDataAsLines(data),
        aggregatedData: getAggregatedData(data),
        tableData: getDataAsTableRows(data, null, params),
        tableColumns: getTableColumns(params),
      });
    },
    abort: metricsRequestRef.abort,
  };
}

async function onBookmarkCreate({ name, description }: IBookmarkFormState) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData) {
    const data: IAppData | any = await appsService.createApp(configData).call();
    if (data.id) {
      dashboardService
        .createDashboard({ app_id: data.id, name, description })
        .call()
        .then((res: IDashboardData | any) => {
          if (res.id) {
            onNotificationAdd({
              id: Date.now(),
              severity: 'success',
              message: BookmarkNotificationsEnum.CREATE,
            });
          }
        })
        .catch((err) => {
          onNotificationAdd({
            id: Date.now(),
            severity: 'error',
            message: BookmarkNotificationsEnum.ERROR,
          });
        });
    }
  }
}

function onBookmarkUpdate(id: string) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData) {
    appsService
      .updateApp(id, configData)
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
}

function getGroupingSelectOptions(
  params: string[],
): GroupingSelectOptionType[] {
  const paramsOptions: GroupingSelectOptionType[] = params.map((param) => ({
    value: `run.params.${param}`,
    group: 'params',
    label: param,
  }));

  return [
    ...paramsOptions,
    {
      group: 'Other',
      label: 'experiment_name',
      value: 'run.experiment_name',
    },
    {
      group: 'Other',
      label: 'run.hash',
      value: 'run.params.status.hash',
    },
    {
      group: 'Other',
      label: 'metric_name',
      value: 'metric_name',
    },
    {
      group: 'context',
      label: 'subset',
      value: 'context.subset',
    },
  ];
}

function processData(data: IRun<IMetricTrace>[]): {
  data: IMetricsCollection<IMetric>[];
  params: string[];
} {
  const grouping = model.getState()?.config?.grouping;
  let metrics: IMetric[] = [];
  let index: number = -1;
  let params: string[] = [];
  const paletteIndex: number = grouping?.paletteIndex || 0;
  data.forEach((run: IRun<IMetricTrace>) => {
    params = params.concat(
      getObjectPaths(_.omit(run.params, 'experiment_name', 'status')),
    );
    metrics = metrics.concat(
      run.traces.map((trace) => {
        index++;
        return createMetricModel({
          ...trace,
          run: createRunModel(_.omit(run, 'traces') as IRun<IMetricTrace>),
          key: encode({
            runHash: run.params.status.hash,
            metricName: trace.metric_name,
            traceContext: trace.context,
          }),
          dasharray: '0',
          color: COLORS[paletteIndex][index % COLORS[paletteIndex].length],
          data: {
            values: new Float64Array(trace.values.blob),
            iterations: new Float64Array(trace.iters.blob),
            epochs: new Float64Array(trace.epochs?.blob),
            timestamps: new Float64Array(trace.timestamps.blob),
            xValues: [...new Float64Array(trace.iters?.blob)],
            yValues: [...new Float64Array(trace.values?.blob)],
          },
        } as IMetric);
      }),
    );
  });

  const processedData = groupData(metrics);
  const uniqParams = _.uniq(params);

  setTooltipData(processedData, uniqParams);

  return {
    data: processedData,
    params: uniqParams,
  };
}

function getFilteredGroupingOptions(
  grouping: IMetricAppConfig['grouping'],
  groupName: GroupNameType,
): string[] {
  const { selectOptions, reverseMode, isApplied } = grouping;

  const filteredOptions = [...selectOptions]
    .filter((opt) => grouping[groupName].indexOf(opt.value) === -1)
    .map((item) => item.value);
  return isApplied[groupName]
    ? reverseMode[groupName]
      ? filteredOptions
      : grouping[groupName]
    : [];
}

function getGroupingPersistIndex({
  groupValues,
  groupKey,
  grouping,
}: IGetGroupingPersistIndex) {
  const configHash = encode(groupValues[groupKey].config as {});
  let index = BigInt(0);
  for (let i = 0; i < configHash.length; i++) {
    const charCode = configHash.charCodeAt(i);
    if (charCode > 47 && charCode < 58) {
      index += BigInt(
        (charCode - 48) * Math.ceil(Math.pow(16, i) / grouping.seed.color),
      );
    } else if (charCode > 96 && charCode < 103) {
      index += BigInt(
        (charCode - 87) * Math.ceil(Math.pow(16, i) / grouping.seed.color),
      );
    }
  }
  return index;
}

function isGroupingApplied(grouping: IMetricAppConfig['grouping']): boolean {
  const groupByColor = getFilteredGroupingOptions(grouping, 'color');
  const groupByStyle = getFilteredGroupingOptions(grouping, 'style');
  const groupByChart = getFilteredGroupingOptions(grouping, 'chart');
  if (
    groupByColor.length === 0 &&
    groupByStyle.length === 0 &&
    groupByChart.length === 0
  ) {
    return false;
  }
  return true;
}

function groupData(data: IMetric[]): IMetricsCollection<IMetric>[] {
  const configData = model.getState()!.config;
  const grouping = configData!.grouping;
  const { paletteIndex } = grouping;
  const groupByColor = getFilteredGroupingOptions(grouping, 'color');
  const groupByStyle = getFilteredGroupingOptions(grouping, 'style');
  const groupByChart = getFilteredGroupingOptions(grouping, 'chart');
  if (
    groupByColor.length === 0 &&
    groupByStyle.length === 0 &&
    groupByChart.length === 0
  ) {
    return [
      {
        config: null,
        color: null,
        dasharray: null,
        chartIndex: 0,
        data: data,
      },
    ];
  }

  const groupValues: {
    [key: string]: IMetricsCollection<IMetric>;
  } = {};

  const groupingFields = _.uniq(
    groupByColor.concat(groupByStyle).concat(groupByChart),
  );

  for (let i = 0; i < data.length; i++) {
    const groupValue: { [key: string]: unknown } = {};
    groupingFields.forEach((field) => {
      groupValue[field] = _.get(data[i], field);
    });
    const groupKey = encode(groupValue);
    if (groupValues.hasOwnProperty(groupKey)) {
      groupValues[groupKey].data.push(data[i]);
    } else {
      groupValues[groupKey] = {
        config: groupValue,
        color: null,
        dasharray: null,
        chartIndex: 0,
        data: [data[i]],
      };
    }
  }

  let colorIndex = 0;
  let dasharrayIndex = 0;
  let chartIndex = 0;

  const colorConfigsMap: { [key: string]: number } = {};
  const dasharrayConfigsMap: { [key: string]: number } = {};
  const chartIndexConfigsMap: { [key: string]: number } = {};

  for (let groupKey in groupValues) {
    const groupValue = groupValues[groupKey];

    if (groupByColor.length > 0) {
      const colorConfig = _.pick(groupValue.config, groupByColor);
      const colorKey = encode(colorConfig);

      if (grouping.persistence.color && grouping.isApplied.color) {
        let index = getGroupingPersistIndex({
          groupValues,
          groupKey,
          grouping,
        });
        groupValue.color =
          COLORS[paletteIndex][
            Number(index % BigInt(COLORS[paletteIndex].length))
          ];
      } else if (colorConfigsMap.hasOwnProperty(colorKey)) {
        groupValue.color =
          COLORS[paletteIndex][
            colorConfigsMap[colorKey] % COLORS[paletteIndex].length
          ];
      } else {
        colorConfigsMap[colorKey] = colorIndex;
        groupValue.color =
          COLORS[paletteIndex][colorIndex % COLORS[paletteIndex].length];
        colorIndex++;
      }
    }

    if (groupByStyle.length > 0) {
      const dasharrayConfig = _.pick(groupValue.config, groupByStyle);
      const dasharrayKey = encode(dasharrayConfig);
      if (grouping.persistence.style && grouping.isApplied.style) {
        let index = getGroupingPersistIndex({
          groupValues,
          groupKey,
          grouping,
        });
        groupValue.dasharray =
          DASH_ARRAYS[Number(index % BigInt(DASH_ARRAYS.length))];
      } else if (dasharrayConfigsMap.hasOwnProperty(dasharrayKey)) {
        groupValue.dasharray =
          DASH_ARRAYS[dasharrayConfigsMap[dasharrayKey] % DASH_ARRAYS.length];
      } else {
        dasharrayConfigsMap[dasharrayKey] = dasharrayIndex;
        groupValue.dasharray = DASH_ARRAYS[dasharrayIndex % DASH_ARRAYS.length];
        dasharrayIndex++;
      }
    }

    if (groupByChart.length > 0) {
      const chartIndexConfig = _.pick(groupValue.config, groupByChart);
      const chartIndexKey = encode(chartIndexConfig);
      if (chartIndexConfigsMap.hasOwnProperty(chartIndexKey)) {
        groupValue.chartIndex = chartIndexConfigsMap[chartIndexKey];
      } else {
        chartIndexConfigsMap[chartIndexKey] = chartIndex;
        groupValue.chartIndex = chartIndex;
        chartIndex++;
      }
    }
  }

  const groups = Object.values(groupValues);

  const chartConfig = configData!.chart;

  return aggregateGroupData({
    groupData: groups,
    methods: {
      area: chartConfig.aggregationConfig.methods.area,
      line: chartConfig.aggregationConfig.methods.line,
    },
    scale: chartConfig.axesScaleType,
  });
}

function getAggregatedData(
  processedData: IMetricsCollection<IMetric>[],
  configData = model.getState()?.config as IMetricAppConfig,
): IAggregatedData[] {
  if (!processedData) {
    return [];
  }
  const paletteIndex: number = configData?.grouping?.paletteIndex || 0;

  let aggregatedData: IAggregatedData[] = [];
  const { smoothingAlgorithm, smoothingFactor } = configData?.chart;

  processedData.forEach((metricsCollection, index) => {
    let lineY: number[];
    let areaMinY: number[];
    let areaMaxY: number[];
    if (smoothingAlgorithm && smoothingFactor) {
      lineY = getSmoothenedData({
        smoothingAlgorithm,
        smoothingFactor,
        data: metricsCollection.aggregation?.line?.yValues || [],
      });
      areaMinY = getSmoothenedData({
        smoothingAlgorithm,
        smoothingFactor,
        data: metricsCollection.aggregation?.area.min?.yValues || [],
      });
      areaMaxY = getSmoothenedData({
        smoothingAlgorithm,
        smoothingFactor,
        data: metricsCollection.aggregation?.area.max?.yValues || [],
      });
    } else {
      lineY = metricsCollection.aggregation?.line?.yValues as number[];
      areaMinY = metricsCollection.aggregation?.area.min?.yValues as number[];
      areaMaxY = metricsCollection.aggregation?.area.max?.yValues as number[];
    }

    const line = {
      xValues: metricsCollection.aggregation?.line?.xValues as number[],
      yValues: lineY,
    };
    const area: any = {
      min: {
        xValues: metricsCollection.aggregation?.area.min?.xValues,
        yValues: areaMinY,
      },
      max: {
        xValues: metricsCollection.aggregation?.area.max?.xValues,
        yValues: areaMaxY,
      },
    };
    aggregatedData.push({
      key: encode(metricsCollection.data.map((metric) => metric.key) as {}),
      area,
      line,
      chartIndex: metricsCollection.chartIndex || 0,
      color:
        metricsCollection.color ||
        COLORS[paletteIndex][index % COLORS[paletteIndex].length],
      dasharray: metricsCollection.dasharray || '0',
    });
  });

  return aggregatedData;
}

function getDataAsLines(
  processedData: IMetricsCollection<IMetric>[],
  configData: IMetricAppConfig | any = model.getState()?.config,
): ILine[][] {
  if (!processedData) {
    return [];
  }
  const { smoothingAlgorithm, smoothingFactor } = configData?.chart;
  const lines = processedData
    .map((metricsCollection: IMetricsCollection<IMetric>) =>
      metricsCollection.data.map((metric: IMetric) => {
        let yValues;
        if (smoothingAlgorithm && smoothingFactor) {
          yValues = getSmoothenedData({
            smoothingAlgorithm,
            smoothingFactor,
            data: metric.data.yValues,
          });
        } else {
          yValues = metric.data.yValues;
        }
        return {
          ...metric,
          color: metricsCollection.color ?? metric.color,
          dasharray: metricsCollection.dasharray ?? metric.color,
          chartIndex: metricsCollection.chartIndex,
          selectors: [metric.key, metric.key, metric.run.params.status.hash],
          data: {
            xValues: metric.data.xValues,
            yValues,
          },
        };
      }),
    )
    .flat();

  return Object.values(_.groupBy(lines, 'chartIndex'));
}

function getDataAsTableRows(
  processedData: IMetricsCollection<IMetric>[],
  xValue: number | string | null = null,
  paramKeys: string[],
): IMetricTableRowData[][] | any {
  if (!processedData) {
    return [];
  }

  return processedData.map((metricsCollection: IMetricsCollection<IMetric>) =>
    metricsCollection.data.map((metric: IMetric) => {
      const closestIndex =
        xValue === null
          ? null
          : getClosestValue(metric.data.iterations as any, xValue as number)
              .index;
      const rowValues: { [key: string]: unknown } = {
        key: metric.key,
        color: metricsCollection.color ?? metric.color,
        dasharray: metricsCollection.dasharray ?? metric.color,
        experiment: metric.run.params.experiment_name,
        run: metric.run.params.status.name,
        metric: metric.metric_name,
        context: Object.entries(metric.context).map((entry) => entry.join(':')),
        value: `${
          closestIndex === null ? '-' : metric.data.values[closestIndex]
        }`,
        iteration: `${
          closestIndex === null ? '-' : metric.data.iterations[closestIndex]
        }`,
      };
      paramKeys.forEach((paramKey) => {
        rowValues[paramKey] = _.get(metric.run.params, paramKey, '-');
      });
      return rowValues;
    }),
  );
}

function setComponentRefs(refElement: React.MutableRefObject<any> | object) {
  const modelState = model.getState();
  if (modelState?.refs) {
    modelState.refs = Object.assign(modelState.refs, refElement);
    model.setState({ refs: modelState.refs });
  }
}

function setTooltipData(
  processedData: IMetricsCollection<IMetric>[],
  paramKeys: string[],
): void {
  const data: { [key: string]: any } = {};

  function getGroupConfig(metric: IMetric) {
    const configData = model.getState()?.config;
    const groupingItems: GroupNameType[] = ['color', 'style', 'chart'];
    let groupConfig: { [key: string]: {} } = {};
    for (let groupItemKey of groupingItems) {
      const groupItem: string[] = configData?.grouping?.[groupItemKey] || [];
      if (groupItem.length) {
        groupConfig[groupItemKey] = groupItem.reduce((acc, paramKey) => {
          Object.assign(acc, {
            [paramKey.replace('run.params.', '')]: _.get(metric, paramKey),
          });
          return acc;
        }, {});
      }
    }
    return groupConfig;
  }

  for (let metricsCollection of processedData) {
    for (let metric of metricsCollection.data) {
      data[metric.key] = {
        metricName: metric.metric_name,
        metricContext: metric.context,
        group_config: getGroupConfig(metric),
        params: paramKeys.reduce((acc, paramKey) => {
          Object.assign(acc, {
            [paramKey]: _.get(metric, `run.params.${paramKey}`),
          });
          return acc;
        }, {}),
      };
    }
  }

  tooltipData = data;
}

//Chart Methods

function onHighlightModeChange(mode: HighlightEnum): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    model.setState({
      config: {
        ...configData,
        chart: {
          ...configData.chart,
          highlightMode: mode,
        },
      },
    });
  }
}

function onZoomModeChange(): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    model.setState({
      config: {
        ...configData,
        chart: {
          ...configData.chart,
          zoomMode: !configData.chart.zoomMode,
        },
      },
    });
  }
}

function onAggregationConfigChange(
  aggregationConfig: Partial<IAggregationConfig>,
): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart && !_.isEmpty(aggregationConfig)) {
    configData.chart = {
      ...configData.chart,
      aggregationConfig: {
        ...configData.chart.aggregationConfig,
        ...aggregationConfig,
      },
    };
    updateModelData(configData);
  }
}

function onSmoothingChange(props: IOnSmoothingChange) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart = { ...configData.chart, ...props };
    updateModelData(configData);
  }
}

function onDisplayOutliersChange(): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.displayOutliers = !configData?.chart.displayOutliers;
    model.setState({ config: configData });
  }
}

function onAxesScaleTypeChange(params: IAxesScaleState): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    model.setState({
      config: {
        ...configData,
        chart: {
          ...configData.chart,
          axesScaleType: params,
        },
      },
    });
  }
}

function setAggregationEnabled(configData: IMetricAppConfig): void {
  const isAppliedGrouping = isGroupingApplied(configData.grouping);
  configData.chart.aggregationConfig.isEnabled = isAppliedGrouping;
  if (!isAppliedGrouping) {
    configData.chart.aggregationConfig.isApplied = false;
  }
}

function onGroupingSelectChange({
  groupName,
  list,
}: IOnGroupingSelectChangeParams) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = { ...configData.grouping, [groupName]: list };
    setAggregationEnabled(configData);
    updateModelData(configData);
  }
}

function onGroupingModeChange({
  groupName,
  value,
}: IOnGroupingModeChangeParams): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping.reverseMode = {
      ...configData.grouping.reverseMode,
      [groupName]: value,
    };
    setAggregationEnabled(configData);
    updateModelData(configData);
  }
}

function onGroupingPaletteChange(index: number): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      paletteIndex: index,
    };
    setAggregationEnabled(configData);
    updateModelData(configData);
  }
}

function onGroupingReset(groupName: GroupNameType) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    const { reverseMode, paletteIndex, isApplied, persistence } =
      configData.grouping;
    configData.grouping = {
      ...configData.grouping,
      reverseMode: { ...reverseMode, [groupName]: false },
      [groupName]: [],
      paletteIndex: groupName === 'color' ? 0 : paletteIndex,
      persistence: { ...persistence, [groupName]: false },
      isApplied: { ...isApplied, [groupName]: true },
    };
    setAggregationEnabled(configData);
    updateModelData(configData);
  }
}

function updateModelData(configData: IMetricAppConfig): void {
  const processedData = processData(
    model.getState()?.rawData as IRun<IMetricTrace>[],
  );
  model.setState({
    config: configData,
    data: processedData.data,
    lineChartData: getDataAsLines(processedData.data),
    aggregatedData: getAggregatedData(processedData.data),
    tableData: getDataAsTableRows(
      processedData.data,
      null,
      processedData.params,
    ),
  });
}

function onGroupingApplyChange(groupName: GroupNameType): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      isApplied: {
        ...configData.grouping.isApplied,
        [groupName]: !configData.grouping.isApplied[groupName],
      },
    };
    setAggregationEnabled(configData);
    updateModelData(configData);
  }
}

function onGroupingPersistenceChange(groupName: 'style' | 'color'): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.grouping) {
    configData.grouping = {
      ...configData.grouping,
      persistence: {
        ...configData.grouping.persistence,
        [groupName]: !configData.grouping.persistence[groupName],
      },
    };
    setAggregationEnabled(configData);
    updateModelData(configData);
  }
}

function onActivePointChange(
  activePoint: IActivePoint,
  focusedStateActive: boolean = false,
): void {
  const tableRef: any = model.getState()?.refs?.tableRef;
  const tableData = getDataAsTableRows(
    model.getState()!.data!,
    activePoint.xValue,
    model.getState()!.params!,
  );
  const stateUpdate: Partial<IMetricAppModelState> = {
    tableData,
  };
  if (tableRef) {
    tableRef.current?.updateData({ newData: tableData.flat() });
    tableRef.current?.setHoveredRow?.(activePoint.key);
    tableRef.current?.setActiveRow?.(
      focusedStateActive ? activePoint.key : null,
    );
    if (focusedStateActive) {
      tableRef.current?.scrollToRow?.(activePoint.key);
    }
  }
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    configData.chart.focusedState = {
      active: focusedStateActive,
      key: activePoint.key,
      xValue: activePoint.xValue,
      yValue: activePoint.yValue,
      chartIndex: activePoint.chartIndex,
    };
    stateUpdate.config = configData;
    stateUpdate.tooltipContent = tooltipData[activePoint.key] || {};
  }

  model.setState(stateUpdate);
}

//Table Methods

function onTableRowHover(rowKey: string): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    const chartPanelRef: any = model.getState()?.refs?.chartPanelRef;
    if (chartPanelRef && !configData.chart.focusedState.active) {
      chartPanelRef.current?.setActiveLine(rowKey);
    }
  }
}

function onTableRowClick(rowKey: string | null): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  const chartPanelRef: any = model.getState()?.refs?.chartPanelRef;
  if (chartPanelRef && rowKey) {
    chartPanelRef.current?.setActiveLine(rowKey, true);
  }
  if (configData?.chart) {
    configData.chart.focusedState = {
      ...configData.chart.focusedState,
      active: !!rowKey,
    };
    updateModelData(configData);
  }
}

function updateGroupingStateUrl(): void {
  const groupingData = model.getState()?.config?.grouping;
  if (groupingData) {
    updateUrlParam('grouping', groupingData);
  }
}

function updateChartStateUrl(): void {
  const chartData = model.getState()?.config?.chart;
  if (chartData) {
    updateUrlParam('chart', chartData);
  }
}

function updateSelectStateUrl(): void {
  const selectData = model.getState()?.config?.select;
  if (selectData) {
    updateUrlParam('select', selectData);
  }
}

function updateUrlParam(
  paramName: string,
  data: Record<string, unknown>,
): void {
  const encodedUrl: string = encode(data);
  console.log(data);

  const url: string = getUrlWithParam(paramName, encodedUrl);
  window.history.pushState(null, '', url);
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

function onResetConfigData(): void {
  model.setState({
    config: getConfig(),
  });
}

function alignData() {}

function onAlignmentMetricChange(metric: string): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    model.setState({
      config: {
        ...configData,
        chart: {
          ...configData.chart,
          alignmentConfig: {
            ...configData.chart.alignmentConfig,
            metric: metric,
          },
        },
      },
    });
  }
}

function onAlignmentTypeChange(type: XAlignmentEnum): void {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.chart) {
    model.setState({
      config: {
        ...configData,
        chart: {
          ...configData.chart,
          alignmentConfig: { ...configData.chart.alignmentConfig, type: type },
        },
      },
    });
  }
}

function onMetricsSelectChange(data: ISelectMetricsOption[]) {
  const configData: IMetricAppConfig | undefined = model.getState()?.config;
  if (configData?.select) {
    model.setState({
      config: {
        ...configData,
        select: { ...configData.select, metrics: data },
      },
    });
  }
}

const metricAppModel = {
  ...model,
  initialize,
  getMetricsData,
  getAppConfigData,
  getDataAsTableRows,
  setComponentRefs,
  setDefaultAppConfigData,
  onHighlightModeChange,
  onZoomModeChange,
  onSmoothingChange,
  onDisplayOutliersChange,
  onAxesScaleTypeChange,
  onAggregationConfigChange,
  onActivePointChange,
  onTableRowHover,
  onTableRowClick,
  onGroupingSelectChange,
  onGroupingModeChange,
  onGroupingPaletteChange,
  onGroupingReset,
  onGroupingApplyChange,
  onGroupingPersistenceChange,
  onBookmarkCreate,
  updateGroupingStateUrl,
  updateChartStateUrl,
  onNotificationDelete,
  onNotificationAdd,
  onBookmarkUpdate,
  onResetConfigData,
  onAlignmentMetricChange,
  onAlignmentTypeChange,
  onMetricsSelectChange,
  updateSelectStateUrl,
};

export default metricAppModel;
