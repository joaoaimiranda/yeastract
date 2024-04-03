import React from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import swapLogo from "bootstrap-icons/icons/arrow-left-right.svg";
import networkLogo from "bootstrap-icons/icons/share-fill.svg";
import matrixLogo from "bootstrap-icons/icons/grid-3x3.svg";
import downloadLogo from "bootstrap-icons/icons/download.svg";
import hamburgerLogo from "bootstrap-icons/icons/list.svg";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

export default function Main() {
    // const [crossSpecies, setCrossSpecies] = React.useState(false);
    // const [documented, setDocumented] = React.useState(true);
    // const [expression, setExpression] = React.useState(false);
    const [formData, setFormData] = React.useState({
        tfs: "",
        genes: "",
        evidence: "documented",
        documented: "expression",
        activator: true,
        inhibitor: true,
        noexprinfo: true,
        envconGroup: "",
        envconSubgroup: "",
        synteny: 0,
        homolog: "",
    });

    const [rowData, setRowData] = React.useState([
        { TF: "Pdr1p", Genes: "PAU8" },
        { TF: "Pdr1p", Genes: "SEO1" },
        { TF: "Pdr1p", Genes: "YAL066W" },
        { TF: "Haa1p", Genes: "YBR090C" },
        { TF: "Haa1p", Genes: "GSR1" },
        { TF: "Haa1p", Genes: "MAK5" },
        { TF: "Msn2p", Genes: "SEO1" },
        { TF: "Msn2p", Genes: "YALO64W" },
        { TF: "Msn2p", Genes: "FLO9" },
    ]);

    const [colDefs, setColDefs] = React.useState([
        { field: "TF" },
        { field: "Genes" },
    ]);
    const defaultColDef = React.useMemo(() => {
        return {
            filter: "agTextColumnFilter",
            floatingFilter: true,
            flex: 1,
        };
    }, []);

    function handleForm(event) {
        const { name, value, checked, type } = event.target;
        console.log(name);
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
        console.log(formData);
    }

    function handleQuery(event) {
        event.preventDefault();
        console.log(formData);
    }

    return (
        <>
            <Form onSubmit={handleQuery}>
                <Row className="border-bottom mb-3 mx-3">
                    <Col>
                        <Form.Group className="mb-3" controlId="tfs">
                            <Form.Label>TFs</Form.Label>
                            <Form.Control
                                as="textarea"
                                onChange={handleForm}
                                rows={6}
                            />
                        </Form.Group>
                        <Button variant="secondary" type="submit">
                            Search
                        </Button>
                    </Col>
                    <Col>
                        <Form.Group className="mb-3" controlId="genes">
                            <Form.Label>Target Genes</Form.Label>
                            <Form.Control
                                as="textarea"
                                onChange={handleForm}
                                rows={6}
                            />
                        </Form.Group>
                    </Col>
                    <Col>
                        <h6 className="mb-3">Evidence</h6>
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
                            disabled={
                                !formData.expression || !formData.documented
                            }
                            checked={formData.activator}
                        />
                        <Form.Check
                            onChange={handleForm}
                            className="mb-3 ms-5"
                            type={"checkbox"}
                            id={"inhibitor"}
                            label={"TF as inhibitor"}
                            disabled={
                                !formData.expression || !formData.documented
                            }
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
                    </Col>
                    <Col>
                        <h6>Environmental Condition</h6>
                        <Form.Select
                            onChange={handleForm}
                            id="envconGroup"
                            className="mt-3 mb-3"
                            aria-label="Environmental Condition Filter"
                            disabled={!formData.documented}
                        >
                            <option value="0">Choose</option>
                            <option value="1">One</option>
                            <option value="2">Two</option>
                            <option value="3">Three</option>
                        </Form.Select>
                        <h6>Synteny</h6>
                        <Form.Select
                            onChange={handleForm}
                            id="synteny"
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
                        <h6>Homologous Relations</h6>
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
                        <Image
                            className="ms-5 me-4 float-end"
                            src={hamburgerLogo}
                            alt="hamburger"
                            width="25"
                            height="25"
                        />
                    </Col>
                </Row>
            </Form>
            <Row className="mx-3">
                <div
                    className="ag-theme-quartz mt-3"
                    style={{ width: 900, height: 400 }}
                >
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={colDefs}
                        defaultColDef={defaultColDef}
                    />
                </div>
            </Row>
        </>
    );
}
