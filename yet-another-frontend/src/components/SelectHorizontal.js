import React from "react";

export default function Select({
    id,
    label,
    size,
    value,
    valueArray,
    handler,
}) {
    return (
        <label className="label cursor-pointer mt-2 p-0">
            <span className="label-text text-color">{label}</span>
            <select
                className={`select select-bordered select-primary select-sm mb-2 text-color ${size}`}
                id={id}
                name={id}
                value={value}
                onChange={handler}
            >
                {valueArray.map(({ option, value }) => (
                    <option key={value} value={value}>
                        {option}
                    </option>
                ))}
            </select>
        </label>
    );
}
