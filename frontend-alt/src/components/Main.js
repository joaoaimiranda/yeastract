import React from "react";
// import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
// import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import swapLogo from "bootstrap-icons/icons/arrow-left-right.svg";
import networkLogo from "bootstrap-icons/icons/share-fill.svg";
import matrixLogo from "bootstrap-icons/icons/grid-3x3.svg";
import downloadLogo from "bootstrap-icons/icons/download.svg";
import hamburgerLogo from "bootstrap-icons/icons/list.svg";
import { AgGridReact } from "ag-grid-react"; // AG Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the grid

export default function Main() {
    // const [crossSpecies, setCrossSpecies] = React.useState(false);
    // const [documented, setDocumented] = React.useState(true);
    // const [expression, setExpression] = React.useState(false);

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

    return (
        <div className="ms-3">
            <Row className="mb-3">
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
                    {/* <Button
                        className="ms-5 me-3 float-end"
                        variant="outline-light"
                    >
                        <img
                            src={hamburgerLogo}
                            alt="network"
                            width="26"
                            height="26"
                        />
                    </Button> */}
                    <Image
                        className="ms-5 me-4 float-end"
                        src={hamburgerLogo}
                        alt="hamburger"
                        width="25"
                        height="25"
                    />
                </Col>
            </Row>
            <Row>
                <div
                    className="ag-theme-quartz mt-3" // applying the grid theme
                    style={{ width: 900, height: 400 }} // the grid will fill the size of the parent container
                >
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={colDefs}
                        defaultColDef={defaultColDef}
                    />
                </div>
            </Row>
        </div>
    );
}
