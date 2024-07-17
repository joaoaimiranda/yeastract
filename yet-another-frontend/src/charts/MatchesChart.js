import React from "react";
import * as d3 from "d3";

export default function MatchesChart({ data }) {
    const ref = React.useRef();

    React.useEffect(() => {
        const width = 1000;
        const height = 100;
        const marginTop = 0;
        const marginRight = 0;
        const marginBottom = 0;
        const marginLeft = 0;
        console.log("bota", data);
        const x = d3
            .scaleLinear()
            .domain([0, width])
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
            .attr("x", x(0))
            .attr("y", y(height))
            .attr("height", height)
            .attr("width", 1000);

        svg.append("g")
            .attr("fill", "red")
            .selectAll()
            .data(data)
            .join("rect")
            .attr("id", (d) => d.pos)
            .attr("x", (d) => x(d.pos))
            .attr("y", y(height))
            .attr("height", height)
            .attr("width", (d) => d.size);

        return () => {
            svg.selectAll("*").remove();
        };
    }, [data]);

    return <svg ref={ref}></svg>;
}
