import React from "react";
import { searchRegulationInfo } from "../services/remoteServices.js";
import { referenceFormat } from "../utils/utils.js";
import constants from "../conf/constants.js";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import CloseIcon from "../svg/CloseIcon.js";

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

    // const getRowHeight = (params) =>
    //     params.data.envcond.length > 1 ? params.data.envcond.length * 17 : 42;

    const colDefs = React.useMemo(
        () => [
            {
                headerName: "TF",
                field: "protein",
                width: 100,
            },
            {
                headerName: "Gene",
                field: "orf",
                width: 120,
                cellRenderer: (p) =>
                    p.data.gene === "Uncharacterized"
                        ? p.data.orf
                        : p.data.gene,
            },
            {
                headerName: "References",
                cellRenderer: (p) => (
                    <a
                        className="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`${constants.pubmedUrl}${p.data.pubmedid}`}
                    >
                        {referenceFormat(p.data)}
                    </a>
                ),
                tooltipValueGetter: (p) => referenceFormat(p.data),
                width: 400,
            },
            { headerName: "Evidence", field: "code", width: 120 },
            { headerName: "Experiment", field: "experiment" },
            { headerName: "Type", field: "association", width: 100 },
            { headerName: "Strain", field: "strain", width: 100 },
            {
                headerName: "Environmental Condition",
                field: "envcond",
                tooltipValueGetter: (p) => p.data.envcond,
                width: 500,
                wrapText: true,
            },
        ],
        []
    );

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
                        // <table className="table">
                        //     <thead>
                        //         <tr>
                        //             <th>Transcription Factor</th>
                        //             <th>Target ORF/Genes</th>
                        //             <th>References</th>
                        //             <th>Evidence Code</th>
                        //             <th>Evidence Experiment</th>
                        //             <th>Association Type</th>
                        //             <th>Strain</th>
                        //             <th>Environmental Condition</th>
                        //         </tr>
                        //     </thead>
                        //     <tbody>
                        //         {info.map((row) => (
                        //             <tr>
                        //                 <td>{row.protein}</td>
                        //                 <td>{row.orf}</td>
                        //                 <td>
                        //                     <a
                        //                         className="underline"
                        //                         target="_blank"
                        //                         rel="noopener noreferrer"
                        //                         href={`${constants.pubmedUrl}${row.pubmedid}`}
                        //                     >
                        //                         {referenceFormat(row)}
                        //                     </a>
                        //                 </td>
                        //                 <td>{row.code}</td>
                        //                 <td>{row.experiment}</td>
                        //                 <td>{row.association}</td>
                        //                 <td>{row.strain}</td>
                        //                 <td>{row["envcond"].join("; ")}</td>
                        //             </tr>
                        //         ))}
                        //     </tbody>
                        // </table>
                        <div
                            className="ag-theme-quartz w-full h-full"
                            style={{
                                "--ag-header-background-color": "#f3f4f6",
                            }}
                        >
                            <AgGridReact
                                rowData={info}
                                columnDefs={colDefs}
                                defaultColDef={defaultColDef}
                                unSortIcon={true}
                                enableCellTextSelection={true}
                                ensureDomOrder={true}
                                // getRowHeight={getRowHeight}
                            />
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
