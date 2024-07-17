import React from "react";
import CloseIcon from "../svg/CloseIcon.js";
// import { splitSequence } from "../utils/utils.js";
import MatchesChart from "../charts/MatchesChart.js";

export default function PromoterModal({ id, orf, data }) {
    function openModal() {
        document.getElementById(id).showModal();
    }

    // const getRowHeight = (params) => {
    //     const singleSize = 28;
    //     const env = Math.ceil(params.data.envcond.length / 35) * singleSize;
    //     const exp = Math.ceil(params.data.experiment.length / 30) * singleSize;
    //     return Math.max(env, exp);
    // };
    console.log(data, id, orf);
    const chartData = [];
    if (data.matches.F) {
        for (let pos of Object.keys(data.matches.F)) {
            chartData.push({
                pos: Number(pos),
                size: data.matches.F[pos],
                motif: data.motif,
            });
        }
    }
    if (data.matches.R) {
        for (let pos of Object.keys(data.matches.R)) {
            chartData.push({
                pos: Number(pos),
                size: data.matches.R[pos],
                motif: data.motif,
            });
        }
    }
    // const promF = data.promoter.F;
    // const promR = data.promoter.R;
    // const promFsplit = splitSequence(promF);
    // const promRsplit = splitSequence(promR);
    return (
        <>
            <button className="ml-2 btn btn-xs" onClick={openModal}>
                Ref
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
                        <MatchesChart data={chartData} />
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
                                            (pos) => (
                                                <li
                                                    key={pos}
                                                    className="px-2 border rounded-lg hover:bg-yellow-200"
                                                    onMouseEnter={() => {
                                                        document
                                                            .getElementById(pos)
                                                            .setAttribute(
                                                                "style",
                                                                "fill: yellow"
                                                            );
                                                    }}
                                                    onMouseLeave={() =>
                                                        document
                                                            .getElementById(pos)
                                                            .setAttribute(
                                                                "style",
                                                                "fill: red"
                                                            )
                                                    }
                                                >
                                                    {`${data.motif}: ${
                                                        pos - 1000
                                                    }`}
                                                </li>
                                            )
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
                                            (pos) => (
                                                <li
                                                    className="px-2 border rounded-lg hover:bg-yellow-200"
                                                    onMouseEnter={() => {
                                                        document
                                                            .getElementById(pos)
                                                            .setAttribute(
                                                                "style",
                                                                "fill: yellow"
                                                            );
                                                    }}
                                                    onMouseLeave={() =>
                                                        document
                                                            .getElementById(pos)
                                                            .setAttribute(
                                                                "style",
                                                                "fill: red"
                                                            )
                                                    }
                                                >
                                                    {`${data.motif}: ${
                                                        pos * -1
                                                    }`}
                                                </li>
                                            )
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
