import React from "react";
import { titleFormat } from "../../utils/utils";

export default function GO({ gos }) {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <tbody>
                    {Object.keys(gos).map((row) => (
                        <tr>
                            <th className="align-top w-32 m-0 p-1">
                                {titleFormat(row)}
                            </th>
                            <td className=" m-0 p-1">
                                <ul>
                                    {gos[row].map((item) => (
                                        <li>
                                            <a
                                                className="link"
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
