import React from "react";
import { useSearchParams } from "react-router-dom";
import { searchORF } from "../services/remoteServices";

export default function View({ species }) {
    let [searchParams, setSearchParams] = useSearchParams();
    const [results, setResults] = React.useState({});
    console.log(species);

    React.useEffect(() => {
        async function fetchData() {
            const res = await searchORF(searchParams.get("orf"), species);
            console.log(res);
            setResults(res);
        }
        fetchData();
    }, [searchParams, species]);

    function titleFormat(str) {
        str = str.replaceAll("_", " ");
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <>
            <h1 className="p-3  font-figtree text-xl">Information</h1>
            {Object.keys(results).length !== 0 && (
                <>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <tbody>
                                {Object.keys(results["general"]).map((row) => (
                                    <tr>
                                        <th>{titleFormat(row)}</th>
                                        <td>{results["general"][row]}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="join join-vertical w-full p-3">
                        <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                            <input type="checkbox" />
                            <div className="collapse-title text-xl font-medium">
                                Locus Information
                            </div>
                            <div className="collapse-content">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <tbody>
                                            {Object.keys(results["locus"]).map(
                                                (row) => (
                                                    <tr>
                                                        <th>
                                                            {titleFormat(row)}
                                                        </th>
                                                        <td>
                                                            {
                                                                results[
                                                                    "locus"
                                                                ][row]
                                                            }
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                            <input type="checkbox" />
                            <div className="collapse-title text-xl font-medium">
                                Protein Information
                            </div>
                            <div className="collapse-content">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <tbody>
                                            {Object.keys(
                                                results["protein"]
                                            ).map((row) => (
                                                <tr>
                                                    <th>{titleFormat(row)}</th>
                                                    <td>
                                                        {row === "TFBS" ? (
                                                            <ul>
                                                                {results[
                                                                    "protein"
                                                                ][row].map(
                                                                    (tfbs) => (
                                                                        <li>
                                                                            {
                                                                                tfbs
                                                                            }
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        ) : (
                                                            results["protein"][
                                                                row
                                                            ]
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                            <input type="checkbox" />
                            <div className="collapse-title text-xl font-medium">
                                GO Information
                            </div>
                            <div className="collapse-content">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <tbody>
                                            {Object.keys(results["go"]).map(
                                                (row) => (
                                                    <tr>
                                                        <th>
                                                            {titleFormat(row)}
                                                        </th>
                                                        <td>
                                                            <ul>
                                                                {results["go"][
                                                                    row
                                                                ].map(
                                                                    (item) => (
                                                                        <li>{`level ${item["depth"]}: ${item["term"]}`}</li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                            <input type="checkbox" />
                            <div className="collapse-title text-xl font-medium">
                                Orthologs
                            </div>
                            <div className="collapse-content">
                                <div className="overflow-x-auto">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Species</th>
                                                <th>Synteny</th>
                                                <th>Ortholog</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.keys(
                                                results["orthologs"]
                                            ).map((synteny) =>
                                                results["orthologs"][
                                                    synteny
                                                ].map((orth) => (
                                                    <tr>
                                                        <td>
                                                            {orth["species"]}
                                                        </td>
                                                        <td>
                                                            {Number(synteny) ===
                                                            0
                                                                ? "Only Homology"
                                                                : `+${synteny} neighbor`}
                                                        </td>
                                                        <td>
                                                            {orth["gene"] ===
                                                            "Uncharacterized" ? (
                                                                <a
                                                                    href={`/view?orf=${orth["orf"]}`}
                                                                >
                                                                    {
                                                                        orth[
                                                                            "orf"
                                                                        ]
                                                                    }
                                                                </a>
                                                            ) : (
                                                                <a
                                                                    href={`/view?orf=${orth["orf"]}`}
                                                                >
                                                                    {[
                                                                        orth[
                                                                            "orf"
                                                                        ],
                                                                        orth[
                                                                            "gene"
                                                                        ],
                                                                    ].join("/")}
                                                                </a>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}
