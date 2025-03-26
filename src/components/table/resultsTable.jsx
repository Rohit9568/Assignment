import { useMemo } from "react";

import BaseTable from "./index";
import ColumnsTable from "./columnsTable";

import { getPropTypes } from "../../utils";

/**
 * The table with the results of the run query operation. Uses the BaseTable component to display the results in a
 * table.
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
function ResultsTable(props) {
  // Destructure props and handle the case where result or data might not be provided
  const { result = [], isLoaded, error, timeOfRequest, data: propData, loading } = props;
  
  // Use propData if provided, otherwise use result
  const data = useMemo(() => propData || result, [propData, result]);

  const columns = useMemo(() => {
    // Check if data exists and has at least one item
    if (!data || data.length === 0) {
      return [];
    }
    return Object.keys(data[0]).map((key) => ({
      Header: key,
      accessor: key,
      defaultCanSort: true,
    }));
  }, [data]);

  return (
    <BaseTable
      columns={columns}
      data={data}
      isLoaded={isLoaded !== undefined ? isLoaded : !loading}
      error={error}
      paginate
      timeOfRequest={timeOfRequest}
    />
  );
}

ResultsTable.propTypes = getPropTypes("tab", "result", "isLoaded", "error", "timeOfRequest", "data", "loading");

export default ResultsTable;
