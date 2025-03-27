// table/BaseTable.jsx
import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  usePagination,
  useResizeColumns,
  useFlexLayout
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
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import InputGroup from "react-bootstrap/InputGroup";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faSort,
  faSortUp,
  faSortDown,
  faEye,
  faSearch,
  faTimes
} from "@fortawesome/free-solid-svg-icons";

import { getPropTypes } from "../../utils";
import './BaseTable.css';

// Separate search component that doesn't lose focus
function TableSearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <InputGroup>
      <FloatingLabel label="Search to filter results">
        <Form.Control
          value={searchTerm}
          onChange={handleChange}
          placeholder="Type to search..."
          className="search-input"
        />
      </FloatingLabel>
      {searchTerm && (
        <Button 
          variant="outline-secondary" 
          onClick={clearSearch}
          className="clear-search-btn"
        >
          <FontAwesomeIcon icon={faTimes} />
        </Button>
      )}
      <InputGroup.Text>
        <FontAwesomeIcon icon={faSearch} />
      </InputGroup.Text>
    </InputGroup>
  );
}

function BaseTable(props) {
  const [expandedCell, setExpandedCell] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", content: "" });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null);
  const [filterValue, setFilterValue] = useState("");

  const data = useMemo(() => props.data || [], [props.data]);
  
  const defaultColumn = useMemo(
    () => ({
      // Default column properties for resizing
      minWidth: 100,
      width: 150,
      maxWidth: 400,
    }),
    []
  );
  
  const columns = useMemo(() => {
    if (!props.columns || props.columns.length === 0) {
      return [];
    }
    
    return props.columns.map(column => ({
      ...column,
      Cell: ({ value, row, column }) => {
        const cellValue = value !== undefined ? value : "";
        const isExpandable = 
          typeof cellValue === 'string' && 
          (cellValue.length > 50 || cellValue.includes('\n'));
        
        return (
          <div className="table-cell-content">
            {isExpandable ? (
              <>
                <div className="cell-preview">
                  {typeof cellValue === 'string' 
                    ? cellValue.substring(0, 50) + (cellValue.length > 50 ? '...' : '') 
                    : cellValue}
                </div>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="expand-cell-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row expansion when clicking the button
                    handleCellExpand(cellValue, row, column);
                  }}
                  title="View full content"
                >
                  <FontAwesomeIcon icon={faEye} />
                </Button>
              </>
            ) : (
              cellValue
            )}
          </div>
        );
      }
    }));
  }, [props.columns]);

  const handleCellExpand = (cellValue, row, column) => {
    setModalContent({
      title: `${column.Header}: ${row.values[props.columns[0].accessor]}`,
      content: cellValue
    });
    setShowModal(true);
  };

  const handleRowExpand = (row, e) => {
    // Only expand if we're not dragging
    if (!isDragging) {
      setExpandedRow(expandedRow === row.id ? null : row.id);
    }
  };

  // Handle mouse events for drag detection
  const handleMouseDown = (e) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (dragStartRef.current) {
      const deltaX = Math.abs(e.clientX - dragStartRef.current.x);
      const deltaY = Math.abs(e.clientY - dragStartRef.current.y);
      
      // If moved more than 5px, consider it a drag
      if (deltaX > 5 || deltaY > 5) {
        setIsDragging(true);
      }
    }
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
    // Reset dragging state after a short delay to allow click events to process
    setTimeout(() => {
      setIsDragging(false);
    }, 100);
  };

  useEffect(() => {
    // Add global mouse event listeners
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    rows,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: { pageIndex: 0, pageSize: 10 },
      autoResetPage: false,
    },
    useFlexLayout,
    useResizeColumns,
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { pageIndex, pageSize } = state;

  // Handle search from our custom component
  const handleSearch = useCallback((value) => {
    setFilterValue(value);
    setGlobalFilter(value || undefined);
  }, [setGlobalFilter]);

  // Determine which rows to display based on pagination
  const finalResult = props.paginate ? page : rows;

  // Entries per page dropdown
  const entriesDropdown = (
    <Form.Group className="mb-0">
      <Form.Select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
        }}
        size="sm"
      >
        {[10, 25, 50, 100].map((size) => (
          <option key={size} value={size}>
            Show {size}
          </option>
        ))}
      </Form.Select>
    </Form.Group>
  );

  // Pagination controls
  const pageControls = (
    <Pagination size="sm">
      <Pagination.First
        onClick={() => gotoPage(0)}
        disabled={!canPreviousPage}
      />
      <Pagination.Prev
        onClick={() => previousPage()}
        disabled={!canPreviousPage}
      />
      {pageCount > 7 ? (
        <>
          <Pagination.Item
            active={pageIndex === 0}
            onClick={() => gotoPage(0)}
          >
            1
          </Pagination.Item>
          
          {pageIndex > 2 && <Pagination.Ellipsis />}
          
          {pageIndex > 0 && (
            <Pagination.Item onClick={() => gotoPage(pageIndex - 1)}>
              {pageIndex}
            </Pagination.Item>
          )}
          
          <Pagination.Item active>{pageIndex + 1}</Pagination.Item>
          
          {pageIndex < pageCount - 1 && (
            <Pagination.Item onClick={() => gotoPage(pageIndex + 1)}>
              {pageIndex + 2}
            </Pagination.Item>
          )}
          
          {pageIndex < pageCount - 3 && <Pagination.Ellipsis />}
          {pageIndex < pageCount - 2 && (
            <Pagination.Item onClick={() => gotoPage(pageCount - 1)}>
              {pageCount}
            </Pagination.Item>
          )}
        </>
      ) : (
        Array.from({ length: pageCount }).map((_, i) => (
          <Pagination.Item
            key={i}
            active={i === pageIndex}
            onClick={() => gotoPage(i)}
          >
            {i + 1}
          </Pagination.Item>
        ))
      )}
      <Pagination.Next onClick={() => nextPage()} disabled={!canNextPage} />
      <Pagination.Last
        onClick={() => gotoPage(pageCount - 1)}
        disabled={!canNextPage}
      />
    </Pagination>
  );

  // Result stats display
  const resultStats = (
    <div className="mb-2">
      <Badge bg="info" className="me-2">
        {rows.length} results
      </Badge>
      {props.timeOfRequest && (
        <Badge bg="success">
          {(props.timeOfRequest / 1000).toFixed(2)}s
        </Badge>
      )}
    </div>
  );

  return (
    <Container fluid className="h-100">
      <Row className="align-items-center mb-2">
        <Col lg={5}>
          <TableSearch onSearch={handleSearch} />
        </Col>
        <Col lg={3}>{props.paginate ? entriesDropdown : <></>}</Col>
        <Col lg={4} className="d-flex justify-content-end">
          {resultStats}
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
        <div className="table-responsive table-container">
          <Table
            {...getTableProps()}
            bordered
            hover
            size={"sm"}
            className="h-100 results-table"
            onMouseDown={handleMouseDown}
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
                        ...column.getHeaderProps().style,
                        position: 'relative',
                      }}
                    >
                      {column.render("Header")}{" "}
                      <span>
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <FontAwesomeIcon icon={faSortDown} />
                          ) : (
                            <FontAwesomeIcon icon={faSortUp} />
                          )
                        ) : (
                          <FontAwesomeIcon icon={faSort} className="text-muted" />
                        )}
                      </span>
                      {/* Add resizer div */}
                      <div
                        {...column.getResizerProps()}
                        className={`resizer ${column.isResizing ? 'isResizing' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {finalResult.length > 0 ? (
                finalResult.map((row) => {
                  prepareRow(row);
                  const isExpanded = expandedRow === row.id;
                  
                  return (
                    <React.Fragment key={row.id}>
                      <tr 
                        {...row.getRowProps()} 
                        className={isExpanded ? 'expanded-row' : ''}
                        onClick={(e) => handleRowExpand(row, e)}
                      >
                        {row.cells.map((cell) => {
                          return (
                            <td 
                              {...cell.getCellProps()} 
                              className="results-table-cell"
                            >
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                      {isExpanded && (
                        <tr className="expanded-row-details">
                          <td colSpan={row.cells.length}>
                            <div className="expanded-row-content">
                              <div className="d-flex justify-content-between align-items-center mb-3">
                                <h6 className="m-0">Row Details</h6>
                                <Button 
                                  variant="outline-secondary" 
                                  size="sm" 
                                  onClick={() => setExpandedRow(null)}
                                >
                                  Close
                                </Button>
                              </div>
                              <div className="row">
                                {Object.entries(row.original).map(([key, value]) => (
                                  <div className="col-md-6 mb-2" key={key}>
                                    <div className="detail-item">
                                      <strong>{key}:</strong> 
                                      <span className="detail-value">
                                        {typeof value === 'string' && value.length > 100 
                                          ? value.substring(0, 100) + '...' 
                                          : String(value)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={columns.length} className="text-center py-3">
                    {filterValue ? (
                      <>
                        No matching records found for <strong>"{filterValue}"</strong>
                      </>
                    ) : (
                      "No data available"
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Row>
      <Row className="mt-2">
        <Col>{props.paginate ? pageControls : <></>}</Col>
      </Row>

      {/* Modal for expanded cell content */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <pre className="expanded-content">{modalContent.content}</pre>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
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