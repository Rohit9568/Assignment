// src/components/tabs/TabPane.jsx
import { Fragment, useState, useRef, Children, Suspense, lazy, cloneElement, useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import QueryButtons from '../query/queryButtons';
import QuerySpace from '../query/querySpace';
import ResultsTable from '../table/resultsTable';
import ColumnsTable from '../table/columnsTable';
import useFile from '../../hooks/useFile';

// Create a custom tab component that doesn't use React Bootstrap's Tab
function CustomTabItem({ eventKey, title, active, onClick, children }) {
    return (
        <div className="tab-pane-content" role="tabpanel" hidden={!active}>
            {active && children}
        </div>
    );
}

// Custom tabs container component
function CustomTabs({ defaultActiveKey, children, onSelect, result, isLoaded }) {
    const [activeKey, setActiveKey] = useState(defaultActiveKey);

    const handleSelect = (key) => {
        setActiveKey(key);
        if (onSelect) onSelect(key);
    };

    // Export functions
    const exportToCSV = () => {
        if (!result || result.length === 0) {
            alert("No data to export.");
            return;
        }

        const headers = Object.keys(result[0]);
        const csvRows = result.map(row => 
            headers.map(header => {
                let value = row[header];
                if (value === null || value === undefined) {
                    value = '';
                } else if (typeof value === 'string') {
                    value = `"${value.replace(/"/g, '""')}"`; // Escape double quotes
                }
                return value;
            }).join(',')
        );

        const csvData = [headers.join(','), ...csvRows].join('\n');
        const filename = 'exported_data.csv';
        downloadFile(csvData, filename, 'text/csv;charset=utf-8;');
    };

    const exportToJSON = () => {
        if (!result || result.length === 0) {
            alert("No data to export.");
            return;
        }

        const jsonData = JSON.stringify(result, null, 2); // null, 2 for pretty printing
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

    // Extract tab titles for the nav
    const tabTitles = Children.map(children, (child) => {
        if (!child) return null;

        const { eventKey, title } = child.props;
        return (
            <Nav.Item key={eventKey}>
                <Nav.Link
                    active={activeKey === eventKey}
                    onClick={() => handleSelect(eventKey)}
                >
                    {title}
                </Nav.Link>
            </Nav.Item>
        );
    });

    return (
        <div className="custom-tabs">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <Nav variant="tabs">
                    {tabTitles}
                </Nav>
                <ButtonGroup>
                    <Button 
                        size="sm" 
                        variant="outline-primary" 
                        onClick={exportToCSV}
                        disabled={!isLoaded || !result || result.length === 0}
                    >
                        <FontAwesomeIcon icon={faDownload} /> Export as CSV
                    </Button>
                    <Button 
                        size="sm" 
                        variant="outline-primary" 
                        onClick={exportToJSON}
                        disabled={!isLoaded || !result || result.length === 0}
                    >
                        <FontAwesomeIcon icon={faDownload} /> Export as JSON
                    </Button>
                </ButtonGroup>
            </div>
            {children}
        </div>
    );
}

// Main TabPane component
const TabPane = ({ tab }) => {
    const [activeTabKey, setActiveTabKey] = useState('results');
    const [tableData, setTableData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [executionTime, setExecutionTime] = useState(0);

    useEffect(() => {
        const loadTableData = async () => {
            setIsLoading(true);
            const startTime = Date.now();

            try {
                // Determine which table to load based on tab.title
                const tableName = tab.title.toLowerCase();
                const response = await fetch(`/data/${tableName}.csv`);
                
                if (!response.ok) {
                    throw new Error(`Failed to load ${tableName} data`);
                }
                
                const csvText = await response.text();
                const data = parseCSV(csvText);
                
                setTableData(data);
                setError(null);
                const endTime = Date.now();
                setExecutionTime(endTime - startTime);
            } catch (err) {
                console.error("Error loading table data:", err);
                setError(err.message);
                setTableData([]);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadTableData();
    }, [tab.title]);

    // Function to parse CSV data
    const parseCSV = (csvText) => {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(header => header.trim());
        
        const result = [];
        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue; // Skip empty lines
            
            const values = parseCSVLine(lines[i]);
            const obj = {};
            
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            
            result.push(obj);
        }
        
        return result;
    };
    
    // Helper function to handle quoted values in CSV
    const parseCSVLine = (line) => {
        const result = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        result.push(currentValue); // Add the last value
        return result;
    };

    return (
        <Fragment>
            <Container fluid className="tab-container">
                {/* Query Section */}
                <Row className="mb-3">
                    <Col xs={12}>
                        <QueryButtons />
                    </Col>
                </Row>
                
                <Row className="mb-4">
                    <Col xs={12} style={{ height: "200px" }}>
                        <QuerySpace 
                            defaultQuery={tab.defaultQuery || `SELECT * FROM ${tab.title}`} 
                            style={{ height: "100%" }}
                        />
                    </Col>
                </Row>
                
                <hr className="my-4" />
                
                {/* Results Section */}
                <Row>
                    <Col xs={12}>
                        <CustomTabs 
                            defaultActiveKey="results" 
                            onSelect={setActiveTabKey}
                            result={tableData}
                            isLoaded={!isLoading}
                        >
                            <CustomTabItem eventKey="results" title="Results" active={activeTabKey === 'results'}>
                                <ResultsTable
                                    data={tableData}
                                    isLoaded={!isLoading}
                                    error={error}
                                    timeOfRequest={executionTime}
                                />
                            </CustomTabItem>
                            <CustomTabItem eventKey="columns" title="Columns" active={activeTabKey === 'columns'}>
                                <ColumnsTable
                                    result={tableData}
                                    isLoaded={!isLoading}
                                    error={error}
                                />
                            </CustomTabItem>
                        </CustomTabs>
                    </Col>
                </Row>
            </Container>
        </Fragment>
    );
};

export default TabPane;