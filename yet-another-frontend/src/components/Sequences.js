// import {
//     Button,
//     Input,
//     Select,
//     SelectItem,
//     Textarea,
//     Dropdown,
//     DropdownTrigger,
//     DropdownMenu,
//     DropdownItem,
// } from "@nextui-org/react";
import React from "react";
// import species from "./Species";
// import { AgGridReact } from "ag-grid-react";
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

    const [tmpResults, setTmpResults] = React.useState("");

    // const [rowData, setRowData] = React.useState([]);

    // const [colDefs, setColDefs] = React.useState([
    //     { headerName: "TF", field: "tf" },
    //     { headerName: "Gene", field: "gene" },
    // ]);
    // const defaultColDef = React.useMemo(() => {
    //     return {
    //         filter: "agTextColumnFilter",
    //         flex: 1,
    //     };
    // }, []);

    // const gridRef = React.useRef();

    // const onBtnExport = React.useCallback(() => {
    //     gridRef.current.api.exportDataAsCsv();
    // }, []);

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
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    async function handleQuery(event) {
        event.preventDefault();
        console.log(formData);
        if (query === "Search for DNA motif(s) on promoter regions") {
            const res = await motifOnPromoter({
                motif: formData.motif,
                substitutions: formData.substitutions,
                genes: formData.genes,
                species:
                    speciesList[species].dbspecies +
                    " " +
                    speciesList[species].dbstrains,
            });
            console.log(res);
            setTmpResults(JSON.stringify(res));
            // setColDefs([{headerName: "ORF", field: "orf"}, {headerName: "# Occurences for DNA Motifs"}])
        } else if (
            query === "Search described TF Binding Sites by a given DNA motif"
        ) {
            const res = await tfbsByMotif({
                motif: formData.motif,
                substitutions: formData.substitutions,
                species:
                    speciesList[species].dbspecies +
                    " " +
                    speciesList[species].dbstrains,
            });
            console.log(res);
            let str = "";
            for (let x of res[1]) {
                str += JSON.stringify(x) + "\n";
            }
            setTmpResults(str);
        } else if (query === "Find TF Binding Site(s)") {
            const res = await tfbsOnSeq({
                motif: formData.motif,
                substitutions: formData.substitutions,
                sequence: formData.sequence,
                species:
                    speciesList[species].dbspecies +
                    " " +
                    speciesList[species].dbstrains,
            });
            console.log(res);
        } else if (query === "Promoter Analysis") {
            const res = await promoterAnalysis({
                genes: formData.genes,
                tfbs_species: formData.tfbs_species,
                synteny: formData.synteny,
                ortholog_species: formData.ortholog_species,
                species:
                    speciesList[species].dbspecies +
                    " " +
                    speciesList[species].dbstrains,
            });
            console.log(res);
        } else if (query === "TF-Consensus List") {
            const res = await tfConsensus(
                speciesList[species].dbspecies +
                    " " +
                    speciesList[species].dbstrains
            );
            console.log(res);
            setTmpResults(JSON.stringify(res));
        } else if (query === "Upstream Sequence") {
            const res = await seqRetrieval({
                genes: formData.genes,
                from: formData.from,
                to: formData.to,
                species:
                    speciesList[species].dbspecies +
                    " " +
                    speciesList[species].dbstrains,
            });
            console.log(res);
            let str = "";
            for (let key of Object.keys(res)) {
                str += key + ":\n" + res[key] + "\n";
            }
            setTmpResults(str);
        } else console.log("Unknown query name");
    }

    return (
        <>
            <form onSubmit={handleQuery}>
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
                <div className="ml-3 flex flex-row justify-center gap-5 mb-5">
                    <h1 className="font-figtree text-xl">Sequences</h1>
                    <select
                        className="select select-sm select-bordered select-primary max-w-106 text-color"
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
                <div className="flex flex-row justify-center space-x-6 p-3 border-b border-gray-500">
                    {query !== "Promoter Analysis" &&
                        query !== "TF-Consensus List" &&
                        query !== "Upstream Sequence" && (
                            <>
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
                                        className="textarea textarea-bordered textarea-primary text-color"
                                        onChange={handleForm}
                                    ></textarea>
                                </label>
                                <label>
                                    <div className="label p-0 mb-2">
                                        <span className="label-text text-color">
                                            Substitutions
                                        </span>
                                    </div>

                                    <select
                                        className="select select-bordered select-primary select-sm max-w-24 mb-3 text-color"
                                        id="substitutions"
                                        name="substitutions"
                                        value={formData.substitutions}
                                        onChange={handleForm}
                                    >
                                        {[0, 1, 2].map((option) => (
                                            <option value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </>
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
                                    className="textarea textarea-bordered textarea-primary max-w-24 min-h-36 max-h-36 text-color"
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
                                className="textarea textarea-bordered textarea-primary text-color"
                                onChange={handleForm}
                            ></textarea>
                        </label>
                    )}
                    {query === "Promoter Analysis" && (
                        <>
                            <span>
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
                                            <option value={option}>
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
                                        className="select select-bordered select-primary select-sm w-full max-w-xs mb-3 text-color"
                                        id="synteny"
                                        name="synteny"
                                        value={formData.synteny}
                                        onChange={handleForm}
                                    >
                                        {syntenies.map((option) => (
                                            <option value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </span>
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
                        </>
                    )}
                    {query === "Upstream Sequence" && (
                        <span>
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
                            <label>
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
                        </span>
                    )}
                    {query !== "TF-Consensus List" && (
                        // <Button className="self-start mt-10" type="submit">
                        //     Search
                        // </Button>
                        <button
                            className="btn btn-primary mt-7"
                            type="submit"
                            onSubmit={handleQuery}
                        >
                            Search
                        </button>
                    )}
                </div>
            </form>
            {/* <div
                className="ag-theme-quartz mt-6 ml-4 "
                style={{ width: 900, height: 400 }}
            >
                <button className="btn mb-6" onClick={onBtnExport}>
                    Download
                </button>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                />
            </div> */}
            <p>{tmpResults}</p>
        </>
    );
}
