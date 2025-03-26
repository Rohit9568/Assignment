import { useMemo } from "react";

import BaseTable from "./index";

import { getFieldDetails, getPropTypes } from "../../utils";

/**
 * The table with the results of the columns of the run query operation. Uses the BaseTable component to display the
 * results in a table.
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function ColumnsTable(props) {
  const { result = [], isLoaded = false, error, tab = {} } = props;
  
  const data = useMemo(() => {
    // Make sure result is an array and has data
    const safeResult = Array.isArray(result) ? result : [];
    if (safeResult.length === 0) {
      return [];
    }
    return Object.keys(safeResult[0]).map((key, index) => ({
      column: key,
      type: getFieldDetails(key).type,
    }));
  }, [result]);

  const columns = useMemo(
    () => [
      {
        Header: "Column",
        accessor: "column",
        defaultCanSort: true,
      },
      {
        Header: "Type",
        accessor: "type",
        defaultCanSort: true,
      },
    ],
    []
  );

  return (
    <BaseTable
      columns={columns}
      data={data}
      isLoaded={isLoaded}
      error={error}
    />
  );
}

ColumnsTable.propTypes = getPropTypes("tab", "result", "isLoaded", "error");

export default ColumnsTable;
