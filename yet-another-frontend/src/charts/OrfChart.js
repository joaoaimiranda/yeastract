import React from "react";
import BarChart from "./BarChart";

export default function OrfChart({ data, tableHighlight }) {
    let auxData = {};
    for (let row of data) {
        if (!auxData[row.orf]) auxData[row.orf] = 1;
        else auxData[row.orf]++;
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
