import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let xScale = d3.scaleTime();
    let maxCircle;
    let rScale = d3.scalePow().exponent(0.5);
    let dateFormat;
    let seriesNames = [];
    let rem = 16;
    let markers = false; // eslint-disable-line
    let includeMarker = undefined; // eslint-disable-line
    let interpolation = d3.curveLinear;
    const colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {
        parent.append('g')
            .style('fill', d => colourScale(d.key))
            .style('stroke', d => colourScale(d.key));

        const timeLine = parent.select('g');

        timeLine.selectAll('circle')
            .data(d => d.values)
            .enter()
            .append('circle')
            .attr('id', d => d.date + d.value)
            .attr('r', d => rScale(d.value))
            .attr('cx', d => xScale(d.date))
            .attr('cy', 0)
            .style('fill-opacity', 0.5)
            .style('stroke-width', 1);

        // add labels to circles that need it
        const parseDate = d3.timeFormat(dateFormat);
        parent.append('g')
            .attr('class', 'annotations-holder')
            .selectAll('text')
            .data(d => d.values.filter(e => e.label === 'yes'))
            .enter()
            .append('text')
            .attr('x', d => xScale(d.date))
            .attr('y', d => 0 - rScale(d.value) - 12)
            .text(d => `${d.name}, ${d.value} (${parseDate(d.date)})`)
            .attr('text-anchor', 'middle')
            .attr('fill', 'black');

        // add connecting lines to labels
        timeLine.selectAll('line')
            .data(d => d.values.filter(e => e.label === 'yes'))
            .enter()
            .append('line')
            .style('stroke', '#000')
            .attr('x1', d => xScale(d.date))
            .attr('x2', d => xScale(d.date))
            .attr('y1', d => 0 - rScale(d.value))
            .attr('y1', d => 0 - rScale(d.value) - 10);

        // add chart subtitle
        parent.append('text')
            .attr('class', 'timeline-label')
            .text(d => d.key)
            .attr('y', -(maxCircle * 0.4));
    }


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

    chart.rScale = (d) => {
        rScale = d;
        return chart;
    };

    chart.setDateFormat = (d) => {
        dateFormat = d;
        return chart;
    };

    chart.maxCircle = (d) => {
        maxCircle = d;
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

    chart.includeMarker = (d) => {
        if (typeof d === 'undefined') return includeMarker;
        includeMarker = d;
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
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}
