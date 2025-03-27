import { useState, Suspense, lazy, useEffect, useRef } from "react";
import "./App.css";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Collapse from "react-bootstrap/Collapse";
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faExpandAlt, faBars, faCompressAlt } from "@fortawesome/free-solid-svg-icons";
import Card from 'react-bootstrap/Card';
import Header from './components/navigation/header';
import QueryTabs from './components/tabs';
import SideBar from './components/navigation/sideBar';
import { addTab } from "./utils";
import logoSvg from "./logo.svg";

const QuerySpace = lazy(() => import('./components/query/querySpace'));

const LoadingFallback = () => (
    <div className="text-center p-4">
        <Spinner animation="border" role="status" variant="primary" />
        <p className="mt-2">Loading component...</p>
    </div>
);

const ErrorFallback = ({ componentName }) => (
    <div className="alert alert-danger m-3">
        <h4>Error: Failed to load {componentName} component</h4>
        <p>Please check the console for more details.</p>
    </div>
);

const LOCAL_STORAGE_KEY = 'sqlEditorState';

function App() {
    const [appStateFromStorage, setAppStateFromStorage] = useState(() => {
        try {
            const storedState = localStorage.getItem(LOCAL_STORAGE_KEY);
            return storedState ? JSON.parse(storedState) : {};
        } catch (error) {
            console.error("Error loading initial state from localStorage:", error);
            return {};
        }
    });

    const [activeKey, setActiveKey] = useState(appStateFromStorage.activeKey || "");
    const [tabs, setTabs] = useState(appStateFromStorage.tabs || []);
    const [queryCount, setQueryCount] = useState(appStateFromStorage.queryCount || 1);
    const [sidebarOpen, setSidebarOpen] = useState(!!appStateFromStorage.tabs?.length);
    const [isFullscreenEnabled, setIsFullscreenEnabled] = useState(false);
    const tabPaneRefs = useRef({});
    const [queryHistory, setQueryHistory] = useState(appStateFromStorage.queryHistory || []); // Load queryHistory

    useEffect(() => {
        try {
            const stateToSave = JSON.stringify({ tabs, activeKey, queryCount, queryHistory }); // Save queryHistory
            localStorage.setItem(LOCAL_STORAGE_KEY, stateToSave);
        } catch (error) {
            console.error("Error saving state to localStorage:", error);
        }
    }, [tabs, activeKey, queryCount, queryHistory]); // Include queryHistory in dependency array

    const handleTrueFullscreenToggle = () => {
        setIsFullscreenEnabled(!isFullscreenEnabled);
        const element = document.documentElement;
        if (!isFullscreenEnabled) {
            element.requestFullscreen?.() || element.mozRequestFullScreen?.() || element.webkitRequestFullscreen?.() || element.msRequestFullscreen?.();
        } else {
            document.exitFullscreen?.() || document.mozCancelFullScreen?.() || document.webkitExitFullscreen?.() || document.msExitFullscreen?.();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            !document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement && setIsFullscreenEnabled(false);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const addToQueryHistory = (query, title) => {
        const newHistoryItem = { id: Date.now(), query, title, timestamp: new Date() };
        setQueryHistory(prevHistory => {
            // Check if an item with the same title already exists
            if (prevHistory.some(item => item.title === title)) {
                return prevHistory; // Don't add if it already exists
            }
            return [newHistoryItem, ...prevHistory].slice(0, 15);
        });
    };

    const handleAddFirstTab = () => {
        try {
            const newQueryTitle = `New Query ${queryCount}`;
            const [newTabs, newActiveKey] = addTab(tabs, newQueryTitle, "", queryCount);
            setTabs(newTabs);
            setActiveKey(newActiveKey);
            setQueryCount(queryCount + 1);
            setSidebarOpen(true);
            addToQueryHistory("", newQueryTitle);
        } catch (error) {
            console.error("Error adding new tab:", error);
        }
    };

    const handleTableClick = (tableName) => {
        const defaultQuery = `SELECT * FROM \`${tableName}\`;`;
        const newTab = { title: tableName, content: defaultQuery, eventKey: tableName, id: tableName };
        const existingTabIndex = tabs.findIndex(tab => tab.eventKey === tableName);

        if (existingTabIndex > -1) {
            const updatedTabs = [...tabs];
            updatedTabs[existingTabIndex] = { ...updatedTabs[existingTabIndex], content: defaultQuery };
            setTabs(updatedTabs);
            setActiveKey(tableName);
        } else {
            setTabs([...tabs, newTab]);
            setActiveKey(tableName);
            setSidebarOpen(true);
        }
        addToQueryHistory(defaultQuery, tableName);
    };

    const handleHistoryItemClick = (historyItem) => {
        const { query, title } = historyItem;
        const existingTab = tabs.find(tab => tab.content === query);
        if (existingTab) {
            setActiveKey(existingTab.eventKey);
        } else {
            const newTab = { title, content: query, eventKey: `history-${historyItem.id}`, id: `history-${historyItem.id}` };
            setTabs([...tabs, newTab]);
            setActiveKey(newTab.eventKey);
            setSidebarOpen(true);
        }
        // Importantly, do NOT call addToQueryHistory here
    };

    return (
        <div className={isFullscreenEnabled ? 'app-fullscreen' : ''}>
            {tabs.length > 0 && !isFullscreenEnabled && (
                <Navbar bg="light" expand="lg" className="shadow-sm">
                    <Container fluid>
                        <Navbar.Brand href="#home" className="d-flex align-items-center">
                            <img src={logoSvg} alt="SQL Editor Logo" height={30} className="me-2" />
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                            <Header
                                activeKey={activeKey}
                                setActiveKey={setActiveKey}
                                tabs={tabs}
                                setTabs={setTabs}
                                queryCount={queryCount}
                                setQueryCount={setQueryCount}
                                sidebarOpen={sidebarOpen}
                                setSidebarOpen={setSidebarOpen}
                            />
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            )}

            <Container fluid className={`h-100 ${isFullscreenEnabled ? 'fullscreen-container' : ''}`}>
                <Row className="h-100">
                    {!isFullscreenEnabled && (
                        <Col md={3} lg={2} className="bg-light border-end sidebar-fixed">
                            <Collapse in={sidebarOpen} dimension="width">
                                <div style={{ width: '250px' }}>
                                    <SideBar
                                        activeKey={activeKey}
                                        setActiveKey={setActiveKey}
                                        tabs={tabs}
                                        setTabs={setTabs}
                                        mobile={!sidebarOpen}
                                        onTableClick={handleTableClick}
                                        queryHistory={queryHistory}
                                        onHistoryItemClick={handleHistoryItemClick}
                                    />
                                </div>
                            </Collapse>
                        </Col>
                    )}
                    <Col
                        md={!isFullscreenEnabled ? (sidebarOpen ? 9 : 12) : 12}
                        lg={!isFullscreenEnabled ? (sidebarOpen ? 10 : 12) : 12}
                        className={`p-3 d-flex flex-column h-100 ${isFullscreenEnabled ? 'fullscreen-content' : ''}`}
                    >
                        <div className="d-flex justify-content-end mb-2">
                            {tabs.length > 0 && (
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={handleTrueFullscreenToggle}
                                >
                                    <FontAwesomeIcon icon={isFullscreenEnabled ? faCompressAlt : faExpandAlt} />
                                    {isFullscreenEnabled ? 'Exit Fullscreen' : 'Fullscreen'}
                                </Button>
                            )}
                        </div>
                        <Suspense fallback={<LoadingFallback />}>
                            {tabs.length > 0 && (
                                <QueryTabs
                                    tabs={tabs}
                                    setTabs={setTabs}
                                    activeKey={activeKey}
                                    setActiveKey={setActiveKey}
                                    isQuerySpaceFullscreen={isFullscreenEnabled}
                                    onTabClose={(tabId) => {
                                        const newTabs = tabs.filter(tab => tab.eventKey !== tabId);
                                        setTabs(newTabs);
                                        if (newTabs.length === 0) {
                                            setSidebarOpen(false);
                                        } else if (activeKey === tabId && newTabs.length > 0) {
                                            setActiveKey(newTabs[0].eventKey);
                                        }
                                    }}
                                />
                            )}
                        </Suspense>
                        {tabs.length === 0 && (
                            <div className="mt-4">
                                <div className="card border-primary">
                                    <div className="card-header bg-primary text-white">
                                        <h4 className="mb-0">Welcome to the Modern SQL Editor</h4>
                                    </div>
                                    <div className="card-body">
                                        <h5 className="card-title">Get started with SQL queries</h5>
                                        <p className="card-text">
                                            Click the button below to create your first SQL query.
                                            Use the toggle button ( <FontAwesomeIcon icon={faBars} /> ) in the header to show/hide the sidebar and explore tables.
                                        </p>
                                        <ul className="list-group list-group-flush mb-3">
                                            <li className="list-group-item">✅ Modern SQL editor with syntax highlighting</li>
                                            <li className="list-group-item">✅ Tab-based interface for multiple queries</li>
                                            <li className="list-group-item">✅ Light and dark editor themes</li>
                                            <li className="list-group-item">✅ View tables and query results</li>
                                        </ul>
                                        <Button
                                            className="btn btn-primary"
                                            onClick={handleAddFirstTab}
                                        >
                                            Start Your First Query
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default App;