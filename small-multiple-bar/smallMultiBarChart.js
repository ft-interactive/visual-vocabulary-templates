import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScale = d3.scaleBand();
    let xScale = d3.scaleLinear();
    const colourScale = d3.scaleOrdinal();
    // .range(gChartcolour.lineWeb)
    // .domain(seriesNames);

    function chart(parent) {
        parent.selectAll('.columns')
            .data(d => d.columnData)
            .enter()
            .append('rect')
            .attr('class', 'columns')
            .attr('id', d => `date: ${d.name} value: ${d.value}`)
            .attr('x', d => xScale(Math.min(d.value, 0)))
            // .attr('transform', d => `translate(0, ${yScale.bandwidth()})`)
            .attr('height', () => yScale.bandwidth())
            .attr('y', (d, i) => ((yScale.bandwidth() + (yScale.bandwidth() * yScale.paddingInner())) * i) + rem)
            .attr('width', d => Math.abs(xScale(d.value) - xScale(0)))
            .attr('fill', () => colourScale());

        // add titles for each chart
        parent.append('text')
            .attr('class', 'chart-label')
            .attr('dy', -(rem / 2))
            .text(d => d.name.toUpperCase());
    }

    chart.yScale = (d) => {
        if (!d) return yScale;
        yScale = d;
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

export function drawTints() {
    let yScale = d3.scaleBand();
    let yLabelWidth;

    function tints(parent) {
        parent
        .each(function addTints() {
            if (d3.select(this).attr('xPosition') === '0') {
                d3.select(this).select('.tint').selectAll('rect')
                    .data(d => d.columnData)
                    .enter()
                    .append('rect')
                    .attr('x', -yLabelWidth - (rem * 0.3))
                    .attr('y', (d, i) => ((yScale.bandwidth() + (yScale.bandwidth() * yScale.paddingInner())) * i) + rem)
                    .attr('width', window.plotDim.width - (rem * 0.4))
                    .attr('height', yScale.bandwidth());
            }
        });
    }

    tints.yScale = (d) => {
        yScale = d;
        return tints;
    };

    tints.yRange = (d) => {
        yScale.range(d);
        return tints;
    };

    tints.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return tints;
    };

    tints.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return tints;
    };

    tints.yLabelWidth = (d) => {
        yLabelWidth = d;
        return tints;
    };

    return tints;
}
