import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let xScale = d3.scaleLinear();
    let yScale = d3.scaleBand();
    let seriesNames = [];
    let yAxisAlign = 'left';
    let rem = 16;

    let colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {
        parent
            .attr('transform', (d) => {
                const xOffset = (xScale(0) - xScale(d.offset));
                return `translate(${xOffset}, ${yScale(d.name)})`;
            });

        parent.selectAll('rect')
            .data(d => d.bands)
            .enter()
            .append('rect')
            .attr('height', yScale.bandwidth())
            .attr('y', d => yScale(d.name))
            .attr('x', d => xScale(Math.min(d.x, d.x1)))
            .attr('width', d => Math.abs(xScale(d.value) - xScale(0)))
            .attr('fill', d => colourScale(d.name));
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

    chart.xScale = (d) => {
        if (!d) return xScale;
        xScale = d;
        return chart;
    };

    chart.xDomain = (d) => {
        if (typeof d === 'undefined') return xScale.domain();
        xScale.domain(d);
        return chart;
    };

    chart.xRange = (d) => {
        if (typeof d === 'undefined') return xScale.range();
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

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (['webS', 'webM', 'webMDefault', 'webL'].includes(d)) {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.barPrint);
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return chart;
    };

    return chart;
}
