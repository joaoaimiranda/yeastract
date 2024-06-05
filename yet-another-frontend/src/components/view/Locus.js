import React from "react";
import { titleFormat } from "../../utils/utils";

export default function Locus({ locus }) {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <tbody>
                    {Object.keys(locus).map((row) => (
                        <tr>
                            <th>{titleFormat(row)}</th>
                            <td>{locus[row]}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
