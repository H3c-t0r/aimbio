import React from 'react';

import { Box, Checkbox, Divider, InputBase, Popper } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Badge, Button, Icon, Text } from 'components/kit';
import ExpressionAutoComplete from 'components/kit/ExpressionAutoComplete';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import useParamsSuggestions from 'hooks/projectData/useParamsSuggestions';

import paramsAppModel from 'services/models/params/paramsAppModel';
import { trackEvent } from 'services/analytics';

import { ISelectFormProps } from 'types/pages/params/components/SelectForm/SelectForm';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import './SelectForm.scss';

function SelectForm({
  requestIsPending,
  onParamsSelectChange,
  selectedParamsData,
  onSelectRunQueryChange,
  selectFormOptions,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const searchRef = React.useRef<any>(null);
  const paramsSuggestions = useParamsSuggestions();

  React.useEffect(() => {
    return () => {
      searchRef.current?.abort();
    };
  }, []);

  function handleParamsSearch(e: React.ChangeEvent<any>) {
    e.preventDefault();
    if (requestIsPending) {
      return;
    }
    searchRef.current = paramsAppModel.getParamsData(true, true);
    searchRef.current.call();
    trackEvent(ANALYTICS_EVENT_KEYS.params.searchClick);
  }

  function handleRequestAbort(e: React.SyntheticEvent): void {
    e.preventDefault();
    if (!requestIsPending) {
      return;
    }
    searchRef.current?.abort();
    paramsAppModel.abortRequest();
  }

  function onSelect(event: object, value: ISelectOption[]): void {
    const lookup = value.reduce(
      (acc: { [key: string]: number }, curr: ISelectOption) => {
        acc[curr.label] = ++acc[curr.label] || 0;
        return acc;
      },
      {},
    );
    onParamsSelectChange(
      value.filter((option: ISelectOption) => lookup[option.label] === 0),
    );
  }

  function handleDelete(field: string): void {
    let fieldData = [...(selectedParamsData?.options || [])].filter(
      (opt: ISelectOption) => opt.label !== field,
    );
    onParamsSelectChange(fieldData);
  }

  function handleClick(event: React.ChangeEvent<any>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose(event: any, reason: any) {
    if (reason === 'toggleInput') {
      return;
    }
    if (anchorEl) {
      anchorEl.focus();
    }
    setAnchorEl(null);
  }

  const open: boolean = !!anchorEl;
  const id = open ? 'select-metric' : undefined;

  return (
    <ErrorBoundary>
      <div className='SelectForm__container'>
        <div className='SelectForm__params__container'>
          <Box display='flex'>
            <Box
              width='100%'
              display='flex'
              justifyContent='space-between'
              alignItems='center'
            >
              <ErrorBoundary>
                <Box display='flex' alignItems='center'>
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleClick}
                    aria-describedby={id}
                  >
                    <Icon name='plus' style={{ marginRight: '0.5rem' }} />{' '}
                    Params
                  </Button>
                  <Popper
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    placement='bottom-start'
                    className='SelectForm__Popper'
                  >
                    <Autocomplete
                      open
                      onClose={handleClose}
                      multiple
                      size='small'
                      disablePortal
                      disableCloseOnSelect
                      options={selectFormOptions}
                      value={selectedParamsData?.options}
                      onChange={onSelect}
                      groupBy={(option) => option.group}
                      getOptionLabel={(option) => option.label}
                      renderTags={() => null}
                      disableClearable={true}
                      ListboxProps={{
                        style: {
                          height: 400,
                        },
                      }}
                      renderInput={(params) => (
                        <InputBase
                          ref={params.InputProps.ref}
                          inputProps={params.inputProps}
                          autoFocus={true}
                          spellCheck={false}
                          className='SelectForm__param__select'
                        />
                      )}
                      renderOption={(option) => {
                        let selected: boolean =
                          !!selectedParamsData?.options.find(
                            (item: ISelectOption) =>
                              item.label === option.label,
                          )?.label;
                        return (
                          <React.Fragment>
                            <Checkbox
                              color='primary'
                              icon={<CheckBoxOutlineBlank />}
                              checkedIcon={<CheckBoxIcon />}
                              checked={selected}
                            />
                            <Text
                              className='SelectForm__option__label'
                              size={14}
                            >
                              {option.label}
                            </Text>
                          </React.Fragment>
                        );
                      }}
                    />
                  </Popper>
                  <Divider
                    style={{ margin: '0 1em' }}
                    orientation='vertical'
                    flexItem
                  />
                  {selectedParamsData?.options.length === 0 && (
                    <Text tint={50} size={14} weight={400}>
                      No params are selected
                    </Text>
                  )}
                  {selectedParamsData?.options &&
                    selectedParamsData.options.length > 0 && (
                      <ErrorBoundary>
                        <Box className='SelectForm__tags ScrollBar__hidden'>
                          {selectedParamsData?.options?.map(
                            (tag: ISelectOption) => {
                              return (
                                <Badge
                                  size='large'
                                  key={tag.label}
                                  color={tag.color}
                                  label={tag.label}
                                  onDelete={handleDelete}
                                />
                              );
                            },
                          )}
                        </Box>
                      </ErrorBoundary>
                    )}
                </Box>
                {selectedParamsData?.options &&
                  selectedParamsData.options.length > 1 && (
                    <ErrorBoundary>
                      <span
                        onClick={() => onParamsSelectChange([])}
                        className='SelectForm__clearAll'
                      >
                        <Icon name='close' />
                      </span>
                    </ErrorBoundary>
                  )}
              </ErrorBoundary>
            </Box>
            <Button
              color='primary'
              variant={requestIsPending ? 'outlined' : 'contained'}
              startIcon={
                <Icon
                  name={requestIsPending ? 'close' : 'search'}
                  fontSize={requestIsPending ? 12 : 14}
                />
              }
              className='Params__SelectForm__search__button'
              onClick={
                requestIsPending ? handleRequestAbort : handleParamsSearch
              }
            >
              {requestIsPending ? 'Cancel' : 'Search'}
            </Button>
          </Box>
          <div className='SelectForm__TextField'>
            <ExpressionAutoComplete
              onExpressionChange={onSelectRunQueryChange}
              onSubmit={handleParamsSearch}
              value={selectedParamsData?.query}
              options={paramsSuggestions}
              placeholder='Filter runs, e.g. run.learning_rate > 0.0001 and run.batch_size == 32'
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(SelectForm);
