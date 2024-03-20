import React from "react";
// import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
// import Stack from "react-bootstrap/Stack";
// import Image from "react-bootstrap/Image";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
// import searchLogo from "bootstrap-icons/icons/search.svg";

export default function Sidebar() {
    const [formData, setFormData] = React.useState({
        tfs: "",
        genes: "",
        documented: true,
        binding: false,
        expression: true,
        activator: true,
        inhibitor: true,
        noexprinfo: false,
        potential: false,
        envconGroup: "",
        envconSubgroup: "",
        synteny: 0,
        crossSpecies: false,
        homolog: "",
    });

    function handleForm(event) {
        const { id, value, checked, type } = event.target;
        console.log(id);
        setFormData((prevData) => ({
            ...prevData,
            [id]: type === "checkbox" ? checked : value,
        }));
    }

    function handleQuery(event) {
        event.preventDefault();
        console.log(formData);
    }

    return (
        <Row className="border-end pe-2 ms-2">
            <Form onSubmit={handleQuery}>
                <Button className="ms-3 mb-3" type="submit">
                    Search
                </Button>
                <Row>
                    <Col className="ms-3">
                        <Form.Group className="mb-3" controlId="tfs">
                            <Form.Label>TFs</Form.Label>
                            <Form.Control
                                as="textarea"
                                onChange={handleForm}
                                rows={4}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="genes">
                            <Form.Label>Target Genes</Form.Label>
                            <Form.Control
                                as="textarea"
                                onChange={handleForm}
                                rows={4}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="ms-2 mb-2">
                    <h5 className="mb-3">Evidence</h5>
                    <Form.Check
                        onChange={handleForm}
                        className="mb-3"
                        type={"checkbox"}
                        id={"documented"}
                        label={"Documented"}
                        checked={formData.documented}
                    />
                    <Form.Check
                        className="mb-3 ms-3"
                        onChange={handleForm}
                        type={"checkbox"}
                        id={"binding"}
                        label={"Binding"}
                        disabled={!formData.documented}
                        checked={formData.binding}
                    />
                    <Form.Check
                        onChange={handleForm}
                        className="mb-3 ms-3"
                        type={"checkbox"}
                        id={"expression"}
                        label={"Expression"}
                        disabled={!formData.documented}
                        checked={formData.expression}
                    />
                    <Form.Check
                        onChange={handleForm}
                        className="mb-3 ms-5"
                        type={"checkbox"}
                        id={"activator"}
                        label={"TF as activator"}
                        disabled={!formData.expression || !formData.documented}
                        checked={formData.activator}
                    />
                    <Form.Check
                        onChange={handleForm}
                        className="mb-3 ms-5"
                        type={"checkbox"}
                        id={"inhibitor"}
                        label={"TF as inhibitor"}
                        disabled={!formData.expression || !formData.documented}
                        checked={formData.inhibitor}
                    />
                    <Form.Check
                        onChange={handleForm}
                        className="mb-3"
                        type={"checkbox"}
                        id={"potential"}
                        label={"Potential"}
                        checked={formData.potential}
                    />
                </Row>
                <Row>
                    <h5>Environmental Condition</h5>
                    <Form.Select
                        onChange={handleForm}
                        id="envconGroup"
                        className="mb-3"
                        aria-label="Environmental Condition Filter"
                        disabled={!formData.documented}
                    >
                        <option value="0">Choose</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </Form.Select>
                    <h5>Synteny</h5>
                    <Form.Select
                        onChange={handleForm}
                        id="synteny"
                        className="mb-3"
                        aria-label="Synteny Filter"
                    >
                        <option value="0">BLAST Best-Scores</option>
                        <option value="1">
                            BLAST Best-Scores + at least 1 neighbor
                        </option>
                        <option value="2">
                            BLAST Best-Scores + at least 2 neighbor
                        </option>
                        <option value="3">
                            BLAST Best-Scores + at least 3 neighbor
                        </option>
                    </Form.Select>
                    <Form.Check
                        onClick={handleForm}
                        className="mb-3"
                        type="switch"
                        id="crossSpecies"
                        label="Cross Species?"
                    />
                    {formData.crossSpecies && (
                        <>
                            <h5>Homologous Relations</h5>
                            <Form.Select
                                onChange={handleForm}
                                id="homolog"
                                className="mt-3 mb-3"
                                aria-label="Homologous Relations Select"
                            >
                                <option>Choose</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                            </Form.Select>
                        </>
                    )}
                </Row>
            </Form>
        </Row>
        // <Nav defaultActiveKey="/" className="flex-column ms-3">
        //     <Form>
        //         <Stack direction="horizontal" gap={3}>
        //             <Form.Control type="text" placeholder="Search" />
        //             <Button variant="outline-secondary" type="submit">
        //                 <Image src={searchLogo} alt="quick-search" fluid />
        //             </Button>
        //         </Stack>
        //     </Form>
        //     <Nav.Link
        //         className="mb-3 text-secondary text-decoration-underline"
        //         href="/"
        //     >
        //         Advanced search
        //     </Nav.Link>
        //     <Nav.Item className="mb-3 bg-body-secondary rounded">
        //         <Nav.Link className="text-secondary-emphasis" href="/">
        //             Regulations
        //         </Nav.Link>
        //     </Nav.Item>
        //     <Nav.Item className="mb-3 bg-body-secondary rounded">
        //         <Nav.Link className="text-secondary-emphasis" eventKey="link-1">
        //             Sequences
        //         </Nav.Link>
        //     </Nav.Item>
        //     <Nav.Item className="mb-3 bg-body-secondary rounded">
        //         <Nav.Link className="text-secondary-emphasis" eventKey="link-2">
        //             About
        //         </Nav.Link>
        //     </Nav.Item>
        //     <Nav.Item className="mb-3 bg-body-secondary rounded">
        //         <Nav.Link className="text-secondary-emphasis" eventKey="link-3">
        //             Help
        //         </Nav.Link>
        //     </Nav.Item>
        // </Nav>
    );
}
