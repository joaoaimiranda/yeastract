import React from "react";
import { sequenceFormat, titleFormat } from "../../utils/utils";
import speciesList from "../../conf/speciesList";

export default function Locus({ locus, orf, species }) {
    const exts = (
        <ul>
            {speciesList[species].ext.map((ext) => (
                <li key={ext.name}>
                    <a
                        className="link"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={
                            ext.name === "KEGG"
                                ? `${ext.url}${orf}`
                                : `${ext.url}${locus.ext}`
                        }
                    >
                        {ext.name}
                    </a>
                </li>
            ))}
        </ul>
    );
    const [showPromSeq, setShowPromSeq] = React.useState(false);
    const [showGeneSeq, setShowGeneSeq] = React.useState(false);

    return (
        <div className="overflow-x-auto">
            <table className="table">
                <tbody>
                    {Object.keys(locus).map((row) => {
                        if (row === "gene_Sequence") {
                            return (
                                <tr key={row}>
                                    <th className="align-top w-32 m-0 p-1">
                                        {titleFormat(row)}
                                        <button
                                            className="btn btn-xs"
                                            onClick={() =>
                                                setShowGeneSeq(!showGeneSeq)
                                            }
                                        >
                                            {showGeneSeq
                                                ? "Hide Seq"
                                                : "Show Seq"}
                                        </button>
                                    </th>
                                    <td className=" m-0 p-1">
                                        {showGeneSeq &&
                                            sequenceFormat(locus[row])}
                                    </td>
                                </tr>
                            );
                        } else if (row === "promoter_Sequence") {
                            return (
                                <tr key={row}>
                                    <th className="align-top w-32 m-0 p-1">
                                        {titleFormat(row)}
                                        <button
                                            className="btn btn-xs"
                                            onClick={() =>
                                                setShowPromSeq(!showPromSeq)
                                            }
                                        >
                                            {showPromSeq
                                                ? "Hide Seq"
                                                : "Show Seq"}
                                        </button>
                                    </th>
                                    <td className=" m-0 p-1">
                                        {showPromSeq &&
                                            sequenceFormat(locus[row])}
                                    </td>
                                </tr>
                            );
                        } else {
                            return (
                                <tr key={row}>
                                    <th className="align-top w-32 m-0 p-1">
                                        {row === "ext"
                                            ? "External Sources"
                                            : titleFormat(row)}
                                    </th>
                                    <td className="m-0 p-1">
                                        {row === "ext" ? exts : locus[row]}
                                    </td>
                                </tr>
                            );
                        }
                    })}
                </tbody>
            </table>
        </div>
    );
}
