import React from "react";
import BarChart from "./BarChart";

export default function AssocTypeChart({ data, tableHighlight }) {
    let auxData = {};
    for (let row of data) {
        if (!auxData[row.association]) auxData[row.association] = 1;
        else auxData[row.association]++;
    }
    const newData = [];
    for (let key of Object.keys(auxData)) {
        newData.push({ label: key, frequency: auxData[key] });
    }
    return (
        <BarChart
            data={newData}
            tableHighlight={tableHighlight}
            width={150}
            height={90}
        />
    );
}
