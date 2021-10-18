import _ from 'lodash-es';
import { IMetric } from 'types/services/models/metrics/metricModel';
import {
  IMetricsCollection,
  ITooltipData,
} from 'types/services/models/metrics/metricsAppModel';
import { IModel, State } from 'types/services/models/model';
import { IParam } from 'types/services/models/params/paramsAppModel';
import getGroupConfig from './getGroupConfig';

export default function getTooltipData<M extends State>({
  processedData,
  paramKeys,
  model,
}: {
  processedData: IMetricsCollection<IMetric | IParam | any>[];
  paramKeys: string[];
  model: IModel<M>;
}): ITooltipData {
  const data: ITooltipData = {};

  for (let metricsCollection of processedData) {
    const groupConfig = getGroupConfig({ metricsCollection, model });

    for (let metric of metricsCollection.data) {
      data[metric.key] = {
        runHash: metric.run.hash,
        metricName: metric.metric_name,
        metricContext: metric.context,
        groupConfig,
        params: paramKeys.reduce((acc, paramKey) => {
          Object.assign(acc, {
            [paramKey]: JSON.stringify(
              _.get(metric, `run.params.${paramKey}`, '-'),
            ),
          });
          return acc;
        }, {}),
      };
    }
  }

  return data;
}
