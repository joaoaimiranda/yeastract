import React from "react";
import speciesList from "../../conf/speciesList";
import { findDbSpecies } from "../../utils/speciesUtils";
export default function GOterm({ goterm, species }) {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <tbody>
                    <tr>
                        <th>Ontology</th>
                        <td>{goterm["go"]["onto"]}</td>
                    </tr>
                    <tr>
                        <th>GO ID</th>
                        <td>{goterm["go"]["goid"]}</td>
                    </tr>
                    <tr>
                        <th>GO Term</th>
                        <td>{`level ${goterm["go"]["depth"]}: ${goterm["go"]["term"]}`}</td>
                    </tr>
                    <tr>
                        <th>Parent Terms</th>
                        <td>
                            <ul>
                                {goterm["parents"].map((item) => (
                                    <li className="underline">
                                        <a
                                            href={`/${species}/view?goid=${item["goid"]}`}
                                        >{`level ${item["depth"]}: ${item["term"]}`}</a>
                                    </li>
                                ))}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <th>Children Terms</th>
                        <td>
                            <ul>
                                {goterm["children"].map((item) => (
                                    <li className="underline">
                                        <a
                                            href={`/${species}/view?goid=${item["goid"]}`}
                                        >{`level ${item["depth"]}: ${item["term"]}`}</a>
                                    </li>
                                ))}
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <th>Associated ORF/Genes</th>
                        <td>
                            <ul>
                                {goterm["genes"].map((item) => (
                                    <li>
                                        <a
                                            href={`/${Object.keys(
                                                speciesList
                                            ).find(
                                                (key) =>
                                                    findDbSpecies(key) ===
                                                    item["species"]
                                            )}/view?orf=${item["orf"]}`}
                                            className="underline"
                                        >
                                            {item["gene"] === "Uncharacterized"
                                                ? item["orf"]
                                                : [
                                                      item["orf"],
                                                      item["gene"],
                                                  ].join("/")}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
