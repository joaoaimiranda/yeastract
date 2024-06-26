import React from "react";
import BarChart from "./BarChart";

export default function GeneChart({ data, tableHighlight }) {
    let auxData = {};
    for (let row of data) {
        if (!auxData[row.gene]) auxData[row.gene] = 1;
        else auxData[row.gene]++;
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
