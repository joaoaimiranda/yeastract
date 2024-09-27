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
import { useParams, useSearchParams } from "react-router-dom";
import constants from "../conf/constants";
import BarChart from "../charts/BarChart";
import Histogram from "../charts/Histogram";
import Network from "../charts/Network";
import Loading from "./Loading";
import ErrorAlert from "./ErrorAlert";
import WarningAlert from "./WarningAlert";
import ErrorToast from "./ErrorToast";
import SampleDataIcon from "../svg/SampleDataIcon";
import HamburgerIcon from "../svg/HamburgerIcon";
import NetworkIcon from "../svg/NetworkIcon";
import TableIcon from "../svg/TableIcon";
import DownloadIcon from "../svg/DownloadIcon";
import TrashIcon from "../svg/TrashIcon";
import { gridAutoSize } from "../utils/utils";

export default function Main() {
    const { species } = useParams();
    let [searchParams, setSearchParams] = useSearchParams();
    const [firstRender, setFirstRender] = React.useState(true);
    const [historyCall, setHistoryCall] = React.useState("");

    const ontologies = [
        { option: "Biological process", value: "process" },
        { option: "Molecular function", value: "function" },
        { option: "Cellular component", value: "component" },
    ];

    const [envcons, setEnvcons] = React.useState({});
    React.useEffect(() => {
        async function fetchData() {
            const res = await getEnvCons();
            setEnvcons(res);
        }
        fetchData();
    }, []);

    const [formData, setFormData] = React.useState({
        // query: "rank-none",
        tfs: searchParams.get("tfs") ? searchParams.get("tfs") : "",
        genes: searchParams.get("genes") ? searchParams.get("genes") : "",
        // evidence: "documented",

        // binding: false,
        // expression: true,
        // // and -> false | or -> true
        // and_or: false,
        // activator: true,
        // inhibitor: true,
        // noexprinfo: true,

        // DOESNT WORK BECAUSE OF ASYNC getEnvCons
        // envconGroup:
        //     searchParams.get("envconGroup") &&
        //     Object.keys(envcons).includes(searchParams.get("envconGroup"))
        //         ? searchParams.get("envconGroup")
        //         : "",
        // envconSubgroup:
        //     searchParams.get("envconGroup") &&
        //     Object.keys(envcons).includes(searchParams.get("envconGroup")) &&
        //     searchParams.get("envconSubgroup") &&
        //     envcons[searchParams.get("envconGroup")].includes(
        //         searchParams.get("envconSubgroup")
        //     )
        //         ? searchParams.get("envconSubgroup")
        //         : "",

        envconGroup: "",
        envconSubgroup: "",
        synteny: 0, // TODO
        homolog: "", // TODO
        ontology:
            searchParams.get("ontology") &&
            ontologies.some((el) => el.value === searchParams.get("ontology"))
                ? searchParams.get("ontology")
                : "process",
    });
    const queries = ["rank-none", "rank-go", "rank-go", "rank-tfbs"];
    const [showFormError, setShowFormError] = React.useState("");
    const [showWarning, setShowWarning] = React.useState("");
    const [showLoading, setShowLoading] = React.useState(false);
    const [showNetwork, setShowNetwork] = React.useState(false);
    const [showError, setShowError] = React.useState("");

    const [gridVisible, setGridVisible] = React.useState(false);
    // const [gridSavedState, setGridSavedState] = React.useState();
    // const [filteredData, setFilteredData] = React.useState();
    const [supressPaginationPanel, setSupressPaginationPanel] =
        React.useState(false);

    console.log("refreshed");

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

    function setSampleData(event) {
        const value = event.currentTarget.getAttribute("value");
        const sample = speciesList[species].sample.find(
            (el) => el.strain === value
        );
        setFormData((prevData) => ({
            ...prevData,
            tfs: sample.tfs,
            genes: sample.tgs,
        }));
    }

    async function handleQuery(event, q = null) {
        // clean error alert
        if (showFormError) setShowFormError("");
        if (showWarning) setShowWarning("");

        if (event !== undefined) event.preventDefault();
        const query = q ? q : event.nativeEvent.submitter.name;

        // let documented = "";
        // if (formData.binding && formData.expression)
        //     documented = formData.and_or
        //         ? "binding or expression"
        //         : "binding and expression";
        // else if (formData.binding) documented = "binding";
        // else if (formData.expression) documented = "expression";

        if (query === "rank-none") {
            // FORM CHECK
            if (formData.tfs.trim() === "" && formData.genes.trim() === "") {
                setShowFormError('Either "TFs" or "Genes" must be filled');
                return;
            }
            setShowLoading(true);
            const reverseCols =
                formData.tfs.trim() === "" && formData.genes.trim() !== "";

            if (!q) {
                if (
                    formData.tfs.concat(
                        formData.genes,
                        formData.envconGroup,
                        formData.envconSubgroup,
                        formData.synteny,
                        formData.homolog
                    ).length < 2000
                ) {
                    const params = {};
                    params.q = query;
                    if (formData.tfs.trim() !== "") params.tfs = formData.tfs;
                    if (formData.genes.trim() !== "")
                        params.genes = formData.genes;
                    if (formData.envconGroup !== "") {
                        params.envconGroup = formData.envconGroup;
                        if (formData.envconSubgroup !== "")
                            params.envconSubgroup = formData.envconSubgroup;
                    }
                    // if (formData.homolog !== "") {
                    //     params.homolog = formData.homolog;
                    //     params.synteny = formData.synteny;
                    // }
                    setSearchParams(params);
                } else {
                    setSearchParams({});
                }
            }
            const res = await searchRegulations({
                ...formData,
                // documented: documented,
                species: speciesList[species].path,
            });
            console.log(res);

            // HTTP ERROR
            if (typeof res === "string") {
                setShowLoading(false);
                setShowError(res);
                return;
            }
            if (res.length === 0) setShowWarning("No regulations found!");

            let first = false;
            if (gridRef.current) gridRef.current.api.setFilterModel(null);

            //prettier-ignore
            if (reverseCols) {
                // fix for ref not available on first query
                if (!gridVisible) {
                    // setGridSavedState({ sort: { sortModel: [{colId: "gene", sort: "asc"}]}});
                    // setFilteredData(res);
                    setGridVisible(true);
                    first = true;
                }
                
                setColDefs([
                    { headerName: "Gene", field: "gene", hide: false, maxWidth: 200, rowDrag: true, colSpan: p => p.node.rowPinned && p.data.id === "network" ? 6 : 1,
                    cellRenderer: p => p.node.rowPinned && p.data.id === "stats" ? <BarChart colName={"gene"} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> 
                    : p.node.rowPinned && p.data.id === "network" ? 
                    <>{res.length > 500 ? `Dataset too big! Network unavailable` : <Network getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} />}</>
                    : <a className="link" href={`/${species}/view?orf=${p.data.orf}`}>{p.data.gene}</a> },
                    { headerName: "ORF", field: "orf", hide: false, maxWidth: 200,
                    cellRenderer: p => p.node.rowPinned && p.data.id === "stats" ? <BarChart colName={"orf"} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> 
                    : <a className="link" href={`/${species}/view?orf=${p.data.orf}`}>{p.data.orf}</a> },
                    { headerName: "TF", field: "tf", hide: false, maxWidth: 150, rowDrag: true,
                    // cellRenderer: p => p.node.rowPinned && p.data.id === "stats" ? <p className="text-lg font-semibold text-wrap">{`${(new Set(res.map(row => row.tf))).size} unique TFs`}</p> 
                    // : <a className="link" href={`/${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a> },
                    cellRenderer: p => <a className="link" href={`/${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a> },
                    { headerName: "Evidence", field: "evidence", hide: false, maxWidth: 170, 
                    cellRenderer: p => p.node.rowPinned && p.data.id === "stats" ? <BarChart colName={"evidence"} width={105} height={75} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> 
                    : p.data.evidence},
                    { headerName: "Association Type", field: "association", hide: false, maxWidth: 140, 
                    cellRenderer: p => p.node.rowPinned && p.data.id === "stats" ? <BarChart colName={"association"} width={140} height={97} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> 
                    : p.data.association},
                    { headerName: "Ref", field: "Reference", maxWidth: 80, hide: false, sortable: false, floatingFilter: false, 
                    cellRenderer: p => !p.node.rowPinned && <RegulationModal id={`reg_modal_${p.data.tf}_${p.data.gene}`} orf={p.data.gene === "Uncharacterized" ? p.data.orf : p.data.gene} tf={p.data.tf} species={species} />},
                ]);
                setRowData(res);
                // apply default sort
                if (!first) gridRef.current.api.applyColumnState({
                    state: [{ colId: "gene", sort: "asc"}, { colId: "tf", sort: null}],
                });
                setTimeout(() => gridAutoSize(gridRef), 100);

            }
            else {
                // fix for ref not available on first query
                if (!gridVisible) {
                    // setGridSavedState({ sort: { sortModel: [{colId: "tf", sort: "asc"}]}});
                    // setFilteredData(res);
                    setGridVisible(true);
                    first = true;
                }

                setColDefs([
                    { headerName: "TF", field: "tf", hide: false, maxWidth: 200, rowDrag: true, colSpan: p => p.node.rowPinned && p.data.id === "network" ? 6 : 1,
                    cellRenderer: p => p.node.rowPinned && p.data.id === "stats" ? <BarChart colName={"tf"} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} />
                    : p.node.rowPinned && p.data.id === "network" ? 
                    <>{res.length > 500 ? `Dataset too big! Network unavailable` : <Network getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} />}</>
                    : <a className="link" href={`/${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a> },
                    { headerName: "Gene", field: "gene", hide: false, maxWidth: 150, rowDrag: true, 
                    // cellRenderer: p => p.node.rowPinned && p.data.id === "stats" ? <p className="text-lg font-semibold text-wrap">{`${(new Set(res.map(row => row.gene))).size} unique Genes`}</p>
                    // : <a className="link" href={`/${species}/view?orf=${p.data.orf}`}>{p.data.gene}</a> },
                    cellRenderer: p => <a className="link" href={`/${species}/view?orf=${p.data.orf}`}>{p.data.gene}</a> },
                    { headerName: "ORF", field: "orf", hide: false, maxWidth: 150,
                    // cellRenderer: p => p.node.rowPinned && p.data.id === "stats" ? <p className="text-lg font-semibold text-wrap">{`${(new Set(res.map(row => row.orf))).size} unique ORFs`}</p> 
                    // : <a className="link" href={`/${species}/view?orf=${p.data.orf}`}>{p.data.orf}</a> },
                    cellRenderer: p => <a className="link" href={`/${species}/view?orf=${p.data.orf}`}>{p.data.orf}</a> },
                    { headerName: "Evidence", field: "evidence", hide: false, maxWidth: 170, 
                    cellRenderer: p => p.node.rowPinned && p.data.id === "stats" ? <BarChart colName={"evidence"} width={105} height={75} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} />
                    : p.data.evidence},
                    { headerName: "Association Type", field: "association", hide: false, maxWidth: 140, 
                    cellRenderer: p => p.node.rowPinned && p.data.id === "stats" ? <BarChart colName={"association"} width={140} height={97} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> 
                    : p.data.association},
                    { headerName: "Ref", field: "Reference", maxWidth: 80, hide: false, sortable: false, floatingFilter: false, 
                    cellRenderer: p => !p.node.rowPinned && <RegulationModal id={`reg_modal_${p.data.tf}_${p.data.gene}`} orf={p.data.gene === "Uncharacterized" ? p.data.orf : p.data.gene} tf={p.data.tf} species={species} />},
                ]);
                setRowData(res);
                // apply default sort
                if (!first) gridRef.current.api.applyColumnState({
                    state: [{ colId: "tf", sort: "asc" }, {colId: "gene", sort: null}],
                });
                setTimeout(() => gridAutoSize(gridRef), 100);

            }
        } else if (query === "rank-tf") {
            // if (documented === "") return; //not accepted
            // FORM CHECK
            if (formData.genes.trim() === "") {
                setShowFormError('"Genes" field cannot be empty');
                return;
            }
            setShowLoading(true);
            if (!q) {
                if (
                    formData.tfs.concat(
                        formData.genes,
                        formData.envconGroup,
                        formData.envconSubgroup,
                        formData.synteny,
                        formData.homolog
                    ).length < 2000
                ) {
                    const params = {};
                    params.q = query;
                    if (formData.tfs.trim() !== "") params.tfs = formData.tfs;
                    if (formData.genes.trim() !== "")
                        params.genes = formData.genes;
                    if (formData.envconGroup !== "") {
                        params.envconGroup = formData.envconGroup;
                        if (formData.envconSubgroup !== "")
                            params.envconSubgroup = formData.envconSubgroup;
                    }
                    setSearchParams(params);
                } else {
                    setSearchParams({});
                }
            }
            const res = await rankTF({
                ...formData,
                // documented: documented,
                species: speciesList[species].path,
            });
            console.log(res);

            // HTTP ERROR
            if (typeof res === "string") {
                setShowLoading(false);
                setShowError(res);
                return;
            }
            if (res.length === 0) setShowWarning("No regulations found!");

            if (!gridVisible) setGridVisible(true);
            if (showNetwork) setShowNetwork(false);

            // prettier-ignore
            setColDefs([
                { headerName: "TF", field: "tf", hide: false, rowDrag: true,
                cellRenderer: p => !p.node.rowPinned && <a className="link" href={`/${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a>},
                { headerName: "% in user set", field: "setPer", filter: 'agNumberColumnFilter', hide: false, maxWidth: 150,
                cellRenderer: (p) => p.node.rowPinned && p.data.id === "stats" ? (<Histogram data={res.map((row) => row.setPer)} width={150} height={95} />) : (p.data.setPer + "%"),},
                { headerName: `% in ${speciesList[species].short}`, field: "dbPer", filter: 'agNumberColumnFilter', hide: false, maxWidth: 150,
                cellRenderer: (p) => p.node.rowPinned && p.data.id === "stats" ? (<Histogram data={res.map((row) => row.dbPer)} width={150} height={95} />) : (p.data.dbPer + "%"),},
                { headerName: "p-value", field: "pvalue", filter: 'agNumberColumnFilter', hide: false, maxWidth: 150,
                cellRenderer: (p) => p.node.rowPinned && p.data.id === "stats" ? (<Histogram data={res.map((row) => row.pvalue)} width={150} height={95} />) : (p.data.pvalue),},
                { headerName: "Target Genes", field: "genes", hide: false, autoHeight: true, rowDrag: true,
                cellRenderer: (p) => p.node.rowPinned && p.data.id === "stats" ? <BarChart colName={"genes"} complex={true} width={130} height={75} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> 
                : (p.data.genes && p.data.genes.map((v, i) => (<><span key={v}><a className="link" href={`/${species}/view?orf=${v}`}>{v}</a>{` `}</span>{i > 0 && i % 7 === 0 && <br />}</>))),},
            ]);
            setRowData(res);
            setTimeout(() => gridAutoSize(gridRef), 100);
        } else if (query === "rank-go") {
            // FORM CHECK
            if (formData.genes.trim() === "") {
                setShowFormError('"Genes" field cannot be empty');
                return;
            }
            setShowLoading(true);
            if (!q) {
                if (formData.genes.concat(formData.ontology).length < 2000) {
                    const params = {};
                    params.q = query;
                    if (formData.genes.trim() !== "")
                        params.genes = formData.genes;
                    setSearchParams(params);
                } else {
                    setSearchParams({});
                }
            }
            const res = await rankGO({
                genes: formData.genes,
                ontology: formData.ontology,
                species: speciesList[species].path,
            });
            console.log(res);
            // HTTP ERROR
            if (typeof res === "string") {
                setShowLoading(false);
                setShowError(res);
                return;
            }
            if (res.length === 0) setShowWarning("No GO terms found!");

            if (!gridVisible) setGridVisible(true);
            if (showNetwork) setShowNetwork(false);

            // prettier-ignore
            setColDefs([
                { headerName: "GO ID", field: "goid", hide: false, 
                cellRenderer: (p) => p.node.rowPinned && p.data.id === "stats" ? (<></>) : (<a className="link" target="_blank" rel="noopener noreferrer" href={`${constants.geneOntologyUrl}${p.data.goid}`}>{p.data.goid}</a>),},
                { headerName: "GO Term", field: "term", hide: false, maxWidth: 300, autoHeight: true,
                cellRenderer: (p) => p.node.rowPinned && p.data.id === "stats" ? (<></>) : (<a className="link text-wrap leading-5" href={`/${species}/view?goid=${p.data.goid}`}>{p.data.term}</a>),},
                { headerName: "Depth level", field: "depth", filter: 'agNumberColumnFilter', hide: false, maxWidth: 150,
                cellRenderer: p => p.node.rowPinned && p.data.id === "stats" ? <BarChart data={res} colName={"depth"} width={150} height={95} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> : p.data.depth},
                { headerName: "% in user set", field: "setPer", filter: 'agNumberColumnFilter', hide: false, maxWidth: 150,
                cellRenderer: (p) =>p.node.rowPinned && p.data.id === "stats" ? (<Histogram data={res.map((row) => row.setPer)} width={150} height={95} />) : (p.data.setPer + "%"),},
                { headerName: `% in ${speciesList[species].short}`, field: "dbPer", filter: 'agNumberColumnFilter', hide: false, maxWidth: 150,
                cellRenderer: (p) => p.node.rowPinned && p.data.id === "stats" ? (<Histogram data={res.map((row) => row.dbPer)} width={150} height={95} />) : (p.data.dbPer + "%"),},
                { headerName: "p-value", field: "pvalue", filter: 'agNumberColumnFilter', hide: false, maxWidth: 150,
                cellRenderer: (p) => p.node.rowPinned && p.data.id === "stats" ? (<Histogram data={res.map((row) => row.pvalue)} width={150} height={95} />) : (p.data.pvalue),},
                { headerName: "Target Genes", field: "genes", hide: false, autoHeight: true, rowDrag: true,
                cellRenderer: (p) => p.node.rowPinned && p.data.id === "stats" ? <BarChart colName={"genes"} complex={true} width={130} height={75} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> 
                : (p.data.genes && p.data.genes.map((v, i) => (<><span key={v}><a className="link" href={`/${species}/view?orf=${v}`}>{v}</a>{` `}</span>{i > 0 && i % 5 === 0 && <br />}</>))),},
            ]);
            setRowData(res);
            setTimeout(() => gridAutoSize(gridRef), 100);
        } else if (query === "rank-tfbs") {
            // FORM CHECK
            if (formData.genes.trim() === "") {
                setShowFormError('"Genes" field cannot be empty');
                return;
            }
            if (formData.homolog === "") {
                setShowFormError("Please select a Homolog Species");
                return;
            }
            setShowLoading(true);
            if (!q) {
                if (
                    formData.tfs.concat(
                        formData.genes,
                        formData.synteny,
                        formData.homolog
                    ).length < 2000
                ) {
                    const params = {};
                    params.q = query;
                    if (formData.tfs.trim() !== "") params.tfs = formData.tfs;
                    if (formData.genes.trim() !== "")
                        params.genes = formData.genes;
                    setSearchParams(params);
                } else {
                    setSearchParams({});
                }
            }
            const res = await rankTFBS({
                ...formData,
                species: speciesList[species].path,
            });
            console.log(res);
            if (!gridVisible) setGridVisible(true);
            if (showNetwork) setShowNetwork(false);

            // TODO
        } else {
            console.error(
                `Form Submission Error: Unknown query name: ${query}`
            );
        }
        setShowLoading(false);
    }

    // run query on first page load if url params are provided
    if (firstRender) {
        // if query is valid
        if (queries.includes(searchParams.get("q"))) {
            setHistoryCall(searchParams.get("q"));
        }
        setFirstRender(false);
    }

    // re-running query if user hits "go back" or "go forward" buttons on browser
    React.useEffect(() => {
        function runQuery(e) {
            const search = e.target.location.search.substring(1);
            if (search) {
                const params = JSON.parse(
                    '{"' +
                        search.replace(/&/g, '","').replace(/=/g, '":"') +
                        '"}',
                    function (key, value) {
                        return key === "" ? value : decodeURIComponent(value);
                    }
                );
                const q = params["q"];
                if (queries.includes(q)) {
                    setFormData((prevData) => {
                        const formKeys = Object.keys(prevData);
                        let newForm = { ...prevData };
                        for (let key of Object.keys(params)) {
                            if (formKeys.includes(key)) {
                                newForm = { ...newForm, [key]: params[key] };
                            }
                        }
                        console.log(newForm);
                        return newForm;
                    });
                    setHistoryCall(q);
                }
            }
        }
        window.addEventListener("popstate", runQuery);
        return () => {
            window.removeEventListener("popstate", runQuery);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        if (historyCall) {
            handleQuery(undefined, historyCall);
            setHistoryCall("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [historyCall]);

    const pinnedTopRowData = React.useMemo(() => {
        console.log(showNetwork);
        return [{ id: "stats" }, { id: "network" }];
    }, [showNetwork]);

    const getRowHeight = (params) => {
        if (!showNetwork && params.data.id === "network") return 1;
        else if (showNetwork && params.data.id === "network") return 700;
        else if (showNetwork && !params.node.rowPinned) return 1;
        else if (params.data.id === "stats") return 80;
        else return 30;
    };

    React.useEffect(() => {
        if (gridRef.current) {
            gridRef.current.api.forEachNode((node) => {
                if (showNetwork && !node.rowPinned) {
                    node.setRowHeight(1);
                    // gridRef.current.api.suppressPaginationPanel = true;
                }
                if (!showNetwork && !node.rowPinned) {
                    node.setRowHeight(30);
                    // gridRef.current.api.suppressPaginationPanel = false;
                }
            });
            setSupressPaginationPanel((prev) => !prev);
            gridRef.current.api.onRowHeightChanged();
        }
    }, [showNetwork]);

    // const updateRowHeight = React.useCallback((networkVisible) => {
    //     gridRef.current.api.forEachNode((node) => {
    //         if (networkVisible && !node.rowPinned) {
    //             node.setRowHeight(1);
    //             gridRef.current.api.suppressPaginationPanel = true;
    //         }
    //         if (!networkVisible && !node.rowPinned) {
    //             node.setRowHeight(35);
    //             gridRef.current.api.suppressPaginationPanel = false;
    //         }
    //     });
    //     // gridRef.current.api.resetRowHeights();
    //     gridRef.current.api.onRowHeightChanged();
    // }, []);

    const getRowStyle = React.useCallback(
        (params) => {
            if (
                (!showNetwork && params.node.data.id === "network") ||
                (showNetwork && !params.node.rowPinned)
            ) {
                return { visibility: "hidden" };
            } else return { visibility: "visible" };
        },
        [showNetwork]
    );

    const autoSizeStrategy = React.useMemo(
        () => ({
            type: "fitCellContents",
        }),
        []
    );

    const gridRef = React.useRef();

    const onBtnExport = React.useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
    }, []);

    const onBtnResetFilter = React.useCallback(() => {
        gridRef.current.api.setFilterModel(null);
    }, []);

    function getFilteredData() {
        const rowData = [];
        if (gridRef.current) {
            gridRef.current.api.forEachNodeAfterFilter((node) => {
                rowData.push(node.data);
            });
        }
        return rowData;
    }

    const getFilterTerm = React.useCallback((col) => {
        const filter = gridRef.current.api.getColumnFilterModel(col);
        const ret = [];
        if (!filter) return null;
        if (filter.conditions) {
            ret.push(...filter.conditions.map((c) => c.filter));
        } else {
            ret.push(filter.filter);
        }
        // return filter === null ? null : filter.filter;
        return ret;
    }, []);

    const setFilter = React.useCallback(async (col, val, remove = false) => {
        let filter = null;
        const currentFilter = gridRef.current.api.getColumnFilterModel(col);
        if (remove) {
            if (currentFilter) {
                const cds = currentFilter.conditions;
                if (cds) {
                    if (cds.some((c) => c.filter === val)) {
                        if (cds.length > 2) {
                            filter = {
                                filterType: "text",
                                operator: "AND",
                                conditions: cds.filter((c) => c.filter !== val),
                            };
                        } else {
                            filter = {
                                filterType: "text",
                                type: "contains",
                                filter: cds.filter((c) => c.filter !== val)[0]
                                    .filter,
                            };
                        }
                    } else filter = currentFilter;
                } else filter = null;
            } else filter = null;
        } else {
            if (currentFilter) {
                let conditions = currentFilter.conditions;
                if (conditions)
                    conditions.push({
                        filterType: "text",
                        type: "contains",
                        filter: val,
                    });
                else
                    conditions = [
                        currentFilter,
                        { filterType: "text", type: "contains", filter: val },
                    ];
                filter = {
                    filterType: "text",
                    operator: "AND",
                    conditions: conditions,
                };
            } else {
                filter = {
                    filterType: "text",
                    type: "contains",
                    filter: val,
                };
            }
        }
        // prettier-ignore
        await gridRef.current.api.setColumnFilterModel(col, filter);
        gridRef.current.api.onFilterChanged();
    }, []);

    // const setNumberFilter = React.useCallback(async (col, min, max) => {
    //     await gridRef.current.api.setColumnFilterModel(col, min === null ? null : {
    //         filterType: "number",
    //         type: "inRange",
    //         filter: min,
    //         filterTo: max,
    //     });
    //     gridRef.current.api.onFilterChanged();
    // }, []);

    // const getFilterInterval = React.useCallback((col) => {
    //     const filter = gridRef.current.api.getColumnFilterModel(col);
    //     return filter === null || filter.type !== "inRange"
    //         ? null
    //         : [filter.filter, filter.filterTo];
    // }, []);

    const addListener = React.useCallback((listener) => {
        gridRef.current.api.addEventListener("filterChanged", listener);
    }, []);

    const removeListener = React.useCallback((listener) => {
        if (gridRef.current)
            gridRef.current.api.removeEventListener("filterChanged", listener);
    }, []);

    const enableDropZones = React.useCallback((params) => {
        const tfTargetContainer = document.querySelector("#tfs");
        const geneTargetContainer = document.querySelector("#genes");
        const tfDropZoneParams = {
            getContainer: () => tfTargetContainer,
            onDragStop: (params) => {
                console.log(params);
                const value = params.node.data.tf;
                setFormData((prevData) => ({
                    ...prevData,
                    tfs:
                        prevData.tfs.trim() === ""
                            ? value
                            : prevData.tfs + "\n" + value,
                }));
            },
        };
        const geneDropZoneParams = {
            getContainer: () => geneTargetContainer,
            onDragStop: (params) => {
                let value = "";
                if (params.node.data.gene !== undefined) {
                    value =
                        params.node.data.gene === "Uncharacterized"
                            ? params.node.data.orf
                            : params.node.data.gene;
                } else if (params.node.data.genes !== undefined) {
                    value = params.node.data.genes.join("\n");
                }

                setFormData((prevData) => ({
                    ...prevData,
                    genes:
                        prevData.genes.trim() === ""
                            ? value
                            : prevData.genes + "\n" + value,
                }));
            },
        };
        params.api.addRowDropZone(tfDropZoneParams);
        params.api.addRowDropZone(geneDropZoneParams);
    }, []);

    const onGridReady = React.useCallback(
        (params) => {
            // addListener(() => {
            //     setFilteredData(getFilteredData());
            // });
            gridRef.current.api.onFilterChanged();
            enableDropZones(params);
        },
        [enableDropZones]
    );

    // const onGridPreDestroyed = React.useCallback((params) => {
    //     const { state } = params;
    //     console.log(state);
    //     setGridSavedState(state);
    // }, []);

    return (
        <div className="w-full h-full">
            <h1 className="ml-4 font-figtree text-xl">Regulations</h1>
            <form
                onSubmit={handleQuery}
                className="p-4 border-b border-gray-500"
            >
                <div className="flex flex-col md:flex-row md:flex-wrap items-center md:items-start gap-2 xl:gap-8">
                    <div className="flex flex-col p-3 max-w-sm rounded-lg shadow-md shadow-gray-300">
                        <div className="flex flex-row gap-2">
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
                                    className="textarea textarea-bordered textarea-primary resize-none min-h-[194px] max-h-[194px] max-w-40 text-color leading-4"
                                    onChange={handleForm}
                                ></textarea>
                            </label>
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
                                    className="textarea textarea-bordered textarea-primary resize-none min-h-[194px] max-h-[194px] max-w-40 text-color leading-4"
                                    onChange={handleForm}
                                ></textarea>
                            </label>
                            <div className="flex flex-col gap-1 justify-end">
                                {speciesList[species].dbstrains.map(
                                    (strain) => (
                                        <div
                                            className="tooltip"
                                            key={strain}
                                            data-tip={`Sample strain ${strain}`}
                                        >
                                            <button
                                                className="btn btn-xs btn-square"
                                                type="button"
                                                id={`${strain}-sample-button`}
                                                value={strain}
                                                onClick={setSampleData}
                                            >
                                                <SampleDataIcon />
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
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
                    <div className="flex flex-col gap-2">
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
                    {showFormError && <ErrorAlert msg={showFormError} />}
                </div>
            </form>
            {showWarning && (
                <div className="px-4 py-2">
                    <WarningAlert msg={showWarning} />
                </div>
            )}
            {gridVisible && (
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
                            className="btn btn-sm"
                            onClick={() => {
                                setShowNetwork((prev) => !prev);
                                // setSupressPaginationPanel(
                                //     !supressPaginationPanel
                                // );
                                // negative operator because state is not up to date yet
                                // updateRowHeight(!showNetwork);
                            }}
                            disabled={
                                rowData.length === 0 ||
                                (rowData.length > 0 &&
                                    rowData[0].gene === undefined)
                            }
                        >
                            {showNetwork ? <TableIcon /> : <NetworkIcon />}
                            {/* <NetworkIcon /> */}
                            <span className="hidden md:block">
                                {showNetwork ? `Table` : `Network`}
                            </span>
                        </button>
                        <button className="btn btn-sm" onClick={onBtnExport}>
                            <DownloadIcon />
                            <span className="hidden md:block">Download</span>
                        </button>
                        <button
                            className="btn btn-sm"
                            onClick={onBtnResetFilter}
                        >
                            <TrashIcon />
                            <span className="hidden md:block">
                                Reset Filters
                            </span>
                        </button>
                    </div>
                    {/* {showNetwork ? (
                        <Network
                            data={rowData}
                            filteredData={filteredData}
                            gridState={gridSavedState}
                            setGridState={setGridSavedState}
                        />
                    ) : ( */}
                    <div
                        className="ag-theme-quartz max-w-[100vw] z-0"
                        style={{
                            "--ag-header-background-color": "#f3f4f6",
                            // "--ag-border-color": "#f3f4f6",
                            "--ag-wrapper-border-radius": "none",
                            "--ag-cell-horizontal-border": "solid #e5e7eb",
                        }}
                    >
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
                            suppressPaginationPanel={supressPaginationPanel}
                            // selectable text inside table
                            enableCellTextSelection={true}
                            ensureDomOrder={true}
                            // enable pinned row for graphs
                            pinnedTopRowData={pinnedTopRowData}
                            // for pinned row height
                            getRowHeight={getRowHeight}
                            // column sizing
                            autoSizeStrategy={autoSizeStrategy}
                            // idk yet
                            // getRowStyle={rowStyleFunc}
                            // initialState={gridSavedState}
                            onGridReady={onGridReady}
                            rowDrag={true}
                            // suppressMoveWhenRowDragging={true}
                            // onGridPreDestroyed={onGridPreDestroyed}
                            getRowStyle={getRowStyle}
                        />
                    </div>
                    {/* )} */}
                </div>
            )}
            {showError && (
                    <ErrorToast msg={showError} setShow={setShowError} />
                ) &&
                // disappear after 10 seconds
                setTimeout(() => {
                    if (showError) setShowError("");
                }, 10000)}
            {showLoading && <Loading />}
        </div>
    );
}
