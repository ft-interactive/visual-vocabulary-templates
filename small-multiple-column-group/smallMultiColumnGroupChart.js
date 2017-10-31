import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale0 = d3.scaleBand();
    // let xScale1 = d3.scaleBand();
    let columnNames = [];
    let yAxisAlign = 'right';
  const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
    let colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
        .domain(columnNames);

    function chart(parent) {
        parent.selectAll('rect')
            .data(d => d.columnData)
            .enter()
            .append('rect')
            .attr('class', 'columns')
            .attr('id', d => `name: ${d.name} value: ${d.value}`)
            .attr('x', d => xScale0(d.name))
            .attr('transform', () => `translate(${-xScale0.bandwidth() / 4},0)`)
            .attr('width', () => xScale0.bandwidth())
            .attr('y', d => yScale(Math.max(0, d.value)))
            .attr('height', d => Math.abs(yScale(d.value) - yScale(0)))
            .attr('fill', d => colourScale(d.name));

        // add titles for each chart
        parent.append('text')
            .attr('class', 'chart-label')
            .attr('dy', -5)
            .text(d => d.name.toUpperCase());
    }

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
    chart.columnNames = (d) => {
        columnNames = d;
        return chart;
    };
    chart.xScale0 = (d) => {
        if (!d) return xScale0;
        xScale0 = d;
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
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return chart;
    };

    return chart;
}
