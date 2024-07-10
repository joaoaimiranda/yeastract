import React from "react";
import { findDbSpecies } from "../../utils/speciesUtils";

export default function Orthologs({ orthologs }) {
    const merge = orthologs[0].concat(orthologs[1], orthologs[2], orthologs[3]);
    const orths = {};
    for (let orth of merge) {
        if (orths[orth.species] === undefined) orths[orth.species] = [orth];
        else orths[orth.species].push(orth);
    }
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Only Homology</th>
                        <th>+1 neighbor synteny</th>
                        <th>+2 neighbors synteny</th>
                        <th>+3 neighbors synteny</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(orths).map((sp) => (
                        <tr>
                            <th>{orths[sp][0]["species"]}</th>
                            {[0, 1, 2, 3].map((syn) => {
                                const filtered = orths[sp].filter(
                                    (el) => el.synteny === syn
                                );
                                return filtered.length > 0 ? (
                                    <td>
                                        {filtered.map((orth, i) => (
                                            <>
                                                <a
                                                    className="link"
                                                    href={`/${findDbSpecies(
                                                        orth["species"]
                                                    )}/view?orf=${orth["orf"]}`}
                                                >
                                                    {orth["gene"] ===
                                                    "Uncharacterized"
                                                        ? orth["orf"]
                                                        : [
                                                              orth["orf"],
                                                              orth["gene"],
                                                          ].join("/")}
                                                </a>
                                                {i < filtered.length - 1 && (
                                                    <br />
                                                )}
                                            </>
                                        ))}
                                    </td>
                                ) : (
                                    <td></td>
                                );
                            })}
                            {/* <td>
                                    {Number(orth["synteny"]) === 0 && orth["synteny"]}
                                </td>
                                <td>
                                    {orth["gene"] === "Uncharacterized" ? (
                                        <a
                                            href={`/${findDbSpecies(
                                                orth["species"]
                                            )}/view?orf=${orth["orf"]}`}
                                        >
                                            {orth["orf"]}
                                        </a>
                                    ) : (
                                        <a
                                            href={`/${findDbSpecies(
                                                orth["species"]
                                            )}/view?orf=${orth["orf"]}`}
                                        >
                                            {[orth["orf"], orth["gene"]].join(
                                                "/"
                                            )}
                                        </a>
                                    )}
                                </td> */}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
