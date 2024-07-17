import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
    motifOnPromoter,
    tfbsByMotif,
    tfbsOnSeq,
    seqRetrieval,
    promoterAnalysis,
    tfConsensus,
} from "../services/remoteServices";
import { useParams } from "react-router-dom";
import speciesList from "../conf/speciesList";
import HamburgerIcon from "../svg/HamburgerIcon";
import DownloadIcon from "../svg/DownloadIcon";
import ErrorAlert from "./ErrorAlert";
import fastaSequenceSample from "../utils/fastaSequenceSample";
import SampleDataIcon from "../svg/SampleDataIcon";
import PromoterModal from "./PromoterModal";
import TFBSModal from "./TFBSModal";

export default function Sequences() {
    const { species } = useParams();

    const [query, setQuery] = React.useState(
        "Search for DNA motif(s) on promoter regions"
    );
    const [formData, setFormData] = React.useState({
        motif: "",
        genes: "",
        substitutions: 0,
        sequence: "",
        tfbs_species: "",
        ortholog_species: [],
        synteny: "BLAST Best-Scores",
        from: -1000,
        to: -1,
    });
    console.log("bota");
    // const [tmpResults, setTmpResults] = React.useState("");
    const [showErrorMessage, setShowErrorMessage] = React.useState({
        flag: false,
        msg: "",
    });
    const [gridVisible, setGridVisible] = React.useState(false);
    const [rowData, setRowData] = React.useState([]);

    // for upstream sequence
    const [rawData, setRawData] = React.useState([]);

    const [colDefs, setColDefs] = React.useState([
        { headerName: "TF", field: "tf" },
        { headerName: "Gene", field: "gene" },
    ]);
    const defaultColDef = React.useMemo(() => {
        return {
            filter: "agTextColumnFilter",
            floatingFilter: true,
            suppressHeaderMenuButton: true,
        };
    }, []);

    const gridRef = React.useRef();

    const onBtnExport = React.useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
    }, []);

    const queries = [
        "Search for DNA motif(s) on promoter regions",
        "Search described TF Binding Sites by a given DNA motif",
        "Find TF Binding Site(s)",
        "Promoter Analysis",
        "TF-Consensus List",
        "Upstream Sequence",
    ];

    const syntenies = [
        "BLAST Best-Scores",
        "BLAST Best-Scores + at least 1 neighbor",
        "BLAST Best-Scores + at least 2 neighbor",
        "BLAST Best-Scores + at least 3 neighbor",
    ];
    const homologs = ["c. albicans", "c. auris", "c. glabrata"];

    function handleForm(event) {
        const { name, value, checked, type } = event.target;
        let newValue = value;
        if (name === "from" && value < -1000) newValue = -1000;
        if (name === "to" && value > -1) newValue = -1;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : newValue,
        }));
    }

    function handleColumns(event) {
        const { name, checked } = event.target;
        setColDefs((prevCols) =>
            prevCols.map((col) =>
                col["field"] === name ? { ...col, hide: !checked } : col
            )
        );
    }

    function setSampleData(event) {
        let motif;
        if (query === "Search for DNA motif(s) on promoter regions")
            motif = "TATATAAG\nTATAWAAM\nTATA[GC]AA[AT]";
        else if (
            query === "Search described TF Binding Sites by a given DNA motif"
        )
            motif = "CACCAGTCGGTGGCTGTGCGCTTGTTACGTAA";
        else motif = "";

        const value = event.currentTarget.getAttribute("value");
        const sample = speciesList[species].sample.find(
            (el) => el.strain === value
        );
        const genes =
            query !==
                "Search described TF Binding Sites by a given DNA motif" &&
            query !== "Find TF Binding Site(s)" &&
            query !== "TF-Consensus List"
                ? sample.tgs
                : "";

        const seq =
            query === "Find TF Binding Site(s)" ? fastaSequenceSample : "";
        // prettier-ignore
        setFormData((prevData) => ({
            ...prevData,
            motif: motif === "" ? prevData.motif : motif,
            genes: genes === "" ? prevData.genes : genes,
            sequence: seq === "" ? prevData.sequence : seq,
            substitutions: query === "Search for DNA motif(s) on promoter regions" ? 0 : prevData.substitutions,
        }));
    }

    const autoSizeStrategy = React.useMemo(
        () => ({
            type: "fitCellContents",
        }),
        []
    );

    async function handleQuery(event) {
        console.log(query);
        event.preventDefault();
        if (showErrorMessage.flag)
            setShowErrorMessage({ flag: false, msg: "" });
        setRawData([]);

        console.log(formData);
        if (query === "Search for DNA motif(s) on promoter regions") {
            if (formData.motif.trim() === "" || formData.genes.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: "DNA Motif and ORF/Genes fields cannot be empty",
                });
                return;
            }
            const res = await motifOnPromoter({
                motif: formData.motif,
                substitutions: formData.substitutions,
                genes: formData.genes,
                species: speciesList[species].path,
            });
            console.log(res);

            if (!gridVisible) setGridVisible(true);

            const data = [];
            for (let key of Object.keys(res)) {
                for (let m of res[key]) {
                    const fcount = m.matches.F
                        ? Object.keys(m.matches.F).length
                        : 0;
                    const rcount = m.matches.R
                        ? Object.keys(m.matches.R).length
                        : 0;
                    data.push({
                        gene: key,
                        count: fcount + rcount,
                        motif: m.motif,
                        match: m,
                    });
                }
            }
            // prettier-ignore
            setColDefs([
                { headerName: "ORF/Gene", field: "gene", cellRenderer: p => <a className="link" href={`${species}/view?orf=${p.data.gene}`}>{p.data.gene}</a> },
                { headerName: "# Occurences", field: "count" },
                { headerName: "Motif", field: "motif"},
                { headerName: "Promoter", field: "Promoter", cellRenderer: p => <PromoterModal id={`prom_modal_${p.data.gene}_${p.data.motif}`} orf={p.data.gene} data={p.data.match} />}
            ]);
            setRowData(data);
        } else if (
            query === "Search described TF Binding Sites by a given DNA motif"
        ) {
            if (formData.motif.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: "DNA Motif field cannot be empty",
                });
                return;
            }
            const res = await tfbsByMotif({
                motif: formData.motif,
                substitutions: formData.substitutions,
                species: speciesList[species].path,
            });
            console.log(res);
            if (!gridVisible) setGridVisible(true);
            // let str = "";
            // for (let x of res[1]) {
            //     str += JSON.stringify(x) + "\n";
            // }
            // setTmpResults(str);
            const bsWidth =
                100 + Math.max(...res[1].map((row) => row.seq.length)) * 7;
            const tfWidth =
                100 +
                Math.max(...res[1].map((row) => row.tfs.join("").length)) * 10;
            // prettier-ignore
            // FIXME MAKE 2 TABLES - THIS ONLY WORKS FOR 2ND TABLE
            setColDefs([
                { headerName: "Binding Site", field: "seq", width: bsWidth},
                { headerName: "TF", field: "tfs", width: tfWidth, cellRenderer: p => p.data.tfs.map((v) =><><a className="link" href={`/${species}/view?orf=${v}`}>{v}</a><span> </span></>)},
                { headerName: "F", field:"F", width: 100, valueFormatter: p => p.value ? Object.keys(p.value)[0] : ""},
                { headerName: "R", field:"R", width: 100, valueFormatter: p => p.value ? Object.keys(p.value)[0] : ""}
            ])
            setRowData(res[1]);
        } else if (query === "Find TF Binding Site(s)") {
            if (formData.sequence.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: "Please enter a sequence in FASTA format",
                });
                return;
            }
            const res = await tfbsOnSeq({
                motif: formData.motif,
                substitutions: formData.substitutions,
                sequence: formData.sequence,
                species: speciesList[species].path,
            });
            console.log(res);
            if (!gridVisible) setGridVisible(true);
            // TODO
        } else if (query === "Promoter Analysis") {
            // TODO FORM CHECK
            const res = await promoterAnalysis({
                genes: formData.genes,
                tfbs_species: formData.tfbs_species,
                synteny: formData.synteny,
                ortholog_species: formData.ortholog_species,
                species: speciesList[species].path,
            });
            console.log(res);
            if (!gridVisible) setGridVisible(true);
            // TODO

            // } else if (query === "TF-Consensus List") {
            //     const res = await tfConsensus(speciesList[species].path);
            //     console.log(res);
            //     if (!gridVisible) setGridVisible(true);
            //     // setTmpResults(JSON.stringify(res));
            //     // prettier-ignore
            //     setColDefs([
            //         { headerName: "TF", field: "tf",
            //         cellRenderer: p => <a className="link" href={`/${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a>},
            //         { headerName: "Consensus", field: "seq" },
            //         { headerName: "Reference", field: "Reference", width: 100, hide: false, sortable: false, floatingFilter: false,
            //         cellRenderer: p => <TFBSModal id={`modal_${p.data.tf}_${p.data.seq}`} species={species} tf={p.data.tf} consensus={p.data.seq} /> }
            //     ]);
            //     setRowData(res);
        } else if (query === "Upstream Sequence") {
            if (formData.genes.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: "ORF/Gene field cannot be empty",
                });
                return;
            }
            const res = await seqRetrieval({
                genes: formData.genes,
                from: formData.from,
                to: formData.to,
                species: speciesList[species].path,
            });
            console.log(res);
            // let str = "";
            // for (let key of Object.keys(res)) {
            //     str += key + ":\n" + res[key] + "\n";
            // }
            // setTmpResults("");
            const resList = [];
            for (let key of Object.keys(res)) {
                let oldStr = res[key];
                const newSeq = [];

                for (let i = 0; i < res[key].length; i += 60) {
                    newSeq.push(oldStr.slice(i, i + 60));
                }
                resList.push({ tf: key, seq: newSeq });
            }
            console.log(resList);
            setGridVisible(false);
            setRawData(resList);
        } else
            console.error(
                `Form Submission Error: Unknown query name: ${query}`
            );
    }

    React.useEffect(() => {
        async function fetchData() {
            const res = await tfConsensus(speciesList[species].path);
            console.log(res);
            setGridVisible(true);
            // setTmpResults(JSON.stringify(res));
            // prettier-ignore
            setColDefs([
                { headerName: "TF", field: "tf", 
                cellRenderer: p => <a className="link" href={`/${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a>},
                { headerName: "Consensus", field: "seq" },
                { headerName: "Reference", field: "Reference", width: 100, hide: false, sortable: false, floatingFilter: false, 
                cellRenderer: p => <TFBSModal id={`modal_${p.data.tf}_${p.data.seq}`} species={species} tf={p.data.tf} consensus={p.data.seq} /> }
            ]);
            setRowData(res);
        }
        if (query === "TF-Consensus List") fetchData();
    }, [query, species]);

    const motifTextareaSize =
        query === "Search described TF Binding Sites by a given DNA motif"
            ? `min-h-9 max-h-9`
            : `min-h-20 max-h-20`;

    return (
        <>
            <form onSubmit={handleQuery} className="md:ml-4">
                {/* <div className="grid grid-cols-3 gap-3">
                    <div></div>
                    <div className="flex flex-row gap-5">
                        <h1 className="text-xl font-bold text-center mb-6 mt-2">
                            Sequences
                        </h1>
                        <select
                            className="select select-bordered select-primary max-w-106 text-color"
                            id="query"
                            name="query"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        >
                            {queries.map((option) => (
                                <option value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                    <div></div>
                </div> */}
                <div className="ml-3 flex flex-row gap-5 mb-5">
                    <h1 className="font-figtree text-xl">Sequences</h1>
                    <select
                        className="select select-sm select-bordered select-primary max-w-106 text-color"
                        id="query"
                        name="query"
                        value={query}
                        onChange={(e) => {
                            setShowErrorMessage({ flag: false, msg: "" });
                            setQuery(e.target.value);
                        }}
                    >
                        {queries.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-row space-x-6 p-3 border-b border-gray-500">
                    {query !== "Promoter Analysis" &&
                        query !== "TF-Consensus List" &&
                        query !== "Upstream Sequence" && (
                            <div className="flex flex-col">
                                <label>
                                    <div className="label p-0 mb-2">
                                        <span className="label-text text-color">
                                            DNA Motif
                                        </span>
                                    </div>
                                    <textarea
                                        id="motif"
                                        name="motif"
                                        value={formData.motif}
                                        className={`textarea textarea-bordered textarea-primary resize-none text-color ${motifTextareaSize} leading-4`}
                                        onChange={handleForm}
                                    ></textarea>
                                </label>
                                <label className="label cursor-pointer mt-2 p-0">
                                    {/* <div className="label p-0 mb-2">
                                        <span className="label-text text-color">
                                            Substitutions
                                        </span>
                                    </div> */}
                                    <span className="label-text text-color">
                                        Substitutions
                                    </span>
                                    <select
                                        className="select select-bordered select-primary select-sm max-w-24 mb-3 text-color"
                                        id="substitutions"
                                        name="substitutions"
                                        value={formData.substitutions}
                                        onChange={handleForm}
                                    >
                                        {[0, 1, 2].map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        )}
                    {query !==
                        "Search described TF Binding Sites by a given DNA motif" &&
                        query !== "Find TF Binding Site(s)" &&
                        query !== "TF-Consensus List" && (
                            <label>
                                <div className="label p-0 mb-2">
                                    <span className="label-text text-color">
                                        ORF/Gene
                                    </span>
                                </div>
                                <textarea
                                    id="genes"
                                    name="genes"
                                    value={formData.genes}
                                    className="textarea textarea-bordered textarea-primary resize-none max-w-24 min-h-32 max-h-32 text-color leading-4"
                                    onChange={handleForm}
                                ></textarea>
                            </label>
                        )}
                    {/* QUERY-DEPENDENT OPTIONS */}
                    {query === "Find TF Binding Site(s)" && (
                        <label>
                            <div className="label p-0 mb-2">
                                <span className="label-text text-color">
                                    Sequence (FastA format)
                                </span>
                            </div>
                            <textarea
                                id="sequence"
                                name="sequence"
                                value={formData.sequence}
                                className="textarea textarea-bordered textarea-primary resize-none text-color min-h-32 max-h-32 leading-4"
                                onChange={handleForm}
                            ></textarea>
                        </label>
                    )}
                    {query === "Promoter Analysis" && (
                        <div className="grid grid-rows-2">
                            {/* <span> */}
                            {/* <Select
                                variant="bordered"
                                label="Consider TFBS from strain:"
                                className="mb-6"
                                id="tfbs_species"
                                name="tfbs_species"
                                defaultSelectedKeys={[formData.substitutions]}
                                onChange={handleForm}
                            >
                                {[0, 1, 2].map((x) => (
                                    <SelectItem key={x} value={x}>
                                        {x}
                                    </SelectItem>
                                ))}
                            </Select>*/}
                            <label>
                                <div className="label p-0 mb-2">
                                    <span className="label-text text-color">
                                        Consider TFBS from strain:
                                    </span>
                                </div>

                                <select
                                    className="select select-bordered select-primary select-sm w-full max-w-xs mb-3 text-color"
                                    id="tfbs_species"
                                    name="tfbs_species"
                                    value={formData.tfbs_species}
                                    onChange={handleForm}
                                >
                                    {homologs.map((option) => (
                                        <option value={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="self-end mb-2">
                                <div className="label p-0 mb-2">
                                    <span className="label-text text-color">
                                        Synteny
                                    </span>
                                </div>

                                <select
                                    className="select select-bordered select-primary select-sm w-full max-w-xs text-color"
                                    id="synteny"
                                    name="synteny"
                                    value={formData.synteny}
                                    onChange={handleForm}
                                >
                                    {syntenies.map((option) => (
                                        <option value={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                            {/* </span> */}
                            {/* TODO COMPARE GENES WITH ORTHOLOGY IN STRAINS*/}
                            {/* <Select
                            label="Compare genes with orthology in strains:"
                            className="max-w-xs mb-6"
                            id="ortholog_species"
                            name="ortholog_species"
                            // TODO FIXME
                            // defaultSelectedKeys={[currentSpecies]}
                            // onChange={(e) => setCurrentSpecies(e.target.value)}
                        >
                            {species.map((x) => (
                                <SelectItem key={x} value={x}>
                                    {x}
                                </SelectItem>
                            ))}
                        </Select> */}
                        </div>
                    )}
                    {query === "Upstream Sequence" && (
                        <div className="grid grid-rows-2">
                            <label>
                                <div className="label p-0 mb-2">
                                    <span className="label-text text-color">
                                        From:
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    id="from"
                                    name="from"
                                    value={formData.from}
                                    className="input input-bordered input-primary input-sm max-w-20 text-color"
                                    onChange={handleForm}
                                />
                            </label>
                            <label className="self-end mb-2">
                                <div className="label">
                                    <span className="label-text text-color">
                                        To
                                    </span>
                                </div>
                                <input
                                    type="number"
                                    id="to"
                                    name="to"
                                    value={formData.to}
                                    className="input input-bordered input-primary input-sm max-w-20 text-color"
                                    onChange={handleForm}
                                />
                            </label>
                        </div>
                    )}
                    {query !== "TF-Consensus List" && (
                        <div className="flex flex-col gap-2">
                            <button
                                className="btn btn-primary mt-7"
                                type="submit"
                                onSubmit={handleQuery}
                            >
                                Search
                            </button>
                            <div className="flex flex-row gap-1">
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
                    )}
                </div>
                <div className="mt-2">
                    {showErrorMessage.flag && (
                        <ErrorAlert msg={showErrorMessage.msg} />
                    )}
                </div>
            </form>
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
                        <button className="btn btn-sm" onClick={onBtnExport}>
                            <DownloadIcon />
                            Download
                        </button>
                    </div>
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
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={colDefs}
                            defaultColDef={defaultColDef}
                            autoSizeStrategy={autoSizeStrategy}
                            unSortIcon={true}
                            // table height
                            domLayout={"autoHeight"}
                            // pagination
                            pagination={true}
                            paginationPageSize={50}
                            // selectable text inside table
                            enableCellTextSelection={true}
                            ensureDomOrder={true}
                        />
                    </div>
                </div>
            )}
            {rawData.length > 0 && (
                <pre className="px-4 py-2">
                    {rawData.map((row) => {
                        return (
                            <>
                                <p key={row.tf} className="text-sm">
                                    {`>${row.tf}`}
                                    <br />
                                    {row.seq.map((line) => (
                                        <>
                                            {`${line}`}
                                            <br />
                                        </>
                                    ))}
                                </p>
                            </>
                        );
                    })}
                </pre>
            )}
        </>
    );
}
