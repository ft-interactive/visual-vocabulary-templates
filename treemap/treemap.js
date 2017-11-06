import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';


export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let rem = 10;
    let seriesNames = [];
    const colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
    .domain(seriesNames);

    function chart(parent) {
        

    }

    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };
    chart.seriesNames = (d) => {
        seriesNames = d;
        return chart;
    };
    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };
    chart.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return chart;
    };
    chart.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return chart;
    };
    chart.colourPalette = (d) => {
        if (highlightNames.length > 0) {
            if (d === 'social' || d === 'video') {
                colourScale.range(gChartcolour.mutedFirstLineSocial);
            } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
                colourScale.range(gChartcolour.mutedFirstLineWeb);
            } else if (d === 'print') {
                colourScale.range(gChartcolour.mutedFirstLinePrint);
            }
            return chart;
        }
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}

