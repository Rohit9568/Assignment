// src/components/tabs/QueryTabs.jsx
import { Tabs, Tab } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Container from "react-bootstrap/Container";
import CloseButton from "react-bootstrap/CloseButton";
import Row from "react-bootstrap/Row";
import { closeTab, getPropTypes } from "../../utils";
import TabPane from "./TabPane";

/**
 * The component with the tabs shown in the query space.
 */
const QueryTabs = (props) => {
    const handleTabClose = (eventKey, event) => {
        event.stopPropagation();
        if (props.onTabClose) {
            props.onTabClose(eventKey); // Call the onTabClose prop from App.jsx
        } else {
            const [newTabs, newActiveKey] = closeTab(eventKey, props.tabs);
            props.setTabs(newTabs);
            props.setActiveKey(newActiveKey);
        }
    };

    // If there are no open tabs currently.
    if (props.tabs.length === 0) {
        return (
            <Container className="h-100">
                <Row className="justify-content-center h-100 align-items-center">
                    <h4 className="text-secondary text-center align-self-center">
                        Nothing to display. Begin a new query or click on one of the tables
                    </h4>
                </Row>
            </Container>
        );
    }

    return (
        <Tabs
            activeKey={props.activeKey}
            onSelect={(key) => props.setActiveKey(key)}
            className="mb-3"
        >
            {props.tabs.map((tab) => (
                <Tab
                    key={tab.eventKey}
                    eventKey={tab.eventKey}
                    title={
                        <span>
                            {tab.title}{" "}
                            <CloseButton
                                style={{ fontSize: "0.5rem" }}
                                onClick={(e) => handleTabClose(tab.eventKey, e)}
                            />
                        </span>
                    }
                >
                    <TabPane tab={tab} />
                </Tab>
            ))}
        </Tabs>
    );
};

QueryTabs.propTypes = getPropTypes(
    "activeKey",
    "tabs",
    "setTabs",
    "setActiveKey",
    "onTabClose" // Added onTabClose prop
);

export default QueryTabs;