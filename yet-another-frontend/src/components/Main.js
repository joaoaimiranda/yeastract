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

export default function Main() {
    // const [crossSpecies, setCrossSpecies] = React.useState(false);
    // const [documented, setDocumented] = React.useState(true);
    // const [expression, setExpression] = React.useState(false);
    const [formData, setFormData] = React.useState({
        // query: "rank-none",
        tfs: "",
        genes: "",
        // evidence: "documented",

        binding: false,
        expression: true,
        // and -> false | or -> true
        and_or: false,
        activator: true,
        inhibitor: true,
        noexprinfo: true,
        envconGroup: "",
        envconSubgroup: "",
        synteny: 0,
        homolog: "",
    });

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

    // FIXME SPECIES STRING FOR MULTIPLE STRAINS
    async function handleQuery(event) {
        event.preventDefault();
        const query = event.nativeEvent.submitter.name;

        let documented = "";
        if (formData.binding && formData.expression)
            documented = formData.and_or
                ? "binding or expression"
                : "binding and expression";
        else if (formData.binding) documented = "binding";
        else if (formData.expression) documented = "expression";

        if (query === "rank-none") {
            if (documented === "") return; //not accepted
            const reverseCols = formData.tfs.trim() === "";
            const res = await searchRegulations({
                ...formData,
                documented: documented,
                species: speciesList[species].path,
            });
            console.log(res);

            //prettier-ignore
            if (reverseCols) {
                setColDefs([
                    { headerName: "Gene", field: "gene", hide: false, 
                    cellRenderer: p => <a className="link" href={`/${species}/view?orf=${p.data.gene}`}>{p.data.gene}</a> },
                    { headerName: "TF", field: "tf", hide: false, 
                    cellRenderer: p => <><a className="link" href={`/${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a><RegulationModal id={`reg_modal_${p.data.gene}_${p.data.tf}`} orf={p.data.gene} tf={p.data.tf} species={species} /></> },
                ]);
                setRowData(res);
                gridRef.current.api.applyColumnState({
                    state: [{ colId: "tf", sort: "asc", sortIndex: 1 }, { colId: "gene", sort: "asc", sortIndex: 0 }],
                });
            }
            else{
            setColDefs([
                { headerName: "TF", field: "tf", hide: false,
                cellRenderer: p => p.node.rowPinned ? <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v4m6-6v6m6-4v4m6-6v6M3 11l6-5 6 5 5.5-5.5"/>
              </svg>
               : <a className="link" href={`${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a> },
                { headerName: "Gene", field: "gene", hide: false, 
                cellRenderer: p => p.node.rowPinned ? <svg className="w-6 h-6 text-gray-800" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15v4m6-6v6m6-4v4m6-6v6M3 11l6-5 6 5 5.5-5.5"/>
              </svg> 
               :<><a className="link" href={`${species}/view?orf=${p.data.gene}`}>{p.data.gene}</a><RegulationModal id={`reg_modal_${p.data.tf}_${p.data.gene}`} orf={p.data.gene} tf={p.data.tf} species={species} /></> },
            //     {headerName: "", field : "ColMenu", hide: false, suppressHeaderMenuButton: true, floatingFilter: false, cellRenderer: p => p.node.rowPinned ?
            //     <details className="dropdown">
            //     <summary
            //         className="btn btn-sm btn-ghost m-1 p-2 z-0"
            //     >
            //         <svg
            //             xmlns="http://www.w3.org/2000/svg"
            //             width="16"
            //             height="16"
            //             fill="currentColor"
            //             className="bi bi-list"
            //             viewBox="0 0 16 16"
            //         >
            //             <path
            //                 fillRule="evenodd"
            //                 d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
            //             />
            //         </svg>
            //     </summary>
            //     <ul
            //         className="dropdown-content z-40 menu p-2 shadow bg-base-100 rounded-box w-52"
            //     >
            //         {colDefs.map((col) => 
            //             <li key={col.field}>
            //                 <label className="label cursor-pointer">
            //                     <span className="label-text">
            //                         {col.headerName}
            //                     </span>
            //                     <input
            //                         type="checkbox"
            //                         id={col.field}
            //                         name={col.field}
            //                         defaultChecked={!col.hide}
            //                         className="checkbox checkbox-sm checkbox-primary"
            //                         onChange={handleColumns}
            //                     />
            //                 </label>
            //             </li>
            //         )}
            //     </ul>
            // </details> : <></>}
            ]);
            setRowData(res);
            gridRef.current.api.applyColumnState({
                state: [{ colId: "tf", sort: "asc" }, { colId: "gene", sort: null}],
            });
        }
        } else if (query === "rank-tf") {
            if (documented === "") return; //not accepted
            const res = await rankTF({
                ...formData,
                documented: documented,
                species: speciesList[species].path,
            });
            console.log(res);
            setColDefs([
                { headerName: "TF", field: "tf", hide: false },
                { headerName: "% in user set", field: "setPer", hide: false },
                { headerName: "% in species", field: "dbPer", hide: false },
                {
                    headerName: "Target Genes",
                    field: "genes",
                    hide: false,
                    cellRenderer: (p) =>
                        p.data.genes.map((v) => (
                            <>
                                <a className="link" href={`/view?orf=${v}`}>
                                    {v}
                                </a>
                                <span> </span>
                            </>
                        )),
                },
            ]);
            setRowData(res);
        } else if (query === "rank-go") {
            const res = await rankGO({
                genes: formData.genes,
                // ontology: formData.ontology,
                species: speciesList[species].path,
            });
            console.log(res);
            setColDefs([
                { headerName: "GO ID", field: "goid", hide: false },
                { headerName: "GO Term", field: "term", hide: false },
                { headerName: "Depth level", field: "depth", hide: false },
                { headerName: "% in user set", field: "setPer", hide: false },
                { headerName: "% in species", field: "dbPer", hide: false },
                {
                    headerName: "Genes",
                    field: "genes",
                    hide: false,
                    cellRenderer: (p) =>
                        p.data.genes.map((v) => (
                            <>
                                <a className="link" href={`/view?orf=${v}`}>
                                    {v}
                                </a>
                                <span> </span>
                            </>
                        )),
                },
            ]);
            setRowData(res);
        } else if (query === "rank-tfbs") {
            if (formData.homolog === "") return; //not accepted
            const res = await rankTFBS({
                ...formData,
                species: speciesList[species].path,
            });
            console.log(res);
        } else {
            console.log("Unknown query name");
        }
    }

    const pinnedTopRowData = React.useMemo(() => {
        return [
            {
                tf: "",
                gene: "",
            },
        ];
    }, []);

    const getRowHeight = React.useCallback(
        (params) => (params.node.rowPinned ? 50 : 35),
        []
    );

    const gridRef = React.useRef();

    const onBtnExport = React.useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
    }, []);

    return (
        <div className="w-full h-full">
            <h1 className="text-center font-figtree text-xl">Regulations</h1>
            <form
                className="flex flex-col md:flex-row md:flex-wrap xl:justify-center items-center gap-2 xl:gap-8 p-4 border-b border-gray-500"
                onSubmit={handleQuery}
            >
                <div className="flex flex-col p-3 max-w-sm rounded-lg shadow-md shadow-gray-200">
                    <div className="flex flex-row justify-center gap-9">
                        <div>
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
                        </div>
                        <div>
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
                                    className="textarea textarea-bordered textarea-primary min-h-44 max-h-44 max-w-40 text-color  leading-4"
                                    onChange={handleForm}
                                ></textarea>
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 mt-auto mb-2 gap-2">
                        <button className="btn" type="submit" name="rank-none">
                            Regulations
                        </button>
                        {/* <div className="col-span-2 items-end flex gap-2 ml-auto"> */}
                        {/* <span className="text-color mb-1">Rank by:</span> */}
                        <button className="btn" type="submit" name="rank-tf">
                            Rank TF
                        </button>
                        <button className="btn" type="submit" name="rank-go">
                            Rank GO
                        </button>
                        <button className="btn" type="submit" name="rank-tfbs">
                            Rank TFBS
                        </button>
                        {/* </div> */}
                    </div>
                </div>
                <div className="grid row-span-2 gap-6 max-w-sm">
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
                </div>

                <div className="flex flex-col p-3 items-center rounded-lg shadow-md shadow-gray-200 max-w-sm">
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
                            {["---", ...Object.keys(envcons)].map((option) => (
                                <option
                                    key={option}
                                    value={option === "---" ? "" : option}
                                >
                                    {option}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        <div className="label p-0 mb-2">
                            <span className="label-text text-color">
                                Subgroup
                            </span>
                        </div>

                        <select
                            className="select select-bordered select-primary select-sm w-56 mb-4 text-color"
                            id="envconSubgroup"
                            name="envconSubgroup"
                            value={formData.envconSubgroup}
                            onChange={handleForm}
                        >
                            {subgroupOptions.map((option) => (
                                <option
                                    key={option}
                                    value={option === "---" ? "" : option}
                                >
                                    {option}
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
                            onChange={handleForm}
                        >
                            {syntenies.map((x) => (
                                <option key={x.value} value={x.value}>
                                    {x.option}
                                </option>
                            ))}
                        </select>
                    </label>
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
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                className="bi bi-list"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                                />
                            </svg>
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
                    <button className="btn btn-sm" onClick={onBtnExport}>
                        Download
                    </button>
                </div>
                <div
                    className="ag-theme-quartz max-w-[100vw] h-full z-0"
                    style={{
                        "--ag-header-background-color": "#f3f4f6",
                        // "--ag-border-color": "#f3f4f6",
                        "--ag-wrapper-border-radius": "none",
                    }}
                >
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={colDefs}
                        defaultColDef={defaultColDef}
                        unSortIcon={true}
                        pagination={true}
                        paginationAutoPageSize={true}
                        pinnedTopRowData={pinnedTopRowData}
                        getRowHeight={getRowHeight}
                        // headerHeight={80}
                    />
                </div>
            </div>
        </div>
    );
}
