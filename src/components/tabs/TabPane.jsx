// src/components/tabs/TabPane.jsx
import { Fragment, useState, useRef, Children, Suspense, lazy, cloneElement, useEffect } from 'react'; // Import useEffect
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
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
function CustomTabs({ defaultActiveKey, children, onSelect }) {
    const [activeKey, setActiveKey] = useState(defaultActiveKey);

    const handleSelect = (key) => {
        setActiveKey(key);
        if (onSelect) onSelect(key);
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

    // Render content of active tab
    const tabContents = Children.map(children, (child) => {
        if (!child) return null;

        const { eventKey } = child.props;
        return cloneElement(child, {
            active: activeKey === eventKey
        });
    });

    return (
        <div className="custom-tabs">
            <Nav variant="tabs" className="mb-3">
                {tabTitles}
            </Nav>
            <div className="tab-content">
                {tabContents}
            </div>
        </div>
    );
}

// Main TabPane component
const TabPane = ({ tab }) => {
    const { result: fileResult, isLoaded: fileIsLoaded, error, timeOfRequest: fileTimeOfRequest } = useFile(tab.title);
    const [query, setQuery] = useState(tab.content || ''); // Initialize query with tab.content
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [executionTime, setExecutionTime] = useState(null); // Initialize as null
    const queryRef = useRef(null);
    const hasInitialRun = useRef(false); // To track if the initial query from sidebar click has run

    const handleQueryChange = (newQuery) => {
        setQuery(newQuery);
    };

    const handleRunQuery = () => {
        setLoading(true);
        setExecutionTime(null); // Reset execution time

        // Track query execution time
        const startTime = Date.now();

        // Simulate query execution
        setTimeout(() => {
            let mockResults = [];
            const queryLower = query.toLowerCase();

            if (queryLower.includes('employee')) {
                mockResults = [
                    { employee_id: 1, first_name: "John", last_name: "Doe", title: "Sales Manager", hire_date: "2020-01-15", salary: 75000 },
                    { employee_id: 2, first_name: "Jane", last_name: "Smith", title: "HR Specialist", hire_date: "2019-06-22", salary: 65000 },
                    { employee_id: 3, first_name: "Bob", last_name: "Johnson", title: "Finance Director", hire_date: "2018-03-10", salary: 82000 },
                    { employee_id: 4, first_name: "Alice", last_name: "Williams", title: "Software Engineer", hire_date: "2021-02-08", salary: 78000 },
                    { employee_id: 5, first_name: "Charlie", last_name: "Brown", title: "Marketing Specialist", hire_date: "2019-11-30", salary: 63000 }
                ];
            } else if (queryLower.includes('customer')) {
                mockResults = [
                    { customer_id: "ALFKI", company_name: "Alfreds Futterkiste", contact_name: "Maria Anders", country: "Germany" },
                    { customer_id: "ANATR", company_name: "Ana Trujillo Emparedados", contact_name: "Ana Trujillo", country: "Mexico" },
                    { customer_id: "ANTON", company_name: "Antonio Moreno Taquería", contact_name: "Antonio Moreno", country: "Mexico" },
                    { customer_id: "AROUT", company_name: "Around the Horn", contact_name: "Thomas Hardy", country: "UK" },
                    { customer_id: "BERGS", company_name: "Berglunds snabbköp", contact_name: "Christina Berglund", country: "Sweden" }
                ];
            } else if (queryLower.includes('order')) {
                mockResults = [
                    { order_id: 10248, customer_id: "VINET", employee_id: 5, order_date: "1996-07-04" },
                    { order_id: 10249, customer_id: "TOMSP", employee_id: 6, order_date: "1996-07-05" },
                    { order_id: 10250, customer_id: "HANAR", employee_id: 4, order_date: "1996-07-08" },
                    { order_id: 10251, customer_id: "VICTE", employee_id: 3, order_date: "1996-07-09" },
                    { order_id: 10252, customer_id: "SUPRD", employee_id: 4, order_date: "1996-07-10" }
                ];
            } else if (queryLower.includes('product')) {
                mockResults = [
                    { product_id: 1, product_name: "Chai", category_id: 1, unit_price: 18.00 },
                    { product_id: 2, product_name: "Chang", category_id: 1, unit_price: 19.00 },
                    { product_id: 3, product_name: "Aniseed Syrup", category_id: 2, unit_price: 10.00 },
                    { product_id: 4, product_name: "Chef Anton's Cajun Seasoning", category_id: 2, unit_price: 22.00 },
                    { product_id: 5, product_name: "Gumbo Mix", category_id: 2, unit_price: 21.35 }
                ];
            } else {
                // Default mock data if table can't be determined
                mockResults = [
                    { id: 1, name: "Sample Record 1", value: "Data 1", amount: 100 },
                    { id: 2, name: "Sample Record 2", value: "Data 2", amount: 200 },
                    { id: 3, name: "Sample Record 3", value: "Data 3", amount: 300 },
                    { id: 4, name: "Sample Record 4", value: "Data 4", amount: 400 },
                    { id: 5, name: "Sample Record 5", value: "Data 5", amount: 500 }
                ];
            }

            const endTime = Date.now();
            setExecutionTime(endTime - startTime);
            setResults(mockResults);
            setLoading(false);
        }, 800);
    };

    useEffect(() => {
        console.log("TabPane received tab.content:", tab.content); // ADD THIS LINE
        if (tab.content && !hasInitialRun.current) {
            // No need to set query again here, it's initialized directly
            handleRunQuery(); // Immediately trigger the data fetch
            hasInitialRun.current = true;
        }
    }, [tab.content]);

    useEffect(() => {
        console.log("TabPane query state:", query); // ADD THIS LINE
    }, [query]);

    return (
        <Fragment>
            <Container fluid className="tab-container">
                <Row>
                    <Col xs={12}>
                        <Container fluid className="query-container">
                            <Row className="query-editor-row">
                                <Col xs={12}>
                                    <Suspense fallback={<div>Loading query editor...</div>}>
                                        <QuerySpace
                                            defaultQuery={query} // Ensure the 'query' state is passed here
                                            onChange={handleQueryChange}
                                        />
                                    </Suspense>
                                </Col>
                            </Row>
                            <Row className="query-buttons-row">
                                <Col xs={12}>
                                    <Suspense fallback={<div>Loading query buttons...</div>}>
                                        <QueryButtons onRunQuery={handleRunQuery} isLoading={loading} />
                                    </Suspense>
                                </Col>
                            </Row>
                            <Row className="results-row">
                                <Col xs={12}>
                                    <Suspense fallback={<div className="text-center py-3">Loading results...</div>}>
                                        <ResultsTable
                                            data={results}
                                            loading={loading}
                                            tab={tab}
                                            isLoaded={!loading} // isLoaded is true only when not loading
                                            timeOfRequest={executionTime}
                                        />
                                    </Suspense>
                                </Col>
                            </Row>
                            {/* REMOVE THIS ENTIRE BLOCK */}
                            {/* {executionTime !== null && (
                                <Row className="mt-2">
                                    <Col>
                                        <p className="text-muted small">
                                            Time Taken: {executionTime}ms, Results: {results.length}
                                        </p>
                                    </Col>
                                </Row>
                            )} */}
                        </Container>
                    </Col>
                </Row>
            </Container>
            <hr />
            <CustomTabs defaultActiveKey="results">
                <CustomTabItem eventKey="results" title="Results">
                    {loading ? (
                        <div className="text-center py-3">Loading results...</div>
                    ) : (
                        <ResultsTable
                            result={fileResult}
                            isLoaded={!loading && fileIsLoaded} // Conditional isLoaded
                            error={error}
                            tab={tab}
                            timeOfRequest={executionTime || fileTimeOfRequest}
                            data={results || []}
                        />
                    )}
                </CustomTabItem>
                <CustomTabItem eventKey="columns" title="Columns">
                    <ColumnsTable
                        result={fileResult}
                        isLoaded={fileIsLoaded || false}
                        error={error}
                        tab={tab}
                    />
                </CustomTabItem>
            </CustomTabs>
        </Fragment>
    );
};

export default TabPane;