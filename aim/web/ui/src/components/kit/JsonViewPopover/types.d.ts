import { ReactJsonViewProps } from 'react-json-view';

export interface IJsonViewPopoverProps extends Partial<ReactJsonViewProps> {
  json: object;
  dictVisualizerSize?: {
    width: number;
    height: number;
  };
}
