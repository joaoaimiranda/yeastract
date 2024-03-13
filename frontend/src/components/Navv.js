import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
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
                <Nav className="me-auto">
                    <NavDropdown
                        title={value}
                        id="dropdown"
                        onSelect={handleChange}
                    >
                        {speciesMenu}
                    </NavDropdown>
                </Nav>
                <Navbar.Brand href="#">YEASTRACT+</Navbar.Brand>
            </Container>
        </Navbar>
    );
}
