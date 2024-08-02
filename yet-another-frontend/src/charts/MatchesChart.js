import React from "react";
import * as d3 from "d3";

export default function MatchesChart({
    data,
    seqName,
    width = 1000,
    height = 80,
    marginTop = 0,
    addListener = false,
    removeListener = false,
    getFilteredData = false,
    setMotifFilter = false,
    isMotifFilter = false,
}) {
    const tooltipRef = React.useRef();
    const ref = React.useRef();

    const [chartData, setChartData] = React.useState(
        getFilteredData ? getFilteredData(seqName) : data
    );

    React.useEffect(() => {
        // const width = 1000;
        // const height = 70;
        // const marginTop = 20;
        // const height = 80;
        const marginRight = 4;
        const marginBottom = 20;
        const marginLeft = 13;

        const x = d3
            .scaleLinear()
            .domain([-width, 0])
            // descending frequency
            .range([marginLeft, width - marginRight]);

        const y = d3
            .scaleLinear()
            .domain([0, height])
            .range([height - marginBottom, marginTop]);

        const svg = d3
            .select(ref.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])
            .attr("style", "max-width: 100%; height: auto;");

        svg.append("rect")
            .attr("fill", "#9ca398")
            .attr("x", x(-width))
            .attr("y", y(height))
            .attr("height", height - marginBottom - marginTop)
            .attr("width", width - marginLeft - marginRight);

        svg.append("g")
            .attr("fill", "red")
            .selectAll()
            .data(chartData)
            .join("rect")
            .attr("id", (d) => `viz_${seqName}_${d.strand}_${d.motif}_${d.pos}`)
            .attr("x", (d) => (d.strand === "F" ? x(d.pos) : x(d.pos - d.size)))
            .attr("y", y(height))
            .attr("height", height - marginBottom - marginTop)
            .attr("width", (d) => d.size)
            .on("mouseover", function (e, d) {
                const el = document.getElementById(
                    `data_${seqName}_${d.strand}_${d.motif}_${d.pos}`
                );
                if (el) el.setAttribute("style", "background-color: yellow");
                d3.select(this).attr("fill", "yellow");
                const text = `${d.motif} ${d.tfs ? d.tfs.join(", ") : ""} ${
                    d.pos
                } ${d.strand}`;
                if (d.pos < -width / 2)
                    d3.select(tooltipRef.current)
                        // .transition()
                        // .duration(100)
                        // .style("position", "absolute")
                        // .style("background", "white")
                        // .style("background", "rgba(0,0,0,0.6)")
                        // .style("color", "black")
                        // .style("color", "white")
                        // .style("object-position", "top")
                        .style("visibility", "visible")
                        // .style("opacity", 1)
                        .style("left", width + d.pos + "px");
                else
                    d3.select(tooltipRef.current)
                        .style("visibility", "visible")
                        .style("right", -d.pos - 10 + "px");
                d3.select(tooltipRef.current).text(text);
            })
            .on("mouseout", function (e, d) {
                const el = document.getElementById(
                    `data_${seqName}_${d.strand}_${d.motif}_${d.pos}`
                );
                if (el)
                    el.setAttribute("style", "background-color: transparent");
                d3.select(this).attr("fill", "red");
                d3.select(tooltipRef.current)
                    // .transition()
                    // .duration(100)
                    .style("visibility", "hidden")
                    .style("left", null)
                    .style("right", null);
                // .style("opacity", 0);
            })
            .on("click", function (e, d) {
                if (isMotifFilter && setMotifFilter) {
                    if (isMotifFilter(d.seqName, d.motif, d.pos, d.strand))
                        setMotifFilter(null, null, null, null);
                    else setMotifFilter(d.seqName, d.motif, d.pos, d.strand);
                }
            });

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        function filterListener(e) {
            setChartData(getFilteredData(seqName));
        }
        if (addListener && removeListener && getFilteredData) {
            addListener(filterListener);
        }

        return () => {
            svg.selectAll("*").remove();
            if (addListener && removeListener && getFilteredData)
                removeListener(filterListener);
        };
    }, [
        chartData,
        seqName,
        width,
        height,
        marginTop,
        addListener,
        removeListener,
        getFilteredData,
        isMotifFilter,
        setMotifFilter,
    ]);

    return (
        <div className="relative">
            {/* <span className="px-3 font-semibold">{seqName}</span> */}
            <div
                className="bg-transparent top-0 absolute text-black px-3 text-sm"
                ref={tooltipRef}
            ></div>
            <svg ref={ref}></svg>
        </div>
    );
}
