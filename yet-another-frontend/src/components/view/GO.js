import React from "react";
import { titleFormat } from "../../utils/utils";

export default function GO({ gos }) {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <tbody>
                    {Object.keys(gos).map((row) => (
                        <tr>
                            <th>{titleFormat(row)}</th>
                            <td>
                                <ul>
                                    {gos[row].map((item) => (
                                        <li>
                                            <a
                                                href={`${window.location.pathname}?goid=${item["goid"]}`}
                                            >{`level ${item["depth"]}: ${item["term"]}`}</a>
                                        </li>
                                    ))}
                                </ul>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
