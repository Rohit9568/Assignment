// header.jsx
import { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faBars } from "@fortawesome/free-solid-svg-icons";

import { getPropTypes, openNewTab } from "../../utils";
import logoSvg from "../../logo.svg";

function Header(props) {
    const hasTabs = props.tabs && props.tabs.length > 0;

    return (
        <Navbar className="shadow-sm" bg="light" expand="lg">
            <Container fluid>
              
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                    <Navbar.Text>
                        {hasTabs && (
                            <>
                                <Button
                                    variant={"outline-primary"}
                                    onClick={() => {
                                        openNewTab(
                                            {
                                                title: `Query ${props.queryCount}`,
                                                entries: [],
                                            },
                                            props.tabs,
                                            props.setTabs,
                                            props.setActiveKey
                                        );
                                        props.setQueryCount(props.queryCount + 1);
                                    }}
                                    style={{ marginRight: "1rem" }}
                                >
                                    <FontAwesomeIcon icon={faPlus} /> New Query
                                </Button>
                                <Button
                                    variant={"outline-primary"}
                                    className="d-lg-none"
                                    onClick={() => {
                                        props.setSidebarOpen(!props.sidebarOpen);
                                    }}
                                    aria-controls="sidebar"
                                    aria-expanded={props.sidebarOpen}
                                >
                                    <FontAwesomeIcon icon={faBars} />
                                </Button>
                                <Button
                                    variant={"outline-primary"}
                                    className="d-none d-lg-inline-block"
                                    onClick={() => {
                                        props.setSidebarOpen(!props.sidebarOpen);
                                    }}
                                    aria-controls="sidebar"
                                    aria-expanded={props.sidebarOpen}
                                >
                                    <FontAwesomeIcon icon={faBars} /> Toggle Sidebar
                                </Button>
                                {/* Fullscreen button is now in the main content */}
                            </>
                        )}
                    </Navbar.Text>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}

Header.propTypes = getPropTypes(
    "queryCount",
    "tabs",
    "setTabs",
    "setActiveKey",
    "setQueryCount",
    "setSidebarOpen",
    "sidebarOpen",
    "onToggleFullscreen"
);

export default Header;