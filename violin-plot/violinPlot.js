import * as d3 from "d3";
import gChartcolour from "g-chartcolour";

export function draw() {
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xMinorScale = d3.scaleLinear();
    let xScale = d3.scaleBand();
    let groups = [];
    let colourScale = d3.scaleOrdinal().domain(groups);
    let highlightNames = [];
    let showIQR = false;
    let showMedian = false;
    let showNinentyFivePc = false;

    function chart(parent) {
        const violinPathLeft = d3
            .line()
            .curve(d3.curveBasis)
            .x(d => -xMinorScale(d[1]) + xScale.bandwidth() / 2)
            .y(d => yScale(d[0]));

        const violinPathRight = d3
            .line()
            .curve(d3.curveBasis)
            .x(d => xMinorScale(d[1]) + xScale.bandwidth() / 2)
            .y(d => yScale(d[0]));

        // Right
        parent
            .append("path")
            .attr("fill", d => colourScale(d.group))
            .datum(d => d.violinPlot)
            .attr("d", violinPathRight);

        // Left
        parent
            .append("path")
            .attr("fill", d => colourScale(d.group))
            .datum(d => d.violinPlot)
            .attr("d", violinPathLeft);
        if (showNinentyFivePc) {
            parent
                .append("line")
                .attr("x1", xScale.bandwidth() / 2)
                .attr("x2", xScale.bandwidth() / 2)
                .attr("y1", d => yScale(d.ninetyFiveExtent[0][0]))
                .attr("y2", d => yScale(d.ninetyFiveExtent[1][0]));
        }

        // IQR box
        if (showIQR) {
            parent
                .append("rect")
                .attr("x", xScale.bandwidth() / 2 - rem)
                .attr("y", d => yScale(d.q3))
                .attr("width", rem * 2)
                .attr("height", d => yScale(d.q1) - yScale(d.q3));
        }

        // Median dot
        if (showMedian) {
            parent
                .append("circle")
                .attr("cx", xScale.bandwidth() / 2)
                .attr("cy", d => yScale(d.q2))
                .attr("r", rem * 0.75);
        }
    }

    chart.yScale = d => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };

    chart.xMinorScale = d => {
        if (!d) return xMinorScale;
        xMinorScale = d;
        return chart;
    };

    chart.xScale = d => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };

    chart.groups = d => {
        if (!d) return groups;
        groups = d;
        return chart;
    };

    chart.highlightNames = d => {
        if (!d) return highlightNames;
        highlightNames = d;
        return chart;
    };

    chart.showIQR = d => {
        if (!d) return showIQR;
        showIQR = d;
        return chart;
    };

    chart.showMedian = d => {
        if (!d) return showMedian;
        showMedian = d;
        return chart;
    };

    chart.showNinentyFivePc = d => {
        if (!d) return showNinentyFivePc;
        showNinentyFivePc = d;
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
