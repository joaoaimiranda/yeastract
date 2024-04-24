import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
// import { NextUIProvider } from "@nextui-org/react";
import Main from "./components/Main";
import Layout from "./components/Layout";
import Sequences from "./components/Sequences";
import About from "./components/About";
import Help from "./components/Help";

function App() {
    // const [sidebar, setSidebar] = React.useState(true);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Main />} />
                    <Route path="sequences" element={<Sequences />} />
                    <Route path="about" element={<About />} />
                    <Route path="help" element={<Help />} />
                    <Route path="*" element={<div>not found</div>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
