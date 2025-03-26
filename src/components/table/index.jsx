// table/BaseTable.jsx
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
} from "react-table";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Spinner from "react-bootstrap/Spinner";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Pagination from "react-bootstrap/Pagination";
import Alert from "react-bootstrap/Alert";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";

import { getPropTypes } from "../../utils";
import './BaseTable.css';
import React from 'react'; // Ensure React is imported

function BaseTable(props) {
  const defaultColumn = React.useMemo(
      () => ({
          minWidth: 30,
          width: 150,
      }),
      []
  );

  const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      page,
      rows,
      prepareRow,
      canPreviousPage,
      canNextPage,
      pageCount,
      gotoPage,
      nextPage,
      previousPage,
      setGlobalFilter,
      setPageSize,
      state: { pageIndex, pageSize },
      allColumns,
      setColumnWidth,
  } = useTable(
      {
          columns: props.columns,
          data: props.data,
          defaultColumn,
      },
      useGlobalFilter,
      useSortBy,
      usePagination
  );

  const firstRender = React.useRef(true);

  React.useEffect(() => {
      if (firstRender.current) {
          firstRender.current = false;
          return;
      }

      const attachResizers = () => {
          const headers = document.querySelectorAll('.results-table th');
          headers.forEach(header => {
              if (!header.querySelector('.resizer')) {
                  const resizer = document.createElement('div');
                  resizer.className = 'resizer';
                  header.style.position = 'relative';
                  header.appendChild(resizer);
              }
          });
      };

      attachResizers();

      const handleResize = (e) => {
          if (!e.target.classList.contains('resizer')) return;
          let startX = e.clientX;
          const header = e.target.parentNode;
          const index = header.cellIndex;
          const column = allColumns[index];
          const startWidth = header.offsetWidth;

          const mouseMoveHandler = (moveEvent) => {
              const newWidth = startWidth + (moveEvent.clientX - startX);
              setColumnWidth(column.id, newWidth);
          };

          const mouseUpHandler = () => {
              document.removeEventListener('mousemove', mouseMoveHandler);
              document.removeEventListener('mouseup', mouseUpHandler);
          };

          document.addEventListener('mousemove', mouseMoveHandler);
          document.addEventListener('mouseup', mouseUpHandler);
      };

      const table = document.querySelector('.results-table');
      if (table) {
          table.addEventListener('mousedown', handleResize);
          return () => table.removeEventListener('mousedown', handleResize);
      }
  }, [headerGroups, allColumns, setColumnWidth]);

  const exportToCSV = () => {
      if (!props.data || props.data.length === 0) {
          alert("No data to export.");
          return;
      }

      const headers = props.columns.map(col => col.Header).join(',');
      const csvRows = props.data.map(row =>
          props.columns.map(col => {
              const accessor = typeof col.accessor === 'function' ? col.accessor : (obj) => obj[col.accessor];
              let value = accessor(row);
              if (value === null || value === undefined) {
                  value = '';
              } else if (typeof value === 'string') {
                  value = `"${value.replace(/"/g, '""')}"`; // Escape double quotes
              }
              return value;
          }).join(',')
      );

      const csvData = [headers, ...csvRows].join('\n');
      const filename = 'exported_data.csv';
      downloadFile(csvData, filename, 'text/csv;charset=utf-8;');
  };

  const exportToJSON = () => {
      if (!props.data || props.data.length === 0) {
          alert("No data to export.");
          return;
      }

      const jsonData = JSON.stringify(props.data, null, 2); // null, 2 for pretty printing
      const filename = 'exported_data.json';
      downloadFile(jsonData, filename, 'application/json');
  };

  const downloadFile = (data, filename, type) => {
      const blob = new Blob([data], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };

  if (!props.isLoaded) {
      return (
          <Container className="h-100">
              <Row className="justify-content-center">
                  <Spinner animation="border" role="status" as="span" />
                  Loading...
              </Row>
          </Container>
      );
  } else if (props.error !== null) {
      return (
          <Container className="h-100">
              <Row className="justify-content-center h-100 align-items-center">
                  <h4 className="text-secondary text-center align-self-center">
                      {/* Error message can be displayed here if needed */}
                  </h4>
              </Row>
          </Container>
      );
  }

  const dropdownItems = [5, 10, 15, 20, 25].map((numEntries) => (
      <option value={numEntries} key={numEntries}>
          {numEntries}
      </option>
  ));

  const entriesDropdown = (
      <FloatingLabel label="No. of entries per page">
          <Form.Select
              onChange={(e) => {
                  setPageSize(parseInt(e.target.value));
              }}
              defaultValue={pageSize}
              disabled={props.data.length === 0}
              id="numEntriesPerPage"
          >
              {dropdownItems}
          </Form.Select>
      </FloatingLabel>
  );

  const pageControls = (
      <Pagination size={"lg"} className="justify-content-center">
          <Pagination.First
              disabled={pageIndex === 0}
              onClick={() => gotoPage(0)}
          />
          <Pagination.Prev disabled={!canPreviousPage} onClick={previousPage} />
          <Pagination.Next disabled={!canNextPage} onClick={nextPage} />
          <Pagination.Last
              disabled={pageIndex === pageCount - 1}
              onClick={() => gotoPage(pageCount - 1)}
          />
      </Pagination>
  );

  const resultStats = (
      <Col lg={4}>
          <Alert variant={"success"}>
              <FontAwesomeIcon icon={faCheck} /> Fetched{" "}
              <strong>{rows.length}</strong> results in{" "}
              <strong>{props.timeOfRequest / 1000}</strong> seconds
          </Alert>
      </Col>
  );

  const finalResult = props.paginate ? page : rows;

  return (
      <Container fluid className="h-100">
          <Row className="align-items-center mb-2"> {/* Added align-items-center and mb-2 */}
              {props.timeOfRequest ? resultStats : <></>}
              <Col lg={4}>
                  <FloatingLabel label="Search to filter results">
                      <Form.Control
                          aria-label="Text input to filter results"
                          onInput={(e) => {
                              setGlobalFilter(e.target.value);
                          }}
                          id="filterInput"
                          disabled={props.data.length === 0}
                      />
                  </FloatingLabel>
              </Col>
              <Col lg={3}>{props.paginate ? entriesDropdown : <></>}</Col>
              <Col lg={3} className="d-flex justify-content-end"> {/* Moved buttons here */}
                  <button onClick={exportToCSV} className="btn btn-primary me-2" disabled={!props.data || props.data.length === 0}>
                      Export as CSV
                  </button>
                  <button onClick={exportToJSON} className="btn btn-secondary" disabled={!props.data || props.data.length === 0}>
                      Export as JSON
                  </button>
              </Col>
          </Row>
          <Row
              style={{
                  maxHeight: "29vh",
                  overflowY: "auto",
                  overflowX: "auto",
              }}
              className="mt-3"
          >
              <Table
                  {...getTableProps()}
                  striped
                  hover
                  size={"sm"}
                  className="h-100 results-table"
                  style={{
                      backgroundColor: "#f8f9fa",
                      borderCollapse: "collapse",
                      color: "#212529",
                  }}
              >
                  <thead>
                      {headerGroups.map((headerGroup) => (
                          <tr
                              {...headerGroup.getHeaderGroupProps()}
                              className="results-table-header-row"
                          >
                              {headerGroup.headers.map((column) => (
                                  <th
                                      {...column.getHeaderProps(column.getSortByToggleProps())}
                                      className="results-table-header-cell"
                                      style={{
                                          minWidth: column.minWidth,
                                          width: column.width,
                                          position: 'relative',
                                      }}
                                  >
                                      {column.render("Header")}
                                  </th>
                              ))}
                          </tr>
                      ))}
                  </thead>
                  <tbody {...getTableBodyProps()}>
                      {finalResult.map((row) => {
                          prepareRow(row);
                          return (
                              <tr
                                  {...row.getRowProps()}
                                  style={{
                                      backgroundColor: "#ffffff",
                                      color: "#212529",
                                  }}
                                  onMouseEnter={(e) =>
                                      (e.currentTarget.style.backgroundColor = "#e9ecef")
                                  }
                                  onMouseLeave={(e) =>
                                      (e.currentTarget.style.backgroundColor = "#ffffff")
                                  }
                              >
                                  {row.cells.map((cell) => {
                                      return (
                                          <td
                                              {...cell.getCellProps()}
                                              className="results-table-cell"
                                              style={{
                                                  borderRight: "1px solid #dee2e6",
                                                  padding: "0.75rem",
                                              }}
                                          >
                                              {cell.render("Cell")}
                                          </td>
                                      );
                                  })}
                              </tr>
                          );
                      })}
                  </tbody>
              </Table>
          </Row>
          <Row className="mt-2">
              <Col>{props.paginate ? pageControls : <></>}</Col>
          </Row>
      </Container>
  );
}

BaseTable.propTypes = getPropTypes(
  "columns",
  "data",
  "isLoaded",
  "error",
  "paginate",
  "timeOfRequest"
);

export default BaseTable;