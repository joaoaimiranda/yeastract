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
} from "@nextui-org/react";
import constants from "../constants";

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

    const envcons = ["x", "y", "z"];
    const syntenies = [
        "BLAST Best-Scores",
        "BLAST Best-Scores + at least 1 neighbor",
        "BLAST Best-Scores + at least 2 neighbor",
        "BLAST Best-Scores + at least 3 neighbor",
    ];
    const homologs = ["c. albicans", "c. auris", "c. glabrata"];

    const [rowData, setRowData] = React.useState([]);

    const [colDefs, setColDefs] = React.useState([
        { field: "tf" },
        { field: "gene" },
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
        if (formData.query === "rank-none") {
            fetch(`${constants.baseUrl}/associations/search`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
                .then((res) => res.json())
                .then((data) => {
                    setColDefs([{ field: "tf" }, { field: "gene" }]);
                    setRowData(data);
                });
        } else if (formData.query === "rank-tf") {
            fetch(`${constants.baseUrl}/associations/ranktf`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            })
                .then((res) => res.json())
                .then((data) => {
                    setColDefs([
                        { field: "tf" },
                        { field: "setPer" },
                        { field: "dbPer" },
                        { field: "genes" },
                    ]);
                    setRowData(data);
                    console.log(data);
                });
        }
    }

    // fetch(`${constants.baseUrl}/utils/species`)
    //     .then((res) => res.json())
    //     .then((data) => console.log(data));

    const gridRef = React.useRef();

    const onBtnExport = React.useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
    }, []);

    return (
        <>
            <h1 className="text-xl font-bold text-center mb-6">Regulations</h1>
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
                <Button className="mb-6" onPress={onBtnExport}>
                    Download
                </Button>
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                />
            </div>
        </>
    );
}
