import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import searchLogo from "bootstrap-icons/icons/search.svg";
import species from "./Species";

export default function Navv() {
    const [value, setValue] = React.useState("SaccharomycescerevisiaeS288c");

    function handleChange(event) {
        setValue(species[event]);
    }

    function mapSpecies() {
        let l = [];
        for (let i = 0; i < species.length; i++) {
            let el = species[i];
            l.push(
                <NavDropdown.Item key={i} eventKey={i} href="#">
                    {el}
                </NavDropdown.Item>
            );
        }
        return l;
    }

    const speciesMenu = React.useMemo(mapSpecies, []);

    return (
        <Navbar expand="lg" className="bg-body-tertiary mb-3">
            <Container>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Navbar.Brand href="#">YEASTRACT+</Navbar.Brand>
                        <NavDropdown
                            title={"Species: " + value}
                            id="species-dropdown"
                            onSelect={handleChange}
                        >
                            {speciesMenu}
                        </NavDropdown>
                        <Nav.Link href="/">Regulations</Nav.Link>
                        <Nav.Link href="/">Sequences</Nav.Link>
                        <Nav.Link href="/">Advanced Search</Nav.Link>
                        <Nav.Link href="/">About</Nav.Link>
                        <Nav.Link href="/">Help</Nav.Link>
                    </Nav>
                    <Form>
                        <Row>
                            <Col xs="auto">
                                <Form.Control
                                    type="text"
                                    placeholder="Search"
                                    className=" mr-sm-2"
                                />
                            </Col>
                            <Col xs="auto">
                                <Button
                                    variant="outline-secondary"
                                    type="submit"
                                >
                                    <Image
                                        src={searchLogo}
                                        alt="quick-search"
                                        fluid
                                    />
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        // <Navbar expand="lg" className="bg-body-secondary mb-3">
        //     <Container>
        //         <Nav className="me-auto">
        //             <NavDropdown
        //                 title={value}
        //                 id="dropdown"
        //                 onSelect={handleChange}
        //             >
        //                 {speciesMenu}
        //             </NavDropdown>
        //         </Nav>
        //         <Navbar.Brand href="#">YEASTRACT+</Navbar.Brand>
        //     </Container>
        // </Navbar>
    );
}
