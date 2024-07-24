import React from "react";

export default function Loading() {
    return (
        <div className="toast toast-end">
            <div className="alert bg-primary">
                <span className="loading loading-spinner loading-sm"></span>
                <span>Loading...</span>
            </div>
        </div>
    );
}
