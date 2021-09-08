import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  Divider,
  TextField,
} from '@material-ui/core';
import {
  ExpandMore,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';
import Autocomplete from '@material-ui/lab/Autocomplete';

import ToggleButton from 'components/ToggleButton/ToggleButton';
import { IGroupingPopoverProps } from 'types/components/GroupingPopover/GroupingPopover';
import {
  IGroupingSelectOption,
  GroupNameType,
} from 'types/services/models/metrics/metricsAppModel';

import './groupingPopoverStyle.scss';
import { ScaleEnum } from '../../utils/d3';
import Icon from '../Icon/Icon';

function GroupingPopover({
  groupName,
  advancedComponent,
  groupingData,
  groupingSelectOptions,
  onSelect,
  onGroupingModeChange,
}: IGroupingPopoverProps): React.FunctionComponentElement<React.ReactNode> {
  function onChange(e: object, values: IGroupingSelectOption[]): void {
    onSelect({
      groupName,
      list: values.map((item: IGroupingSelectOption) =>
        typeof item === 'string' ? item : item.value,
      ),
    });
  }

  const values: IGroupingSelectOption[] = React.useMemo(() => {
    let data: { value: string; group: string; label: string }[] = [];
    groupingSelectOptions.forEach((option) => {
      if (groupingData?.[groupName].indexOf(option.value) !== -1) {
        data.push(option);
      }
    });
    return data;
  }, [groupName, groupingData]);

  function handleGroupingMode(
    // e: React.ChangeEvent<HTMLInputElement>,
    // checked: boolean,
    val: string | number,
    id: any,
  ) {
    onGroupingModeChange({
      groupName,
      value: val === 'Reverse',
      options: groupingData.reverseMode[groupName as GroupNameType]
        ? groupingSelectOptions
        : null,
    });
  }

  return (
    <div className='GroupingPopover'>
      <div className='GroupingPopover__container'>
        <div className='GroupingPopover__container__select'>
          <h3 className='GroupingPopover__subtitle'>
            Select Fields for grouping by Stroke style
          </h3>
          <Autocomplete
            id='select-metrics'
            size='small'
            multiple
            disableCloseOnSelect
            options={groupingSelectOptions}
            value={values}
            onChange={onChange}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => option.label}
            getOptionSelected={(option, value) => option.value === value.value}
            renderInput={(params) => (
              <TextField
                {...params}
                variant='outlined'
                label='Select Params'
                placeholder='Select'
              />
            )}
            renderOption={(option, { selected }) => (
              <React.Fragment>
                <Checkbox
                  icon={<CheckBoxOutlineBlank />}
                  checkedIcon={<CheckBoxIcon />}
                  style={{ marginRight: 4 }}
                  checked={selected}
                />
                {option.label}
              </React.Fragment>
            )}
          />
        </div>
        <div className='GroupingPopover__toggleMode__div'>
          <h3 className='GroupingPopover__subtitle'>select grouping mode</h3>
          <ToggleButton
            title='Select Mode'
            id='yAxis'
            value={
              groupingData.reverseMode[groupName as GroupNameType]
                ? 'Reverse'
                : 'Group'
            }
            leftValue='Group'
            rightValue='Reverse'
            leftLabel='Group'
            rightLabel='Reverse'
            onChange={handleGroupingMode}
          />
        </div>
        {advancedComponent && (
          <div className='GroupingPopover__advanced__component'>
            <Accordion className='GroupingPopover__accordion__container'>
              <AccordionSummary
                expandIcon={
                  <Icon fontSize='0.875rem' name='arrow-bidirectional-close' />
                }
                id='panel1c-header'
              >
                <span className='GroupingPopover__subtitle'>
                  Advanced options
                </span>
              </AccordionSummary>
              <AccordionDetails style={{ padding: 0 }}>
                {advancedComponent}
              </AccordionDetails>
            </Accordion>
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupingPopover;
