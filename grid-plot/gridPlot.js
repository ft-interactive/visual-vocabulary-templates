import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleBand();
    let groupNames = [];
    let yAxisAlign = 'right';
    let rem = 16;
    const colourScale = d3.scaleOrdinal()
        .domain(groupNames);

    function chart(parent) {
        xScale.paddingInner(0);
        yScale.paddingInner(0);

        // parent.attr('transform', d => `translate(0, ${yScale(d.name)})`)
        //     .attr('width', xScale.bandwidth());

        const block = parent.selectAll('.block')
            .data(d => d.gridCats)
            .enter()
            .append('g')
            .attr('class', 'block');

        block
            .append('rect')
            .attr('class', (d) => {
                const emptyFill = d.name === 'empty' ? 'grid noData' : 'grid';
                return emptyFill;
            })
            .attr('x', (d, i) => xScale(Math.floor(i % 10)))
            .attr('width', () => xScale.bandwidth())
            .attr('y', (d, i) => yScale(Math.floor(i / 10)))
            .attr('height', () => yScale.bandwidth())
            .attr('fill', d => colourScale(d.name));

        // add titles for each chart
        parent.append('text')
            .attr('class', 'chart-label')
            .attr('dy', -5)
            .attr('dx', (xScale.bandwidth() * 5) + (rem / 3))
            .text(d => d.name);
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

    chart.groupNames = (d) => {
        if (typeof d === 'undefined') return groupNames;
        groupNames = d;
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

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (['webS', 'webM', 'webMDefault', 'webL'].includes(d)) {
            colourScale.range(gChartcolour.categorical_bar);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.barPrint);
        }
        return chart;
    };

    return chart;
}
