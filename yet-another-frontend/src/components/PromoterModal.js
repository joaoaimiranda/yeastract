import React from "react";
import CloseIcon from "../svg/CloseIcon.js";
// import { splitSequence } from "../utils/utils.js";
import MatchesChart from "../charts/MatchesChart.js";

export default function PromoterModal({ id, orf, data }) {
    function openModal() {
        document.getElementById(id).showModal();
    }

    // console.log(data, id, orf);
    const chartData = [];
    if (data.matches.F) {
        for (let pos of Object.keys(data.matches.F)) {
            chartData.push({
                pos: Number(pos) - 1000,
                size: data.matches.F[pos],
                motif: data.motif,
                strand: "F",
            });
        }
    }
    if (data.matches.R) {
        for (let pos of Object.keys(data.matches.R)) {
            chartData.push({
                pos: Number(pos) * -1,
                size: data.matches.R[pos],
                motif: data.motif,
                strand: "R",
            });
        }
    }
    // const promF = data.promoter.F;
    // const promR = data.promoter.R;
    // const promFsplit = splitSequence(promF);
    // const promRsplit = splitSequence(promR);

    function handleMouseOver(e, pos, strand) {
        e.target.setAttribute("style", "background-color: yellow");
        document
            .getElementById(`viz_${orf}_${strand}_${data.motif}_${pos}`)
            .setAttribute("style", "fill: yellow");
    }

    function handleMouseLeave(e, pos, strand) {
        e.target.setAttribute("style", "background-color: transparent");
        document
            .getElementById(`viz_${orf}_${strand}_${data.motif}_${pos}`)
            .setAttribute("style", "fill: red");
    }

    return (
        <>
            <button className="ml-2 btn btn-xs" onClick={openModal}>
                View
            </button>
            <dialog id={id} className="modal">
                <div className="modal-box w-10/12 max-w-full h-full flex flex-col">
                    <div className="grid grid-cols-2 sticky top-0 z-30 bg-base-100 bg-opacity-90">
                        <h3 className="text-xl self-center">{`Consensus in ${orf} Promoter Sequence`}</h3>
                        <form method="dialog" className="justify-self-end mb-2">
                            <button className="btn btn-ghost btn-circle">
                                <CloseIcon />
                            </button>
                        </form>
                    </div>
                    <div className="my-5">
                        <span className="ml-3">{`${orf} Promoter Sequence`}</span>
                        <MatchesChart data={chartData} seqName={orf} />
                    </div>
                    <div className="flex flex-col">
                        <div className="grid grid-cols-6">
                            <div className="flex flex-col">
                                <span className="text-lg">
                                    Forward Matches:
                                </span>
                                <ul>
                                    {data.matches.F ? (
                                        Object.keys(data.matches.F).map(
                                            (pos) => {
                                                const newPos =
                                                    Number(pos) - 1000;
                                                return (
                                                    <li
                                                        id={`data_${orf}_F_${data.motif}_${newPos}`}
                                                        key={newPos}
                                                        className="px-2 border rounded-lg"
                                                        // prettier-ignore
                                                        onMouseOver={(e) => handleMouseOver(e, newPos, "F")}
                                                        // prettier-ignore
                                                        onMouseLeave={(e) => handleMouseLeave(e, newPos, "F")}
                                                    >
                                                        {`${data.motif}: ${newPos}`}
                                                    </li>
                                                );
                                            }
                                        )
                                    ) : (
                                        <li>no matches found</li>
                                    )}
                                </ul>
                            </div>
                            {/* <div className="col-span-5">
                                <span>Promoter Sequence</span>
                                <pre className="leading-5">
                                    {`> ${orf}`}
                                    <br />
                                    {promFsplit.map((line) => (
                                        <>
                                            {line}
                                            <br />
                                        </>
                                    ))}
                                </pre>
                            </div> */}
                        </div>
                        <div className="grid grid-cols-6">
                            <div className="flex flex-col">
                                <span className="text-lg">
                                    Reverse Matches:
                                </span>
                                <ul>
                                    {data.matches.R ? (
                                        Object.keys(data.matches.R).map(
                                            (pos) => {
                                                const newPos = Number(pos) * -1;
                                                return (
                                                    <li
                                                        key={newPos}
                                                        id={`data_${orf}_R_${data.motif}_${newPos}`}
                                                        className="px-2 border rounded-lg"
                                                        // prettier-ignore
                                                        onMouseOver={(e) => handleMouseOver(e, newPos, "R")}
                                                        // prettier-ignore
                                                        onMouseLeave={(e) => handleMouseLeave(e, newPos, "R")}
                                                    >
                                                        {`${data.motif}: ${newPos}`}
                                                    </li>
                                                );
                                            }
                                        )
                                    ) : (
                                        <span>no matches found</span>
                                    )}
                                </ul>
                            </div>
                            {/* <div className="col-span-5">
                                <span>
                                    Promoter Sequence Complementary Strand
                                </span>
                                <pre className="leading-5">
                                    {`> ${orf}`}
                                    <br />
                                    {promRsplit.map((line) => (
                                        <>
                                            {line}
                                            <br />
                                        </>
                                    ))}
                                </pre>
                            </div> */}
                        </div>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>Close</button>
                </form>
            </dialog>
        </>
    );
}
