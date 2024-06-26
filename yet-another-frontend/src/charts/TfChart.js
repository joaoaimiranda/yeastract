import React from "react";
import BarChart from "./BarChart";

export default function TfChart({ data, tableHighlight }) {
    let auxData = {};
    for (let row of data) {
        if (!auxData[row.tf]) auxData[row.tf] = 1;
        else auxData[row.tf]++;
    }
    const newData = [];
    for (let key of Object.keys(auxData)) {
        newData.push({ label: key, frequency: auxData[key] });
    }
    return (
        <BarChart
            data={newData}
            tableHighlight={tableHighlight}
            width={200}
            height={90}
        />
    );
}
