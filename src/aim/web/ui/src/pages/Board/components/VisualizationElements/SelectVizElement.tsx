import * as React from 'react';

import { Select } from 'components/kit_v2';

function SelectVizElement(props: any) {
  const options = (props.options.options || []).map((opt: string) => ({
    value: opt,
    label: opt,
  }));

  const onChange = (val: string) => {
    if (typeof props.callbacks?.on_change === 'function') {
      const index = options.findIndex((opt: any) => opt.value === val);
      props.callbacks.on_change(val, index);
    }
  };

  return (
    <Select
      multiple={false}
      searchable
      value={props.options.value}
      popoverProps={{ align: 'start' }}
      options={[
        {
          group: '',
          options,
        },
      ]}
      onValueChange={onChange}
    />
  );
}

export default SelectVizElement;
