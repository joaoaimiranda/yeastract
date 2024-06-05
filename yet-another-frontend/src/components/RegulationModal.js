import React from "react";
import { searchRegulationInfo } from "../services/remoteServices.js";
import { referenceFormat } from "../utils/utils.js";

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

    return (
        <>
            <button className="ml-2 btn btn-xs btn-ghost" onClick={openModal}>
                Ref
            </button>
            <dialog id={props.id} className="modal">
                <div className="modal-box w-11/12 max-w-full">
                    {Object.keys(info).length !== 0 && (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Transcription Factor</th>
                                    <th>Target ORF/Genes</th>
                                    <th>References</th>
                                    <th>Evidence Code</th>
                                    <th>Evidence Experiment</th>
                                    <th>Association Type</th>
                                    <th>Strain</th>
                                    <th>Environmental Condition</th>
                                </tr>
                            </thead>
                            <tbody>
                                {info.map((row) => (
                                    <tr>
                                        <td>{row.protein}</td>
                                        <td>{row.orf}</td>
                                        <td>{referenceFormat(row)}</td>
                                        <td>{row.code}</td>
                                        <td>{row.experiment}</td>
                                        <td>{row.association}</td>
                                        <td>{row.strain}</td>
                                        <td>{row["envcond"].join("; ")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
}
