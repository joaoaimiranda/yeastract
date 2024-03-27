import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import {
    Textarea,
    Radio,
    RadioGroup,
    Checkbox,
    Select,
    SelectItem,
    Button,
    Input,
    Link,
} from "@nextui-org/react";
import species from "./Species";

export default function Main() {
    // const [crossSpecies, setCrossSpecies] = React.useState(false);
    // const [documented, setDocumented] = React.useState(true);
    // const [expression, setExpression] = React.useState(false);
    const [formData, setFormData] = React.useState({
        query: "rank-none",
        tfs: "",
        genes: "",
        evidence: "documented",
        documented: "expression",
        activator: true,
        inhibitor: true,
        noexprinfo: true,
        envconGroup: "",
        envconSubgroup: "",
        synteny: "BLAST Best-Scores",
        homolog: "",
    });

    const [searchFormData, setSearchFormData] = React.useState("");
    const [currentSpecies, setCurrentSpecies] = React.useState(
        "SaccharomycescerevisiaeS288c"
    );

    const envcons = ["x", "y", "z"];
    const syntenies = [
        "BLAST Best-Scores",
        "BLAST Best-Scores + at least 1 neighbor",
        "BLAST Best-Scores + at least 2 neighbor",
        "BLAST Best-Scores + at least 3 neighbor",
    ];
    const homologs = ["c. albicans", "c. auris", "c. glabrata"];

    const [rowData, setRowData] = React.useState([
        { TF: "Pdr1p", Genes: "PAU8" },
        { TF: "Pdr1p", Genes: "SEO1" },
        { TF: "Pdr1p", Genes: "YAL066W" },
        { TF: "Haa1p", Genes: "YBR090C" },
        { TF: "Haa1p", Genes: "GSR1" },
        { TF: "Haa1p", Genes: "MAK5" },
        { TF: "Msn2p", Genes: "SEO1" },
        { TF: "Msn2p", Genes: "YALO64W" },
        { TF: "Msn2p", Genes: "FLO9" },
    ]);

    const [colDefs, setColDefs] = React.useState([
        { field: "TF" },
        { field: "Genes" },
    ]);
    const defaultColDef = React.useMemo(() => {
        return {
            filter: "agTextColumnFilter",
            flex: 1,
        };
    }, []);

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

    function handleSearch(event) {
        event.preventDefault();
        console.log(searchFormData);
    }

    const gridRef = React.useRef();

    const onBtnExport = React.useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
    }, []);

    return (
        <>
            <h1 className="text-4xl text-center p-3 font-ntr">YEASTRACT+</h1>
            <div className="grid grid-cols-6 gap-4">
                <div className="flex flex-col p-5">
                    <Select
                        label="Species"
                        className="max-w-xs mb-6"
                        id="species"
                        name="species"
                        defaultSelectedKeys={[currentSpecies]}
                        onChange={(e) => setCurrentSpecies(e.target.value)}
                    >
                        {species.map((x) => (
                            <SelectItem key={x} value={x}>
                                {x}
                            </SelectItem>
                        ))}
                    </Select>
                    <form onSubmit={handleSearch}>
                        <Input
                            defaultValue={searchFormData}
                            placeholder="Search"
                            onChange={(e) => setSearchFormData(e.target.value)}
                        />
                    </form>
                    <Link
                        href="/"
                        underline="always"
                        className="justify-center mt-1 mb-6"
                        color="foreground"
                    >
                        Advanced Search
                    </Link>
                    <Link
                        href="/"
                        size="lg"
                        color="foreground"
                        isBlock
                        className="mb-3"
                    >
                        Regulations
                    </Link>
                    <Link
                        href="/"
                        size="lg"
                        color="foreground"
                        isBlock
                        className="mb-3"
                    >
                        Sequences
                    </Link>
                    <Link
                        href="/"
                        size="lg"
                        color="foreground"
                        isBlock
                        className="mb-3"
                    >
                        About
                    </Link>
                    <Link
                        href="/"
                        size="lg"
                        color="foreground"
                        isBlock
                        className="mb-3"
                    >
                        Help
                    </Link>
                </div>
                <div className="col-span-5 p-6">
                    <h1 className="text-xl font-bold text-center mb-6">
                        Regulations
                    </h1>
                    <form
                        className="flex flex-row space-x-16 p-3 border-b border-gray-500"
                        onSubmit={handleQuery}
                    >
                        <RadioGroup
                            size="sm"
                            label="Query mode"
                            id="query"
                            name="query"
                            defaultValue={formData.query}
                            onChange={handleForm}
                        >
                            <Radio value="rank-none">Search by TFs/Genes</Radio>
                            <Radio value="rank-tf">Rank by TF</Radio>
                            <Radio value="rank-go">Rank by GO</Radio>
                            <Radio value="rank-tfbs">Rank by Unique TFBS</Radio>
                            <Radio value="matrix">Regulation Matrix</Radio>
                        </RadioGroup>
                        <span>
                            <Textarea
                                variant="bordered"
                                id="tfs"
                                name="tfs"
                                label="TFs"
                                className="max-w-40 mb-10"
                                minRows={5}
                                defaultValue={formData.tfs}
                                onChange={handleForm}
                            />
                            <Button type="submit" onSubmit={handleQuery}>
                                Search
                            </Button>
                        </span>
                        <span>
                            <Textarea
                                variant="bordered"
                                id="genes"
                                name="genes"
                                label="Genes"
                                className="max-w-40 mb-10"
                                minRows={5}
                                defaultValue={formData.genes}
                                onChange={handleForm}
                            />
                            <Button onPress={onBtnExport}>Download</Button>
                        </span>
                        <RadioGroup
                            size="sm"
                            label="Evidence"
                            id="evidence"
                            name="evidence"
                            defaultValue={formData.evidence}
                            onChange={handleForm}
                        >
                            <Radio value="documented">Documented</Radio>
                            <RadioGroup
                                size="sm"
                                className="ml-6"
                                id="documented"
                                name="documented"
                                defaultValue={formData.documented}
                                isDisabled={formData.evidence !== "documented"}
                                onChange={handleForm}
                            >
                                <Radio value="binding">Binding</Radio>
                                <Radio value="expression">Expression</Radio>

                                <Checkbox
                                    size="sm"
                                    className="ml-3"
                                    id="activator"
                                    name="activator"
                                    isSelected={formData.activator}
                                    onChange={handleForm}
                                >
                                    Activator
                                </Checkbox>
                                <Checkbox
                                    size="sm"
                                    className="ml-3"
                                    id="inhibitor"
                                    name="inhibitor"
                                    isSelected={formData.inhibitor}
                                    onChange={handleForm}
                                >
                                    Inhibitor
                                </Checkbox>
                                <Checkbox
                                    size="sm"
                                    className="ml-3"
                                    id="noexprinfo"
                                    name="noexprinfo"
                                    isSelected={formData.noexprinfo}
                                    onChange={handleForm}
                                >
                                    No information
                                </Checkbox>
                                <Radio value="binding or expression">
                                    Binding or Expression
                                </Radio>
                                <Radio value="binding and expression">
                                    Binding and Expression
                                </Radio>
                            </RadioGroup>
                            <Radio value="potential">Potential</Radio>
                        </RadioGroup>
                        <span className="min-w-80">
                            <Select
                                variant="bordered"
                                label="Environmental Condition"
                                className="max-w-xs mb-6"
                                id="envconGroup"
                                name="envconGroup"
                                onChange={handleForm}
                            >
                                {envcons.map((x) => (
                                    <SelectItem key={x} value={x}>
                                        {x}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                variant="bordered"
                                label="Synteny"
                                className="max-w-xs mb-6"
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
                            <Select
                                variant="bordered"
                                label="Homologous Relations"
                                className="max-w-xs  mb-6"
                                id="homolog"
                                name="homolog"
                                onChange={handleForm}
                            >
                                {homologs.map((x) => (
                                    <SelectItem key={x} value={x}>
                                        {x}
                                    </SelectItem>
                                ))}
                            </Select>
                        </span>
                    </form>

                    <div
                        className="ag-theme-quartz mt-6 ml-6 "
                        style={{ width: 900, height: 400 }}
                    >
                        <AgGridReact
                            ref={gridRef}
                            rowData={rowData}
                            columnDefs={colDefs}
                            defaultColDef={defaultColDef}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
