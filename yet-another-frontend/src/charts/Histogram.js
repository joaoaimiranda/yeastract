import React from "react";
import * as d3 from "d3";

export default function Histogram({ data, width, height }) {
    const tooltipRef = React.useRef();
    const ref = React.useRef();
    React.useEffect(() => {
        // const width = 200;
        // const height = 80;
        const marginTop = 5;
        const marginRight = 0;
        const marginBottom = 0;
        const marginLeft = 0;
        // console.log(data);
        const bins = d3
            .bin()
            .domain([0, 100])
            .thresholds(10)
            .value((d) => d)(data);

        // Declare the x (horizontal position) scale.
        const x = d3
            .scaleLinear()
            .domain([bins[0].x0, bins[bins.length - 1].x1]) // descending frequency
            .range([marginLeft, width - marginRight]);

        // Declare the y (vertical position) scale.
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(bins, (d) => d.length)])
            .range([height - marginBottom, marginTop]);

        // Create the SVG container.
        const svg = d3
            .select(ref.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");
        // console.log(bins[0].x1 - bins[0].x0);
        // Add a rect for each bar.
        svg.append("g")
            .attr("fill", "steelblue")
            .selectAll()
            .data(bins)
            .join("rect")
            .attr("x", (d) => x(d.x0) + 1)
            .attr("y", (d) => y(d.length))
            .attr("height", (d) => y(0) - y(d.length))
            .attr("width", (d) => x(d.x1) - x(d.x0) - 1)
            .on("mouseover", function (event, d) {
                // console.log(event.pageX, event.pageY);
                d3.select(tooltipRef.current)
                    .transition()
                    .duration(100)
                    .style("opacity", 0.9)
                    .style("position", "absolute")
                    // .style("z-index", "10")
                    .style("background", "rgba(0,0,0,0.6)")
                    .style("color", "white")
                    .style("object-position", "top");
                // .style("left", event.pageX + "px")
                // .style("top", event.pageY - 28 + "px");
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", "4px")
                    .style("stroke-opacity", "1");
                d3.select(tooltipRef.current).text(
                    `${d.x0}%-${d.x1}%: ${d.length}`
                );
            })
            .on("mouseout", function () {
                d3.select(tooltipRef.current)
                    .transition()
                    .duration(200)
                    .style("opacity", 0);
                d3.select(this).style("stroke-opacity", "0");
            });
    }, [data, width, height]);

    return (
        <>
            <div ref={tooltipRef}></div>
            <svg ref={ref}></svg>
        </>
    );
}
