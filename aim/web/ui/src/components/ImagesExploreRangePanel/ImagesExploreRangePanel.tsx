import React from 'react';

import { Button } from 'components/kit';
import SliderWithInput from 'components/SliderWithInput';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { ANALYTICS_EVENT_KEYS } from 'config/analytics/analyticsKeysMap';

import * as analytics from 'services/analytics';
import imagesExploreAppModel from 'services/models/imagesExplore/imagesExploreAppModel';

import { IImagesExploreRangePanelProps } from './types.d';

import './styles.scss';

function ImagesExploreRangePanel({
  recordSlice,
  indexSlice,
  indexRange,
  stepRange,
  indexDensity,
  recordDensity,
  onSliceRangeChange,
  onDensityChange,
  applyButtonDisabled,
}: IImagesExploreRangePanelProps): React.FunctionComponentElement<React.ReactNode> {
  const searchMetricsRef = React.useRef<any>(null);
  function handleSearch() {
    analytics.trackEvent(
      ANALYTICS_EVENT_KEYS.images.imagesPanel.clickApplyButton,
    );
    searchMetricsRef.current = imagesExploreAppModel.getImagesData(true);
    searchMetricsRef.current.call();
  }

  return (
    <ErrorBoundary>
      <form className='ImagesExploreRangePanel' onSubmit={handleSearch}>
        <div className='ImagesExploreRangePanel__container'>
          <SliderWithInput
            sliderTitle='Steps'
            countInputTitle='Steps count'
            countTitleTooltip='Number of steps to display'
            sliderTitleTooltip='Training step. Increments every time track() is called'
            min={stepRange[0]}
            max={stepRange[1]}
            selectedRangeValue={recordSlice}
            selectedCountValue={recordDensity}
            onSearch={handleSearch}
            onRangeChange={(value: number | number[]) =>
              onSliceRangeChange('recordSlice', value)
            }
            onCountChange={(value, metaData) =>
              onDensityChange(value, metaData, 'recordDensity')
            }
            inputValidationPatterns={[
              {
                errorCondition: (value: string | number) =>
                  +value < stepRange[0],
                errorText:
                  stepRange[0] <= 0
                    ? 'Value should be greater then 0'
                    : `Value should be equal or greater then ${stepRange[0]}`,
              },
              {
                errorCondition: (value: string | number) =>
                  +value > stepRange[1],
                errorText: `Value should be equal or smaller then ${stepRange[1]}`,
              },
              {
                errorCondition: (value: string | number) => +value === 0,
                errorText: "Value can't be 0",
              },
            ]}
          />
          <div className='ImagesExploreRangePanel__container__sliderContainerSeparator'></div>
          <SliderWithInput
            sliderTitle='Indices'
            countInputTitle='Indices count'
            countTitleTooltip='Number of images per step'
            sliderTitleTooltip='Index in the list of images passed to track() call'
            min={indexRange[0]}
            max={indexRange[1]}
            selectedRangeValue={indexSlice}
            selectedCountValue={indexDensity}
            onSearch={handleSearch}
            onRangeChange={(value: number | number[]) =>
              onSliceRangeChange('indexSlice', value)
            }
            onCountChange={(value, metaData) =>
              onDensityChange(value, metaData, 'indexDensity')
            }
            inputValidationPatterns={[
              {
                errorCondition: (value: string | number) =>
                  +value < indexRange[0],
                errorText:
                  indexRange[0] <= 0
                    ? 'Value should be greater then 0'
                    : `Value should be equal or greater then ${indexRange[0]}`,
              },
              {
                errorCondition: (value: string | number) =>
                  +value > indexRange[1],
                errorText: `Value should be equal or smaller then ${indexRange[1]}`,
              },
              {
                errorCondition: (value: string | number) => +value === 0,
                errorText: "Value can't be 0",
              },
            ]}
          />
          <div className='ImagesExploreRangePanel__container__searchButtonContainer'>
            <Button
              size='small'
              color='primary'
              variant='contained'
              type='submit'
              onClick={handleSearch}
              className='ImagesExploreRangePanel__container__searchButtonContainer__searchButton'
              disabled={applyButtonDisabled}
            >
              Apply
            </Button>
          </div>
        </div>
      </form>
    </ErrorBoundary>
  );
}

ImagesExploreRangePanel.displayName = 'ImagesExploreRangePanel';

export default React.memo<IImagesExploreRangePanelProps>(
  ImagesExploreRangePanel,
);
