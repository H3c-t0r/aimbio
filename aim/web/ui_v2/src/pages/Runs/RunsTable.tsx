import React from 'react';
import { size } from 'lodash-es';
import Table from 'components/Table/Table';
import { IRunsTableProps } from 'types/pages/runs/Runs';

function RunsTable({
  isRunsDataLoading,
  isInfiniteLoading,
  runsList,
  tableRef,
  columns,
  tableRowHeight,
  onExportTableData,
  getLastRunsData,
  isLatest,
  data,
  onRowsChange,
  onManageColumns,
  onRowHeightChange,
  hiddenRuns,
  columnsOrder,
}: IRunsTableProps): React.FunctionComponentElement<React.ReactNode> {
  const getLatestRunsDataRequestRef = React.useRef<any>(null);
  React.useEffect(() => {
    return () => {
      getLatestRunsDataRequestRef.current?.abort();
    };
  }, []);

  function handleInfiniteLoad(row: any) {
    if (!isLatest) {
      getLatestRunsDataRequestRef.current = getLastRunsData(row);
      getLatestRunsDataRequestRef.current.call().catch();
    }
  }

  return (
    <div className='Runs__RunList__runListBox'>
      <div className='Runs__RunList__runListBox__titleBox'>
        <span className='Runs__RunList__runListBox__titleBox__title'>Runs</span>
      </div>
      <div className='RunsTable'>
        <Table
          custom
          allowInfiniteLoading
          isInfiniteLoading={isInfiniteLoading}
          showRowClickBehaviour={false}
          infiniteLoadHandler={handleInfiniteLoad}
          showResizeContainerActionBar={false}
          emptyText={'No runs found'}
          key={`${columns?.length}-${size(runsList)}`}
          ref={tableRef}
          data={data}
          columns={columns}
          isLoading={isRunsDataLoading}
          // Table options
          topHeader
          groups={!Array.isArray(runsList)}
          rowHeight={tableRowHeight}
          hiddenRows={hiddenRuns}
          // Table actions
          columnsOrder={columnsOrder}
          onRowsChange={onRowsChange}
          onManageColumns={onManageColumns}
          onRowHeightChange={onRowHeightChange}
          onExport={onExportTableData}
        />
      </div>
    </div>
  );
}

export default RunsTable;
