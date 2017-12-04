import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleBand();
    let seriesNames = [];
    let showValues = false;
    let yAxisAlign = 'right';
    let rem = 16;
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {
        xScale.paddingInner(0);
        yScale.paddingInner(0);

        parent.attr('transform', d => `translate(0, ${yScale(d.name)})`)
            .attr('width', xScale.bandwidth());

        const block = parent.selectAll('g')
            .data(d => d.groups)
            .enter()
            .append('g');

        block
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

        if(showValues) {
            block
                .append('text')
                .attr('class', 'blockValue')
                .attr('x', d => xScale(d.name))
                .attr('y', d => yScale(d.name))
                .attr('dx', (xScale.bandwidth() / 2))
                .attr('dy', (yScale.bandwidth() / 2) + (rem / 4))
                .text(d => d.value)
                .attr('font-size', rem);
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

    chart.showValues = (d) => {
        if (typeof d === 'undefined') return showValues;
        showValues = d;
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

    chart.colourPalette = (d, type) => {
        if (!d) return colourScale;
        colourScale.range(type);
        return chart;
    };

    return chart;
}
