import React from "react";
import { Routes, Route, BrowserRouter, Navigate } from "react-router-dom";
// import { NextUIProvider } from "@nextui-org/react";
import Main from "./components/Main";
import Layout from "./components/Layout";
import Sequences from "./components/Sequences";
import AdvancedSearch from "./components/AdvancedSearch";
import About from "./components/About";
import Help from "./components/Help";
// import { getSpecies } from "./services/remoteServices";
import View from "./components/View";
import speciesList from "./conf/speciesList.js";

function App() {
    // const [sidebar, setSidebar] = React.useState(true);

    // if scerevisiae exists, then screvisiae - otherwise, first species on the object
    const defaultSpecies =
        speciesList.scerevisiae !== undefined
            ? speciesList.scerevisiae.path
            : speciesList[Object.keys(speciesList)[0]].path;
    // const [speciesList, setSpeciesList] = React.useState([]);

    // React.useEffect(() => {
    //     async function fetchData() {
    //         const res = await getSpecies();
    //         const defaultSpecies = res.some(
    //             (el) => el === "Saccharomyces cerevisiae S288c"
    //         )
    //             ? "Saccharomyces cerevisiae S288c"
    //             : res[0];
    //         setCurrentSpecies(defaultSpecies);
    //         setSpeciesList(res);
    //     }
    //     fetchData();
    // }, []);

    // const speciesList = React.useMemo(async () => {

    //     const list = await res;
    //     console.log(list);
    //     return list;
    // }, []);

    // prettier-ignore
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<Navigate to={`/${defaultSpecies}`} replace={true} />} />
                    <Route path="/:species" element={<Main />} />

                    <Route path="/sequences" element={<Navigate to={`/${defaultSpecies}/sequences`} replace={true} />} />
                    <Route path="/:species/sequences/" element={<Sequences />} />

                    <Route path="/advanced-search" element={<Navigate to={`/${defaultSpecies}/advanced-search`} replace={true} />} />
                    <Route path="/:species/advanced-search" element={<AdvancedSearch />} />

                    <Route path="/view" element={<Navigate to={`/${defaultSpecies}/view`} replace={true} />} />
                    <Route path="/:species/view" element={<View />} />

                    <Route path="/about" element={<Navigate to={`/${defaultSpecies}/about`} replace={true} />} />
                    <Route path="/:species/about" element={<About />} />

                    <Route path="/help" element={<Navigate to={`/${defaultSpecies}/help`} replace={true} />} />
                    <Route path="/:species/help" element={<Help />} />
                    
                    <Route path="*" element={<span>404 not found</span>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
