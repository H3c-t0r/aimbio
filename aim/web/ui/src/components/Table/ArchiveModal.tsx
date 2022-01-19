import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

import Table from 'components/Table/Table';
import { Button, Icon, Modal, Text } from 'components/kit';

function ArchiveModal({
  opened,
  onClose,
  selectedRows,
  archiveMode,
  onRowSelect,
}: any): React.FunctionComponentElement<React.ReactNode> {
  const [data, setData] = React.useState<any[]>([]);
  const [disabledData, setDisabledData] = React.useState<any[]>([]);
  const tableRef = React.useRef<any>({});
  const disabledTableRef = React.useRef<any>({});
  const tableColumns = [
    {
      dataKey: 'experiment',
      key: 'experiment',
      title: 'Experiment',
      width: 200,
    },
    {
      dataKey: 'run',
      key: 'run',
      title: 'Run',
      width: 0,
      flexGrow: 1,
      cellRenderer: function cellRenderer({ cellData, rowData }: any) {
        return (
          <div
            className={classNames('ActionModal__tableRowWithAction', {
              isDisabled: rowData.isDisabled,
            })}
          >
            <p
              className={classNames('ActionModal__tableRowWithAction__date', {
                'in-progress': rowData?.isInProgress,
              })}
            >
              {cellData}
            </p>
            {!rowData.isDisabled && (
              <Button
                size='small'
                withOnlyIcon
                color='secondary'
                className={'ActionModal__tableRowWithAction__deleteButton'}
                onClick={() => {
                  const tmpSelectedRows = onRowSelect({
                    data: Object.values(selectedRows).filter(
                      (selectRow: any) => selectRow.runHash === rowData.runHash,
                    ),
                    actionType: 'removeAll',
                  });
                  if (_.isEmpty(tmpSelectedRows)) {
                    onClose();
                  }
                }}
              >
                <Icon name='close' fontSize={10} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  React.useEffect(() => {
    const archivedList: any[] = [];
    const unarchivedList: any[] = [];
    const runHashList: string[] = [];
    Object.values(selectedRows || {}).forEach((selectedRow: any) => {
      if (!runHashList.includes(selectedRow.runHash)) {
        runHashList.push(selectedRow.runHash);
        const rowData = {
          key: selectedRow.runHash,
          run: `${moment(selectedRow.creation_time * 1000).format(
            'DD MMM YYYY, HH:mm A',
          )}`,
          experiment: selectedRow.experiment.name,
          runHash: selectedRow.runHash,
          selectKey: selectedRow.selectKey,
          isInProgress: !selectedRow?.end_time,
          isDisabled:
            (archiveMode && selectedRow.archived) ||
            (!archiveMode && !selectedRow.archived),
        };
        if (selectedRow.archived) {
          unarchivedList.push(rowData);
        } else {
          archivedList.push(rowData);
        }
      }
    });

    setData(archiveMode ? archivedList : unarchivedList);
    setDisabledData(!archiveMode ? archivedList : unarchivedList);
    tableRef.current?.updateData?.({
      newData: archiveMode ? archivedList : unarchivedList,
    });
    disabledTableRef.current?.updateData?.({
      newData: !archiveMode ? archivedList : unarchivedList,
    });
  }, [selectedRows]);

  return (
    opened && (
      <Modal
        opened={opened}
        onClose={onClose}
        onOk={() => {}}
        cancelButtonText='Cancel'
        okButtonText={archiveMode ? 'Archive' : 'Unarchive'}
        title={`Do you really want to ${
          archiveMode ? 'archive' : 'unarchive'
        }?`}
        modalType='warning'
      >
        <div className='ActionModal'>
          <Text size={14} weight={400} className='ActionModal__infoText'>
            Archived runs will not appear in search both on Dashboard and
            Explore. But you will still be able to unarchive the run at any
            time.
          </Text>
          <Text size={12} weight={500} className='ActionModal__tableTitle'>
            {`${Object.values(data).length} Selected runs you can ${
              archiveMode ? 'archive' : 'unarchive'
            }`}
          </Text>
          {!_.isEmpty(data) && (
            <Table
              ref={tableRef}
              fixed={false}
              columns={tableColumns}
              minHeight={'100px'}
              data={data}
              hideHeaderActions
              headerHeight={28}
              emptyText='No Text'
              rowHeight={24}
              onRowHover={() => {}}
              height='100%'
            />
          )}
          {!_.isEmpty(disabledData) && (
            <Text size={12} weight={500} className='ActionModal__tableTitle'>
              {`${Object.values(disabledData).length} Selected runs you can ${
                !archiveMode ? 'archive' : 'unarchive'
              }`}
            </Text>
          )}
          {!_.isEmpty(disabledData) && (
            <div className='ActionModal__disabledTableWrapper'>
              <Table
                ref={disabledTableRef}
                fixed={false}
                columns={tableColumns}
                minHeight={'100px'}
                data={disabledData}
                hideHeaderActions
                headerHeight={28}
                emptyText='No Text'
                rowHeight={24}
                onRowHover={() => {}}
                height='100%'
              />
            </div>
          )}
        </div>
      </Modal>
    )
  );
}

export default React.memo(ArchiveModal);
