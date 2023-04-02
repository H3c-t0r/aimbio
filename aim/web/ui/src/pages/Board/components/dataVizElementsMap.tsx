import * as React from 'react';
import * as _ from 'lodash-es';

import DictVisualizer from 'components/kit/DictVisualizer';
import LineChart from 'components/LineChart/LineChart';
import { Slider, Input, Text, Select } from 'components/kit_v2';

import RunLogRecords from 'pages/RunDetail/RunLogRecords';

import { ILineChartRef } from 'types/components/LineChart/LineChart';

import DataTable from './DataTable';
import ImagesList from './ImagesList';
import AudiosList from './AudiosList';
import TextList from './TextList';
import FiguresList from './FiguresList';
import Plotly from './Plotly';

export const dataVizElementsMap: any = {
  LineChart: (props: any) => {
    const onActivePointChange = React.useCallback(
      _.debounce(props.callbacks?.on_active_point_change, 100),
      [],
    );
    const chartRef = React.useRef<ILineChartRef>(null);
    const focusedStateRef = React.useRef<any>({});

    const syncHoverState = React.useCallback(
      ({ activePoint, focusedState: currentFocusedState }) => {
        if (activePoint) {
          if (currentFocusedState?.active) {
            /** on focus point */

            onActivePointChange(activePoint, true);
          } else {
            /** on mouse over */

            onActivePointChange(activePoint, false);
          }
        } else {
          /** on mouse leave */
        }
      },
      [],
    );

    return (
      <LineChart
        ref={chartRef}
        id={'0'}
        nameKey={'board'}
        data={props.data}
        syncHoverState={syncHoverState}
      />
    );
  },
  DataFrame: (props: any) => (
    <DataTable
      data={
        typeof props.data === 'string' ? JSON.parse(props.data) : props.data
      }
    />
  ),
  Figures: (props: any) => <FiguresList key={Date.now()} data={props.data} />,
  Images: (props: any) => <ImagesList key={Date.now()} data={props.data} />,
  Audios: (props: any) => <AudiosList key={Date.now()} data={props.data} />,
  Texts: (props: any) => <TextList key={Date.now()} data={props.data} />,
  JSON: (props: any) => (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <DictVisualizer src={props.data} />
    </div>
  ),
  HTML: (props: any) => (
    <div
      style={{ width: '100%', height: '100%', overflow: 'auto' }}
      dangerouslySetInnerHTML={{ __html: props.data }}
    />
  ),
  Text: (props: any) => <Text>{props.data}</Text>,
  Select: (props: any) => {
    let multi = Array.isArray(props.options.values);
    return (
      <Select
        multiple={multi}
        searchable
        value={multi ? props.options.values : props.options.value}
        options={[
          {
            group: '',
            options: props.options.options.map((opt: string) => ({
              value: opt,
              label: opt,
            })),
          },
        ]}
        onValueChange={(key: string) => props.callbacks?.on_change?.(key)}
      />
    );
  },
  RunMessages: (props: any) => (
    <div style={{ flex: 1 }}>
      <RunLogRecords key={props.data} runHash={props.data} inProgress={false} />
    </div>
  ),
  Plotly: (props: any) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Plotly {...props} />
    </div>
  ),
  Slider: (props: any) => {
    const onChange = React.useCallback(
      _.debounce(props.callbacks?.on_change, 100),
      [],
    );
    return (
      <Slider
        min={props.options.min}
        max={props.options.max}
        value={[props.options.value]}
        step={0.01}
        onValueChange={onChange}
      />
    );
  },
  TextInput: (props: any) => {
    const onChange = React.useCallback(({ target }) => {
      props.callbacks?.on_change(target.value);
    }, []);
    return <Input value={props.options.value} onChange={onChange} />;
  },
};
