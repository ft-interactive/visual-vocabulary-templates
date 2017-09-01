import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let yAxisAlign = 'right';
    let rem = 16;
    let markers = false; // eslint-disable-line
    let includeMarker = undefined; // eslint-disable-line
    let interpolation = d3.curveLinear;
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {

    }


    chart.seriesNames = (d) => {
        seriesNames = d;
        return chart;
    };
    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };
    chart.xDomain = (d) => {
        xScale.domain(d);
        return chart;
    };
    chart.xRange = (d) => {
        xScale.rangeRound(d);
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
    chart.includeMarker = (d) => {
        includeMarker = d;
        return chart;
    };
    chart.markers = (d) => {
        markers = d;
        return chart;
    };
    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };
    chart.colourPalette = (d) => {
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}
