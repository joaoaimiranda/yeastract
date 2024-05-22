import React from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
// import { NextUIProvider } from "@nextui-org/react";
import Main from "./components/Main";
import Layout from "./components/Layout";
import Sequences from "./components/Sequences";
import AdvancedSearch from "./components/AdvancedSearch";
import About from "./components/About";
import Help from "./components/Help";
import { getSpecies } from "./services/remoteServices";
import View from "./components/View";

function App() {
    // const [sidebar, setSidebar] = React.useState(true);

    const [currentSpecies, setCurrentSpecies] = React.useState(
        "Saccharomyces cerevisiae S288c"
    );
    const [speciesList, setSpeciesList] = React.useState([]);

    React.useEffect(() => {
        async function fetchData() {
            const res = await getSpecies();
            const defaultSpecies = res.some(
                (el) => el === "Saccharomyces cerevisiae S288c"
            )
                ? "Saccharomyces cerevisiae S288c"
                : res[0];
            setCurrentSpecies(defaultSpecies);
            setSpeciesList(res);
        }
        fetchData();
    }, []);

    // const speciesList = React.useMemo(async () => {

    //     const list = await res;
    //     console.log(list);
    //     return list;
    // }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Layout
                            species={currentSpecies}
                            setSpecies={setCurrentSpecies}
                            speciesList={speciesList}
                        />
                    }
                >
                    <Route
                        index
                        element={
                            <Main
                                species={currentSpecies}
                                speciesList={speciesList}
                            />
                        }
                    />
                    <Route
                        path="sequences"
                        element={<Sequences species={currentSpecies} />}
                    />
                    <Route
                        path="advanced-search"
                        element={<AdvancedSearch species={currentSpecies} />}
                    />
                    <Route
                        path="view"
                        element={<View species={currentSpecies} />}
                    />
                    <Route path="about" element={<About />} />
                    <Route path="help" element={<Help />} />
                    <Route path="*" element={<span>404 not found</span>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
