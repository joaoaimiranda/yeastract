import React from "react";
import BarChart from "./BarChart";

export default function EvidenceChart({ data, tableHighlight }) {
    let auxData = {};
    for (let row of data) {
        if (!auxData[row.evidence]) auxData[row.evidence] = 1;
        else auxData[row.evidence]++;
    }
    const newData = [];
    for (let key of Object.keys(auxData)) {
        newData.push({ label: key, frequency: auxData[key] });
    }
    return (
        <BarChart
            data={newData}
            tableHighlight={tableHighlight}
            width={180}
            height={90}
        />
    );
}
