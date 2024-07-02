import React from "react";
import * as d3 from "d3";

export default function Network({ data }) {
    const ref = React.useRef();

    React.useEffect(() => {
        const width = 700;
        const height = 700;

        // Replace the input nodes and links with mutable objects for the simulation.
        const nodes = [];
        for (let row of data) {
            if (!nodes.some((el) => el.id === row.tf))
                nodes.push({ id: row.tf, type: "source" });
            if (!nodes.some((el) => el.id === row.gene || el.id === row.orf))
                nodes.push({
                    id: row.gene === "Uncharacterized" ? row.orf : row.gene,
                    type: "target",
                });
        }
        const links = data.map((row) => ({
            source: row.tf,
            target: row.gene === "Uncharacterized" ? row.orf : row.gene,
            value: row.association,
            dash: row.evidence,
        }));

        console.log(nodes);

        const LinkTypes = ["Negative", "Dual", "Positive", "N/A"];

        // Construct the scales.
        const color = d3.scaleOrdinal(LinkTypes, d3.schemeSet1);

        // Construct the forces.
        const forceNode = d3.forceManyBody();
        const forceLink = d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(190);
        // if (nodeStrength !== undefined) forceNode.strength(nodeStrength);
        // if (linkStrength !== undefined) forceLink.strength(linkStrength);

        const simulation = d3
            .forceSimulation(nodes)
            .force("link", forceLink)
            .force("charge", forceNode)
            .force("center", d3.forceCenter())
            .on("tick", ticked);

        const svg = d3
            .select(ref.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

        const markerData = LinkTypes.map((d, i) => ({
            id: i,
            type: d,
            fill: color(d),
        }));

        svg.append("defs")
            .selectAll("marker")
            .data(markerData)
            .join("marker")
            .attr("id", (d) => `marker_${d.type}`)
            .attr("viewBox", "-0 -5 10 10")
            .attr("fill", (d) => {
                console.log(d);
                return d.fill;
            })
            .attr("refX", 13)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            // .attr("xoverflow", "visible")
            .append("path")
            // .attr("fill", "black")
            //     (d) => {
            //     console.log(color(d.value));
            //     return color(d.value);
            // })
            .attr("d", "M 0,-5 L 10 ,0 L 0,5");
        // .style("stroke", "none");

        const link = svg
            .append("g")
            // .attr("stroke", "#999")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 1.5)
            .attr("stroke-linecap", "round")
            .selectAll("path")
            .data(links)
            .join("path")
            .attr("fill", "none")
            .attr("stroke", ({ value }) => color(value))
            .attr("stroke-dasharray", ({ dash }) =>
                dash === "Expression" ? "6,4" : "0"
            )
            .attr(
                "marker-end",
                (d) => `url(${new URL(`#marker_${d.value}`, window.location)})`
            );

        const node = svg
            // .append("g")
            // .attr("fill", "steelbue")
            // .attr("stroke", "black")
            // .attr("stroke-opacity", 1)
            // .attr("stroke-width", 1.5)
            .selectAll(null)
            .data(nodes)
            // .join("circle")
            .enter()
            .append("g")
            .attr("fill", "steelbue")
            .attr("stroke", "black")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 1.5);

        // .append("text")
        // // .attr("x", 8)
        // .text(function (d) {
        //     return d.id;
        // })
        // .attr("fill", "gray")
        // .attr("stroke", "none")
        // .attr("font-size", "0.7em")
        // .attr("dx", 8)
        // .attr("dy", (d) => d.y)

        const circle = node
            .append("circle")
            .attr("r", 5)
            .attr("fill", (d) => (d.type === "source" ? "steelblue" : "yellow"))
            .call(drag(simulation));

        const text = node
            .append("text")
            .attr("dx", "1em")
            .attr("font-size", "11px")
            .attr("stroke-width", 0.5)
            .text((d) => d.id);

        // const shadowText = svg
        //     .append("text")
        //     .attr("x", 8)
        //     .attr("y", ".31em")
        //     .attr("class", "shadow")
        //     .text(function (d) {
        //         return d.id;
        //     });
        // node.append("circle").attr("r", 5);
        // node.;
        // text.attr("transform", function (d) {
        //     return "translate(" + d.x + "," + d.y + ")";
        // });

        function ticked() {
            // link.attr("x1", (d) => d.source.x)
            //     .attr("y1", (d) => d.source.y)
            //     .attr("x2", (d) => d.target.x)
            //     .attr("y2", (d) => d.target.y);
            link.attr("d", function (d) {
                const dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                if (dx !== 0 || dy !== 0) {
                    return (
                        "M" +
                        d.source.x +
                        "," +
                        d.source.y +
                        "A" +
                        dr +
                        "," +
                        dr +
                        " 0 0,1 " +
                        d.target.x +
                        "," +
                        d.target.y
                    );
                }
                return (
                    "M" +
                    d.source.x +
                    "," +
                    d.source.y +
                    "C" +
                    (d.source.x - 30) +
                    "," +
                    (d.source.y - 30) +
                    " " +
                    (d.target.x + 30) +
                    "," +
                    (d.target.y - 30) +
                    " " +
                    d.target.x +
                    "," +
                    d.target.y
                );
            });

            // node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
            circle.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
            text.attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        }

        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }

            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }

            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }

            return d3
                .drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
    }, [data]);

    return (
        <div className="border ">
            <svg ref={ref}></svg>
        </div>
    );
}
