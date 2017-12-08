import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let yAxisAlign = 'right';
    let yAxisHighlight = 0;
    let frameName;
    const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
    let annotate = false; // eslint-disable-line
    let colourScale = d3.scaleOrdinal();

    function chart(parent) {
        const width = window.plotDim.width;
        const height = window.plotDim.height;

        const area = d3.area()
            .x(d => xScale(d.data.date))
            .y0(d => yScale(yAxisHighlight))
            .y1(d => yScale(d[1]));

        const defs = parent.append('defs')

        defs.append('clipPath')
            .attr('id', frameName + 'chartMask')
            .append('path')
            .attr('d', area)
            .style('fill', 'white')
            .attr('opacity', 0.5);

        parent.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', width)
            .attr('height', d => yScale(yAxisHighlight))
            .attr('fill', colourScale(3))
            .attr('clip-path', 'url(#' + frameName + 'chartMask)');

        parent.append('rect')
            .attr('x', 0)
            .attr('y', d => yScale(yAxisHighlight))
            .attr('width', width)
            .attr('height', d => height - yScale(yAxisHighlight))
            .attr('fill', colourScale(7))
            .attr('clip-path', 'url(#' + frameName + 'chartMask)');
    }

    chart.plotDim = (d) => {
        if (!d) return window.plotDim;
        window.plotDim = d;
        return chart;
    };
    chart.frameName = (d) => {
        if (typeof d === 'undefined') return frameName;
        frameName = d;
        return chart;
    };

    chart.yAxisHighlight = (d) => {
        if (!d) return yAxisHighlight;
        yAxisHighlight = d;
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

    chart.yRange = (d) => {
        if (typeof d === 'undefined') return yScale.range();
        yScale.range(d);
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
        xScale.range(d);
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

    chart.colourPalette = (d) => {
        if (!d) return colourScale;
        if (d === 'social' || d === 'video') {
            colourScale.range(gChartcolour.lineSocial);
        } else if (d === 'webS' || d === 'webM' || d === 'webMDefault' || d === 'webL') {
            colourScale.range(gChartcolour.categorical_line);
        } else if (d === 'print') {
            colourScale.range(gChartcolour.linePrint);
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return chart;
    };

    return chart;
}

export function drawHighlights() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let invertScale = false;

    function highlights(parent) {
        parent.append('rect')
        // .attr('class', 'highlights')
        .attr('x', d => xScale(d.begin))
        .attr('width', d => xScale(d.end) - xScale(d.begin))
        .attr('y', () => {
            if (invertScale) {
                return yScale.range()[0];
            }
            return yScale.range()[1];
        })
        .attr('height', () => {
            if (invertScale) {
                return yScale.range()[1];
            }
            return yScale.range()[0];
        })
    }

    highlights.yScale = (d) => {
        yScale = d;
        return highlights;
    };

    highlights.xScale = (d) => {
        xScale = d;
        return highlights;
    };

    highlights.yRange = (d) => {
        yScale.range(d);
        return highlights;
    };

    highlights.xRange = (d) => {
        xScale.range(d);
        return highlights;
    };

    highlights.invertScale = (d) => {
        invertScale = d;
        return highlights;
    };

    return highlights;
}

export function drawAnnotations() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();

    function annotations(parent) {
        parent.append('line')
            .attr('class', 'annotation')
            .attr('x1', d => xScale(d.date))
            .attr('x2', d => xScale(d.date))
            .attr('y1', yScale.range()[0])
            .attr('y2', yScale.range()[1] - 5);

        parent.append('text')
            .attr('class', 'annotation')
            .attr('text-anchor', 'middle')
            .attr('x', d => xScale(d.date))
            .attr('y', yScale.range()[1] - (rem / 2))
            .text(d => d.annotate);
    }

    annotations.yScale = (d) => {
        yScale = d;
        return annotations;
    };

    annotations.xScale = (d) => {
        xScale = d;
        return annotations;
    };

    annotations.yRange = (d) => {
        yScale.range(d);
        return annotations;
    };

    annotations.xRange = (d) => {
        xScale.range(d);
        return annotations;
    };

    annotations.rem = (d) => {
        if (!d) return rem;
        rem = d;
        return annotations;
    };

    return annotations;
}
