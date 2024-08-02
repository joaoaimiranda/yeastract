import React from "react";

export default function TextInput({ id, label, size, value, handler }) {
    return (
        <label>
            <div className="label p-0 mb-2">
                <span className="label-text">{label}</span>
            </div>
            <input
                type="text"
                className={`input input-sm input-bordered input-primary text-color ${size}`}
                id={id}
                name={id}
                value={value}
                onChange={handler}
            />
        </label>
    );
}
