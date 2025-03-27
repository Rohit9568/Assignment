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
                    { employee_id: 5, first_name: "Charlie", last_name: "Brown", title: "Marketing Specialist", hire_date: "2019-11-30", salary: 63000 },
                    { employee_id: 6, first_name: "Eva", last_name: "Martinez", title: "Accountant", hire_date: "2022-05-10", salary: 60000 },
                    { employee_id: 7, first_name: "David", last_name: "Garcia", title: "Project Manager", hire_date: "2021-09-01", salary: 88000 },
                    { employee_id: 8, first_name: "Sophia", last_name: "Lee", title: "UX Designer", hire_date: "2023-01-20", salary: 72000 },
                    { employee_id: 9, first_name: "Daniel", last_name: "Wilson", title: "Data Analyst", hire_date: "2022-07-18", salary: 68000 },
                    { employee_id: 10, first_name: "Olivia", last_name: "Taylor", title: "Customer Support", hire_date: "2020-04-05", salary: 55000 }
                ];
            } else if (queryLower.includes('customer')) {
                mockResults = [
                    { customer_id: "ALFKI", company_name: "Alfreds Futterkiste", contact_name: "Maria Anders", country: "Germany" },
                    { customer_id: "ANATR", company_name: "Ana Trujillo Emparedados", contact_name: "Ana Trujillo", country: "Mexico" },
                    { customer_id: "ANTON", company_name: "Antonio Moreno Taquería", contact_name: "Antonio Moreno", country: "Mexico" },
                    { customer_id: "AROUT", company_name: "Around the Horn", contact_name: "Thomas Hardy", country: "UK" },
                    { customer_id: "BERGS", company_name: "Berglunds snabbköp", contact_name: "Christina Berglund", country: "Sweden" },
                    { customer_id: "BLAUS", company_name: "Blauer See Delikatessen", contact_name: "Hanna Moos", country: "Germany" },
                    { customer_id: "BLONP", company_name: "Blondel père et fils", contact_name: "Frédérique Citeaux", country: "France" },
                    { customer_id: "BOLID", company_name: "Bólido Comidas preparadas", contact_name: "Martín Sommer", country: "Spain" },
                    { customer_id: "BONAP", company_name: "Bon app'", contact_name: "Laurence Lebihan", country: "France" },
                    { customer_id: "BOTTM", company_name: "Bottom-Dollar Markets", contact_name: "Elizabeth Lincoln", country: "Canada" },
                    { customer_id: "BSBEV", company_name: "B's Beverages", contact_name: "Victoria Ashworth", country: "UK" },
                    { customer_id: "CACTU", company_name: "Cactus Comidas para llevar", contact_name: "Patricio Simpson", country: "Argentina" },
                    { customer_id: "CENTC", company_name: "Centro comercial Moctezuma", contact_name: "Francisco Chang", country: "Mexico" },
                    { customer_id: "CHOPS", company_name: "Chop-suey Chinese", contact_name: "Yang Wang", country: "Switzerland" },
                    { customer_id: "COMMI", company_name: "Comércio Mineiro", contact_name: "Pedro Afonso", country: "Brazil" }
                ];
            } else if (queryLower.includes('order')) {
                mockResults = [
                    { order_id: 10248, customer_id: "VINET", employee_id: 5, order_date: "1996-07-04" },
                    { order_id: 10249, customer_id: "TOMSP", employee_id: 6, order_date: "1996-07-05" },
                    { order_id: 10250, customer_id: "HANAR", employee_id: 4, order_date: "1996-07-08" },
                    { order_id: 10251, customer_id: "VICTE", employee_id: 3, order_date: "1996-07-09" },
                    { order_id: 10252, customer_id: "SUPRD", employee_id: 4, order_date: "1996-07-10" },
                    { order_id: 10253, customer_id: "HANAR", employee_id: 3, order_date: "1996-07-11" },
                    { order_id: 10254, customer_id: "CHOPS", employee_id: 5, order_date: "1996-07-12" },
                    { order_id: 10255, customer_id: "RICSU", employee_id: 9, order_date: "1996-07-15" },
                    { order_id: 10256, customer_id: "WELLI", employee_id: 3, order_date: "1996-07-16" },
                    { order_id: 10257, customer_id: "HILAA", employee_id: 4, order_date: "1996-07-17" }
                ];
            } else if (queryLower.includes('product')) {
                mockResults = [
                    { product_id: 1, product_name: "Chai", category_id: 1, unit_price: 18.00 },
                    { product_id: 2, product_name: "Chang", category_id: 1, unit_price: 19.00 },
                    { product_id: 3, product_name: "Aniseed Syrup", category_id: 2, unit_price: 10.00 },
                    { product_id: 4, product_name: "Chef Anton's Cajun Seasoning", category_id: 2, unit_price: 22.00 },
                    { product_id: 5, product_name: "Gumbo Mix", category_id: 2, unit_price: 21.35 },
                    { product_id: 6, product_name: "Grandma's Boysenberry Spread", category_id: 2, unit_price: 25.00 },
                    { product_id: 7, product_name: "Uncle Bob's Organic Dried Pears", category_id: 7, unit_price: 30.00 },
                    { product_id: 8, product_name: "Northwoods Cranberry Sauce", category_id: 2, unit_price: 40.00 },
                    { product_id: 9, product_name: "Mishi Kobe Niku", category_id: 6, unit_price: 97.00 },
                    { product_id: 10, product_name: "Ikura", category_id: 8, unit_price: 31.00 }
                ];
            } else {
                // Default mock data if table can't be determined
                mockResults = [
                    { id: 1, name: "Sample Record 1", value: "Data 1", amount: 100 },
                    { id: 2, name: "Sample Record 2", value: "Data 2", amount: 200 },
                    { id: 3, name: "Sample Record 3", value: "Data 3", amount: 300 },
                    { id: 4, name: "Sample Record 4", value: "Data 4", amount: 400 },
                    { id: 5, name: "Sample Record 5", value: "Data 5", amount: 500 },
                    { id: 6, name: "Sample Record 6", value: "Data 6", amount: 600 },
                    { id: 7, name: "Sample Record 7", value: "Data 7", amount: 700 },
                    { id: 8, name: "Sample Record 8", value: "Data 8", amount: 800 },
                    { id: 9, name: "Sample Record 9", value: "Data 9", amount: 900 },
                    { id: 10, name: "Sample Record 10", value: "Data 10", amount: 1000 }
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