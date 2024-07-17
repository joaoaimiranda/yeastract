import React from "react";
import constants from "../../conf/constants";
import { findDbSpecies } from "../../utils/speciesUtils";
export default function GOterm({ goterm, species }) {
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <tbody>
                    <tr>
                        <th className="align-top w-32">Ontology</th>
                        <td>{goterm["go"]["onto"]}</td>
                    </tr>
                    <tr>
                        <th className="align-top w-32">GO ID</th>
                        <td>
                            <a
                                className="link"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={`${constants.geneOntologyUrl}${goterm["go"]["goid"]}`}
                            >
                                {goterm["go"]["goid"]}
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <th className="align-top w-32">GO Term</th>
                        <td>{`level ${goterm["go"]["depth"]}: ${goterm["go"]["term"]}`}</td>
                    </tr>
                    <tr>
                        <th className="align-top w-32">Parent Terms</th>
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
                        <th className="align-top w-32">Children Terms</th>
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
                        <th className="align-top w-32">Associated ORF/Genes</th>
                        <td>
                            <ul>
                                {goterm["genes"].map((item) => (
                                    <li>
                                        <a
                                            href={`/${findDbSpecies(
                                                item["species"]
                                            )}/view?orf=${item["orf"]}`}
                                            className="link"
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
