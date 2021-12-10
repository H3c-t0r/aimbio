import React from 'react';

import { Tooltip } from '@material-ui/core';

import { Text, Slider } from 'components/kit';

import { IRangeSliderWithInputProps } from './RangeSliderWithInput.d';

import './RangeSliderWithInput.scss';

/**
 * @property {string} sliderTitle - title of slider
 * @property {string} countInputTitle - title of count input
 * @property {number} selectedRangeValue - selected range value
 * @property {number} selectedCountValue - selected input value
 * @property {function} onSearch - search method
 * @property {function} onCountChange - count change method
 * @property {function} onRangeChange - range change method
 * @property {number} min - minimum range value
 * @property {number} max - maximum range value
 * @property {string}  sliderTitleTooltip - tooltip value of slider title
 * @property {string}  countTitleTooltip - tooltip value of count title
 */

function RangeSliderWithInput({
  sliderTitle,
  countInputTitle,
  selectedRangeValue,
  selectedCountValue,
  onSearch,
  onCountChange,
  onRangeChange,
  min,
  max,
  sliderTitleTooltip,
  countTitleTooltip,
}: IRangeSliderWithInputProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className={'RangeSliderWithInput'}>
      <div className='RangeSliderWithInput__sliderWrapper'>
        <div className='RangeSliderWithInput__sliderWrapper__sliderTitleBox'>
          {sliderTitleTooltip ? (
            <Tooltip title={sliderTitleTooltip}>
              <span className='RangeSliderWithInput__sliderWrapper__title'>
                {sliderTitle}:
              </span>
            </Tooltip>
          ) : (
            <span className='RangeSliderWithInput__sliderWrapper__title'>
              {sliderTitle}:
            </span>
          )}
          <Text
            size={10}
            weight={600}
            tint={80}
            className='RangeSliderWithInput__sliderWrapper__sliderValuesLabel'
          >{`${selectedRangeValue[0]} - ${selectedRangeValue[1]}`}</Text>
        </div>

        <Slider
          value={selectedRangeValue}
          onChange={((e: any, value: any) => onRangeChange(value)) as any}
          min={min}
          max={max}
          valueLabelDisplay='auto'
          getAriaValueText={(value) => `${value}`}
          onKeyPress={(e) => {
            if (e.which === 13) {
              onSearch();
            }
          }}
        />
      </div>
      <div className='RangeSliderWithInput__densityWrapper'>
        <div className='RangeSliderWithInput__densityWrapper__densityTitleBox'>
          <Text
            className='RangeSliderWithInput__densityWrapper__densityTitleBox__densityFieldLabel'
            size={10}
            weight={400}
            tint={70}
            color='primary'
          >
            {countInputTitle}:
          </Text>
          {countTitleTooltip && (
            <Tooltip title={countTitleTooltip} placement='right-end'>
              <div className='RangeSliderWithInput__densityWrapper__densityTitleBox__labelTooltip'>
                ?
              </div>
            </Tooltip>
          )}
        </div>
        <input
          type='number'
          value={selectedCountValue}
          onChange={onCountChange}
          className={`RangeSliderWithInput__densityWrapper__densityField ${
            selectedCountValue === 0
              ? 'RangeSliderWithInput__densityWrapper__densityField-invalid'
              : ''
          }`}
        />
      </div>
    </div>
  );
}

RangeSliderWithInput.displayName = 'RangeSliderWithInput';

export default React.memo<IRangeSliderWithInputProps>(RangeSliderWithInput);
