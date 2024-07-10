import React from "react";
import CloseIcon from "../svg/CloseIcon.js";
import { splitSequence } from "../utils/utils.js";

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
    const promF = data[0].promoter.F;
    const promR = data[0].promoter.R;
    const promFsplit = splitSequence(promF);
    const promRsplit = splitSequence(promR);
    return (
        <>
            <button className="ml-2 btn btn-xs" onClick={openModal}>
                Ref
            </button>
            <dialog id={id} className="modal">
                <div className="modal-box w-11/12 max-w-full h-full flex flex-col">
                    <div className="grid grid-cols-2">
                        <h3 className="text-xl self-center">{`Consensus in ${orf} Promoter Sequence`}</h3>
                        <form method="dialog" className="justify-self-end mb-2">
                            <button className="btn btn-ghost btn-circle">
                                <CloseIcon />
                            </button>
                        </form>
                    </div>
                    <div className="flex flex-col">
                        <div className="grid grid-cols-6">
                            <div className="flex flex-col">
                                <span className="leading-4">Consensus</span>
                                <ul className="leading-6">
                                    {data.map((m) =>
                                        m.matches.F ? (
                                            <li>
                                                {Object.keys(m.matches.F).map(
                                                    (pos) =>
                                                        `${m.motif}: ${
                                                            pos - 1000
                                                        }`
                                                )}
                                            </li>
                                        ) : (
                                            <></>
                                        )
                                    )}
                                </ul>
                            </div>
                            <div className="col-span-5">
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
                            </div>
                        </div>
                        <div className="grid grid-cols-6">
                            <div className="flex flex-col">
                                <span className="leading-4">Consensus</span>
                                <ul className="leading-6">
                                    {data.map((m) =>
                                        m.matches.R ? (
                                            <li>
                                                {Object.keys(m.matches.R).map(
                                                    (pos) =>
                                                        `${m.motif}: ${
                                                            pos * -1
                                                        }`
                                                )}
                                            </li>
                                        ) : (
                                            <></>
                                        )
                                    )}
                                </ul>
                            </div>
                            <div className="col-span-5">
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
                            </div>
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
