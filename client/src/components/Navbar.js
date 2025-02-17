import React, { useState, useContext } from "react";
import "../styles/Navbar.css";
import { Navbar, Nav, Container, Modal, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SignupForm from './SignupForm';
import LoginForm from './LoginForm';
import { DarkModeContext } from '../context/DarkModeContext';
import Auth from '../utils/auth';

function AppNavbar() {
    // Set modal display state
    const [showModal, setShowModal] = useState(false);
    const { toggleDarkMode, darkMode } = useContext(DarkModeContext)

    return (
        <>
            <Navbar collapseOnSelect expand="xl" variant="dark">
                <Container className="navCon">
                    {!Auth.loggedIn() ? (
                        <Navbar.Brand className="jj">Journey Journals</Navbar.Brand>
                    ) : (
                        <Navbar.Brand className="jj darkButton" onClick={toggleDarkMode}>{Auth.getProfile().data.username}'s Journey Journals</Navbar.Brand>
                    )}
                    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                    <Navbar.Collapse id="responsive-navbar-nav">
                        <Nav className="me-auto">
                            {/* If logged in, render all accessible tabs in navbar */}
                            {Auth.loggedIn() ? (
                                <>
                                    <Link className=" navLinks" to="/travelfeed">
                                        Feed
                                    </Link>

                                    <Link className=" navLinks" to="/me">
                                        Profile
                                    </Link>

                                    <Link className=" navLinks" to="/logout" onClick={Auth.logout}>
                                        Logout
                                    </Link>
                                </>
                            ) : (
                                <Link className=" navLinks" to="/" onClick={() => setShowModal(true)}>Login</Link>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Set modal data up */}
            <Modal
                size='lg'
                show={showModal}
                onHide={() => setShowModal(false)}
                aria-labelledby='signup-modal'
                centered>

                {/* Tab container to do either signup or login component */}
                <Tab.Container defaultActiveKey='login'>
                    <Modal.Header closeButton>
                        <Modal.Title id='login-modal'>
                            <Nav variant='pills'>
                                <Nav.Item>
                                    <Nav.Link className="something2" eventKey='login'>Login</Nav.Link>
                                </Nav.Item>
                                <Nav.Item>
                                    <Nav.Link className="something2" eventKey='signup'>Sign Up</Nav.Link>
                                </Nav.Item>
                            </Nav>
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Tab.Content>
                            <Tab.Pane eventKey='login'>
                                <LoginForm handleModalClose={() => setShowModal(false)} />
                            </Tab.Pane>
                            <Tab.Pane eventKey='signup'>
                                <SignupForm handleModalClose={() => setShowModal(false)} />
                            </Tab.Pane>
                        </Tab.Content>
                    </Modal.Body>
                </Tab.Container>
            </Modal>
        </>
    );
}

export default AppNavbar;