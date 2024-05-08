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

export default function Sequences() {
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
        console.log(event.target);
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function handleQuery(event) {
        event.preventDefault();
        console.log(formData);
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
                <div className="ml-3 flex flex-row gap-5">
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
                <div className="flex flex-row space-x-6 p-3 border-b border-gray-500">
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
        </>
    );
}
