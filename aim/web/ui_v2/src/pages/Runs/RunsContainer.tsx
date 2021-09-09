import React, { memo } from 'react';
import useModel from 'hooks/model/useModel';
import Runs from './Runs';
import { ITableRef } from '../../types/components/Table/Table';
import runsAppModel from '../../services/models/runs/runsAppModel';

const runsRequestRef = runsAppModel.getRunsData();
function RunsContainer(): React.FunctionComponentElement<React.ReactNode> {
  const tableRef = React.useRef<ITableRef>(null);
  const runsData = useModel(runsAppModel);

  React.useEffect(() => {
    if (tableRef.current) {
      runsAppModel.setComponentRefs({
        tableRef,
      });
    }
  }, [runsData?.data]);

  React.useEffect(() => {
    runsAppModel.initialize();
    return () => {
      runsRequestRef.abort();
    };
  }, []);

  return (
    <Runs
      tableData={runsData?.tableData}
      tableColumns={runsData?.tableColumns}
      isRunsDataLoading={runsData?.requestIsPending}
      onSelectRunQueryChange={runsAppModel.onSelectRunQueryChange}
      tableRowHeight={runsData?.config?.table.rowHeight}
      tableRef={tableRef}
      query={runsData?.config?.select.query}
      updateSelectStateUrl={runsAppModel.updateSelectStateUrl}
      onExportTableData={runsAppModel.onExportTableData}
      getLastRunsData={runsAppModel.getLastRunsData}
    />
  );
}

export default memo(RunsContainer);
