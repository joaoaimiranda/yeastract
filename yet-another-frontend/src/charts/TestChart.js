import React from "react";
import * as d3 from "d3";

export default function TestChart({ data }) {
    const ref = React.useRef();
    React.useEffect(() => {
        const width = 928;
        const height = 500;
        const marginTop = 30;
        const marginRight = 0;
        const marginBottom = 30;
        const marginLeft = 40;
        console.log(data);
        let auxData = {};
        for (let row of data) {
            if (!auxData[row.tf]) auxData[row.tf] = 1;
            else auxData[row.tf]++;
        }
        const newData = [];
        for (let key of Object.keys(auxData)) {
            newData.push({ tf: key, frequency: auxData[key] });
        }

        // Declare the x (horizontal position) scale.
        const x = d3
            .scaleBand()
            .domain(
                d3.groupSort(
                    newData,
                    ([d]) => -d.frequency,
                    (d) => d.tf
                )
            ) // descending frequency
            .range([marginLeft, width - marginRight])
            .padding(0.1);

        // Declare the y (vertical position) scale.
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(newData, (d) => d.frequency)])
            .range([height - marginBottom, marginTop]);

        // Create the SVG container.
        const svg = d3
            .select(ref.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        // Add a rect for each bar.
        svg.append("g")
            .attr("fill", "steelblue")
            .selectAll()
            .data(newData)
            .join("rect")
            .attr("x", (d) => x(d.tf))
            .attr("y", (d) => y(d.frequency))
            .attr("height", (d) => y(0) - y(d.frequency))
            .attr("width", x.bandwidth());

        // // Add the x-axis and label.
        // svg.append("g")
        //     .attr("transform", `translate(0,${height - marginBottom})`)
        //     .call(d3.axisBottom(x).tickSizeOuter(0));

        // // Add the y-axis and label, and remove the domain line.
        // svg.append("g")
        //     .attr("transform", `translate(${marginLeft},0)`)
        //     .call(d3.axisLeft(y).tickFormat((y) => y.toFixed()))
        //     .call((g) => g.select(".domain").remove())
        //     .call((g) =>
        //         g
        //             .append("text")
        //             .attr("x", -marginLeft)
        //             .attr("y", 10)
        //             .attr("fill", "currentColor")
        //             .attr("text-anchor", "start")
        //             .text("↑ Frequency")
        //     );
    }, [data]);

    // Return the SVG element.
    return <svg ref={ref}></svg>;
}
