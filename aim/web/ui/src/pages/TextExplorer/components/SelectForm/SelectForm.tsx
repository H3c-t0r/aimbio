import React from 'react';

import { Box, Checkbox, Divider, InputBase, Popper } from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank,
} from '@material-ui/icons';

import { Icon, Badge, Button } from 'components/kit';
import ExpressionAutoComplete from 'components/kit/ExpressionAutoComplete';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import textExplorerAppModel from 'services/models/textExplorer/textExplorerAppModel';

import { ISelectFormProps } from 'types/pages/textsExplorer/components/SelectForm/SelectForm';
import { ISelectOption } from 'types/services/models/explorer/createAppModel';

import './SelectForm.scss';

function SelectForm({
  requestIsPending,
  selectedTextsData,
  searchButtonDisabled,
  selectFormData,
  onTextsExplorerSelectChange,
  onSelectRunQueryChange,
}: ISelectFormProps): React.FunctionComponentElement<React.ReactNode> {
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const searchMetricsRef = React.useRef<any>(null);

  React.useEffect(() => {
    return () => {
      searchMetricsRef.current?.abort();
    };
  }, []);

  function handleSearch(e: React.ChangeEvent<any>): void {
    e.preventDefault();
    if (requestIsPending || searchButtonDisabled) {
      return;
    }
    searchMetricsRef.current = textExplorerAppModel.getTextData(true, true);
    searchMetricsRef.current.call();

    // trackEvent(ANALYTICS_EVENT_KEYS.images.searchClick);
  }

  function handleRequestAbort(e: React.SyntheticEvent): void {
    e.preventDefault();
    if (!requestIsPending) {
      return;
    }
    searchMetricsRef.current?.abort();
    textExplorerAppModel.abortRequest();
  }

  function onSelect(event: object, value: ISelectOption[]): void {
    const lookup = value.reduce(
      (acc: { [key: string]: number }, curr: ISelectOption) => {
        acc[curr.label] = ++acc[curr.label] || 0;
        return acc;
      },
      {},
    );
    onTextsExplorerSelectChange(
      value.filter((option: ISelectOption) => lookup[option.label] === 0),
    );
  }

  function handleDelete(field: string): void {
    let fieldData = [...selectedTextsData?.options].filter(
      (opt: ISelectOption) => opt.label !== field,
    );
    onTextsExplorerSelectChange(fieldData);
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
        <div className='SelectForm__texts__container'>
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
                    <Icon name='plus' style={{ marginRight: '0.5rem' }} />
                    Texts
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
                      className='Autocomplete__container'
                      size='small'
                      disablePortal={true}
                      disableCloseOnSelect
                      options={selectFormData.options}
                      value={selectedTextsData?.options ?? ''}
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
                          spellCheck={false}
                          placeholder='Search'
                          autoFocus={true}
                          className='SelectForm__metric__select'
                        />
                      )}
                      renderOption={(option) => {
                        let selected: boolean =
                          !!selectedTextsData?.options.find(
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
                              size='small'
                            />
                            <span className='SelectForm__option__label'>
                              {option.label}
                            </span>
                          </React.Fragment>
                        );
                      }}
                    />
                  </Popper>
                  <Divider
                    style={{ margin: '0 1rem' }}
                    orientation='vertical'
                    flexItem
                  />
                  {selectedTextsData?.options.length === 0 && (
                    <span className='SelectForm__tags__empty'>
                      No texts are selected
                    </span>
                  )}
                  <Box className='SelectForm__tags ScrollBar__hidden'>
                    {selectedTextsData?.options?.map((tag: ISelectOption) => {
                      return (
                        <Badge
                          size='large'
                          key={tag.label}
                          color={tag.color}
                          label={tag.label}
                          onDelete={handleDelete}
                        />
                      );
                    })}
                  </Box>
                </Box>
                {selectedTextsData?.options.length > 1 && (
                  <ErrorBoundary>
                    <span
                      onClick={() => onTextsExplorerSelectChange([])}
                      className='SelectForm__clearAll'
                    >
                      <Icon name='close' />
                    </span>
                  </ErrorBoundary>
                )}
              </ErrorBoundary>
            </Box>
          </Box>
          {selectedTextsData?.advancedMode ? null : (
            <ErrorBoundary>
              <div className='SelectForm__TextField'>
                <ExpressionAutoComplete
                  onExpressionChange={onSelectRunQueryChange}
                  onSubmit={handleSearch}
                  value={selectedTextsData?.query}
                  options={selectFormData.suggestions}
                  placeholder='Filter runs, e.g. run.learning_rate > 0.0001 and run.batch_size == 32'
                />
              </div>
            </ErrorBoundary>
          )}
        </div>
        <div className='SelectForm__search__container'>
          <Button
            fullWidth
            color='primary'
            variant={requestIsPending ? 'outlined' : 'contained'}
            startIcon={
              <Icon
                name={requestIsPending ? 'close' : 'search'}
                fontSize={requestIsPending ? 12 : 14}
              />
            }
            className='SelectForm__search__button'
            onClick={requestIsPending ? handleRequestAbort : handleSearch}
            disabled={searchButtonDisabled}
          >
            {requestIsPending ? 'Cancel' : 'Search'}
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(SelectForm);
