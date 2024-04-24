import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
// import {
//     Textarea,
//     Radio,
//     RadioGroup,
//     Checkbox,
//     Select,
//     SelectItem,
//     Button,
// } from "@nextui-org/react";
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
                <div>
                    <label className="label cursor-pointer">
                        <span className="label-text">Search by TFs/Genes</span>
                        <input
                            type="radio"
                            id="rank-none"
                            name="query"
                            value="rank-none"
                            className="radio radio-sm"
                            checked={formData.query === "rank-none"}
                            onChange={handleForm}
                        />
                    </label>
                    <label className="label cursor-pointer">
                        <span className="label-text">Rank by TF</span>
                        <input
                            type="radio"
                            id="rank-tf"
                            name="query"
                            value="rank-tf"
                            className="radio radio-sm"
                            checked={formData.query === "rank-tf"}
                            onChange={handleForm}
                        />
                    </label>
                    <label className="label cursor-pointer">
                        <span className="label-text">Rank by GO</span>
                        <input
                            type="radio"
                            id="rank-go"
                            name="query"
                            value="rank-go"
                            className="radio radio-sm"
                            checked={formData.query === "rank-go"}
                            onChange={handleForm}
                        />
                    </label>
                    <label className="label cursor-pointer">
                        <span className="label-text">Rank by Unique TFBS</span>
                        <input
                            type="radio"
                            id="rank-tfbs"
                            name="query"
                            value="rank-tfbs"
                            className="radio radio-sm"
                            checked={formData.query === "rank-tfbs"}
                            onChange={handleForm}
                        />
                    </label>
                </div>
                <div>
                    <div className="flex flex-row gap-6 mb-3">
                        <label>
                            <div className="label">
                                <span className="label-text">TFs</span>
                            </div>
                            <textarea
                                id="tfs"
                                name="tfs"
                                value={formData.tfs}
                                className="textarea textarea-bordered"
                                onChange={handleForm}
                            ></textarea>
                        </label>

                        <label>
                            <div className="label">
                                <span className="label-text">Genes</span>
                            </div>
                            <textarea
                                id="genes"
                                name="genes"
                                value={formData.genes}
                                className="textarea textarea-bordered"
                                onChange={handleForm}
                            ></textarea>
                        </label>
                    </div>
                    <div className="flex flex-row gap-6">
                        <button
                            className="btn"
                            type="submit"
                            onSubmit={handleQuery}
                        >
                            Search
                        </button>
                    </div>
                </div>
                <div>
                    <label className="label cursor-pointer">
                        <span className="label-text">Binding</span>
                        <input
                            type="radio"
                            id="binding"
                            name="documented"
                            value="binding"
                            className="radio radio-sm"
                            checked={formData.documented === "binding"}
                            onChange={handleForm}
                        />
                    </label>
                    <label className="label cursor-pointer">
                        <span className="label-text">Expression</span>
                        <input
                            type="radio"
                            id="expression"
                            name="documented"
                            value="expression"
                            className="radio radio-sm"
                            checked={formData.documented === "expression"}
                            onChange={handleForm}
                        />
                    </label>

                    <label className="label cursor-pointer">
                        <span className="label-text">
                            Binding or Expression
                        </span>
                        <input
                            type="radio"
                            id="binding or expression"
                            name="documented"
                            value="binding or expression"
                            className="radio radio-sm"
                            checked={
                                formData.documented === "binding or expression"
                            }
                            onChange={handleForm}
                        />
                    </label>
                    <label className="label cursor-pointer">
                        <span className="label-text">
                            Binding and Expression
                        </span>
                        <input
                            type="radio"
                            id="binding and expression"
                            name="documented"
                            value="binding and expression"
                            className="radio radio-sm"
                            checked={
                                formData.documented === "binding and expression"
                            }
                            onChange={handleForm}
                        />
                    </label>
                </div>
                <div>
                    <label className="label cursor-pointer">
                        <span className="label-text">TF as activator</span>
                        <input
                            type="checkbox"
                            id="activator"
                            name="activator"
                            className="checkbox  checkbox-sm"
                            checked={formData.activator}
                            onChange={handleForm}
                        />
                    </label>
                    <label className="label cursor-pointer">
                        <span className="label-text">TF as inhibitor</span>
                        <input
                            type="checkbox"
                            id="inhibitor"
                            name="inhibitor"
                            className="checkbox  checkbox-sm"
                            checked={formData.inhibitor}
                            onChange={handleForm}
                        />
                    </label>
                    <label className="label cursor-pointer">
                        <span className="label-text">
                            No assoc. information
                        </span>
                        <input
                            type="checkbox"
                            id="noexprinfo"
                            name="noexprinfo"
                            className="checkbox  checkbox-sm"
                            checked={formData.noexprinfo}
                            onChange={handleForm}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        <div className="label">
                            <span className="label-text">
                                Environmental Condition
                            </span>
                        </div>

                        <select
                            className="select select-bordered select-sm w-full max-w-xs mb-3"
                            id="envconGroup"
                            name="envconGroup"
                            value={formData.envconGroup}
                            onChange={handleForm}
                        >
                            {envcons.map((option) => (
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
                    <label>
                        <div className="label">
                            <span className="label-text">
                                Homologous Regulations
                            </span>
                        </div>

                        <select
                            className="select select-bordered select-sm w-full max-w-xs mb-3"
                            id="homolog"
                            name="homolog"
                            value={formData.homolog}
                            onChange={handleForm}
                        >
                            {homologs.map((option) => (
                                <option value={option}>{option}</option>
                            ))}
                        </select>
                    </label>
                    {/* <Select
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
                    </Select> */}
                </div>
            </form>

            <div
                className="ag-theme-quartz mt-6 ml-6 "
                style={{ width: 900, height: 400 }}
            >
                {/* <Button className="mb-6" onPress={onBtnExport}>
                    Download
                </Button> */}
                <button className="btn mb-6" onClick={onBtnExport}>
                    Download
                </button>
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
