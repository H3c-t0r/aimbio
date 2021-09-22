import React, { memo } from 'react';
import * as yup from 'yup';
import { isEmpty, noop } from 'lodash-es';
import { TextField } from '@material-ui/core';
import { useFormik } from 'formik';

import ConfirmModal from 'components/ConfirmModal/ConfirmModal';
import Icon from 'components/Icon/Icon';
import tagsAppModel from 'services/models/tags/tagsAppModel';

import './Tags.scss';

function TagDelete({
  tagInfo,
  tagHash,
  onDeleteModalToggle,
  onTagDetailOverlayToggle,
  isTagDetailOverLayOpened,
  modalIsOpen,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const formik = useFormik({
    initialValues: { name: '' },
    onSubmit: noop,
    validationSchema: yup.object({
      name: yup.string().test('name', 'Name does not match', function (name) {
        return name === tagInfo.name;
      }),
    }),
  });
  const {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    submitForm,
    validateForm,
  } = formik;
  const { name } = values;

  function onChange(e: React.ChangeEvent<any>) {
    setFieldValue('name', e?.target?.value, true).then(() => {
      setFieldTouched('name', true);
    });
  }

  function onTagHide() {
    submitForm().then(() =>
      validateForm(values).then((errors) => {
        if (isEmpty(errors)) {
          tagsAppModel.deleteTag(tagHash).then(() => {
            tagsAppModel.getTagsData().call();
            onDeleteModalToggle();
            isTagDetailOverLayOpened && onTagDetailOverlayToggle();
          });
        }
      }),
    );
  }

  return (
    <ConfirmModal
      open={modalIsOpen}
      onCancel={onDeleteModalToggle}
      onSubmit={onTagHide}
      text='Are you sure you want to delete this tag?'
      icon={<Icon name='delete' />}
    >
      <p className='TagDelete__contentContainer__contentBox__warningText'>
        {`Please type "${tagInfo?.name}" to confirm:`}
      </p>
      <TextField
        label='Name'
        value={name}
        id='name'
        variant='outlined'
        className='TagForm__tagFormContainer__labelField TextField__OutLined__Small'
        size='small'
        onChange={onChange}
        error={!!(touched.name && errors.name)}
        helperText={touched.name && errors.name}
      />
    </ConfirmModal>
  );
}

export default memo(TagDelete);
