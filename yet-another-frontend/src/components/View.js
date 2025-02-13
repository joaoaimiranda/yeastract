import React from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { searchGOterm, searchORF } from "../services/remoteServices";
import speciesList from "../conf/speciesList";
import Orthologs from "./view/Orthologs";
import GO from "./view/GO";
import Protein from "./view/Protein";
import Locus from "./view/Locus";
import GOterm from "./view/GOterm";
import { titleFormat } from "../utils/utils";
import ErrorToast from "./ErrorToast";

export default function View() {
    const { species } = useParams();
    let [searchParams] = useSearchParams();
    const [results, setResults] = React.useState({});
    const [showError, setShowError] = React.useState("");

    React.useEffect(() => {
        async function fetchData() {
            if (searchParams.get("orf")) {
                const res = await searchORF(
                    searchParams.get("orf"),
                    speciesList[species].path
                );
                console.log(res);
                // HTTP ERROR
                if (typeof res === "string") {
                    setShowError(res);
                    return;
                }
                setResults(res);
            } else if (searchParams.get("goid")) {
                const res = await searchGOterm(
                    searchParams.get("goid"),
                    speciesList[species].path
                );
                console.log(res);
                // HTTP ERROR
                if (typeof res === "string") {
                    setShowError(res);
                    return;
                }
                setResults(res);
            }
        }
        fetchData();
    }, [searchParams, species]);

    return (
        <>
            <h1 className="p-3  font-figtree text-xl">Information</h1>
            {Object.keys(results).length !== 0 &&
                searchParams.get("orf") !== null && (
                    <>
                        <div className="overflow-x-auto px-3">
                            <table className="table">
                                <tbody>
                                    {Object.keys(results["general"]).map(
                                        (row) => (
                                            <tr key={row}>
                                                <th className="align-top w-24 m-0 p-1">
                                                    {titleFormat(row)}
                                                </th>
                                                <td className=" m-0 p-1">
                                                    {results["general"][row]}
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="join join-vertical w-full p-3">
                            <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                                <input type="checkbox" />
                                <div className="collapse-title text-xl font-medium">
                                    Locus
                                </div>
                                <div className="collapse-content">
                                    <Locus
                                        locus={results["locus"]}
                                        orf={
                                            results["general"][
                                                "systematic_Name"
                                            ]
                                        }
                                        species={species}
                                    />
                                </div>
                            </div>
                            <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                                <input type="checkbox" />
                                <div className="collapse-title text-xl font-medium">
                                    Protein
                                </div>
                                <div className="collapse-content">
                                    <Protein
                                        protein={results["protein"]}
                                        species={species}
                                    />
                                </div>
                            </div>
                            <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                                <input type="checkbox" />
                                <div className="collapse-title text-xl font-medium">
                                    Gene Ontology
                                </div>
                                <div className="collapse-content">
                                    <GO gos={results["go"]} />
                                </div>
                            </div>
                            <div className="collapse collapse-arrow join-item bg-base-100 border border-base-300">
                                <input type="checkbox" />
                                <div className="collapse-title text-xl font-medium">
                                    Orthologs
                                </div>
                                <div className="collapse-content">
                                    <Orthologs
                                        orthologs={results["orthologs"]}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            {Object.keys(results).length !== 0 &&
                searchParams.get("goid") !== null && (
                    <GOterm goterm={results} species={species} />
                )}
            {showError && (
                    <ErrorToast msg={showError} setShow={setShowError} />
                ) &&
                // disappear after 10 seconds
                setTimeout(() => {
                    if (showError) setShowError("");
                }, 10000)}
        </>
    );
}
