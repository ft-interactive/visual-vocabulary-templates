import * as d3 from "d3";
import gChartcolour from "g-chartcolour";

export function draw() {
    let rem = 10;
    let seriesNames = [];
    let highlightNames = [];
    const colourScale = d3.scaleOrdinal().domain(seriesNames);

    function chart(parent) {
        //Your drawing function in here
    }

    chart.highlightNames = d => {
        highlightNames = d;
        return chart;
    };

    chart.seriesNames = d => {
        if (typeof d === "undefined") return seriesNames;
        seriesNames = d;
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
