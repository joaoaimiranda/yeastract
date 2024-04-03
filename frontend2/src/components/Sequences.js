import { Button, Input, Select, SelectItem, Textarea } from "@nextui-org/react";
import React from "react";
import species from "./Species";

export default function Sequences() {
    const [formData, setFormData] = React.useState({
        query: "Search for DNA motif(s) on promoter regions",
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

    function handleForm(event) {
        const { name, value, checked, type } = event.target;
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
            <h1 className="text-xl font-bold text-center mb-6">Sequences</h1>
            <form
                className="flex flex-row space-x-16 p-3 border-b border-gray-500"
                onSubmit={handleQuery}
            >
                <span>
                    <Select
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
                    </Select>
                    <Button type="submit">Search</Button>
                </span>
                <span>
                    <Textarea
                        isDisabled={
                            formData.query === "Promoter Analysis" ||
                            formData.query === "TF-Consensus List" ||
                            formData.query === "Upstream Sequence"
                        }
                        id="motif"
                        name="motif"
                        label="DNA Motif"
                        className="max-w-40 mb-10"
                        minRows={3}
                        defaultValue={formData.motif}
                        onChange={handleForm}
                    />
                    <Select
                        isDisabled={
                            formData.query === "Promoter Analysis" ||
                            formData.query === "TF-Consensus List" ||
                            formData.query === "Upstream Sequence"
                        }
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
                    </Select>
                </span>
                <Textarea
                    isDisabled={
                        formData.query ===
                            "Search described TF Binding Sites by a given DNA motif" ||
                        formData.query === "Find TF Binding Site(s)" ||
                        formData.query === "TF-Consensus List"
                    }
                    id="genes"
                    name="genes"
                    label="ORF/Gene"
                    className="max-w-40 mb-10"
                    minRows={5}
                    defaultValue={formData.genes}
                    onChange={handleForm}
                />
                {/* QUERY-DEPENDENT OPTIONS*/}
                {formData.query === "Find TF Binding Site(s)" && (
                    <Textarea
                        id="sequence"
                        name="sequence"
                        label="Sequence (FastA format)"
                        className="max-w-40 mb-10"
                        minRows={5}
                        defaultValue={formData.sequence}
                        onChange={handleForm}
                    />
                )}
                {formData.query === "Promoter Analysis" && (
                    <>
                        <span>
                            <Select
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
                            </Select>
                        </span>
                        <Select
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
                        </Select>
                    </>
                )}
                {formData.query === "Upstream Sequence" && (
                    <span>
                        <Input
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
                        />
                    </span>
                )}
            </form>
        </>
    );
}
