import React from "react";
import { searchTFBS } from "../services/remoteServices.js";
import speciesList from "../conf/speciesList.js";
export default function Modal(props) {
    const [info, setInfo] = React.useState({});

    React.useEffect(() => {
        async function fetchData() {
            const data = await searchTFBS(
                props.tf,
                props.consensus,
                speciesList[props.species].dbspecies +
                    " " +
                    speciesList[props.species].dbstrains
            );
            setInfo(data);
        }
        fetchData();
    }, [props.tf, props.consensus, props.species]);

    function titleFormat(str) {
        str = str.replaceAll("_", " ");
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <dialog id={props.id} className="modal">
            <div className="modal-box w-11/12 max-w-full">
                {Object.keys(info).length !== 0 && (
                    <table>
                        <thead>
                            <tr>
                                {Object.keys(info[0]).map((col) => (
                                    <th>{titleFormat(col)}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {info.map((row) => (
                                <tr>
                                    {Object.keys(row).map((cell) => (
                                        <td>{row[cell]}</td>
                                    ))}
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
    );
}
