import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
    searchRegulations,
    rankTF,
    rankGO,
    rankTFBS,
    getEnvCons,
} from "../services/remoteServices";
import speciesList from "../conf/speciesList";
import RegulationModal from "./RegulationModal";
import { useParams } from "react-router-dom";
import constants from "../conf/constants";
import BarChart from "../charts/BarChart";
import Histogram from "../charts/Histogram";
import Network from "../charts/Network";

import ErrorAlert from "./ErrorAlert";
import SampleDataIcon from "../svg/SampleDataIcon";
import HamburgerIcon from "../svg/HamburgerIcon";
import NetworkIcon from "../svg/NetworkIcon";
import TableIcon from "../svg/TableIcon";
import DownloadIcon from "../svg/DownloadIcon";

export default function Main() {
    // const [crossSpecies, setCrossSpecies] = React.useState(false);
    // const [documented, setDocumented] = React.useState(true);
    // const [expression, setExpression] = React.useState(false);
    const [formData, setFormData] = React.useState({
        // query: "rank-none",
        tfs: "",
        genes: "",
        // evidence: "documented",

        // binding: false,
        // expression: true,
        // // and -> false | or -> true
        // and_or: false,
        // activator: true,
        // inhibitor: true,
        // noexprinfo: true,
        envconGroup: "",
        envconSubgroup: "",
        synteny: 0,
        homolog: "",
        ontology: "process",
    });
    const [showErrorMessage, setShowErrorMessage] = React.useState({
        flag: false,
        msg: "",
    });
    const [showNetwork, setShowNetwork] = React.useState(false);

    const [gridVisible, setGridVisible] = React.useState(false);
    const [gridSavedState, setGridSavedState] = React.useState();
    const [filteredData, setFilteredData] = React.useState();

    const { species } = useParams();
    // if (speciesList[species] === undefined) return <div>not found</div>; // create 404 page eventually

    console.log("refreshed");

    // const envcons = ["x", "y", "z"];
    const [envcons, setEnvcons] = React.useState({});
    React.useEffect(() => {
        async function fetchData() {
            const res = await getEnvCons();
            setEnvcons(res);
        }
        fetchData();
    }, []);

    const subgroupOptions = React.useMemo(() => {
        if (formData.envconGroup === "") return ["---"];
        else return ["---", ...envcons[formData.envconGroup]];
    }, [envcons, formData.envconGroup]);

    const syntenies = [
        { option: "BLAST Best-Scores", value: 0 },
        { option: "BLAST Best-Scores + at least 1 neighbor", value: 1 },
        { option: "BLAST Best-Scores + at least 2 neighbor", value: 2 },
        { option: "BLAST Best-Scores + at least 3 neighbor", value: 3 },
    ];

    // const homologs = ["c. albicans", "c. auris", "c. glabrata"];

    const ontologies = [
        { option: "Biological process", value: "process" },
        { option: "Molecular function", value: "function" },
        { option: "Cellular component", value: "component" },
    ];

    const [rowData, setRowData] = React.useState([]);

    const [colDefs, setColDefs] = React.useState([
        { headerName: "TF", field: "tf", hide: false },
        { headerName: "Gene", field: "gene", hide: false },
    ]);
    const defaultColDef = React.useMemo(() => {
        return {
            filter: true,
            // flex: 1,
            floatingFilter: true,
            suppressHeaderMenuButton: true,
        };
    }, []);

    function handleColumns(event) {
        const { name, checked } = event.target;
        setColDefs((prevCols) =>
            prevCols.map((col) =>
                col["field"] === name ? { ...col, hide: !checked } : col
            )
        );
    }

    function handleForm(event) {
        const { name, value, checked, type } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    // FIXME DOESNT WORK FOR MULTIPLE STRAINS
    function setSampleData() {
        setFormData((prevData) => ({
            ...prevData,
            tfs: speciesList[species].sample[0].tfs,
            genes: speciesList[species].sample[0].tgs,
        }));
    }

    async function handleQuery(event) {
        if (showErrorMessage.flag) setShowErrorMessage(false);
        event.preventDefault();
        const query = event.nativeEvent.submitter.name;

        // let documented = "";
        // if (formData.binding && formData.expression)
        //     documented = formData.and_or
        //         ? "binding or expression"
        //         : "binding and expression";
        // else if (formData.binding) documented = "binding";
        // else if (formData.expression) documented = "expression";

        if (query === "rank-none") {
            // if (documented === "") return; //not accepted
            // FORM CHECK
            if (formData.tfs.trim() === "" && formData.genes.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: 'Either "TFs" or "Genes" must be filled',
                });
                return;
            }
            const reverseCols =
                formData.tfs.trim() === "" && formData.genes.trim() !== "";
            const res = await searchRegulations({
                ...formData,
                // documented: documented,
                species: speciesList[species].path,
            });
            console.log(res);
            let first = false;

            //prettier-ignore
            if (reverseCols) {
                // fix for ref not available on first query
                if (!gridVisible) {setGridSavedState({sort: {sortModel: [{colId: "gene", sort: "asc"}]}});setGridVisible(true);first = true}
                
                setColDefs([
                    { headerName: "Gene", field: "gene", hide: false, width: 200,
                    cellRenderer: p => p.node.rowPinned ? <BarChart data={res} colName={"gene"} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> : <a className="link" href={`/${species}/view?orf=${p.data.orf}`}>{p.data.gene}</a> },
                    { headerName: "ORF", field: "orf", hide: false, width: 200,
                    cellRenderer: p => p.node.rowPinned ? <BarChart data={res} colName={"orf"} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> : <a className="link" href={`/${species}/view?orf=${p.data.orf}`}>{p.data.orf}</a> },
                    { headerName: "TF", field: "tf", hide: false, width: 150,
                    cellRenderer: p => p.node.rowPinned ? <p className="text-lg font-semibold text-wrap">{`${(new Set(res.map(row => row.tf))).size} unique TFs`}</p> : <a className="link" href={`/${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a> },
                    { headerName: "Evidence", field: "evidence", hide: false, width: 180, 
                    cellRenderer: p => p.node.rowPinned ? <BarChart data={res} colName={"evidence"} width={180} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> : p.data.evidence},
                    { headerName: "Association Type", field: "association", hide: false, width: 150, 
                    cellRenderer: p => p.node.rowPinned ? <BarChart data={res} colName={"association"} width={150} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> : p.data.association},
                    { headerName: "Reference", field: "Reference", width: 100, hide: false, sortable: false, floatingFilter: false, 
                    cellRenderer: p => !p.node.rowPinned && <RegulationModal id={`reg_modal_${p.data.tf}_${p.data.gene}`} orf={p.data.gene === "Uncharacterized" ? p.data.orf : p.data.gene} tf={p.data.tf} species={species} />},
                ]);
                setRowData(res);
                // apply default sort
                if (!first) gridRef.current.api.applyColumnState({
                    state: [{ colId: "tf", sort: null }, { colId: "gene", sort: "asc"}],
                });
            }
            else {
                // fix for ref not available on first query
                if (!gridVisible) {setGridSavedState({sort: {sortModel: [{colId: "tf", sort: "asc"}]}});setGridVisible(true);first = true}

                setColDefs([
                    { headerName: "TF", field: "tf", hide: false, width: 200,
                    cellRenderer: p => p.node.rowPinned ? 
                        <BarChart data={res} colName={"tf"} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} />
                        : <a className="link" href={`${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a> },
                    { headerName: "Gene", field: "gene", hide: false, width: 150, 
                    cellRenderer: p => p.node.rowPinned ? <p className="text-lg font-semibold text-wrap">{`${(new Set(res.map(row => row.gene))).size} unique Genes`}</p>
                        : <a className="link" href={`${species}/view?orf=${p.data.orf}`}>{p.data.gene}</a> },
                    { headerName: "ORF", field: "orf", hide: false, width: 150,
                    cellRenderer: p => p.node.rowPinned ? <p className="text-lg font-semibold text-wrap">{`${(new Set(res.map(row => row.orf))).size} unique ORFs`}</p> :<a className="link" href={`/${species}/view?orf=${p.data.orf}`}>{p.data.orf}</a> },
                    { headerName: "Evidence", field: "evidence", hide: false, width: 180, 
                    cellRenderer: p => p.node.rowPinned ? <BarChart data={res} colName={"evidence"} width={180} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> : p.data.evidence},
                    { headerName: "Association Type", field: "association", hide: false, width: 150, 
                    cellRenderer: p => p.node.rowPinned ? <BarChart data={res} colName={"association"} width={150} height={95} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> : p.data.association},
                    { headerName: "Reference", field: "Reference", width: 100, hide: false, sortable: false, floatingFilter: false, 
                    cellRenderer: p => !p.node.rowPinned && <RegulationModal id={`reg_modal_${p.data.tf}_${p.data.gene}`} orf={p.data.gene === "Uncharacterized" ? p.data.orf : p.data.gene} tf={p.data.tf} species={species} />},
                ]);
                setRowData(res);
                setFilteredData(res)
                // apply default sort
                if (!first) gridRef.current.api.applyColumnState({
                    state: [{ colId: "tf", sort: "asc" }, { colId: "gene", sort: null}],
                });
            }
        } else if (query === "rank-tf") {
            // if (documented === "") return; //not accepted
            // FORM CHECK
            if (formData.genes.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: '"Genes" field cannot be empty',
                });
                return;
            }
            const res = await rankTF({
                ...formData,
                // documented: documented,
                species: speciesList[species].path,
            });
            console.log(res);
            if (!gridVisible) setGridVisible(true);

            // prettier-ignore
            setColDefs([
                { headerName: "TF", field: "tf", hide: false },
                { headerName: "% in user set", field: "setPer", hide: false, width: 150,
                cellRenderer: (p) => p.node.rowPinned ? (<Histogram data={res.map((row) => row.setPer)} width={150} height={95} />) : (p.data.setPer + "%"),},
                { headerName: "% in species", field: "dbPer", hide: false, width: 150,
                cellRenderer: (p) => p.node.rowPinned ? (<Histogram data={res.map((row) => row.dbPer)} width={150} height={95} />) : (p.data.dbPer + "%"),},
                { headerName: "Target Genes", field: "genes", hide: false,
                cellRenderer: (p) => p.node.rowPinned ? (<></>) : (p.data.genes.map((v) => (<><a className="link" href={`/${species}/view?orf=${v}`}>{v}</a><span> </span></>))),},
            ]);
            setRowData(res);
        } else if (query === "rank-go") {
            // FORM CHECK
            if (formData.genes.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: '"Genes" field cannot be empty',
                });
                return;
            }
            const res = await rankGO({
                genes: formData.genes,
                // ontology: formData.ontology,
                species: speciesList[species].path,
            });
            console.log(res);
            if (!gridVisible) setGridVisible(true);

            // prettier-ignore
            setColDefs([
                { headerName: "GO ID", field: "goid", hide: false,
                cellRenderer: (p) => p.node.rowPinned ? (<></>) : (<a className="link" target="_blank" rel="noopener noreferrer" href={`${constants.geneOntologyUrl}${p.data.goid}`}>{p.data.goid}</a>),},
                { headerName: "GO Term", field: "term", hide: false,
                cellRenderer: (p) => p.node.rowPinned ? (<></>) : (<a className="link" href={`/${species}/view?goid=${p.data.goid}`}>{p.data.term}</a>),},
                { headerName: "Depth level", field: "depth", hide: false },
                { headerName: "% in user set", field: "setPer", hide: false, width: 150,
                cellRenderer: (p) =>p.node.rowPinned ? (<Histogram data={res.map((row) => row.setPer)} width={150} height={95} />) : (p.data.setPer + "%"),},
                { headerName: "% in species", field: "dbPer", hide: false, width: 150,
                cellRenderer: (p) => p.node.rowPinned ? (<Histogram data={res.map((row) => row.dbPer)} width={150} height={95} />) : (p.data.dbPer + "%"),},
                { headerName: "Genes", field: "genes", hide: false,
                cellRenderer: (p) => p.node.rowPinned ? (<></>) : (p.data.genes.map((v) => (<><a className="link" href={`/${species}/view?orf=${v}`}>{v}</a><span> </span></>))),},
            ]);
            setRowData(res);
        } else if (query === "rank-tfbs") {
            // FORM CHECK
            if (formData.genes.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: '"Genes" field cannot be empty',
                });
                return;
            }
            if (formData.homolog === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: "Please select a Homolog Species",
                });
                return;
            }
            const res = await rankTFBS({
                ...formData,
                species: speciesList[species].path,
            });
            console.log(res);
            if (!gridVisible) setGridVisible(true);

            // TODO
        } else {
            console.log("Unknown query name");
        }
    }

    // const chartUnhover = () => {
    //     return { backgroundColor: "white" };
    // };

    // const [rowStyleFunc, setRowStyleFunc] = React.useState(() => chartUnhover);

    // const chartHoverToTable = (col, val) => {
    //     const styleSetter = (p) => {
    //         const row = p.data;
    //         for (const [key, value] of Object.entries(row)) {
    //             if (col === key && value === val)
    //                 return { backgroundColor: "blue" };
    //         }
    //         return { backgroundColor: "white" };
    //     };
    //     setRowStyleFunc(() => styleSetter);
    // };

    const pinnedTopRowData = React.useMemo(() => {
        return [
            {
                tf: "",
                gene: "",
            },
        ];
    }, []);

    const getRowHeight = React.useCallback(
        (params) => (params.node.rowPinned ? 80 : 35),
        []
    );

    // const autoSizeStrategy = React.useMemo(
    //     () => ({
    //         type: "fitCellContents",
    //     }),
    //     []
    // );

    const gridRef = React.useRef();

    const onBtnExport = React.useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
    }, []);

    function getFilteredData() {
        const rowData = [];
        gridRef.current.api.forEachNodeAfterFilter((node) => {
            rowData.push(node.data);
        });
        return rowData;
    }

    const setFilter = React.useCallback(async (col, val) => {
        await gridRef.current.api.setColumnFilterModel(col, {
            filterType: "text",
            type: "contains",
            filter: val,
        });
        gridRef.current.api.onFilterChanged();
    }, []);

    const getFilterTerm = React.useCallback((col) => {
        const filter = gridRef.current.api.getColumnFilterModel(col);
        return filter === null ? null : filter.filter;
    }, []);

    const addListener = React.useCallback((listener) => {
        gridRef.current.api.addEventListener("filterChanged", listener);
    }, []);

    const removeListener = React.useCallback((listener) => {
        if (gridRef.current)
            gridRef.current.api.removeEventListener("filterChanged", listener);
    }, []);

    const onGridReady = React.useCallback(() => {
        addListener(() => {
            setFilteredData(getFilteredData());
        });
        gridRef.current.api.onFilterChanged();
    }, [addListener]);

    const onGridPreDestroyed = React.useCallback((params) => {
        const { state } = params;
        setGridSavedState(state);
    }, []);

    return (
        <div className="w-full h-full">
            <h1 className="text-center font-figtree text-xl">Regulations</h1>
            <form
                onSubmit={handleQuery}
                className=" p-4 border-b border-gray-500"
            >
                <div className="flex flex-col md:flex-row md:flex-wrap items-center md:items-start gap-2 xl:gap-8">
                    <div className="flex flex-col p-3 max-w-sm rounded-lg shadow-md shadow-gray-300">
                        <div className="flex flex-row gap-2">
                            {/* <div className="flex flex-col"> */}
                            <label>
                                <div className="label p-0 mb-2">
                                    <span className="label-text text-color">
                                        TFs
                                    </span>
                                </div>
                                <textarea
                                    id="tfs"
                                    name="tfs"
                                    value={formData.tfs}
                                    className="textarea textarea-bordered textarea-primary min-h-44 max-h-44 max-w-40 text-color leading-4"
                                    onChange={handleForm}
                                ></textarea>
                            </label>
                            {/* <div className="grid grid-cols-2 gap-2 mt-2 mr-2"></div> */}
                            {/* </div> */}
                            {/* <div className="flex flex-col"> */}
                            <label>
                                <div className="label p-0 mb-2">
                                    <span className="label-text text-color">
                                        Genes
                                    </span>
                                </div>
                                <textarea
                                    id="genes"
                                    name="genes"
                                    value={formData.genes}
                                    className="textarea textarea-bordered textarea-primary min-h-44 max-h-44 max-w-40 text-color leading-4"
                                    onChange={handleForm}
                                ></textarea>
                            </label>
                            {/* <div className="grid grid-cols-2 gap-2 mt-2"></div> */}
                            {/* </div> */}
                        </div>
                        <button
                            className="btn btn-xs btn-square self-end"
                            type="button"
                            onClick={setSampleData}
                        >
                            <SampleDataIcon />
                        </button>
                        {/* <div className="grid grid-cols-4 mt-auto mb-2 gap-2"> */}
                        {/* </div> */}
                        {/* </div> */}
                    </div>
                    {/* <div className="grid row-span-2 gap-6 max-w-sm">
                    <div className="p-3 content-center rounded-lg shadow-md shadow-gray-200">
                        <div className="flex flex-col gap-3">
                            <label>
                                <div className="label p-0 mb-2 ml-1">
                                    <span className="label-text text-color">
                                        Evidence
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        id="binding"
                                        name="binding"
                                        type="checkbox"
                                        aria-label="Binding"
                                        className="btn"
                                        checked={formData.binding}
                                        onChange={handleForm}
                                    />
                                    <input
                                        id="expression"
                                        name="expression"
                                        type="checkbox"
                                        aria-label="Expression"
                                        className="btn"
                                        checked={formData.expression}
                                        onChange={handleForm}
                                    />
                                </div>
                            </label>
                            <div className="self-center">
                                <label className="cursor-pointer label">
                                    <span className="label-text mr-2 text-color">
                                        AND
                                    </span>
                                    <input
                                        id="and_or"
                                        name="and_or"
                                        type="checkbox"
                                        className="toggle bg-primary border-primary hover:bg-blue-500"
                                        checked={formData.and_or}
                                        onChange={handleForm}
                                        disabled={
                                            !(
                                                formData.binding &&
                                                formData.expression
                                            )
                                        }
                                    />
                                    <span className="label-text ml-2 text-color">
                                        OR
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 rounded-lg shadow-md shadow-gray-200">
                        <label>
                            <div className="label p-0 mb-2 ml-1 justify-center">
                                <span className="label-text text-color ">
                                    TF as...
                                </span>
                            </div>
                            <div className="flex flex-row justify-center gap-2 mb-2">
                                <input
                                    id="activator"
                                    name="activator"
                                    type="checkbox"
                                    aria-label="Activator"
                                    className="btn"
                                    checked={formData.activator}
                                    onChange={handleForm}
                                    disabled={!formData.expression}
                                />
                                <input
                                    id="inhibitor"
                                    name="inhibitor"
                                    type="checkbox"
                                    aria-label="Inhibitor"
                                    className="btn"
                                    checked={formData.inhibitor}
                                    onChange={handleForm}
                                    disabled={!formData.expression}
                                />
                                <input
                                    id="noexprinfo"
                                    name="noexprinfo"
                                    type="checkbox"
                                    aria-label="N/A"
                                    className="btn"
                                    checked={formData.noexprinfo}
                                    onChange={handleForm}
                                    disabled={!formData.expression}
                                />
                            </div>
                        </label>
                    </div>
                </div> */}
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col p-3 items-center rounded-lg shadow-md shadow-gray-300 max-w-sm">
                            <label>
                                <div className="label p-0 mb-2">
                                    <span className="label-text text-color">
                                        Environmental Condition Group
                                    </span>
                                </div>

                                <select
                                    className="select select-bordered select-primary select-sm w-56 mb-2 text-color"
                                    id="envconGroup"
                                    name="envconGroup"
                                    value={formData.envconGroup}
                                    onChange={handleForm}
                                >
                                    {["---", ...Object.keys(envcons)].map(
                                        (option) => (
                                            <option
                                                key={option}
                                                value={
                                                    option === "---"
                                                        ? ""
                                                        : option
                                                }
                                            >
                                                {option}
                                            </option>
                                        )
                                    )}
                                </select>
                            </label>
                            <label>
                                <div className="label p-0 mb-2">
                                    <span className="label-text text-color">
                                        Subgroup
                                    </span>
                                </div>

                                <select
                                    className="select select-bordered select-primary select-sm w-56 mb-2 text-color"
                                    id="envconSubgroup"
                                    name="envconSubgroup"
                                    value={formData.envconSubgroup}
                                    onChange={handleForm}
                                >
                                    {subgroupOptions.map((option) => (
                                        <option
                                            key={option}
                                            value={
                                                option === "---" ? "" : option
                                            }
                                        >
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="flex flex-col p-3 items-center rounded-lg shadow-md shadow-gray-300 max-w-sm">
                            <label>
                                <div className="label p-0 mb-2">
                                    <span className="label-text text-color">
                                        Ontology (Rank GO only)
                                    </span>
                                </div>
                                <select
                                    className="select select-bordered select-primary select-sm w-56 text-color"
                                    id="ontology"
                                    name="ontology"
                                    value={formData.ontology}
                                    onChange={handleForm}
                                >
                                    {ontologies.map((x) => (
                                        <option
                                            key={x.value}
                                            value={x.value}
                                            // value={option === "---" ? "" : option}
                                        >
                                            {x.option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>
                    <div className="flex flex-col p-3 items-center rounded-lg shadow-md shadow-gray-300 max-w-sm">
                        <label>
                            <div className="label p-0 mb-2">
                                <span className="label-text text-color">
                                    Homologous Regulations
                                </span>
                            </div>

                            <select
                                className="select select-bordered select-primary select-sm w-56 mb-2 text-color"
                                id="homolog"
                                name="homolog"
                                value={formData.homolog}
                                onChange={handleForm}
                                // TODO IMPLEMENT HOMOLOGOUS BEFORE ENABLING THIS OPTION
                                disabled
                            >
                                {[
                                    "---",
                                    ...Object.keys(speciesList).filter(
                                        (el) => el !== species
                                    ),
                                ].map((option) => (
                                    <option
                                        key={option}
                                        value={option === "---" ? "" : option}
                                    >
                                        {option === "---"
                                            ? "---"
                                            : speciesList[option].short}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <div className="label p-0 mb-2">
                                <span className="label-text text-color">
                                    Synteny
                                </span>
                            </div>

                            <select
                                className="select select-bordered select-primary select-sm w-56 mb-2 text-color"
                                id="synteny"
                                name="synteny"
                                value={formData.synteny}
                                disabled={formData.homolog === ""}
                                onChange={handleForm}
                            >
                                {syntenies.map((x) => (
                                    <option key={x.value} value={x.value}>
                                        {x.option}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
                <div className="flex flex-row gap-2 mt-4 justify-center md:justify-start">
                    <button
                        className="btn btn-primary w-20"
                        type="submit"
                        name="rank-none"
                    >
                        Regulations
                    </button>
                    <button
                        className="btn btn-primary w-20"
                        type="submit"
                        name="rank-tf"
                    >
                        Rank TF
                    </button>
                    <button
                        className="btn btn-primary w-20"
                        type="submit"
                        name="rank-go"
                    >
                        Rank GO
                    </button>
                    <button
                        className="btn btn-primary w-20"
                        type="submit"
                        name="rank-tfbs"
                        disabled
                    >
                        Rank TFBS
                    </button>
                </div>
                <div className="mt-2">
                    {showErrorMessage.flag && (
                        <ErrorAlert msg={showErrorMessage.msg} />
                    )}
                </div>
            </form>

            <div className="px-4 py-2 w-full h-full">
                <div className="p-2 bg-gray-100 rounded-t-lg border-x border-t border-[#e5e7eb] flex gap-5">
                    <div className="dropdown dropdown-bottom">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-sm btn-ghost p-2"
                        >
                            <HamburgerIcon />
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-40 menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                            {colDefs.map((col) => (
                                <li key={col.field}>
                                    <label className="label cursor-pointer">
                                        <span className="label-text">
                                            {col.headerName}
                                        </span>
                                        <input
                                            type="checkbox"
                                            id={col.field}
                                            name={col.field}
                                            defaultChecked={!col.hide}
                                            className="checkbox checkbox-sm checkbox-primary"
                                            onChange={handleColumns}
                                        />
                                    </label>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <button
                        className="btn btn-sm btn-square"
                        onClick={() => setShowNetwork((prev) => !prev)}
                    >
                        {showNetwork ? <TableIcon /> : <NetworkIcon />}
                    </button>
                    <button className="btn btn-sm" onClick={onBtnExport}>
                        <DownloadIcon />
                        Download
                    </button>
                </div>
                {showNetwork ? (
                    <Network data={filteredData} />
                ) : (
                    <div
                        className="ag-theme-quartz max-w-[100vw] z-0"
                        style={{
                            "--ag-header-background-color": "#f3f4f6",
                            // "--ag-border-color": "#f3f4f6",
                            "--ag-wrapper-border-radius": "none",
                            "--ag-cell-horizontal-border": "solid #e5e7eb",
                        }}
                    >
                        {gridVisible && (
                            <AgGridReact
                                // table api ref
                                ref={gridRef}
                                // table data
                                rowData={rowData}
                                columnDefs={colDefs}
                                // col filters enabled
                                defaultColDef={defaultColDef}
                                // display sort icon
                                unSortIcon={true}
                                // table height
                                domLayout={"autoHeight"}
                                // pagination
                                pagination={true}
                                paginationPageSize={50}
                                // selectable text inside table
                                enableCellTextSelection={true}
                                ensureDomOrder={true}
                                // enable pinned row for graphs
                                pinnedTopRowData={pinnedTopRowData}
                                // for pinned row height
                                getRowHeight={getRowHeight}
                                // column sizing
                                // autoSizeStrategy={autoSizeStrategy}
                                // idk yet
                                // getRowStyle={rowStyleFunc}
                                initialState={gridSavedState}
                                onGridReady={onGridReady}
                                onGridPreDestroyed={onGridPreDestroyed}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
