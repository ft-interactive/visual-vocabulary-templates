import * as d3 from "d3";
import gChartcolour from "g-chartcolour";

export function draw() {
    let rem = 10;
    let groupNames = [];
    let highlightNames = [];
    const colourScale = d3.scaleOrdinal().domain(groupNames);

    function chart(parent) {
        const node = parent
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .attr(
                "class",
                d =>
                    "node" +
                    (!d.children ? " node--leaf" : d.depth ? "" : " node--root")
            )
            .each(function(d) {
                d.node = this;
            });

        node.append("circle")
            .attr("id", d => `node-${d.id}`)
            .attr("r", d => d.r)
            .style("fill", d => colourScale(d.data.group));
    }

    chart.groupNames = d => {
        if (typeof d === "undefined") return groupNames;
        groupNames = d;
        colourScale.domain(groupNames);
        return chart;
    };

    chart.plotDim = d => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return chart;
    };

    chart.rem = d => {
        if (!d) return rem;
        rem = d;
        return chart;
    };

    chart.colourPalette = d => {
        if (!d) return colourScale;
        if (highlightNames.length > 0) {
            if (d === "social" || d === "video") {
                colourScale.range(gChartcolour.mutedFirstLineSocial);
            } else if (
                d === "webS" ||
                d === "webM" ||
                d === "webMDefault" ||
                d === "webL"
            ) {
                colourScale.range(gChartcolour.mutedFirstLineWeb);
            } else if (d === "print") {
                colourScale.range(gChartcolour.mutedFirstLinePrint);
            }
            return chart;
        }
        if (d === "social" || d === "video") {
            colourScale.range(gChartcolour.lineSocial);
        } else if (
            d === "webS" ||
            d === "webM" ||
            d === "webMDefault" ||
            d === "webL"
        ) {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === "print") {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}
