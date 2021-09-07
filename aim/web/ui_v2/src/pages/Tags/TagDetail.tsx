import React, { memo, useEffect } from 'react';
import { isEmpty } from 'lodash-es';

import BusyLoaderWrapper from 'components/BusyLoaderWrapper/BusyLoaderWrapper';
import tagsAppModel from 'services/models/tags/tagsAppModel';
import hexToRgbA from 'utils/haxToRgba';
import TagRunsTable from './TagRunsTable';
import { ITagDetailProps } from 'types/pages/tags/Tags';
import EmptyComponent from 'components/EmptyComponent/EmptyComponent';
import Icon from 'components/Icon/Icon';

import './Tags.scss';

function TagDetail({
  id,
  onSoftDeleteModalToggle,
  onUpdateModalToggle,
  onDeleteModalToggle,
  isTagInfoDataLoading,
  tagInfo,
  isRunsDataLoading,
  tagRuns,
}: ITagDetailProps): React.FunctionComponentElement<React.ReactNode> {
  useEffect(() => {
    const tagRequestRef = tagsAppModel.getTagById(id);
    const tagRunsRequestRef = tagsAppModel.getTagRuns(id);
    tagRunsRequestRef.call();
    tagRequestRef.call();
    return () => {
      tagRunsRequestRef.abort();
      tagRequestRef.abort();
    };
  }, [id]);

  return (
    <div className='TagDetail'>
      <div className='TagDetail__headerContainer'>
        <BusyLoaderWrapper
          isLoading={isTagInfoDataLoading}
          loaderType='skeleton'
          loaderConfig={{ variant: 'rect', width: 100, height: 24 }}
          width='auto'
        >
          {tagInfo && (
            <div className='TagContainer__tagBox'>
              <div
                className='TagContainer__tagBox__tag'
                style={{
                  borderColor: tagInfo?.color,
                  background: hexToRgbA(tagInfo?.color, 0.1),
                }}
              >
                <span
                  className='TagContainer__tagBox__tag__content'
                  style={{ color: tagInfo?.color }}
                >
                  {tagInfo?.name}
                </span>
              </div>
            </div>
          )}
        </BusyLoaderWrapper>
        <div className='TagDetail__headerContainer__headerActionsBox'>
          {!tagInfo?.archived && (
            <Icon
              name='edit'
              className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
              onClick={onUpdateModalToggle}
            />
          )}
          {tagInfo?.archived ? (
            <Icon
              name='eye-show-outline'
              color='primary'
              className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
              onClick={onSoftDeleteModalToggle}
            />
          ) : (
            <Icon
              name='eye-outline-hide'
              color='primary'
              className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
              onClick={onSoftDeleteModalToggle}
            />
          )}
          <span className='TagDetail__headerContainer__headerActionsBox__actionsIcon__Wrapper'>
            <Icon
              name='delete'
              fontSize='small'
              color='primary'
              className='TagDetail__headerContainer__headerActionsBox__actionsIcon'
              onClick={onDeleteModalToggle}
            />
          </span>
        </div>
      </div>
      <BusyLoaderWrapper
        isLoading={isRunsDataLoading}
        className='Tags__TagList__tagListBusyLoader'
      >
        {!isEmpty(tagRuns) ? (
          <TagRunsTable runsList={tagRuns} />
        ) : (
          <EmptyComponent size='big' content='No Runs' />
        )}
      </BusyLoaderWrapper>
    </div>
  );
}

export default memo(TagDetail);
