import React, { ChangeEvent, memo, useRef, useState } from 'react';
import { Button, TextField, Dialog, Drawer } from '@material-ui/core';

import TagForm from 'components/TagForm/TagForm';
import TagsTable from './TagsTable';
import TagDetail from './TagDetail';
import TagSoftDelete from './TagSoftDelete';
import { ITagProps, ITagsListProps } from 'types/pages/tags/Tags';
import TagDelete from './TagDelete';
import Icon from 'components/Icon/Icon';
import * as analytics from 'services/analytics';

import './Tags.scss';

function TagsList({
  tagsList,
  isHiddenTagsList,
  isTagsDataLoading,
  tagInfo,
  tagRuns,
  isRunsDataLoading,
  isTagInfoDataLoading,
}: ITagsListProps): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = useRef<any>({});
  const [isCreateModalOpened, setIsCreateModalOpened] = useState(false);
  const [isUpdateModalOpened, setIsUpdateModalOpened] = useState(false);
  const [isSoftDeleteModalOpened, setIsSoftDeleteModalOpened] = useState(false);
  const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false);
  const [isTagDetailOverLayOpened, setIsTagDetailOverLayOpened] =
    useState(false);
  const [tagDetailId, setTagDetailId] = useState('');
  const [searchValue, setSearchValue] = useState('');

  function onCreateModalToggle() {
    setIsCreateModalOpened(!isCreateModalOpened);
  }

  function onUpdateModalToggle() {
    setIsUpdateModalOpened(!isUpdateModalOpened);
  }

  function onSoftDeleteModalToggle() {
    setIsSoftDeleteModalOpened(!isSoftDeleteModalOpened);
  }

  function onDeleteModalToggle() {
    setIsDeleteModalOpened(!isDeleteModalOpened);
  }

  function onTagDetailOverlayToggle() {
    if (isTagDetailOverLayOpened) {
      tableRef.current?.setActiveRow(null);
    }
    setIsTagDetailOverLayOpened(!isTagDetailOverLayOpened);
  }

  function openTagDetailOverLay() {
    setIsTagDetailOverLayOpened(true);
  }

  function onSearchInputChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchValue(e.target.value);
  }

  function onTableRunClick(id: string) {
    if (!isTagDetailOverLayOpened) {
      openTagDetailOverLay();
    }
    setTagDetailId(id);
    analytics.trackEvent('[Tags] Open tag detail page');
  }

  return (
    <div className='Tags__TagList'>
      <div className='Tags__TagList__header'>
        <TextField
          placeholder='Search'
          variant='outlined'
          InputProps={{
            startAdornment: <Icon name='search' />,
            disabled: isTagsDataLoading,
          }}
          onChange={onSearchInputChange}
          value={searchValue}
        />
        {!isHiddenTagsList && (
          <Button
            variant='contained'
            size='small'
            className='Tags__TagList__header__createButton'
            color='primary'
            onClick={onCreateModalToggle}
          >
            <Icon name='plus' />
            Create Tag
          </Button>
        )}
      </div>
      <TagsTable
        tableRef={tableRef}
        tagsList={tagsList.filter((tag: ITagProps) =>
          tag.name.includes(searchValue),
        )}
        isTagsDataLoading={isTagsDataLoading}
        hasSearchValue={!!searchValue}
        onTableRunClick={onTableRunClick}
        onSoftDeleteModalToggle={onSoftDeleteModalToggle}
        onDeleteModalToggle={onDeleteModalToggle}
        onUpdateModalToggle={onUpdateModalToggle}
      />
      <Dialog
        key={tagInfo?.id + '1'}
        onClose={onCreateModalToggle}
        aria-labelledby='customized-dialog-title'
        open={isCreateModalOpened}
      >
        <div className='Tags__TagList__modalContainer'>
          <div className='Tags__TagList__modalContainer__titleBox'>
            <span className='Tags__TagList__modalContainer__titleBox__title'>
              Create Tag
            </span>
          </div>
          <div className='Tags__TagList__modalContainer__contentBox'>
            <TagForm onCloseModal={onCreateModalToggle} />
          </div>
        </div>
      </Dialog>
      <Dialog
        key={tagInfo?.id + '2'}
        onClose={onUpdateModalToggle}
        aria-labelledby='customized-dialog-title'
        open={isUpdateModalOpened}
      >
        <div className='Tags__TagList__modalContainer'>
          <div className='Tags__TagList__modalContainer__titleBox'>
            <span className='Tags__TagList__modalContainer__titleBox__title'>
              Update Tag
            </span>
          </div>
          <div className='Tags__TagList__modalContainer__contentBox'>
            <TagForm
              onCloseModal={onUpdateModalToggle}
              tagData={tagInfo}
              tagId={tagInfo?.id}
              editMode
            />
          </div>
        </div>
      </Dialog>
      {tagInfo && (
        <TagSoftDelete
          modalIsOpen={isSoftDeleteModalOpened}
          tagInfo={tagInfo}
          tagHash={tagInfo?.id}
          onSoftDeleteModalToggle={onSoftDeleteModalToggle}
          onTagDetailOverlayToggle={onTagDetailOverlayToggle}
          isTagDetailOverLayOpened={isTagDetailOverLayOpened}
        />
      )}

      {tagInfo && (
        <TagDelete
          modalIsOpen={isDeleteModalOpened}
          tagInfo={tagInfo}
          tagHash={tagInfo?.id}
          onDeleteModalToggle={onDeleteModalToggle}
          onTagDetailOverlayToggle={onTagDetailOverlayToggle}
          isTagDetailOverLayOpened={isTagDetailOverLayOpened}
        />
      )}
      <Drawer
        className='Tags__TagList__overLayContainer'
        anchor='right'
        open={isTagDetailOverLayOpened}
        onClose={onTagDetailOverlayToggle}
      >
        {isTagDetailOverLayOpened && (
          <TagDetail
            id={tagDetailId}
            onSoftDeleteModalToggle={onSoftDeleteModalToggle}
            onUpdateModalToggle={onUpdateModalToggle}
            onDeleteModalToggle={onDeleteModalToggle}
            tagRuns={tagRuns}
            tagInfo={tagInfo}
            isRunsDataLoading={isRunsDataLoading}
            isTagInfoDataLoading={isTagInfoDataLoading}
          />
        )}
      </Drawer>
    </div>
  );
}

export default memo(TagsList);
