import React from "react";
import Modal from "../Modal";
import { sequenceFormat, titleFormat } from "../../utils/utils";
export default function Protein({ protein, species }) {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <tbody>
                    {Object.keys(protein).map((row) => (
                        <tr>
                            <th className="align-top w-32">
                                {titleFormat(row)}
                            </th>
                            <td>
                                {row === "TFBS" ? (
                                    <ul>
                                        {protein[row].map((tfbs) => (
                                            <li>
                                                <span>{tfbs}</span>
                                                <Modal
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
