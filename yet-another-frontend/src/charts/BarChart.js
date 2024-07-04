import React from "react";
import * as d3 from "d3";

export default function BarChart({
    data,
    colName,
    width,
    height,
    getFilter,
    setFilter,
    getFilteredData,
    addListener,
    removeListener,
}) {
    const tooltipRef = React.useRef();
    const ref = React.useRef();

    const [chartData, setChartData] = React.useState(data);

    React.useEffect(() => {
        // const width = 200;
        // const height = 80;
        const marginTop = 5;
        const marginRight = 0;
        const marginBottom = 0;
        const marginLeft = 0;

        let auxData = {};
        for (let row of chartData) {
            if (!auxData[row[colName]]) auxData[row[colName]] = 1;
            else auxData[row[colName]]++;
        }
        const newData = [];
        for (let key of Object.keys(auxData)) {
            newData.push({ label: key, frequency: auxData[key] });
        }

        // Declare the x (horizontal position) scale.
        const x = d3
            .scaleBand()
            .domain(
                d3.groupSort(
                    newData,
                    ([d]) => -d.frequency,
                    (d) => d.label
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
            .attr("id", `barchart_${colName}`)
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
            .attr("x", (d) => x(d.label))
            .attr("y", (d) => y(d.frequency))
            .attr("height", (d) => y(0) - y(d.frequency))
            .attr("width", x.bandwidth())
            .on("mouseover", function (event, d) {
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
                // d3.select(this)
                //     .style("stroke", "black")
                //     .style("stroke-width", "4px")
                //     .style("stroke-opacity", "1");
                d3.select(this).style("fill", "orange");
                d3.select(tooltipRef.current).text(`${d.label} ${d.frequency}`);
            })
            .on("mouseout", function () {
                d3.select(tooltipRef.current)
                    .transition()
                    .duration(200)
                    // .style("opacity", 0);
                    .style("visibility", "hidden");
                // d3.select(this).style("stroke-opacity", "0");
                d3.select(this).style("fill", "steelblue");
            })
            .on("click", async function (e, d) {
                if (getFilter(colName) === d.label) {
                    await setFilter(colName, null);
                } else {
                    await setFilter(colName, d.label);
                }
                setChartData(getFilteredData());
            });

        function filterListener(e) {
            setChartData(getFilteredData());
        }
        addListener(filterListener);

        return () => {
            svg.selectAll("*").remove();
            removeListener(filterListener);
        };
    }, [
        chartData,
        colName,
        width,
        height,
        getFilter,
        setFilter,
        getFilteredData,
        addListener,
        removeListener,
    ]);

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
