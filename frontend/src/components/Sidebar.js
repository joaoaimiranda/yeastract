import React from "react";
import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Stack from "react-bootstrap/Stack";
import Image from "react-bootstrap/Image";
import searchLogo from "bootstrap-icons/icons/search.svg";

export default function Sidebar() {
    return (
        <Nav defaultActiveKey="/" className="flex-column ms-3">
            <Form>
                <Stack direction="horizontal" gap={3}>
                    <Form.Control type="text" placeholder="Search" />
                    <Button variant="outline-secondary" type="submit">
                        <Image src={searchLogo} alt="quick-search" fluid />
                    </Button>
                </Stack>
            </Form>
            <Nav.Link
                className="mb-3 text-secondary text-decoration-underline"
                href="/"
            >
                Advanced search
            </Nav.Link>
            <Nav.Item className="mb-3 bg-body-secondary rounded">
                <Nav.Link className="text-secondary-emphasis" href="/">
                    Regulations
                </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-3 bg-body-secondary rounded">
                <Nav.Link className="text-secondary-emphasis" eventKey="link-1">
                    Sequences
                </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-3 bg-body-secondary rounded">
                <Nav.Link className="text-secondary-emphasis" eventKey="link-2">
                    About
                </Nav.Link>
            </Nav.Item>
            <Nav.Item className="mb-3 bg-body-secondary rounded">
                <Nav.Link className="text-secondary-emphasis" eventKey="link-3">
                    Help
                </Nav.Link>
            </Nav.Item>
        </Nav>
    );
}
