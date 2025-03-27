// src/components/navigation/sideBar.jsx
import { useState, useRef, useEffect } from "react";
import CloseButton from "react-bootstrap/CloseButton";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronRight, faTable, faHistory } from "@fortawesome/free-solid-svg-icons"; // Import faHistory

import FILE_NAMES from "../../data/fileNames";
import { closeTab, getPropTypes, openNewTab } from "../../utils";

function SideBar(props) {
    const {
        activeKey = '',
        tabs = [],
        setTabs = () => {},
        setActiveKey = () => {},
        mobile = false,
        onTableClick, // Add the onTableClick prop
        queryHistory: initialQueryHistory = [], // Receive initial queryHistory
        onHistoryItemClick // Receive onHistoryItemClick
    } = props;

    // State for sidebar width
    const [sidebarWidth, setSidebarWidth] = useState(250);
    const sidebarRef = useRef(null);
    const isResizing = useRef(false);

    // State for local recent queries
    const [localRecentQueries, setLocalRecentQueries] = useState(() => {
        return initialQueryHistory;
    });

    // Update localRecentQueries when initialQueryHistory prop changes
    useEffect(() => {
        setLocalRecentQueries(initialQueryHistory);
    }, [initialQueryHistory]);

    // Drag to resize
    const handleMouseDown = (e) => {
        e.preventDefault();
        isResizing.current = true;

        const startX = e.clientX;
        const startWidth = sidebarWidth;

        const onMouseMove = (e) => {
            if (!isResizing.current) return;
            let newWidth = startWidth + (e.clientX - startX);
            if (newWidth < 150) newWidth = 150; // Minimum width
            if (newWidth > 400) newWidth = 400; // Maximum width
            setSidebarWidth(newWidth);
        };

        const onMouseUp = () => {
            isResizing.current = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleTableClick = (fileName) => {
        const defaultQuery = `SELECT * FROM \`${fileName}\`;`; // Removed LIMIT 10
        openNewTab(
            {
                title: fileName, // Set the tab title to the table name
                content: defaultQuery, // Set the initial query content
                entries: [],
            },
            tabs,
            setTabs,
            setActiveKey,
            fileName // Pass the table name as eventKey for easier identification
        );
        if (onTableClick) {
            onTableClick(fileName); // Call the function passed from App
        }

        // Update recent queries, but only if it's not already present
        if (!localRecentQueries.some(item => item.title === fileName)) {
            setLocalRecentQueries([{ id: Date.now(), title: fileName, query: defaultQuery }, ...localRecentQueries]);
        }
    };

    const handleHistoryItemClickLocal = (item) => {
        onHistoryItemClick(item);
        // No need to add to recent queries again if clicking on a history item
    };

    const menuLinks = (FILE_NAMES || []).map((fileName) => (
        <Row className="nav-item" key={fileName}>
            <Col>
                <a
                    href={`/${fileName}`}
                    className={fileName === activeKey ? "nav-link active" : "nav-link"}
                    onClick={(e) => {
                        e.preventDefault();
                        handleTableClick(fileName);
                    }}
                >
                    <FontAwesomeIcon icon={fileName === activeKey ? faChevronDown : faChevronRight} />{" "}
                    <FontAwesomeIcon icon={faTable} /> {fileName}
                </a>
            </Col>
        </Row>
    ));

    const historyItems = (localRecentQueries || []).map(item => (
        <Row className="nav-item" key={item.id}>
            <Col>
                <a
                    href={`/history/${item.id}`}
                    className="nav-link"
                    onClick={(e) => {
                        e.preventDefault();
                        handleHistoryItemClickLocal(item);
                    }}
                >
                    <FontAwesomeIcon icon={faHistory} /> {item.title || item.query?.substring(0, 20) + "..."}
                </a>
            </Col>
        </Row>
    ));

    return (
        <div style={{ display: "flex" }}>
            <Container
                ref={sidebarRef}
                fluid
                style={{
                    width: sidebarWidth,
                    height: `${mobile ? "100%" : "calc(100vh - 8rem)"}`,
                    transition: isResizing.current ? "none" : "width 0.2s ease",
                    overflowX: "hidden"
                }}
                className={`sidebar ${isResizing.current ? "resizing" : ""}`}
                id={`sidebar${mobile ? "mobile" : ""}`}
            >
                <p className="text-secondary heading mt-3">All Tables</p>
                <Container fluid className="tableLinks">{menuLinks}</Container>
                <hr />
                <p className="text-secondary heading mt-3">Recent Queries</p> {/* Changed heading */}
                <Container fluid className="historyLinks">{historyItems}</Container> {/* Render history */}
                {/* <hr />
                <p className="text-secondary heading mt-3">Open Tabs</p>
                <Container fluid className="tabLinks">{openTabs}</Container> */}
            </Container>
            {/* Drag handle */}
            <div
                className="drag-handle"
                onMouseDown={handleMouseDown}
            />
        </div>
    );
}

SideBar.propTypes = getPropTypes("activeKey", "tabs", "setTabs", "setActiveKey", "mobile", "onTableClick", "queryHistory", "onHistoryItemClick"); // Add propTypes

export default SideBar;