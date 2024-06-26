import React from "react";
import * as d3 from "d3";

export default function BarChart({ data, tableHighlight, width, height }) {
    const tooltipRef = React.useRef();
    const ref = React.useRef();
    React.useEffect(() => {
        // const width = 200;
        // const height = 80;
        const marginTop = 5;
        const marginRight = 0;
        const marginBottom = 0;
        const marginLeft = 0;

        // Declare the x (horizontal position) scale.
        const x = d3
            .scaleBand()
            .domain(
                d3.groupSort(
                    data,
                    ([d]) => -d.frequency,
                    (d) => d.label
                )
            ) // descending frequency
            .range([marginLeft, width - marginRight])
            .padding(0.1);

        // Declare the y (vertical position) scale.
        const y = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => d.frequency)])
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
            .data(data)
            .join("rect")
            .attr("x", (d) => x(d.label))
            .attr("y", (d) => y(d.frequency))
            .attr("height", (d) => y(0) - y(d.frequency))
            .attr("width", x.bandwidth())
            .on("mouseover", function (event, d) {
                console.log(event.pageX, event.pageY);
                d3.select(tooltipRef.current)
                    .transition()
                    .duration(100)
                    // .style("opacity", 0.9)
                    .style("position", "absolute")
                    // .style("z-index", "10")
                    .style("background", "rgba(0,0,0,0.6)")
                    .style("color", "white")
                    .style("object-position", "top")
                    .style("visibility", "visible");
                // .style("left", event.pageX + "px")
                // .style("top", event.pageY - 28 + "px");
                d3.select(this)
                    .style("stroke", "black")
                    .style("stroke-width", "4px")
                    .style("stroke-opacity", "1");
                d3.select(tooltipRef.current).text(`${d.label} ${d.frequency}`);
                // tableHighlight("tf", d.label);
            })
            .on("mousemove", function () {})
            .on("mouseout", function () {
                d3.select(tooltipRef.current)
                    .transition()
                    .duration(200)
                    // .style("opacity", 0);
                    .style("visibility", "hidden");
                d3.select(this).style("stroke-opacity", "0");
            });
    }, [data, width, height]);

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

    // Return the SVG element.

    //  transform={`translate(${marginLeft}, ${marginTop})`}
    return (
        <>
            <div ref={tooltipRef}></div>
            <svg ref={ref}></svg>
            {/* <svg
                width={width + marginLeft + marginRight}
                height={height + marginTop + marginBottom}
                viewBox={`0 0 ${width} ${height}`}
                style={{ maxWidth: "100%", height: "auto" }}
            >
                <g>
                    {data.map(({ tf, frequency }) => (
                        <rect
                            key={`bar-${tf}`}
                            x={x(tf)}
                            y={y(frequency)}
                            width={x.bandwidth()}
                            height={y(0) - y(frequency)}
                            fill="steelblue"
                            onMouseOver={mouseover}
                        />
                    ))}
                </g>
            </svg> */}
        </>
    );
}
