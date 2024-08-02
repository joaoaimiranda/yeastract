import React from "react";
import { findDbSpecies } from "../../utils/speciesUtils";

export default function Orthologs({ orthologs }) {
    const merge = orthologs[3].concat(orthologs[2], orthologs[1], orthologs[0]);
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
                        <th className=" m-0 p-1"></th>
                        <th className=" m-0 p-1">+3 neighbors synteny</th>
                        <th className=" m-0 p-1">+2 neighbors synteny</th>
                        <th className=" m-0 p-1">+1 neighbor synteny</th>
                        <th className=" m-0 p-1">Only Homology</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(orths).map((sp, i) => (
                        <tr key={i}>
                            <th className=" m-0 p-1">
                                {orths[sp][0]["species"]}
                            </th>
                            {[3, 2, 1, 0].map((syn) => {
                                const filtered = orths[sp].filter(
                                    (el) => el.synteny === syn
                                );
                                return filtered.length > 0 ? (
                                    <td key={syn} className=" m-0 p-1">
                                        {filtered.map((orth, i) => (
                                            <span key={i}>
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
                                            </span>
                                        ))}
                                    </td>
                                ) : (
                                    <td key={syn} className=" m-0 p-1"></td>
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
