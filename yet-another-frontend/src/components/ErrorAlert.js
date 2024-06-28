import React from "react";
import ErrorAlertIcon from "../svg/ErrorAlertIcon";

export default function ErrorAlert({ msg }) {
    return (
        <div role="alert" className="alert alert-error">
            <ErrorAlertIcon />
            <span>{msg}</span>
        </div>
    );
}
