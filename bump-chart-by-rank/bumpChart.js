import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleBand();
    let seriesNames = [];
    let yAxisAlign = 'right';
    let interpolation = d3.curveMonotoneX;
    let mutedColour = '#999999';
    let highlightNames = [];
    let colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {
        const lineData = d3.line()
        .defined(function(d) {return d.value != null; })
        .curve(interpolation)
        .x(d => xScale(d.name) + (xScale.bandwidth() / 2))
        .y(d => yScale(d.value));

        parent.append('path')
            .attr('stroke', ((d) => {
                if (d.highlight) {
                    return colourScale.range()[1];
                }
                return colourScale.range()[0];
            }))
            .attr('opacity', (d) => {
                if (d.highlight) {
                    return 1.0}
                else {return 0.5};
            })
            .attr('d', d => lineData(d.lineData));

        parent.selectAll('circle')
            .data(d => d.lineData.filter(el =>el.terminal === true))
            .enter()
            .append('circle')
            .attr('cy', d => yScale(d.value))
            .attr('cx', d => xScale(d.name) + (xScale.bandwidth() / 2))
            .attr('r', rem / 4)
            .attr('opacity', (d) => {
                if (d.highlight) {
                    return 1.0;
                }
                else {return 0.5};
            })
            .attr('fill', (d) => {
                if (d.highlight) {
                    return colourScale.range()[1];
                }
                return colourScale.range()[0];
            });
    


    }

    chart.highlightNames = (d) => {
        if (!d) return highlightNames;
        highlightNames = d;
        return chart;
    };

    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
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

    chart.interpolation = (d) => {
        if (!d) return interpolation;
        interpolation = d;
        return chart;
    };

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (highlightNames.length > 0) {
            if (d === 'social' || d === 'video') {
                colourScale.range(gChartcolour.mutedFirstLineSocial);
            } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
                colourScale.range(gChartcolour.mutedFirstLineWeb);
            } else if (d === 'print') {
                colourScale.range(gChartcolour.mutedFirstLinePrint);
            } else if (d && d.name && d.name === 'scale') {
                colourScale = d;
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
