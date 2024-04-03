import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { NextUIProvider } from "@nextui-org/react";
// import './App.css';
// import Navv from "./components/Navv";
// import Sidebar from "./components/Sidebar";
import Main from "./components/Main";
import Layout from "./components/Layout";
import Sequences from "./components/Sequences";
import About from "./components/About";
import Help from "./components/Help";

function App() {
    // const [sidebar, setSidebar] = React.useState(true);

    const navigate = useNavigate();

    return (
        <NextUIProvider navigate={navigate}>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Main />} />
                    <Route path="sequences" element={<Sequences />} />
                    <Route path="about" element={<About />} />
                    <Route path="help" element={<Help />} />
                    <Route path="*" element={<div>not found</div>} />
                </Route>
            </Routes>
        </NextUIProvider>
    );
}

export default App;
