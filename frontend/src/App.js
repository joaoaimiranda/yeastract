import React from "react";
import Navv from "./components/Navv";
import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "react-bootstrap/Image";
import arrowRightLogo from "bootstrap-icons/icons/arrow-bar-right.svg";
import arrowLeftLogo from "bootstrap-icons/icons/arrow-bar-left.svg";

function App() {
    const [sidebar, setSidebar] = React.useState(true);

    return (
        <div className="App inter-font">
            <Row>
                <Navv />
            </Row>
            <Row>
                <Col>
                    {/* <Button
                        className="ms-2 mb-2"
                        variant="outline-light"
                        onClick={() => setSidebar(!sidebar)}
                    >
                        <img
                            src={sidebar ? arrowLeftLogo : arrowRightLogo}
                            alt="menu"
                            width="25"
                            height="25"
                        />
                    </Button> */}
                    <Image
                        className="ms-4 mb-3"
                        src={sidebar ? arrowLeftLogo : arrowRightLogo}
                        alt="menu"
                        width="25"
                        height="25"
                        onClick={() => setSidebar(!sidebar)}
                    />
                </Col>
                <Col>
                    <h3>Regulations</h3>
                </Col>
            </Row>
            <Row>
                {sidebar ? (
                    <>
                        <Col xs={2}>
                            <Sidebar />
                        </Col>
                        <Col xd={10}>
                            <Main />
                        </Col>
                    </>
                ) : (
                    <Main />
                )}
            </Row>
        </div>
    );
}

export default App;
