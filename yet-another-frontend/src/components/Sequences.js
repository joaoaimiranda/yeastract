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
        from: "-1000",
        to: "-1",
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
            <h1 className="text-xl font-bold text-center mb-6">{query}</h1>
            <form
                className="flex flex-row space-x-16 p-3 border-b border-gray-500"
                onSubmit={handleQuery}
            >
                <div>
                    {/* <Select
                        variant="bordered"
                        className="max-w-xs mb-6"
                        id="query"
                        name="query"
                        onChange={handleForm}
                        defaultSelectedKeys={[
                            "Search for DNA motif(s) on promoter regions",
                        ]}
                        aria-label="query selection"
                    >
                        {queries.map((q) => (
                            <SelectItem key={q} value={q}>
                                {q}
                            </SelectItem>
                        ))}
                    </Select> */}
                    <select
                        className="select select-bordered w-full mb-6 flex flex-row"
                        id="query"
                        name="query"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    >
                        {queries.map((option) => (
                            <option value={option}>{option}</option>
                        ))}
                    </select>
                    {query !== "TF-Consensus List" && (
                        // <Button className="self-start mt-10" type="submit">
                        //     Search
                        // </Button>
                        <button
                            className="btn flex flex-row"
                            type="submit"
                            onSubmit={handleQuery}
                        >
                            Search
                        </button>
                    )}
                </div>
                {query !== "Promoter Analysis" &&
                    query !== "TF-Consensus List" &&
                    query !== "Upstream Sequence" && (
                        <div>
                            {/* <Textarea
                                id="motif"
                                name="motif"
                                label="DNA Motif"
                                className="max-w-40 mb-10"
                                minRows={3}
                                defaultValue={formData.motif}
                                onChange={handleForm}
                            /> */}
                            <label>
                                <div className="label">
                                    <span className="label-text">
                                        DNA Motif
                                    </span>
                                </div>
                                <textarea
                                    id="motif"
                                    name="motif"
                                    value={formData.motif}
                                    className="textarea textarea-bordered"
                                    onChange={handleForm}
                                ></textarea>
                            </label>
                            {/* <Select
                                variant="bordered"
                                label="Substitutions"
                                className="max-w-xs mb-6"
                                id="substitutions"
                                name="substitutions"
                                defaultSelectedKeys={[formData.substitutions]}
                                onChange={handleForm}
                            >
                                {[0, 1, 2].map((x) => (
                                    <SelectItem key={x} value={x}>
                                        {x}
                                    </SelectItem>
                                ))}
                            </Select> */}
                            <label>
                                <div className="label">
                                    <span className="label-text">
                                        Substitutions
                                    </span>
                                </div>

                                <select
                                    className="select select-bordered select-sm w-full max-w-xs mb-3"
                                    id="substitutions"
                                    name="substitutions"
                                    value={formData.substitutions}
                                    onChange={handleForm}
                                >
                                    {[0, 1, 2].map((option) => (
                                        <option value={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}
                {query !==
                    "Search described TF Binding Sites by a given DNA motif" &&
                    query !== "Find TF Binding Site(s)" &&
                    query !== "TF-Consensus List" && (
                        // <Textarea
                        //     id="genes"
                        //     name="genes"
                        //     label="ORF/Gene"
                        //     className="max-w-40 mb-10"
                        //     minRows={5}
                        //     defaultValue={formData.genes}
                        //     onChange={handleForm}
                        // />
                        <label>
                            <div className="label">
                                <span className="label-text">ORF/Gene</span>
                            </div>
                            <textarea
                                id="genes"
                                name="genes"
                                value={formData.genes}
                                className="textarea textarea-bordered"
                                onChange={handleForm}
                            ></textarea>
                        </label>
                    )}
                {/* QUERY-DEPENDENT OPTIONS */}
                {query === "Find TF Binding Site(s)" && (
                    // <Textarea
                    //     id="sequence"
                    //     name="sequence"
                    //     label="Sequence (FastA format)"
                    //     className="max-w-40 mb-10"
                    //     minRows={5}
                    //     defaultValue={formData.sequence}
                    //     onChange={handleForm}
                    // />
                    <label>
                        <div className="label">
                            <span className="label-text">
                                Sequence (FastA format)
                            </span>
                        </div>
                        <textarea
                            id="sequence"
                            name="sequence"
                            value={formData.sequence}
                            className="textarea textarea-bordered"
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
                            </Select>
                            <Select
                                variant="bordered"
                                label="Synteny"
                                className="mb-6"
                                id="synteny"
                                name="synteny"
                                defaultSelectedKeys={[formData.synteny]}
                                onChange={handleForm}
                            >
                                {syntenies.map((x) => (
                                    <SelectItem key={x} value={x}>
                                        {x}
                                    </SelectItem>
                                ))}
                            </Select> */}
                            <label>
                                <div className="label">
                                    <span className="label-text">
                                        Consider TFBS from strain:
                                    </span>
                                </div>

                                <select
                                    className="select select-bordered select-sm w-full max-w-xs mb-3"
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
                            <label>
                                <div className="label">
                                    <span className="label-text">Synteny</span>
                                </div>

                                <select
                                    className="select select-bordered select-sm w-full max-w-xs mb-3"
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
                        {/* <Input
                            className="mb-6 max-w-20"
                            id="from"
                            name="from"
                            label="From:"
                            defaultValue={formData.from}
                            onChange={handleForm}
                        />
                        <Input
                            className="max-w-20"
                            id="to"
                            name="to"
                            label="To:"
                            defaultValue={formData.to}
                            onChange={handleForm}
                        /> */}
                        <label className="w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">From:</span>
                            </div>
                            <input
                                type="text"
                                id="from"
                                name="from"
                                value={formData.from}
                                className="input input-bordered w-full max-w-xs"
                                onChange={handleForm}
                            />
                        </label>
                        <label className="w-full max-w-xs">
                            <div className="label">
                                <span className="label-text">To</span>
                            </div>
                            <input
                                type="text"
                                id="to"
                                name="to"
                                value={formData.to}
                                className="input input-bordered w-full max-w-xs"
                                onChange={handleForm}
                            />
                        </label>
                    </span>
                )}
            </form>
        </>
    );
}
