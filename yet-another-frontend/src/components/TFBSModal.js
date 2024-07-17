import React from "react";
import { searchTFBS } from "../services/remoteServices.js";
import { referenceFormat } from "../utils/utils.js";
import constants from "../conf/constants.js";
import CloseIcon from "../svg/CloseIcon.js";
import HamburgerIcon from "../svg/HamburgerIcon.js";
import DownloadIcon from "../svg/DownloadIcon.js";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

export default function TFBSModal(props) {
    const [info, setInfo] = React.useState({});
    const [opened, setOpened] = React.useState(false);

    React.useEffect(() => {
        async function fetchData() {
            const data = await searchTFBS(
                props.tf,
                props.consensus,
                props.species
            );
            setInfo(data);
        }
        if (opened) fetchData();
    }, [props.tf, props.consensus, props.species, opened]);

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
        const env =
            Math.ceil(params.data.environmental_Condition.length / 35) *
            singleSize;
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
            cellRenderer: (p) => (
                <a
                    className="link"
                    href={`${props.species}/view?orf=${p.data.protein}`}
                >
                    {p.data.protein}
                </a>
            ),
        },
        {
            headerName: "Binding Site",
            field: "IUPACseq",
            width: 200,
            hide: false,
        },
        {
            headerName: "References",
            field: "pubmedid",
            width: 250,
            hide: false,
            cellRenderer: (p) => (
                <a
                    className="link"
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
        { headerName: "Strain", field: "strain", width: 100, hide: false },
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
        {
            headerName: "Environmental Condition",
            field: "environmental_Condition",
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
            <button className="btn btn-xs p-1" onClick={openModal}>
                Ref
            </button>
            <dialog id={props.id} className="modal">
                <div className="modal-box w-11/12 max-w-full">
                    <div className="grid grid-cols-2 sticky top-0 z-30 bg-base-100 bg-opacity-90">
                        <h3 className="text-xl self-center">{`Reference(s) supporting ${props.consensus} Binding Site`}</h3>
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
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
}
