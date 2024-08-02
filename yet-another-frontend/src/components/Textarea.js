import React from "react";

export default function Textarea({ id, label, size, value, handler }) {
    return (
        <label>
            <div className="label p-0 mb-2">
                <span className="label-text text-color">{label}</span>
            </div>
            <textarea
                id={id}
                name={id}
                value={value}
                className={`textarea textarea-bordered textarea-primary resize-none text-color ${size} leading-4`}
                onChange={handler}
            ></textarea>
        </label>
    );
}
