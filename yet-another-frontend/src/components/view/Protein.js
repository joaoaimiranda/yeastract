import React from "react";
import TFBSModal from "../TFBSModal";
import { sequenceFormat, titleFormat } from "../../utils/utils";
export default function Protein({ protein, species }) {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <tbody>
                    {Object.keys(protein).map((row) => (
                        <tr key={row}>
                            <th className="align-top w-32 m-0 p-1">
                                {titleFormat(row)}
                            </th>
                            <td className=" m-0 p-1">
                                {row === "TFBS" ? (
                                    <ul>
                                        {protein[row].map((tfbs, i) => (
                                            <li key={i}>
                                                <span>{tfbs} </span>
                                                <TFBSModal
                                                    id={`modal_${tfbs}`}
                                                    species={species}
                                                    tf={protein["protein_name"]}
                                                    consensus={tfbs}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                ) : row === "aminoacid_sequence" ? (
                                    sequenceFormat(protein[row])
                                ) : (
                                    protein[row]
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
