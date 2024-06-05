import React from "react";
import { findDbSpecies } from "../../utils/speciesUtils";

export default function Orthologs({ orthologs }) {
    return (
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
                    {Object.keys(orthologs).map((synteny) =>
                        orthologs[synteny].map((orth) => (
                            <tr>
                                <td>{orth["species"]}</td>
                                <td>
                                    {Number(synteny) === 0
                                        ? "Only Homology"
                                        : `+${synteny} neighbor`}
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
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
