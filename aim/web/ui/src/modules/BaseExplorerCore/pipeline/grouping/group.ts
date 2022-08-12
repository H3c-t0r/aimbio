// group by [group type] [group_type] [order]
import { cyrb53 } from '../../helpers';

import { pickValues } from './getGroupValues';
import { GroupType, Order } from './types';
import getGroupValues from './getGroupValues';

/*
 * cache = {
 *   hash1
 * }
 */
function group(
  data: any[],
  args: {
    type: GroupType;
    fields: string[];
    orders: Order[];
  },
) {
  const config = {
    ...args,
    orders: args.orders,
  };

  // if (cache.has(groupHash)) {
  //   const config = cache.get(groupHash);
  //   if (config?.options.order === args.order) {
  //     return config?.result;
  //   }
  //   // order
  //   const data = applyOrder(config?.result);
  //   const result = { data, modificationKey: config?.result.modificationKey };
  //   const cacheData = { result, options: { order: args.order } };
  //   cache.set(groupHash, cacheData);
  //
  //   return result;
  // }
  const groups = getGroupValues(data, config.fields, config.orders);

  // @ts-ignore
  const result = data.map((item: any) => {
    const groupKey: string = cyrb53(pickValues(item, config.fields));

    const group = item['groups'] || {};
    return {
      ...item,
      groups: {
        ...group,
        [config.type]: [groupKey],
      },
    };
  });

  return {
    data: result,
    foundGroups: groups,
  };
}

export default group;
