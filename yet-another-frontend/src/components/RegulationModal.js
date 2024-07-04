import React from "react";
import { searchRegulationInfo } from "../services/remoteServices.js";
import { referenceFormat } from "../utils/utils.js";
import constants from "../conf/constants.js";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import CloseIcon from "../svg/CloseIcon.js";
import HamburgerIcon from "../svg/HamburgerIcon";
import DownloadIcon from "../svg/DownloadIcon";

export default function Modal(props) {
    const [info, setInfo] = React.useState({});
    const [opened, setOpened] = React.useState(false);

    React.useEffect(() => {
        async function fetchData() {
            const data = await searchRegulationInfo(
                props.orf,
                props.tf,
                props.species
            );
            setInfo(data);
        }
        if (opened) fetchData();
    }, [props.tf, props.orf, props.species, opened]);

    function openModal() {
        if (!opened) setOpened(true);
        document.getElementById(props.id).showModal();
    }

    const defaultColDef = React.useMemo(() => {
        return {
            filter: true,
            // flex: 1,
            floatingFilter: true,
            suppressHeaderMenuButton: true,
        };
    }, []);

    const getRowHeight = (params) => {
        const singleSize = 28;
        const env = Math.ceil(params.data.envcond.length / 35) * singleSize;
        const exp = Math.ceil(params.data.experiment.length / 30) * singleSize;
        const pub =
            Math.ceil(referenceFormat(params.data).length / 35) * singleSize;
        return Math.max(env, exp, pub);
    };

    const [colDefs, setColDefs] = React.useState([
        {
            headerName: "TF",
            field: "protein",
            width: 100,
            hide: false,
        },
        {
            headerName: "Gene",
            field: "orf",
            width: 100,
            hide: false,
            cellRenderer: (p) =>
                p.data.gene === "Uncharacterized" ? p.data.orf : p.data.gene,
        },
        {
            headerName: "References",
            field: "pubmedid",
            width: 250,
            hide: false,
            cellRenderer: (p) => (
                <a
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                    href={`${constants.pubmedUrl}${p.data.pubmedid}`}
                >
                    <p className="leading-7">{referenceFormat(p.data)}</p>
                </a>
            ),
            tooltipValueGetter: (p) => referenceFormat(p.data),
            wrapText: true,
        },
        { headerName: "Evidence", field: "code", width: 100, hide: false },
        {
            headerName: "Experiment",
            field: "experiment",
            width: 200,
            hide: false,
            cellRenderer: (p) => (
                <p className="text-wrap leading-7">{p.data.experiment}</p>
            ),
            tooltipValueGetter: (p) => p.data.experiment,
        },
        { headerName: "Type", field: "association", width: 100, hide: false },
        { headerName: "Strain", field: "strain", width: 100, hide: false },
        {
            headerName: "Environmental Condition",
            field: "envcond",
            tooltipValueGetter: (p) => p.data.envcond,
            width: 300,
            // wrapText: true,
            hide: false,
            cellRenderer: (p) => (
                <p className="text-wrap leading-7">{p.data.envcond}</p>
            ),
        },
    ]);

    function handleColumns(event) {
        const { name, checked } = event.target;
        setColDefs((prevCols) =>
            prevCols.map((col) =>
                col["field"] === name ? { ...col, hide: !checked } : col
            )
        );
    }

    const gridRef = React.useRef();

    const onBtnExport = React.useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
    }, []);

    return (
        <>
            <button className="ml-2 btn btn-xs" onClick={openModal}>
                Ref
            </button>
            <dialog id={props.id} className="modal">
                <div className="modal-box w-11/12 max-w-full h-full flex flex-col">
                    <div className="grid grid-cols-2">
                        <h3 className="text-xl self-center">{`Reference(s) supporting ${props.tf} -> ${props.orf}`}</h3>
                        <form method="dialog" className="justify-self-end mb-2">
                            <button className="btn btn-ghost btn-circle">
                                <CloseIcon />
                            </button>
                        </form>
                    </div>
                    {Object.keys(info).length !== 0 && (
                        <div className="w-full h-full">
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
                                                        defaultChecked={
                                                            !col.hide
                                                        }
                                                        className="checkbox checkbox-sm checkbox-primary"
                                                        onChange={handleColumns}
                                                    />
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    className="btn btn-sm"
                                    onClick={onBtnExport}
                                >
                                    <DownloadIcon />
                                    Download
                                </button>
                            </div>
                            <div
                                className="ag-theme-quartz w-full h-full"
                                style={{
                                    "--ag-header-background-color": "#f3f4f6",
                                    "--ag-wrapper-border-radius": "none",
                                    "--ag-cell-horizontal-border":
                                        "solid #e5e7eb",
                                }}
                            >
                                <AgGridReact
                                    rowData={info}
                                    columnDefs={colDefs}
                                    defaultColDef={defaultColDef}
                                    unSortIcon={true}
                                    enableCellTextSelection={true}
                                    ensureDomOrder={true}
                                    domLayout={"autoHeight"}
                                    getRowHeight={getRowHeight}
                                />
                            </div>
                        </div>
                    )}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>Close</button>
                </form>
            </dialog>
        </>
    );
}
