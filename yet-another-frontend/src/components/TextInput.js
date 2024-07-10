import React from "react";

export default function TextInput({ id, labelText, filterState, handler }) {
    return (
        <label>
            <div className="label">
                <span className="label-text">{labelText}</span>
            </div>
            <input
                type="text"
                className="input input-sm input-bordered max-w-36"
                id={`filter-${id}`}
                name={`filter-${id}`}
                value={
                    filterState === undefined ||
                    filterState.filterModel === undefined ||
                    filterState.filterModel[id] === undefined
                        ? ""
                        : filterState.filterModel[id].filter
                }
                onChange={handler}
            />
        </label>
    );
}
