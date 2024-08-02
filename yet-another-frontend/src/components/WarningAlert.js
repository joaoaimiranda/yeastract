import React from "react";
import WarningAlertIcon from "../svg/WarningAlertIcon";

export default function WarningAlert({ msg }) {
    return (
        <div role="alert" className="alert alert-warning">
            <WarningAlertIcon />
            <span>{msg}</span>
        </div>
    );
}
