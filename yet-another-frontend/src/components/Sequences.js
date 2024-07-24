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
import { useParams, useSearchParams } from "react-router-dom";
import speciesList from "../conf/speciesList";
import HamburgerIcon from "../svg/HamburgerIcon";
import DownloadIcon from "../svg/DownloadIcon";
import ErrorAlert from "./ErrorAlert";
import fastaSequenceSample from "../conf/fastaSequenceSample";
import SampleDataIcon from "../svg/SampleDataIcon";
import PromoterModal from "./PromoterModal";
import TFBSModal from "./TFBSModal";
import { gridAutoSize } from "../utils/utils";
import Loading from "./Loading";
import MatchesChart from "../charts/MatchesChart";

export default function Sequences() {
    const { species } = useParams();
    let [searchParams, setSearchParams] = useSearchParams();
    const [first, setFirst] = React.useState(true);
    const [historyCall, setHistoryCall] = React.useState(false);

    // prettier-ignore
    const queries = [
        { option: "Search for DNA motif(s) on promoter regions", value: "motif-on-promoter"},
        { option: "Search described TF Binding Sites by a given DNA motif", value: "tfbs-by-motif"},
        { option: "Find TF Binding Site(s)", value: "tfbs-on-seq"},
        { option: "Promoter Analysis", value: "prom-analysis"},
        { option: "TF-Consensus List", value: "tf-consensus"},
        { option: "Upstream Sequence", value: "upstream-seq"},
    ];
    const substitutions = [0, 1, 2];

    const [query, setQuery] = React.useState(
        searchParams.get("q") &&
            queries.some((row) => row.value === searchParams.get("q"))
            ? queries.find((row) => row.value === searchParams.get("q"))
            : queries[0]
    );

    const [formData, setFormData] = React.useState({
        motif: searchParams.get("motif") ? searchParams.get("motif") : "",
        genes: searchParams.get("genes") ? searchParams.get("genes") : "",
        substitutions:
            searchParams.get("subs") &&
            substitutions.includes(Number(searchParams.get("subs")))
                ? Number(searchParams.get("subs"))
                : 0,
        sequence: searchParams.get("seq") ? searchParams.get("seq") : "",
        tfbs_species: searchParams.get("tfbsspecies")
            ? searchParams.get("tfbsspecies")
            : "",
        ortholog_species: [], // TODO
        synteny:
            searchParams.get("synteny") &&
            substitutions.includes(Number(searchParams.get("synteny")))
                ? Number(searchParams.get("synteny"))
                : 0,
        from:
            searchParams.get("from") &&
            Number(searchParams.get("from")) >= -1000 &&
            Number(searchParams.get("from")) <= -1
                ? Number(searchParams.get("from"))
                : -1000,
        to:
            searchParams.get("to") &&
            Number(searchParams.get("to")) >= -1000 &&
            Number(searchParams.get("to")) <= -1
                ? Number(searchParams.get("to"))
                : -1,
    });

    const [showErrorMessage, setShowErrorMessage] = React.useState({
        flag: false,
        msg: "",
    });
    const [showLoading, setShowLoading] = React.useState(false);
    const [gridVisible, setGridVisible] = React.useState(false);

    const [rowData, setRowData] = React.useState([]);
    const [mopRowData, setMopRowData] = React.useState([]);
    const [tbmRowData, setTbmRowData] = React.useState([]);
    // for find tf binding sites
    const [tosRowData, setTosRowData] = React.useState([]);
    const [tosChartData, setTosChartData] = React.useState([]);
    const [showTos, setShowTos] = React.useState(false);
    // const [paRowData, setPaRowData] = React.useState([])
    // for upstream sequence
    const [showUpsData, setShowUpsData] = React.useState(false);
    const [upsData, setUpsData] = React.useState([]);

    // prettier-ignore
    const mopColDefs = [
        { headerName: "Gene", field: "gene", 
        cellRenderer: (p) => (<a className="link" href={`${species}/view?orf=${p.data.gene}`}>{p.data.gene}</a>)},
        { headerName: "#", field: "count" },
        { headerName: "Motif", field: "motif" },
        { headerName: "Promoter", field: "Promoter", maxWidth: 100, sortable: false, floatingFilter: false, 
        cellRenderer: (p) => (<PromoterModal id={`prom_modal_${p.data.gene}_${p.data.motif}`} orf={p.data.gene} data={p.data.match} />)},
    ];
    // prettier-ignore
    const tbmColDefs = [
        { headerName: "Binding Site", field: "seq" },
        { headerName: "TF", field: "tfs", maxWidth: 500, autoHeight: true,
        cellRenderer: (p) => p.data.tfs.map((v) => (<span key={v}><a className="link" href={`/${species}/view?orf=${v}`}>{v}</a>{` `}</span>))},
        { headerName: "F", field: "F",
        valueFormatter: (p) => (p.value ? Object.keys(p.value)[0] : ""),},
        { headerName: "R", field: "R",
        valueFormatter: (p) => (p.value ? Object.keys(p.value)[0] : ""),},
    ];

    // prettier-ignore
    const tosColDefs = [
        { headerName: "Binding Site", field: "seq" },
        { headerName: "TF", field: "tfs", maxWidth: 500, autoHeight: true, 
        cellRenderer: p => p.data.tfs.map((v, i) => (<span key={`${v}${i}`}><a className="link" href={`/${species}/view?orf=${v}`}>{v}</a>{` `}</span>))},
        { headerName: "Position", field: "pos", filter: 'agNumberColumnFilter'},
        { headerName: "Strand", field: "strand" }
    ]

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

    const syntenies = [
        { option: "BLAST Best-Scores", value: 0 },
        { option: "BLAST Best-Scores + at least 1 neighbor", value: 1 },
        { option: "BLAST Best-Scores + at least 2 neighbor", value: 2 },
        { option: "BLAST Best-Scores + at least 3 neighbor", value: 3 },
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
        if (query.value === "motif-on-promoter")
            motif = "TATATAAG\nTATAWAAM\nTATA[GC]AA[AT]";
        else if (query.value === "tfbs-by-motif")
            motif = "CACCAGTCGGTGGCTGTGCGCTTGTTACGTAA";
        else motif = "";

        const value = event.currentTarget.getAttribute("value");
        const sample = speciesList[species].sample.find(
            (el) => el.strain === value
        );
        const genes =
            query.value !== "tfbs-by-motif" &&
            query.value !== "tfbs-on-seq" &&
            query.value !== "tf-consensus"
                ? sample.tgs
                : "";

        const seq = query.value === "tfbs-on-seq" ? fastaSequenceSample : "";
        // prettier-ignore
        setFormData((prevData) => ({
            ...prevData,
            motif: motif === "" ? prevData.motif : motif,
            genes: genes === "" ? prevData.genes : genes,
            sequence: seq === "" ? prevData.sequence : seq,
            substitutions: query.value === "motif-on-promoter" ? 0 : prevData.substitutions,
        }));
    }

    const autoSizeStrategy = React.useMemo(
        () => ({
            type: "fitCellContents",
        }),
        []
    );

    function handleQueryChange(e) {
        console.log("bota");
        const value = e.target.value;
        setShowErrorMessage({ flag: false, msg: "" });
        setQuery(queries.find((el) => el.value === value));
        if (value !== "upstream-seq") setShowUpsData(false);
        if (value !== "tfbs-on-seq") setShowTos(false);

        if (value === "motif-on-promoter") {
            if (mopRowData.length !== 0) {
                if (!gridVisible) setGridVisible(true);
                setColDefs(mopColDefs);
                setRowData(mopRowData);
                setTimeout(() => gridAutoSize(gridRef), 100);
            } else {
                setGridVisible(false);
            }
        } else if (value === "tfbs-by-motif") {
            if (tbmRowData.length !== 0) {
                if (!gridVisible) setGridVisible(true);
                setColDefs(tbmColDefs);
                setRowData(tbmRowData);
                setTimeout(() => gridAutoSize(gridRef), 100);
            } else {
                setGridVisible(false);
            }
        } else if (value === "tfbs-on-seq") {
            if (tosRowData.length !== 0) {
                setColDefs(tosColDefs);
                setRowData(tosRowData);
                setShowTos(true);
            }
        }
        // else if (value === "prom-analysis") {
        //     if (paRowData.length !== 0) setRowData(paRowData)
        // }
        else if (value === "upstream-seq") {
            if (upsData.length !== 0) setShowUpsData(true);
            else setGridVisible(false);
        } else {
        }
    }

    async function handleQuery(event) {
        console.log(query);
        if (event !== undefined) {
            event.preventDefault();
        }
        if (showErrorMessage.flag)
            setShowErrorMessage({ flag: false, msg: "" });
        if (query.value !== "upstream-seq") setShowUpsData(false);

        console.log(formData);
        if (query.value === "motif-on-promoter") {
            if (formData.motif.trim() === "" || formData.genes.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: "DNA Motif and ORF/Genes fields cannot be empty",
                });
                return;
            }
            setShowLoading(true);

            if (event !== undefined) {
                if (
                    query.value.concat(
                        formData.motif,
                        formData.substitutions,
                        formData.genes
                    ).length < 2000
                ) {
                    const params = {};
                    params.q = query.value;
                    params.motif = formData.motif;
                    params.subs = formData.substitutions;
                    params.genes = formData.genes;
                    setSearchParams(params);
                } else {
                    setSearchParams({ q: query.value });
                }
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
            setColDefs(mopColDefs);
            setRowData(data);
            setMopRowData(data);
            setTimeout(() => gridAutoSize(gridRef), 100);
        } else if (query.value === "tfbs-by-motif") {
            if (formData.motif.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: "DNA Motif field cannot be empty",
                });
                return;
            }
            setShowLoading(true);

            if (
                query.value.concat(formData.motif, formData.substitutions)
                    .length < 2000
            ) {
                const params = {};
                params.q = query.value;
                params.motif = formData.motif;
                params.subs = formData.substitutions;
                setSearchParams(params);
            } else {
                setSearchParams({ q: query.value });
            }

            const res = await tfbsByMotif({
                motif: formData.motif,
                substitutions: formData.substitutions,
                species: speciesList[species].path,
            });
            console.log(res);
            if (!gridVisible) setGridVisible(true);

            // const bsWidth =
            //     100 + Math.max(...res[1].map((row) => row.seq.length)) * 7;
            // const tfWidth =
            //     100 +
            //     Math.max(...res[1].map((row) => row.tfs.join("").length)) * 10;
            // prettier-ignore
            // FIXME MAKE 2 TABLES - THIS ONLY WORKS FOR 2ND TABLE
            const tableData = [{divider: true, title: `Inserted motif inside ${species} binding sites${res[0].length === 0 ? " (no matches)" : ""}`}, ...res[0], {divider: true, title: `${species} binding sites inside inserted motif${res[1].length === 0 ? " (no matches)" : ""}`}, ...res[1]]
            setColDefs(tbmColDefs);
            setRowData(tableData);
            setTbmRowData(tableData);
            setTimeout(() => gridAutoSize(gridRef), 100);
        } else if (query.value === "tfbs-on-seq") {
            if (formData.sequence.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: "Please enter a sequence in FASTA format",
                });
                return;
            }
            setShowLoading(true);

            if (
                query.value.concat(
                    formData.sequence,
                    formData.motif,
                    formData.substitutions
                ).length < 2000
            ) {
                const params = {};
                params.q = query.value;
                params.sequence = formData.sequence;
                if (formData.motif.trim() !== "") params.motif = formData.motif;
                params.subs = formData.substitutions;
                setSearchParams(params);
            } else {
                setSearchParams({ q: query.value });
            }

            const res = await tfbsOnSeq({
                motif: formData.motif,
                substitutions: formData.substitutions,
                sequence: formData.sequence,
                species: speciesList[species].path,
            });
            console.log(res);
            if (!gridVisible) setGridVisible(true);

            const chartData = [];
            const tableData = [];
            for (let seqName of Object.keys(res)) {
                const seqData = [];
                let len = 0;
                if (res[seqName][0] !== undefined)
                    len = res[seqName][0].promoterlen;
                tableData.push({ divider: true, seqName: seqName, len: len });
                for (let row of res[seqName]) {
                    if (row.matches.F) {
                        for (let pos of Object.keys(row.matches.F)) {
                            const newPos = Number(pos) - row.promoterlen;
                            tableData.push({
                                id: `data_${seqName}_F_${row.motif}_${newPos}`,
                                tfs: row.tfs,
                                seq: row.motif,
                                pos: newPos,
                                strand: "F",
                                divider: false,
                            });
                            seqData.push({
                                pos: newPos,
                                size: row.matches.F[pos],
                                motif: row.motif,
                                strand: "F",
                            });
                        }
                    }
                    if (row.matches.R) {
                        for (let pos of Object.keys(row.matches.R)) {
                            const newPos = Number(pos) * -1;
                            tableData.push({
                                id: `data_${seqName}_R_${row.motif}_${newPos}`,
                                tfs: row.tfs,
                                seq: row.motif,
                                pos: newPos,
                                strand: "R",
                                divider: false,
                            });
                            seqData.push({
                                pos: newPos,
                                size: row.matches.R[pos],
                                motif: row.motif,
                                strand: "R",
                            });
                        }
                    }
                }
                chartData.push({ seqName: seqName, data: seqData, len: len });
            }
            setColDefs(tosColDefs);
            setTosRowData(tableData);
            setTosChartData(chartData);
            setShowTos(true);
            setRowData(tableData);
            setTimeout(() => gridAutoSize(gridRef), 100);
        } else if (query.value === "prom-analysis") {
            // TODO FORM CHECK
            setShowLoading(true);
            const res = await promoterAnalysis({
                genes: formData.genes,
                tfbs_species: formData.tfbs_species,
                synteny: formData.synteny,
                ortholog_species: formData.ortholog_species,
                species: speciesList[species].path,
            });
            console.log(res);
            if (!gridVisible) setGridVisible(true);
            // TODO PROMOTER ANALYSIS

            // TF CONSENSUS IS NOW HANDLED WITH USE EFFECT
            // } else if (query.value === "tf-consensus") {
            //     const res = await tfConsensus(speciesList[species].path);
            //     console.log(res);
            //     if (!gridVisible) setGridVisible(true);
            //     // prettier-ignore
            //     setColDefs([
            //         { headerName: "TF", field: "tf",
            //         cellRenderer: p => <a className="link" href={`/${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a>},
            //         { headerName: "Consensus", field: "seq" },
            //         { headerName: "Reference", field: "Reference", width: 100, hide: false, sortable: false, floatingFilter: false,
            //         cellRenderer: p => <TFBSModal id={`modal_${p.data.tf}_${p.data.seq}`} species={species} tf={p.data.tf} consensus={p.data.seq} /> }
            //     ]);
            //     setRowData(res);
        } else if (query.value === "upstream-seq") {
            if (formData.genes.trim() === "") {
                setShowErrorMessage({
                    flag: true,
                    msg: "ORF/Gene field cannot be empty",
                });
                return;
            }
            setShowLoading(true);

            if (
                query.value.concat(formData.genes, formData.from, formData.to)
                    .length < 2000
            ) {
                const params = {};
                params.q = query.value;
                params.genes = formData.genes;
                params.from = formData.from;
                params.to = formData.to;
                setSearchParams(params);
            } else {
                setSearchParams({ q: query.value });
            }

            const res = await seqRetrieval({
                genes: formData.genes,
                from: formData.from,
                to: formData.to,
                species: speciesList[species].path,
            });
            console.log(res);

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
            setShowUpsData(true);
            setUpsData(resList);
        } else {
            console.error(
                `Form Submission Error: Unknown query name: ${query.option}`
            );
        }
        setShowLoading(false);
    }

    // TF-CONSENSUS
    React.useEffect(() => {
        async function fetchData() {
            setShowLoading(true);
            const res = await tfConsensus(speciesList[species].path);
            console.log(res);
            setGridVisible(true);
            // prettier-ignore
            setColDefs([
                { headerName: "TF", field: "tf", 
                cellRenderer: p => <a className="link" href={`/${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a>},
                { headerName: "Consensus", field: "seq" },
                { headerName: "Ref", field: "Ref", maxWidth: 60, hide: false, sortable: false, floatingFilter: false, 
                cellRenderer: p => <TFBSModal id={`modal_${p.data.tf}_${p.data.seq}`} species={species} tf={p.data.tf} consensus={p.data.seq} /> }
            ]);
            setRowData(res);
            setTimeout(() => gridAutoSize(gridRef), 100);
            setShowLoading(false);
        }
        if (query.value === "tf-consensus") fetchData();
    }, [query, species]);

    const isFullWidthRow = React.useCallback(
        (params) =>
            params.rowNode.data.divider !== undefined &&
            params.rowNode.data.divider === true,
        []
    );

    const fullWidthCellRenderer = React.useCallback(
        ({ node }) =>
            node.data.seqName === undefined ? (
                <span className="text-lg font-semibold px-3 py-6">
                    {node.data.title}
                </span>
            ) : (
                <span className="text-lg font-semibold px-3 py-6">{`Target Sequence: ${node.data.seqName} (size ${node.data.len})`}</span>
            ),
        []
    );

    const motifTextareaSize =
        query.value === "tfbs-by-motif"
            ? `min-h-9 max-h-9`
            : `min-h-20 max-h-20`;

    // run query on first page load if url params are provided
    if (first) {
        if (queries.some((el) => el.value === searchParams.get("q"))) {
            setQuery(queries.find((el) => el.value === searchParams.get("q")));
            handleQuery();
        }
        setFirst(false);
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
                const q = queries.find((el) => el.value === params["q"]);
                if (q) {
                    setQuery(q);
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
                    setHistoryCall(true);
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
            setHistoryCall(false);
            handleQuery();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [historyCall]);

    function sequenceDownload() {
        const fileName = "sequence" + Date.now() + ".fasta";

        const sequenceStr =
            upsData
                .map((row) => `> ${row.tf}\n${row.seq.join("\n")}`)
                .join("\n") + "\n";

        const element = document.createElement("a");
        const file = new Blob([sequenceStr], { type: "text/plain" });
        element.href = URL.createObjectURL(file);
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
    }

    return (
        <>
            <form
                onSubmit={handleQuery}
                className="md:ml-4 border-b border-gray-500"
            >
                <div className="ml-3 flex flex-row gap-5 mb-5">
                    <h1 className="font-figtree text-xl">Sequences</h1>
                    <select
                        className="select select-sm select-bordered select-primary max-w-106 text-color"
                        id="query"
                        name="query"
                        value={query.value}
                        onChange={handleQueryChange}
                    >
                        {queries.map(({ option, value }) => (
                            <option key={value} value={value}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-row space-x-6 p-3">
                    {query.value !== "prom-analysis" &&
                        query.value !== "tf-consensus" &&
                        query.value !== "upstream-seq" && (
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
                                        className="select select-bordered select-primary select-sm max-w-24 mb-2 text-color"
                                        id="substitutions"
                                        name="substitutions"
                                        value={formData.substitutions}
                                        onChange={handleForm}
                                    >
                                        {substitutions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        )}
                    {query.value !== "tfbs-by-motif" &&
                        query.value !== "tfbs-on-seq" &&
                        query.value !== "tf-consensus" && (
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
                    {query.value === "tfbs-on-seq" && (
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
                    {query.value === "prom-analysis" && (
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
                                    {syntenies.map(({ option, value }) => (
                                        <option key={value} value={value}>
                                            {option}
                                        </option>
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
                    {query.value === "upstream-seq" && (
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
                    {query.value !== "tf-consensus" && (
                        // <div className="flex flex-col gap-2">

                        <div className="flex flex-row gap-1 self-end">
                            {speciesList[species].dbstrains.map((strain) => (
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
                            ))}
                        </div>
                        // </div>
                    )}
                </div>
                {query.value !== "tf-consensus" && (
                    <button
                        className="btn btn-primary ml-3"
                        type="submit"
                        onSubmit={handleQuery}
                    >
                        Search
                    </button>
                )}
                <div className="mt-2">
                    {showErrorMessage.flag && (
                        <ErrorAlert msg={showErrorMessage.msg} />
                    )}
                </div>
            </form>
            {showTos && (
                <div className="px-4 py-2">
                    {tosChartData.map((row) => (
                        <MatchesChart
                            data={row.data}
                            seqName={row.seqName}
                            width={row.len}
                        />
                    ))}
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
                            isFullWidthRow={isFullWidthRow}
                            fullWidthCellRenderer={fullWidthCellRenderer}
                        />
                    </div>
                </div>
            )}
            {showUpsData && (
                <div className="px-4 py-2">
                    {upsData.length > 0 ? (
                        <>
                            <span>
                                This is a{" "}
                                <span className="font-bold">preview</span>. The
                                full content is available via download.{" "}
                                <button
                                    className="btn btn-sm"
                                    onClick={sequenceDownload}
                                >
                                    <DownloadIcon />
                                    Download
                                </button>
                            </span>
                            <br />
                            <br />
                            <pre>
                                <p key={upsData[0].tf} className="text-sm">
                                    {`>${upsData[0].tf}`}
                                    <br />
                                    {upsData[0].seq.map((line) => (
                                        <>
                                            {line}
                                            <br />
                                        </>
                                    ))}
                                    ...
                                </p>
                                {/* {upsData.map((row) => {
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
                    })} */}
                            </pre>
                            <span className="font-bold">End of preview</span>
                        </>
                    ) : (
                        <span>No sequences found!</span>
                    )}
                </div>
            )}
            {showLoading && <Loading />}
        </>
    );
}
