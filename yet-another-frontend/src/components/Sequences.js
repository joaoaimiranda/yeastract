import React from "react";
// import { AgGridReact } from "ag-grid-react";
// import "ag-grid-community/styles/ag-grid.css";
// import "ag-grid-community/styles/ag-theme-quartz.css";
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
// import HamburgerIcon from "../svg/HamburgerIcon";
import DownloadIcon from "../svg/DownloadIcon";
import ErrorAlert from "./ErrorAlert";
import fastaSequenceSample from "../conf/fastaSequenceSample";
import SampleDataIcon from "../svg/SampleDataIcon";
// import PromoterModal from "./PromoterModal";
import TFBSModal from "./TFBSModal";
import { gridAutoSize, mergeIntervals } from "../utils/utils";
import Loading from "./Loading";
import MatchesChart from "../charts/MatchesChart";
import Textarea from "./Textarea";
import TextInput from "./TextInput";
import Select from "./Select";
import SelectHorizontal from "./SelectHorizontal";
import Table from "./Table";
import BarChart from "../charts/BarChart";
import ErrorToast from "./ErrorToast";

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
    const substitutions = [0, 1, 2].map((el) => ({ option: el, value: el }));

    const [query, setQuery] = React.useState(
        searchParams.get("q") &&
            queries.some((row) => row.value === searchParams.get("q"))
            ? queries.find((row) => row.value === searchParams.get("q"))
            : queries[0]
    );

    const [formData, setFormData] = React.useState({
        motifmop: searchParams.get("motifmop")
            ? searchParams.get("motifmop")
            : "",
        motiftbm: searchParams.get("motiftbm")
            ? searchParams.get("motiftbm")
            : "",
        motiftos: searchParams.get("motiftos")
            ? searchParams.get("motiftos")
            : "",

        genesmop: searchParams.get("genesmop")
            ? searchParams.get("genesmop")
            : "",
        genespa: searchParams.get("genespa") ? searchParams.get("genespa") : "",
        genesups: searchParams.get("genesups")
            ? searchParams.get("genesups")
            : "",

        substitutionsmop:
            searchParams.get("substitutionsmop") &&
            substitutions.includes(Number(searchParams.get("substitutionsmop")))
                ? Number(searchParams.get("substitutionsmop"))
                : 0,
        substitutionstbm:
            searchParams.get("substitutionstbm") &&
            substitutions.includes(Number(searchParams.get("substitutionstbm")))
                ? Number(searchParams.get("substitutionstbm"))
                : 0,

        sequence: searchParams.get("sequence")
            ? searchParams.get("sequence")
            : "",
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

    const [showFormError, setShowFormError] = React.useState("");
    const [showError, setShowError] = React.useState("");

    const [showLoading, setShowLoading] = React.useState(false);
    const [gridVisible, setGridVisible] = React.useState(false);

    const [rowData, setRowData] = React.useState([]);

    const [mopRowData, setMopRowData] = React.useState([]);

    const [showTbmTable, setShowTbmTable] = React.useState(false);
    const tbmGridRef = React.useRef();
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
        { headerName: "Gene", field: "gene", maxWidth: 200,
        cellRenderer: (p) => p.node.rowPinned ? <BarChart colName={"gene"} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> : 
        <a className="link" href={`/${species}/view?orf=${p.data.gene}`}>{p.data.gene}</a>},
        { headerName: "#", field: "count", filter: 'agNumberColumnFilter' },
        { headerName: "Motif", field: "motif" },
        { headerName: "Promoter", field: "promoterMatch", sortable: false, floatingFilter: false, autoHeight: true,
        cellRenderer: p => !p.node.rowPinned && <MatchesChart data={p.data.chartData} seqName={p.data.gene} width={p.data.promoterlen} marginTop={25} height={60} />}
        // { headerName: "Match on Promoter", field: "promoterMatch", cellRenderer: p => p.value && <ul>{p.value.map(el => <li key={el}>{el}</li>)}</ul>},
        // { headerName: "Promoter", field: "Promoter", maxWidth: 100, sortable: false, floatingFilter: false, 
        // cellRenderer: (p) => (!p.node.rowPinned && <PromoterModal id={`prom_modal_${p.data.gene}_${p.data.motif}`} orf={p.data.gene} data={p.data.match} />)},
    ];
    // prettier-ignore
    const tbm0ColDefs = [
        // { headerName: "Binding Site", field: "seq"},
        { headerName: "Binding Site", field: "viz", 
        cellRenderer: p => !p.node.rowPinned && <p>{p.value.map(v => v)}</p>},
        { headerName: "TF", field: "tfs", maxWidth: 200, autoHeight: true,
        cellRenderer: (p) => p.node.rowPinned ? <BarChart tbm0={true} colName={"tfs"} complex={true} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getTbmFilteredData} addListener={addListener} removeListener={removeListener} /> :
        p.data.tfs.map((v) => (<span key={v}><a className="link" href={`/${species}/view?orf=${v}`}>{v}</a>{` `}</span>))},
        { headerName: "For. pos.", field: "F", 
        valueFormatter: (p) => (p.value && Object.keys(p.value).join(", ")),},
        { headerName: "Rev. pos.", field: "R",
        valueFormatter: (p) => (p.value && Object.keys(p.value).join(", ")),},
    ];
    // prettier-ignore
    const tbm1ColDefs = [
        // { headerName: "Binding Site", field: "seq" },
        { headerName: "User Inserted Motif", field: "viz",
        cellRenderer: (p) => !p.node.rowPinned && <p>{p.value.map((v) => v)}</p>},
        { headerName: "TF", field: "tfs", maxWidth: 200, autoHeight: true,
        cellRenderer: (p) => p.node.rowPinned ? (<BarChart colName={"tfs"} complex={true} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} />) : (
        p.data.tfs.map((v) => (<span key={v}><a className="link" href={`/${species}/view?orf=${v}`}>{v}</a>{` `}</span>))),},
        { headerName: "For. pos.", field: "F",
        valueFormatter: (p) => p.value && Object.keys(p.value).join(", "),},
        { headerName: "Rev. pos.", field: "R",
        valueFormatter: (p) => p.value && Object.keys(p.value).join(", "),},
    ];
    const [tbmGridColDefs, setTbmGridColDefs] = React.useState([]);
    const [tbmGridRowData, setTbmGridRowData] = React.useState([]);

    // prettier-ignore
    const tosColDefs = [
        { headerName: "Seq. Name", field: "seqName", maxWidth: 200,
        cellRenderer: p => p.node.rowPinned ? <BarChart colName={"seqName"} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> : p.value},
        { headerName: "Binding Site", field: "motif" },
        { headerName: "TF", field: "tfs", maxWidth: 200, autoHeight: true, 
        cellRenderer: p => p.node.rowPinned ? <BarChart colName={"tfs"} complex={true} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> :
        p.data.tfs.map((v, i) => (<span key={`${v}${i}`}><a className="link" href={`/${species}/view?orf=${v}`}>{v}</a>{` `}</span>))},
        { headerName: "Position", field: "pos", filter: 'agNumberColumnFilter'},
        { headerName: "Strand", field: "strand", maxWidth: 100,
        cellRenderer: p => p.node.rowPinned ? <BarChart colName={"strand"} width={100} height={115} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> : p.value}
    ]

    const [colDefs, setColDefs] = React.useState([
        { headerName: "TF", field: "tf" },
        { headerName: "Gene", field: "gene" },
    ]);
    // const defaultColDef = React.useMemo(() => {
    //     return {
    //         filter: "agTextColumnFilter",
    //         floatingFilter: true,
    //         suppressHeaderMenuButton: true,
    //     };
    // }, []);

    const gridRef = React.useRef();

    // const onBtnExport = React.useCallback(() => {
    //     gridRef.current.api.exportDataAsCsv();
    // }, []);

    const syntenies = [
        { option: "BLAST Best-Scores", value: 0 },
        { option: "BLAST Best-Scores + at least 1 neighbor", value: 1 },
        { option: "BLAST Best-Scores + at least 2 neighbor", value: 2 },
        { option: "BLAST Best-Scores + at least 3 neighbor", value: 3 },
    ];

    const homologs = [
        { value: "c. albicans", option: "c. albicans" },
        { value: "c. auris", option: "c. auris" },
        { value: "c. glabrata", option: "c. glabrata" },
    ];

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

    // function handleColumns(event) {
    //     const { name, checked } = event.target;
    //     setColDefs((prevCols) =>
    //         prevCols.map((col) =>
    //             col["field"] === name ? { ...col, hide: !checked } : col
    //         )
    //     );
    // }

    function setSampleData(event) {
        const value = event.currentTarget.getAttribute("value");
        const sample = speciesList[species].sample.find(
            (el) => el.strain === value
        );

        if (query.value === "motif-on-promoter") {
            setFormData((prevData) => ({
                ...prevData,
                motifmop: "TATATAAG\nTATAWAAM\nTATA[GC]AA[AT]",
                genesmop: sample.tgs,
                substitutionsmop: 0,
            }));
        } else if (query.value === "tfbs-by-motif") {
            setFormData((prevData) => ({
                ...prevData,
                motiftbm: "CACCAGTCGGTGGCTGTGCGCTTGTTACGTAA",
                substitutionstbm: 0,
            }));
        } else if (query.value === "tfbs-on-seq") {
            setFormData((prevData) => ({
                ...prevData,
                sequence: fastaSequenceSample,
            }));
        } else if (query.value === "prom-analysis") {
            setFormData((prevData) => ({
                ...prevData,
                genespa: sample.tgs,
            }));
        } else if (query.value === "upstream-seq") {
            setFormData((prevData) => ({
                ...prevData,
                genesups: sample.tgs,
            }));
        } else {
            // do nothing
        }
    }

    // const autoSizeStrategy = React.useMemo(
    //     () => ({
    //         type: "fitCellContents",
    //     }),
    //     []
    // );

    function handleQueryChange(e) {
        const value = e.target.value;
        setShowFormError("");
        setQuery(queries.find((el) => el.value === value));
        if (value !== "upstream-seq") setShowUpsData(false);
        if (value !== "tfbs-on-seq") setShowTos(false);
        if (value !== "tfbs-by-motif") setShowTbmTable(false);

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
                setShowTbmTable(true);

                setColDefs(tbm1ColDefs);
                setTbmGridColDefs(tbm0ColDefs);

                setRowData(tbmRowData[1]);
                setTbmRowData(tbmGridRowData[0]);
                setTimeout(() => {
                    gridAutoSize(gridRef);
                    gridAutoSize(tbmGridRef);
                }, 100);
            } else {
                setGridVisible(false);
            }
        } else if (value === "tfbs-on-seq") {
            if (tosRowData.length !== 0) {
                if (!gridVisible) setGridVisible(true);
                setColDefs(tosColDefs);
                setRowData(tosRowData);
                setTimeout(() => {
                    gridAutoSize(gridRef);
                    setShowTos(true);
                }, 100);
            } else {
                setGridVisible(false);
            }
        } else if (value === "prom-analysis") {
            // if (paRowData.length !== 0) setRowData(paRowData)
            // TODO
            setGridVisible(false);
        } else if (value === "upstream-seq") {
            if (upsData.length !== 0) setShowUpsData(true);
            setGridVisible(false);
        } else {
            // do nothing
        }
    }

    async function handleQuery(event) {
        console.log(query);
        if (event !== undefined) {
            event.preventDefault();
        }
        if (showFormError) setShowFormError("");
        if (query.value !== "upstream-seq") setShowUpsData(false);

        console.log(formData);
        if (query.value === "motif-on-promoter") {
            if (
                formData.motifmop.trim() === "" ||
                formData.genesmop.trim() === ""
            ) {
                setShowFormError(
                    "DNA Motif and ORF/Genes fields cannot be empty"
                );
                return;
            }
            setShowLoading(true);

            if (event !== undefined) {
                if (
                    query.value.concat(
                        formData.motifmop,
                        formData.substitutionsmop,
                        formData.genesmop
                    ).length < 2000
                ) {
                    const params = {};
                    params.q = query.value;
                    params.motifmop = formData.motifmop;
                    params.substitutionsmop = formData.substitutionsmop;
                    params.genesmop = formData.genesmop;
                    if (event !== undefined) setSearchParams(params);
                } else {
                    if (event !== undefined)
                        setSearchParams({ q: query.value });
                }
            }

            const res = await motifOnPromoter({
                motif: formData.motifmop,
                substitutions: formData.substitutionsmop,
                genes: formData.genesmop,
                species: speciesList[species].path,
            });
            console.log(res);
            // HTTP ERROR
            if (typeof res === "string") {
                setShowLoading(false);
                setShowError(res);
                return;
            }

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
                    const chartData = [];
                    if (m.matches.F) {
                        for (let pos of Object.keys(m.matches.F)) {
                            chartData.push({
                                pos: Number(pos) - 1000,
                                size: m.matches.F[pos],
                                motif: m.promoterMatch,
                                strand: "F",
                            });
                        }
                    }
                    if (m.matches.R) {
                        for (let pos of Object.keys(m.matches.R)) {
                            chartData.push({
                                pos: Number(pos) * -1,
                                size: m.matches.R[pos],
                                motif: m.promoterMatch,
                                strand: "R",
                            });
                        }
                    }
                    data.push({
                        gene: key,
                        count: fcount + rcount,
                        motif: m.motif,
                        promoterMatch: m.promoterMatch,
                        match: m,
                        promoterlen: m.promoterlen,
                        chartData: chartData,
                    });
                }
            }
            // prettier-ignore
            setColDefs(mopColDefs);
            setRowData(data);
            setMopRowData(data);
            setTimeout(() => gridAutoSize(gridRef), 100);
        } else if (query.value === "tfbs-by-motif") {
            if (formData.motiftbm.trim() === "") {
                setShowFormError("DNA Motif field cannot be empty");
                return;
            }
            setShowLoading(true);

            if (
                query.value.concat(formData.motiftbm, formData.substitutionstbm)
                    .length < 2000
            ) {
                const params = {};
                params.q = query.value;
                params.motiftbm = formData.motiftbm;
                params.substitutionstbm = formData.substitutionstbm;
                if (event !== undefined) setSearchParams(params);
            } else {
                if (event !== undefined) setSearchParams({ q: query.value });
            }

            // hopefully deepcopy str
            const inputStr = formData.motiftbm.repeat(1).trim();

            const res = await tfbsByMotif({
                motif: formData.motiftbm,
                substitutions: formData.substitutionstbm,
                species: speciesList[species].path,
            });
            console.log(res);
            // HTTP ERROR
            if (typeof res === "string") {
                setShowLoading(false);
                setShowError(res);
                return;
            }

            // second table
            if (!gridVisible) setGridVisible(true);
            // first table
            if (!showTbmTable) setShowTbmTable(true);

            // prettier-ignore
            // const tableData = [{divider: true, title: `Inserted motif inside ${species} binding sites${res[0].length === 0 ? " (no matches)" : ""}`}, ...res[0], {divider: true, title: `${species} binding sites inside inserted motif${res[1].length === 0 ? " (no matches)" : ""}`}, ...res[1]]

            for (let i = 0; i <= 1; i++) {
            for (let row of res[i]) {
                const intervals = [];
                const str = i === 1 ? inputStr : row.seq
                if (row.F)
                    for (let entry of Object.entries(row.F)) {
                        const [pos, size] = entry;
                        intervals.push({
                            start: Number(pos),
                            end: Number(pos) + Number(size),
                        });
                    }
                if (row.R)
                    for (let entry of Object.entries(row.R)) {
                        const [pos, size] = entry;
                        const start =
                            str.length - Number(pos) - Number(size);
                        const end = str.length - Number(pos);
                        intervals.push({ start: start, end: end });
                    }
                const concatIntervals = mergeIntervals(intervals);
                const jsxs = [str.slice(0, concatIntervals[0].start)];
                for (let i = 0; i < concatIntervals.length; i++) {
                    const itv = concatIntervals[i];
                    const nextItv = concatIntervals[i + 1];
                    jsxs.push(
                        <span key={`${itv.start}-${itv.end}`} className="bg-green-500">
                            {str.slice(itv.start, itv.end)}
                        </span>
                    );
                    jsxs.push(
                        nextItv
                            ? str.slice(itv.end, nextItv.start)
                            : str.slice(itv.end)
                    );
                }
                row.viz = jsxs;
            }
        }
            console.log(res);

            // second table
            setColDefs(tbm1ColDefs);
            // first table
            setTbmGridColDefs(tbm0ColDefs);
            // second table
            setRowData(res[1]);
            // first table
            setTbmGridRowData(res[0]);
            // data saving
            setTbmRowData(res);
            setTimeout(() => {
                gridAutoSize(gridRef);
                gridAutoSize(tbmGridRef);
            }, 100);
        } else if (query.value === "tfbs-on-seq") {
            if (formData.sequence.trim() === "") {
                setShowFormError("Please enter a sequence in FASTA format");
                return;
            }
            setShowLoading(true);

            if (
                query.value.concat(formData.sequence, formData.motiftos)
                    .length < 2000
            ) {
                const params = {};
                params.q = query.value;
                params.sequence = formData.sequence;
                if (formData.motiftos.trim() !== "")
                    params.motiftos = formData.motiftos;
                if (event !== undefined) setSearchParams(params);
            } else {
                if (event !== undefined) setSearchParams({ q: query.value });
            }

            const res = await tfbsOnSeq({
                motif: formData.motiftos,
                sequence: formData.sequence,
                species: speciesList[species].path,
            });
            console.log(res);
            // HTTP ERROR
            if (typeof res === "string") {
                setShowLoading(false);
                setShowError(res);
                return;
            }
            const chartData = [];
            const tableData = [];
            for (let seqName of Object.keys(res)) {
                const seqData = [];
                let len = 0;
                if (res[seqName][0] !== undefined)
                    len = res[seqName][0].promoterlen;
                // tableData.push({ divider: true, seqName: seqName, len: len });
                for (let row of res[seqName]) {
                    if (row.matches.F) {
                        for (let pos of Object.keys(row.matches.F)) {
                            const newPos = Number(pos) - row.promoterlen;
                            tableData.push({
                                id: `data_${seqName}_F_${row.motif}_${newPos}`,
                                seqName: seqName,
                                tfs: row.tfs,
                                motif: row.motif,
                                pos: newPos,
                                size: row.matches.F[pos],
                                strand: "F",
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
                                seqName: seqName,
                                tfs: row.tfs,
                                motif: row.motif,
                                pos: newPos,
                                size: row.matches.R[pos],
                                strand: "R",
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

            // table data storage
            setTosRowData(tableData);
            // chart data
            setTosChartData(chartData);
            // show chart
            if (!gridVisible) setGridVisible(true);
            else setShowTos(true);
            // table columns
            setColDefs(tosColDefs);
            // set table data
            setRowData(tableData);
            setTimeout(() => gridAutoSize(gridRef), 100);
        } else if (query.value === "prom-analysis") {
            // TODO FORM CHECK
            setShowLoading(true);
            const res = await promoterAnalysis({
                genes: formData.genespa,
                tfbs_species: formData.tfbs_species,
                synteny: formData.synteny,
                ortholog_species: formData.ortholog_species,
                species: speciesList[species].path,
            });
            console.log(res);
            // HTTP ERROR
            if (typeof res === "string") {
                setShowLoading(false);
                setShowError(res);
                return;
            }
            if (!gridVisible) setGridVisible(true);
            // TODO PROMOTER ANALYSIS

            // TF CONSENSUS IS NOW HANDLED WITH USE EFFECT BECAUSE THERE IS NO FORM SUBMISSION EVENT
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
            if (formData.genesups.trim() === "") {
                setShowFormError("ORF/Gene field cannot be empty");
                return;
            }
            setShowLoading(true);

            if (
                query.value.concat(
                    formData.genesups,
                    formData.from,
                    formData.to
                ).length < 2000
            ) {
                const params = {};
                params.q = query.value;
                params.genesups = formData.genesups;
                params.from = formData.from;
                params.to = formData.to;
                if (event !== undefined) setSearchParams(params);
            } else {
                if (event !== undefined) setSearchParams({ q: query.value });
            }

            const res = await seqRetrieval({
                genes: formData.genesups,
                from: formData.from,
                to: formData.to,
                species: speciesList[species].path,
            });
            console.log(res);
            // HTTP ERROR
            if (typeof res === "string") {
                setShowLoading(false);
                setShowError(res);
                return;
            }
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

    // const mouseEnterRow = React.useCallback((e) => {
    //     console.log(e.node.data);
    //     const seqName = e.node.data.seqName;
    //     const strand = e.node.data.strand;
    //     const motif = e.node.data.motif;
    //     const pos = e.node.data.pos;
    //     const el = document.getElementById(
    //         `viz_${seqName}_${strand}_${motif}_${pos}`
    //     );
    //     console.log(el);
    //     el.setAttribute("fill", "yellow");
    // }, []);

    // const mouseLeaveRow = React.useCallback((e) => {
    //     console.log(e);
    //     const seqName = e.node.data.seqName;
    //     const strand = e.node.data.strand;
    //     const motif = e.node.data.motif;
    //     const pos = e.node.data.pos;
    //     document
    //         .getElementById(`viz_${seqName}_${strand}_${motif}_${pos}`)
    //         .setAttribute("style", "fill: red");
    // }, []);

    // const addHoverListener = React.useCallback(() => {
    //     gridRef.current.api.forEachNode((node) => {
    //         node.addEventListener("mouseEnter", mouseEnterRow);
    //         node.addEventListener("mouseLeave", mouseLeaveRow);
    //     });
    // }, [mouseEnterRow, mouseLeaveRow]);

    // const removeHoverListener = React.useCallback(() => {
    //     if (gridRef.current) {
    //     gridRef.current.api.removeEventListener("mouseEnter", mouseEnterRow)
    //     gridRef.current.api.removeEventListener("mouseLeave", mouseLeaveRow)
    //     }
    // }, [mouseEnterRow, mouseLeaveRow])

    const addListener = React.useCallback((listener, tbm0 = false) => {
        if (tbm0)
            tbmGridRef.current.api.addEventListener("filterChanged", listener);
        else gridRef.current.api.addEventListener("filterChanged", listener);
    }, []);

    const removeListener = React.useCallback((listener, tbm0 = false) => {
        if (tbm0) {
            if (tbmGridRef.current) {
                tbmGridRef.current.api.removeEventListener(
                    "filterChanged",
                    listener
                );
            }
        } else {
            if (gridRef.current) {
                gridRef.current.api.removeEventListener(
                    "filterChanged",
                    listener
                );
            }
        }
    }, []);

    function getFilteredData() {
        const rowData = [];
        if (gridRef.current)
            gridRef.current.api.forEachNodeAfterFilter((node) => {
                rowData.push(node.data);
            });
        return rowData;
    }

    function getTbmFilteredData() {
        const rowData = [];
        if (tbmGridRef.current)
            tbmGridRef.current.api.forEachNodeAfterFilter((node) => {
                rowData.push(node.data);
            });
        return rowData;
    }

    // const setFilter = React.useCallback(async (col, val) => {
    //     const filter = {
    //         filterType: "text",
    //         type: "contains",
    //         filter: val,
    //     };
    //     // prettier-ignore
    //     await gridRef.current.api.setColumnFilterModel(col, val === null ? null : filter);
    //     gridRef.current.api.onFilterChanged();
    // }, []);

    // const getFilterTerm = React.useCallback((col) => {
    //     const filter = gridRef.current.api.getColumnFilterModel(col);
    //     return filter === null ? null : filter.filter;
    // }, []);

    const getFilterTerm = React.useCallback((col, tbm0 = false) => {
        const filter = tbm0
            ? tbmGridRef.current.api.getColumnFilterModel(col)
            : gridRef.current.api.getColumnFilterModel(col);
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

    const setFilter = React.useCallback(
        async (col, val, remove = false, tbm0 = false) => {
            let filter = null;
            const currentFilter = tbm0
                ? tbmGridRef.current.api.getColumnFilterModel(col)
                : gridRef.current.api.getColumnFilterModel(col);
            if (remove) {
                if (currentFilter) {
                    const cds = currentFilter.conditions;
                    if (cds) {
                        if (cds.some((c) => c.filter === val)) {
                            if (cds.length > 2) {
                                filter = {
                                    filterType: "text",
                                    operator: "AND",
                                    conditions: cds.filter(
                                        (c) => c.filter !== val
                                    ),
                                };
                            } else {
                                filter = {
                                    filterType: "text",
                                    type: "contains",
                                    filter: cds.filter(
                                        (c) => c.filter !== val
                                    )[0].filter,
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
                            {
                                filterType: "text",
                                type: "contains",
                                filter: val,
                            },
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
            if (tbm0) {await tbmGridRef.current.api.setColumnFilterModel(col, filter);tbmGridRef.current.api.onFilterChanged();}
        else{ await gridRef.current.api.setColumnFilterModel(col, filter);
        gridRef.current.api.onFilterChanged();}
        },
        []
    );

    // FOR FIND TFBS CHART ONLY
    const getFTFBSFilteredData = React.useCallback((seqName) => {
        const rowData = [];
        if (gridRef.current)
            gridRef.current.api.forEachNodeAfterFilter((node) => {
                if (node.data.seqName === seqName) rowData.push(node.data);
            });
        return rowData;
    }, []);

    const isMotifFilter = React.useCallback((seqName, tfbs, pos, strand) => {
        // prettier-ignore
        const seqNameFilter = gridRef.current.api.getColumnFilterModel("seqName");
        // prettier-ignore
        const tfbsFilter = gridRef.current.api.getColumnFilterModel("motif");
        // prettier-ignore
        const posFilter = gridRef.current.api.getColumnFilterModel("pos");
        // prettier-ignore
        const strandFilter = gridRef.current.api.getColumnFilterModel("strand");

        if (
            seqNameFilter &&
            tfbsFilter &&
            posFilter &&
            strandFilter &&
            seqNameFilter.filter === seqName &&
            tfbsFilter.filter === tfbs &&
            posFilter.filter === pos &&
            strandFilter.filter === strand
        ) {
            return true;
        }
        return false;
    }, []);

    const setMotifFilter = React.useCallback(
        async (seqName, tfbs, pos, strand) => {
            let seqNameFilter = null;
            let tfbsFilter = null;
            let posFilter = null;
            let strandFilter = null;
            if (seqName && tfbs && pos && strand) {
                seqNameFilter = {
                    filterType: "text",
                    type: "contains",
                    filter: seqName,
                };
                tfbsFilter = {
                    filterType: "text",
                    type: "contains",
                    filter: tfbs,
                };
                posFilter = {
                    filterType: "number",
                    type: "equals",
                    filter: pos,
                };
                strandFilter = {
                    filterType: "text",
                    type: "contains",
                    filter: strand,
                };
            }
            // prettier-ignore
            await gridRef.current.api.setColumnFilterModel("seqName", seqNameFilter);
            await gridRef.current.api.setColumnFilterModel("motif", tfbsFilter);
            await gridRef.current.api.setColumnFilterModel("pos", posFilter);
            // prettier-ignore
            await gridRef.current.api.setColumnFilterModel("strand", strandFilter);

            gridRef.current.api.onFilterChanged();
        },
        []
    );

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

    // TF-CONSENSUS
    React.useEffect(() => {
        async function fetchData() {
            setShowLoading(true);
            const res = await tfConsensus(speciesList[species].path);
            console.log(res);
            // HTTP ERROR
            if (typeof res === "string") {
                setShowLoading(false);
                setShowError(res);
                return;
            }
            setSearchParams({ q: "tf-consensus" });
            setGridVisible(true);
            // prettier-ignore
            setColDefs([
                    { headerName: "TF", field: "tf", maxWidth: 200,
                    cellRenderer: p => p.node.rowPinned ? <BarChart colName={"tf"} width={200} height={90} getFilter={getFilterTerm} setFilter={setFilter} getFilteredData={getFilteredData} addListener={addListener} removeListener={removeListener} /> :
                    <a className="link" href={`/${species}/view?orf=${p.data.tf}`}>{p.data.tf}</a>},
                    { headerName: "Consensus", field: "seq" },
                    { headerName: "Ref", field: "Ref", maxWidth: 60, hide: false, sortable: false, floatingFilter: false, 
                    cellRenderer: p => !p.node.rowPinned && <TFBSModal id={`modal_${p.data.tf}_${p.data.seq}`} species={species} tf={p.data.tf} consensus={p.data.seq} /> }
                ]);
            setRowData(res);
            setTimeout(() => gridAutoSize(gridRef), 100);
            setShowLoading(false);
        }
        if (query.value === "tf-consensus") fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, species, addListener, removeListener, setFilter, getFilterTerm]);

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
                    {query.value === "motif-on-promoter" && (
                        <>
                            <div className="flex flex-col">
                                <Textarea
                                    id="motifmop"
                                    label="DNA Motif"
                                    size={motifTextareaSize}
                                    value={formData.motifmop}
                                    handler={handleForm}
                                />
                                <SelectHorizontal
                                    id="substitutionsmop"
                                    label="Substitutions"
                                    size="max-w-24"
                                    value={formData.substitutionsmop}
                                    valueArray={substitutions}
                                    handler={handleForm}
                                />
                            </div>
                            <Textarea
                                id="genesmop"
                                label="ORF/Gene"
                                size="max-w-24 min-h-32 max-h-32"
                                value={formData.genesmop}
                                handler={handleForm}
                            />
                        </>
                    )}
                    {query.value === "tfbs-by-motif" && (
                        <div className="flex flex-col gap-2">
                            <TextInput
                                id="motiftbm"
                                label="DNA Motif"
                                size="w-72"
                                value={formData.motiftbm}
                                handler={handleForm}
                            />
                            <SelectHorizontal
                                id="substitutionstbm"
                                label="Substitutions"
                                size="max-w-24"
                                value={formData.substitutionstbm}
                                valueArray={substitutions}
                                handler={handleForm}
                            />
                        </div>
                    )}
                    {query.value === "tfbs-on-seq" && (
                        <>
                            <Textarea
                                id="motiftos"
                                label="DNA Motif"
                                size="max-w-24 min-h-32 max-h-32"
                                value={formData.motiftos}
                                handler={handleForm}
                            />
                            <Textarea
                                id="sequence"
                                label="Sequence (FastA format)"
                                size="w-80 min-h-32 max-h-32"
                                value={formData.sequence}
                                handler={handleForm}
                            />
                        </>
                    )}
                    {query.value === "prom-analysis" && (
                        <>
                            <Textarea
                                id="genespa"
                                label="ORF/Gene"
                                size="max-w-24 min-h-32 max-h-32"
                                value={formData.genespa}
                                handler={handleForm}
                            />
                            <div className="grid grid-rows-2">
                                <Select
                                    id="tfbs_species"
                                    label="Consider TFBS from strain:"
                                    size="w-full max-w-xs"
                                    value={formData.tfbs_species}
                                    valueArray={homologs}
                                    handler={handleForm}
                                />
                                <Select
                                    id="synteny"
                                    label="Synteny"
                                    size="w-full max-w-xs"
                                    value={formData.synteny}
                                    valueArray={syntenies}
                                    handler={handleForm}
                                />
                            </div>
                        </>
                    )}
                    {query.value === "upstream-seq" && (
                        <>
                            <Textarea
                                id="genesups"
                                label="ORF/Gene"
                                size="max-w-24 min-h-32 max-h-32"
                                value={formData.genesups}
                                handler={handleForm}
                            />
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
                        </>
                    )}
                    {/* {query.value !== "prom-analysis" &&
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
                    )} */}
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
                        // delete this line after prom-analysis is implemented
                        disabled={query.value === "prom-analysis"}
                    >
                        Search
                    </button>
                )}
                <div className="mt-2">
                    {showFormError && <ErrorAlert msg={showFormError} />}
                </div>
            </form>
            {showTbmTable && (
                <div className="px-4 py-2">
                    <h3 className="mb-2 font-semibold">{`Inserted motif inside ${speciesList[species].short} binding sites`}</h3>
                    <Table
                        gridRef={tbmGridRef}
                        colDefs={tbmGridColDefs}
                        setColDefs={setTbmGridColDefs}
                        rowData={tbmGridRowData}
                        charts={true}
                    />
                    <h3 className="mt-2 font-semibold">{`${speciesList[species].short} binding sites inside inserted motif`}</h3>
                </div>
            )}
            {showTos && (
                <div className="flex">
                    <div className="px-4 py-2 grow-0 flex flex-col items-end">
                        {tosChartData.map((row) => (
                            <div key={row.seqName}>
                                <span>{row.seqName}</span>
                                <MatchesChart
                                    key={row.seqName}
                                    data={row.data}
                                    seqName={row.seqName}
                                    width={row.len}
                                    marginTop={25}
                                    height={60}
                                    addListener={addListener}
                                    removeListener={removeListener}
                                    getFilteredData={getFTFBSFilteredData}
                                    isMotifFilter={isMotifFilter}
                                    setMotifFilter={setMotifFilter}
                                />
                            </div>
                        ))}
                    </div>
                    <div></div>
                </div>
            )}
            {gridVisible && (
                <div className="px-4 py-2 w-full h-full">
                    {/* <div className="p-2 bg-gray-100 rounded-t-lg border-x border-t border-[#e5e7eb] flex gap-5">
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
                            onGridReady={() => {
                                if (query.value === "tfbs-on-seq") {
                                    setShowTos(true);
                                    // addHoverListener();
                                }
                            }}
                        />
                    </div> */}
                    <Table
                        gridRef={gridRef}
                        colDefs={colDefs}
                        setColDefs={setColDefs}
                        rowData={rowData}
                        onGridReady={() => {
                            if (query.value === "tfbs-on-seq") {
                                setShowTos(true);
                            }
                        }}
                        charts={true}
                    />
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
                                    {upsData[0].seq
                                        .slice(0, 3)
                                        .map((line, i) => (
                                            <span key={i}>
                                                {line}
                                                <br />
                                            </span>
                                        ))}
                                    ...
                                </p>
                            </pre>
                            <span className="font-bold">End of preview</span>
                        </>
                    ) : (
                        <span>No sequences found!</span>
                    )}
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
        </>
    );
}
