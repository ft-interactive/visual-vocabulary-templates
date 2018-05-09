import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

export function draw() {
    let rem = 10;
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleOrdinal();
    let seriesNames = [];
    let highlightNames = [];
    let projectionDates = [];
    let yAxisAlign = 'right';
    let markers = false;
    let annotate = false; // eslint-disable-line
    let interpolation = d3.curveLinear;
    const colourScale = d3
        .scaleOrdinal()
        // .range(gChartcolour.lineWeb)
        .domain(projectionDates);

    const r = rem / 2.5; // size of the circle

    function chart(parent) {
        parent.attr('transform', d => `translate(${xScale(d.name)}, 0)`);

        const groups = parent
            .selectAll('g.group')
            .data(d => d.beeswarmData)
            .enter()
            .append('g')
            .attr('class', 'group')
            .attr('transform', d => `translate(0, ${yScale(d.value)})`);

        // for the data, make numDots copies of the whole group's data point
        // for the transform, `(i * 2 * r)` is move circles across so they’re adjacent to one another in a line, but that would leave them left-aligned from the centre of the year, so then `-((d.numDots - 1) * r)` move them back across to the left by half of `the width of the group of dots minus one`. then centre that whole thing by adding half the xScale bandwidth (`xScale.bandwidth() / 2`).
        groups
            .selectAll('circle')
            .data(d => d3.range(0, d.numDots).map(() => d))
            .enter()
            .append('circle')
            .attr(
                'transform',
                (d, i) =>
                    `translate(${((xScale.bandwidth() / 2) +
                        (i * 2 * r)) - ((d.numDots - 1) * r)}, 0)`,
            )
            .attr('fill', d => colourScale(d.date))
            .attr('r', r);
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

    chart.highlightNames = (d) => {
        highlightNames = d;
        return chart;
    };

    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };

    chart.projectionDates = (d) => {
        if (typeof d === 'undefined') return projectionDates;
        projectionDates = d;
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

    chart.annotate = (d) => {
        annotate = d;
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
        if (highlightNames.length > 0) {
            if (d === 'social' || d === 'video') {
                colourScale.range(gChartcolour.mutedFirstLineSocial);
            } else if (
                d === 'webS' ||
                d === 'webM' ||
                d === 'webMDefault' ||
                d === 'webL'
            ) {
                colourScale.range(gChartcolour.mutedFirstLineWeb);
            } else if (d === 'print') {
                colourScale.range(gChartcolour.mutedFirstLinePrint);
            }
            return chart;
        }
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (
            d === 'webS' ||
            d === 'webM' ||
            d === 'webMDefault' ||
            d === 'webL'
        ) {
            colourScale.range(gChartcolour.lineWeb);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        }
        return chart;
    };

    return chart;
}
