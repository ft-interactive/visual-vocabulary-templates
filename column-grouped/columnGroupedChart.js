import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale0 = d3.scaleBand();
    let xScale1 = d3.scaleBand();
    let seriesNames = [];
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
        const min = yScale.domain()[0];

        parent.attr('transform', d => `translate(${xScale0(d.name)},0)`)
            .attr('width', xScale0.bandwidth());

        parent.selectAll('rect')
            .data(d => d.groups)
            .enter()
            .append('rect')
            .attr('class', 'columns')
            .attr('x', d => xScale1(d.name))
            .attr('width', () => Math.max(1, xScale1.bandwidth()))
            .attr('y', (d) => {
                if(logScale) {
                    return yScale(Math.max(min, d.value))
                }
               return yScale(Math.max(0, d.value))
            })
            .attr('height', (d) => {
                if(logScale) {
                    return Math.abs(yScale(d.value) - yScale(min))
                }
                return Math.abs(yScale(d.value) - yScale(0))
            })
            .attr('fill', d => colourScale(d.name));

        if (showNumberLabels) {
            parent.selectAll('text')
            .data(d => d.groups)
            .enter()
            .append('text')
            .html(d => d.value)
            .attr('class', 'column-label')
            .attr('x', d => xScale1(d.name) + (xScale1.bandwidth() / 2))
            .attr('y', () => yScale(0))
            .attr('dy', (d) => { if (d.value < 0) { return rem; } return -(rem / 4); })
            .attr('font-size', rem)
            .attr('fill', '#ffffff')
            .style('text-anchor', 'middle');
        }
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

    chart.xScale0 = (d) => {
        if (!d) return xScale0;
        xScale0 = d;
        return chart;
    };

    chart.xDomain0 = (d) => {
        xScale0.domain(d);
        return chart;
    };

    chart.xRange0 = (d) => {
        xScale0.rangeRound(d);
        return chart;
    };

    chart.xScale1 = (d) => {
        if (!d) return xScale1;
        xScale1 = d;
        return chart;
    };

    chart.xDomain1 = (d) => {
        xScale1.domain(d);
        return chart;
    };

    chart.xRange1 = (d) => {
        xScale1.rangeRound(d);
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

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.barPrint);
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
