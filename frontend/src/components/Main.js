import React from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import swapLogo from "bootstrap-icons/icons/arrow-left-right.svg";
import networkLogo from "bootstrap-icons/icons/share-fill.svg";
import matrixLogo from "bootstrap-icons/icons/grid-3x3.svg";
import downloadLogo from "bootstrap-icons/icons/download.svg";
import hamburgerLogo from "bootstrap-icons/icons/list.svg";

export default function Main() {
    const [crossSpecies, setCrossSpecies] = React.useState(false);
    const [documented, setDocumented] = React.useState(true);
    const [expression, setExpression] = React.useState(false);

    return (
        <Form>
            <Row className="border-bottom mb-3">
                <Col className="ms-3">
                    <Form.Group className="mb-3" controlId="TF.ControlTextarea">
                        <Form.Label>TFs</Form.Label>
                        <Form.Control as="textarea" rows={6} />
                    </Form.Group>
                </Col>
                <Col>
                    <Form.Group
                        className="mb-3"
                        controlId="Gene.ControlTextarea"
                    >
                        <Form.Label>Target Genes</Form.Label>
                        <Form.Control as="textarea" rows={6} />
                    </Form.Group>
                </Col>
                <Col>
                    <h6 className="mb-3">Evidence</h6>
                    <Form.Check
                        onChange={(e) => setDocumented(e.target.checked)}
                        className="mb-3"
                        type={"checkbox"}
                        id={"evidence-documented-checkbox"}
                        label={"Documented"}
                        checked={documented}
                    />
                    <Form.Check
                        className="mb-3 ms-3"
                        type={"checkbox"}
                        id={"evidence-documented-binding-checkbox"}
                        label={"Binding"}
                        disabled={!documented}
                    />
                    <Form.Check
                        onClick={(e) => setExpression(e.target.checked)}
                        className="mb-3 ms-3"
                        type={"checkbox"}
                        id={"evidence-documented-expression-checkbox"}
                        label={"Expression"}
                        disabled={!documented}
                    />
                    <Form.Check
                        className="mb-3 ms-5"
                        type={"checkbox"}
                        id={"evidence-documented-expression-activator-checkbox"}
                        label={"TF as activator"}
                        disabled={!expression}
                    />
                    <Form.Check
                        className="mb-3 ms-5"
                        type={"checkbox"}
                        id={"evidence-documented-expression-inhibitor-checkbox"}
                        label={"TF as inhibitor"}
                        disabled={!expression}
                    />
                    <Form.Check
                        className="mb-3"
                        type={"checkbox"}
                        id={"evidence-potential-checkbox"}
                        label={"Potential"}
                    />
                </Col>
                <Col>
                    <h6>Environmental Condition</h6>
                    <Form.Select
                        className="mt-3 mb-3"
                        aria-label="Environmental Condition Filter"
                        disabled={!documented}
                    >
                        <option>Choose</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </Form.Select>
                    <h6>Synteny</h6>
                    <Form.Select
                        className="mt-3 mb-3"
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
                </Col>
                <Col>
                    <Form.Check
                        onClick={(e) => setCrossSpecies(e.target.checked)}
                        className="mb-3"
                        type="switch"
                        id="default-checkbox"
                        label="Cross Species?"
                    />
                    {crossSpecies && (
                        <>
                            <h6>Homologous Relations</h6>
                            <Form.Select
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
                </Col>
            </Row>
            <Row>
                <Col>
                    <img
                        className="ms-5"
                        src={swapLogo}
                        alt="swap"
                        width="26"
                        height="26"
                    />
                    <img
                        className="ms-5"
                        src={networkLogo}
                        alt="network"
                        width="26"
                        height="26"
                    />
                    <img
                        className="ms-5"
                        src={matrixLogo}
                        alt="network"
                        width="26"
                        height="26"
                    />
                    <img
                        className="ms-5"
                        src={downloadLogo}
                        alt="network"
                        width="26"
                        height="26"
                    />
                </Col>
                <Col>
                    <Button className="ms-5 me-3 float-end" variant="secondary">
                        <img
                            src={hamburgerLogo}
                            alt="network"
                            width="26"
                            height="26"
                        />
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}
