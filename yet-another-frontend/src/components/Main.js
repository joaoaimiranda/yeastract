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
import {
    searchRegulations,
    rankTF,
    rankGO,
    rankTFBS,
} from "../services/remoteServices";

export default function Main(props) {
    // const [crossSpecies, setCrossSpecies] = React.useState(false);
    // const [documented, setDocumented] = React.useState(true);
    // const [expression, setExpression] = React.useState(false);
    const [formData, setFormData] = React.useState({
        // query: "rank-none",
        tfs: "",
        genes: "",
        // evidence: "documented",

        binding: false,
        expression: true,
        // and -> false | or -> true
        and_or: false,
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
        { headerName: "TF", field: "tf" },
        { headerName: "Gene", field: "gene" },
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

    async function handleQuery(event) {
        event.preventDefault();
        const query = event.nativeEvent.submitter.name;
        let documented = "";
        if (formData.binding && formData.expression)
            documented = formData.and_or
                ? "binding or expression"
                : "binding and expression";
        else if (formData.binding) documented = "binding";
        else if (formData.expression) documented = "expression";

        if (query === "rank-none") {
            if (documented === "") return; //not accepted
            const reverseCols = formData.tfs.trim() === "";
            const res = await searchRegulations({
                ...formData,
                documented: documented,
                species: props.species,
            });
            console.log(res);
            if (reverseCols)
                setColDefs([
                    { headerName: "Gene", field: "gene" },
                    { headerName: "TF", field: "tf" },
                ]);
            else
                setColDefs([
                    { headerName: "TF", field: "tf" },
                    { headerName: "Gene", field: "gene" },
                ]);
            setRowData(res);
        } else if (query === "rank-tf") {
            if (documented === "") return; //not accepted
            const res = await rankTF({
                ...formData,
                documented: documented,
                species: props.species,
            });
            console.log(res);
            setColDefs([
                { headerName: "TF", field: "tf" },
                { headerName: "% in user set", field: "setPer" },
                { headerName: "% in species", field: "dbPer" },
                { headerName: "Target Genes", field: "genes" },
            ]);
            setRowData(res);
        } else if (query === "rank-go") {
            const res = await rankGO({
                genes: formData.genes,
                // ontology: formData.ontology,
                species: props.species,
            });
            console.log(res);
            setColDefs([
                { headerName: "GO ID", field: "goid" },
                { headerName: "GO Term", field: "term" },
                { headerName: "Depth level", field: "depth" },
                { headerName: "% in user set", field: "setPer" },
                { headerName: "% in species", field: "dbPer" },
                { headerName: "Genes", field: "gene" },
            ]);
            setRowData(res);
        } else if (query === "rank-tfbs") {
            if (formData.homolog === "") return; //not accepted
            const res = await rankTFBS({
                ...formData,
                species: props.species,
            });
            console.log(res);
        } else {
            console.log("Unknown query name");
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
        <div>
            <h1 className="text-xl font-bold text-center text-color">
                Regulations
            </h1>
            <form
                className="flex flex-col lg:flex-row justify-center gap-2 lg:gap-8 p-4 border-b border-gray-500"
                onSubmit={handleQuery}
            >
                <div className="flex flex-col p-3 max-w-sm self-center rounded-lg shadow-md shadow-gray-200">
                    <div className="flex flex-row justify-center gap-9">
                        <div>
                            <label>
                                <div className="label p-0 mb-2">
                                    <span className="label-text text-color">
                                        TFs
                                    </span>
                                </div>
                                <textarea
                                    id="tfs"
                                    name="tfs"
                                    value={formData.tfs}
                                    className="textarea textarea-bordered textarea-primary min-h-44 max-h-44 max-w-40 text-color"
                                    onChange={handleForm}
                                ></textarea>
                            </label>
                        </div>
                        <div>
                            <label>
                                <div className="label p-0 mb-2">
                                    <span className="label-text text-color">
                                        Genes
                                    </span>
                                </div>
                                <textarea
                                    id="genes"
                                    name="genes"
                                    value={formData.genes}
                                    className="textarea textarea-bordered textarea-primary min-h-44 max-h-44 max-w-40 text-color"
                                    onChange={handleForm}
                                ></textarea>
                            </label>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 mt-auto mb-2 gap-2">
                        {/* <label className="label cursor-pointer">
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
                    </label> */}
                        <button className="btn" type="submit" name="rank-none">
                            Regulations
                        </button>
                        {/* <div className="col-span-2 items-end flex gap-2 ml-auto"> */}
                        {/* <span className="text-color mb-1">Rank by:</span> */}
                        <button className="btn" type="submit" name="rank-tf">
                            Rank TF
                        </button>
                        <button className="btn" type="submit" name="rank-go">
                            Rank GO
                        </button>
                        <button className="btn" type="submit" name="rank-tfbs">
                            Rank TFBS
                        </button>
                        {/* </div> */}
                    </div>
                </div>
                {/* <div className="flex flex-row gap-6">
                        
                    </div> */}
                <div className="grid row-span-2 gap-6">
                    <div className="p-3 content-center rounded-lg shadow-md shadow-gray-200">
                        {/* <label className="label cursor-pointer mt-5">
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
                    </label> */}
                        <div className="flex flex-col gap-3">
                            <label>
                                <div className="label p-0 mb-2 ml-1">
                                    <span className="label-text text-color">
                                        Evidence
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        id="binding"
                                        name="binding"
                                        type="checkbox"
                                        aria-label="Binding"
                                        className="btn"
                                        checked={formData.binding}
                                        onChange={handleForm}
                                    />
                                    <input
                                        id="expression"
                                        name="expression"
                                        type="checkbox"
                                        aria-label="Expression"
                                        className="btn"
                                        checked={formData.expression}
                                        onChange={handleForm}
                                    />
                                </div>
                            </label>
                            <div className="self-center">
                                <label className="cursor-pointer label">
                                    <span className="label-text mr-2 text-color">
                                        AND
                                    </span>
                                    <input
                                        id="and_or"
                                        name="and_or"
                                        type="checkbox"
                                        className="toggle bg-primary border-primary hover:bg-blue-500"
                                        checked={formData.and_or}
                                        onChange={handleForm}
                                        disabled={
                                            !(
                                                formData.binding &&
                                                formData.expression
                                            )
                                        }
                                    />
                                    <span className="label-text ml-2 text-color">
                                        OR
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="p-3 rounded-lg shadow-md shadow-gray-200">
                        <label>
                            <div className="label p-0 mb-2 ml-1 justify-center">
                                <span className="label-text text-color ">
                                    TF as...
                                </span>
                            </div>
                            <div className="flex flex-row justify-center gap-2 mb-2">
                                <input
                                    id="activator"
                                    name="activator"
                                    type="checkbox"
                                    aria-label="Activator"
                                    className="btn"
                                    checked={formData.activator}
                                    onChange={handleForm}
                                    disabled={!formData.expression}
                                />
                                <input
                                    id="inhibitor"
                                    name="inhibitor"
                                    type="checkbox"
                                    aria-label="Inhibitor"
                                    className="btn"
                                    checked={formData.inhibitor}
                                    onChange={handleForm}
                                    disabled={!formData.expression}
                                />
                                <input
                                    id="noexprinfo"
                                    name="noexprinfo"
                                    type="checkbox"
                                    aria-label="N/A"
                                    className="btn"
                                    checked={formData.noexprinfo}
                                    onChange={handleForm}
                                    disabled={!formData.expression}
                                />
                            </div>
                        </label>
                    </div>
                </div>
                {/* <div>
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
                </div> */}
                <div className="flex flex-col p-3 items-center rounded-lg shadow-md shadow-gray-200">
                    <label>
                        <div className="label p-0 mb-2">
                            <span className="label-text text-color">
                                Environmental Condition Group
                            </span>
                        </div>

                        <select
                            className="select select-bordered select-primary select-sm w-56 mb-2 text-color"
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
                        <div className="label p-0 mb-2">
                            <span className="label-text text-color">
                                Subgroup
                            </span>
                        </div>

                        <select
                            className="select select-bordered select-primary select-sm w-56 mb-4 text-color"
                            id="envconSubgroup"
                            name="envconSubgroup"
                            value={formData.envconSubgroup}
                            onChange={handleForm}
                        >
                            {envcons.map((option) => (
                                <option value={option}>{option}</option>
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
                            className="select select-bordered select-primary select-sm w-56 mb-2 text-color"
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
                        <div className="label p-0 mb-2">
                            <span className="label-text text-color">
                                Homologous Regulations
                            </span>
                        </div>

                        <select
                            className="select select-bordered select-primary select-sm w-56 mb-2 text-color"
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
                </div>
            </form>

            <div
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
            </div>
        </div>
    );
}
