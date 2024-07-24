import React from "react";
import * as d3 from "d3";

export default function MatchesChart({ data, seqName, width = 1000 }) {
    const tooltipRef = React.useRef();
    const ref = React.useRef();

    React.useEffect(() => {
        // const width = 1000;
        const height = 80;
        const marginTop = 0;
        const marginRight = 4;
        const marginBottom = 20;
        const marginLeft = 13;
        // console.log("bota", data);
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
            .attr("fill", "steelblue")
            .attr("x", x(-width))
            .attr("y", y(height))
            .attr("height", height - marginBottom)
            .attr("width", width - marginLeft - marginRight);

        svg.append("g")
            .attr("fill", "red")
            .selectAll()
            .data(data)
            .join("rect")
            .attr("id", (d) => `viz_${seqName}_${d.strand}_${d.motif}_${d.pos}`)
            .attr("x", (d) => x(d.pos))
            .attr("y", y(height))
            .attr("height", height - marginBottom)
            .attr("width", (d) => d.size)
            .on("mouseover", function (e, d) {
                const el = document.getElementById(
                    `data_${seqName}_${d.strand}_${d.motif}_${d.pos}`
                );
                if (el) el.setAttribute("style", "background-color: yellow");
                d3.select(this).style("fill", "yellow");
                d3.select(tooltipRef.current)
                    .transition()
                    .duration(100)
                    // .style("position", "absolute")
                    // .style("background", "white")
                    // .style("background", "rgba(0,0,0,0.6)")
                    // .style("color", "black")
                    // .style("color", "white")
                    // .style("object-position", "top")
                    // .style("visibility", "visible");
                    .style("opacity", 1);
                d3.select(tooltipRef.current).text(
                    `${d.motif} ${d.pos} ${d.strand}`
                );
            })
            .on("mouseout", function (e, d) {
                const el = document.getElementById(
                    `data_${seqName}_${d.strand}_${d.motif}_${d.pos}`
                );
                if (el)
                    el.setAttribute("style", "background-color: transparent");
                d3.select(this).style("fill", "red");
                d3.select(tooltipRef.current)
                    .transition()
                    .duration(100)
                    // .style("visibility", "hidden");
                    .style("opacity", 0);
            });

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));

        return () => {
            svg.selectAll("*").remove();
        };
    }, [data, seqName, width]);

    return (
        <div>
            <span>{seqName}</span>
            <div
                className="bg-transparent text-black object-top px-3"
                ref={tooltipRef}
            >
                Hover for additional info
            </div>
            <svg ref={ref}></svg>
        </div>
    );
}
