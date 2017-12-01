import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleBand();
    let seriesNames = [];
    let scaleBreaks = [];
    let cScale;
    let logScale = false;
    let yAxisAlign = 'right';
    let rem = 16;
    let markers = false; // eslint-disable-line
    let includeMarker = undefined; // eslint-disable-line
    let interpolation = d3.curveLinear;
    let showNumberLabels = false; // show numbers on end of bars
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {
        xScale.paddingInner(0);
        yScale.paddingInner(0);

        parent.attr('transform', d => `translate(0, ${yScale(d.name)})`)
            .attr('width', xScale.bandwidth());

        parent.selectAll('rect')
            .data(d => d.groups)
            .enter()
            .append('rect')
            .attr('class', (d) => {
                if (typeof d.value === 'number') {
                    return 'grid';
                }
                return 'grid noData';
            })
            .attr('x', d => xScale(d.name))
            .attr('width', () => xScale.bandwidth())
            .attr('y', d => yScale(d.name))
            .attr('height', () => yScale.bandwidth())
            .attr('fill', d => colourScale.range()[d.scaleCat]);
    }

    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
        return chart;
    };

    chart.yDomain = (d) => {
        if (typeof d === 'undefined') return yScale.domain();
        yScale.domain(d);
        return chart;
    };

    chart.yRange = (d) => {
        if (typeof d === 'undefined') return yScale.range();
        yScale.range(d);
        return chart;
    };

    chart.yAxisAlign = (d) => {
        if (!d) return yAxisAlign;
        yAxisAlign = d;
        return chart;
    };

    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };

    chart.scaleBreaks = (d) => {
        if (typeof d === 'undefined') return scaleBreaks;
        scaleBreaks = d;
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
        if (typeof d === 'undefined') return includeMarker;
        includeMarker = d;
        return chart;
    };

    chart.logScale = (d) => {
        if (typeof d === 'undefined') return logScale;
        logScale = d;
        return chart;
    };

    chart.markers = (d) => {
        if (typeof d === 'undefined') return markers;
        markers = d;
        return chart;
    };

    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };

    chart.colourPalette = (d, type) => {
        if (!d) return colourScale;

        if (d === 'social' || d === 'video') {
            colourScale.range(type);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(type);
        } else if (d === 'print') {
            colourScale.range(type);
        }
        return chart;
    };

    chart.showNumberLabels = (d) => {
        if (typeof d === 'undefined') return showNumberLabels;
        showNumberLabels = d;
        return chart;
    };

    return chart;
}
