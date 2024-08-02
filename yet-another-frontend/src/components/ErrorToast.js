import React from "react";
import MiniCloseIcon from "../svg/MiniCloseIcon";

export default function ErrorToast({ msg, setShow }) {
    return (
        <div className="toast toast-end">
            <div className="alert alert-error relative">
                <span>{msg}</span>
                <button
                    className="btn btn-ghost btn-circle btn-xs absolute top-1 right-1"
                    onClick={() => setShow("")}
                >
                    <MiniCloseIcon />
                </button>
            </div>
        </div>
    );
}
