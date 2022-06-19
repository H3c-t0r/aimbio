import { ISelectOption } from 'services/models/explorer/createAppModel';

import { IAppModelConfig } from 'types/services/models/explorer/createAppModel';

export interface ISelectFormProps {
  requestIsPending: boolean;
  isDisabled?: boolean;
  selectedMetricsData: IAppModelConfig['select'];
  selectFormData: {
    options: ISelectOption[];
    suggestions: Record<any>;
    advancedSuggestions?: Record<any>;
  };
  onMetricsSelectChange: (options: ISelectOption[]) => void;
  onSelectRunQueryChange: (query: string) => void;
  onSelectAdvancedQueryChange: (query: string) => void;
  toggleSelectAdvancedMode: () => void;
  onSearchQueryCopy: () => void;
}
