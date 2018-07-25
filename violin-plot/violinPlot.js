import * as d3 from "d3";
import gChartcolour from "g-chartcolour";

export function draw() {
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleBand();

    function chart(parent) {
        //Your drawing function in here
    }

    chart.yScale = d => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };

    chart.yAxisAlign = d => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
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
