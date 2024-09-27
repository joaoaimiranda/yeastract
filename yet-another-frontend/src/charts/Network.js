import React from "react";
import * as d3 from "d3";
import dashedArrow from "../svg/dashedarrow.png";
import arrow from "../svg/normalarrow.png";
import green from "../svg/green.png";
import red from "../svg/red.png";
import blue from "../svg/blue.png";
import gray from "../svg/gray.png";

export default function Network({
    // data,
    // filteredData,
    // gridState,
    // setGridState,
    getFilteredData,
    addListener,
    removeListener,
}) {
    const ref = React.useRef();

    const [chartData, setChartData] = React.useState(getFilteredData());
    // console.log(chartData);
    React.useEffect(() => {
        const width = 700;
        const height = 700;

        const nodes = [];
        for (let row of chartData) {
            if (!nodes.some((el) => el.id === row.tf))
                nodes.push({ id: row.tf, type: "source" });
            if (!nodes.some((el) => el.id === row.gene || el.id === row.orf))
                nodes.push({
                    id: row.gene === "Uncharacterized" ? row.orf : row.gene,
                    type: "target",
                });
        }
        const links = chartData.map((row) => ({
            source: row.tf,
            target: row.gene === "Uncharacterized" ? row.orf : row.gene,
            value: row.association,
            dash: row.evidence,
        }));

        const LinkTypes = ["Negative", "Dual", "Positive", "N/A"];

        const colorScheme = d3.schemeSet1;
        // custom color for N/A and Dual
        colorScheme.splice(1, 1, "#2c6492");
        colorScheme.splice(3, 1, "#666");

        const color = d3.scaleOrdinal(LinkTypes, colorScheme);

        const forceNode = d3.forceManyBody();
        const forceLink = d3
            .forceLink(links)
            .id((d) => d.id)
            .distance(190);

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
            .attr("fill", (d) => d.fill)
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
            .selectAll(null)
            .data(nodes)
            .enter()
            .append("g")
            .attr("fill", "steelbue")
            .attr("stroke", "black")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 1.5);

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
        // prettier-ignore
        function ticked() {
            // link.attr("x1", (d) => d.source.x)
            //     .attr("y1", (d) => d.source.y)
            //     .attr("x2", (d) => d.target.x)
            //     .attr("y2", (d) => d.target.y);
            link.attr("d", function (d) {
                const dx = d.target.x - d.source.x, dy = d.target.y - d.source.y, dr = Math.sqrt(dx * dx + dy * dy);
                if (dx !== 0 || dy !== 0) {
                    return ("M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y);
                }
                return ("M" + d.source.x + "," + d.source.y + "C" + (d.source.x - 30) + "," + (d.source.y - 30) + " " + 
                    (d.target.x + 30) + "," + (d.target.y - 30) + " " + d.target.x + "," +d.target.y);
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
        function filterListener(e) {
            setChartData(getFilteredData());
        }

        addListener(filterListener);

        return () => {
            svg.selectAll("*").remove();
            removeListener(filterListener);
        };
    }, [chartData, getFilteredData, addListener, removeListener]);

    // function handleFilter(event) {
    //     const { name, value } = event.target;
    //     const key = name.split("-")[1];
    //     const regex = new RegExp(value, "gi");
    //     const newData = data.filter((row) => regex.test(row[key]));
    //     // update table state filter
    //     if (
    //         gridState.filter === undefined ||
    //         gridState.filter.filterModel === undefined
    //     ) {
    //         setGridState((prevState) => ({
    //             ...prevState,
    //             filter: {
    //                 filterModel: {
    //                     [key]: {
    //                         filter: value,
    //                         filterType: "text",
    //                         type: "contains",
    //                     },
    //                 },
    //             },
    //         }));
    //     } else {
    //         setGridState((prevState) => ({
    //             ...prevState,
    //             filter: {
    //                 filterModel: {
    //                     ...prevState.filter.filterModel,
    //                     [key]: {
    //                         filter: value,
    //                         filterType: "text",
    //                         type: "contains",
    //                     },
    //                 },
    //             },
    //         }));
    //     }
    //     setChartData(newData);
    // }

    return (
        <div>
            <div className="absolute right-1 top-2">
                <div>
                    <img src={arrow} alt="arrow" />
                    <span>Binding</span>
                </div>
                <div>
                    <img src={arrow} alt="arrow" />
                    <span>Binding + Expression</span>
                </div>
                <div>
                    <img src={dashedArrow} alt="dashed-arrow" />
                    <span>Expression only</span>
                </div>
                <br />
                <div>
                    <img src={green} alt="green-arrow" />
                    <span>Positive</span>
                </div>
                <div>
                    <img src={red} alt="red-arrow" />
                    <span>Negative</span>
                </div>
                <div>
                    <img src={blue} alt="blue-arrow" />
                    <span>Dual</span>
                </div>
                <div>
                    <img src={gray} alt="gray-arrow" />
                    <span>N/A</span>
                </div>
            </div>
            {/* THE NETWORK ITSELF */}
            <svg ref={ref}></svg>
        </div>
    );
}
