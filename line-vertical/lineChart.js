import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let seriesNames = [];
    let highlightNames = [];
    let yAxisAlign = 'right';
    let markers = false;
    let invertScale = false;
    const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
    let annotate = false; // eslint-disable-line
    let interpolation = d3.curveLinear;
    const colourScale = d3.scaleOrdinal()
    // .range(gChartcolour.lineWeb)
        .domain(seriesNames);

    function chart(parent) {
        const lineData = d3.line()
            .defined(d => d)
            .curve(interpolation)
            .y(d => yScale(d.date))
            .x(d => xScale(d.value));

        parent.append('path')
            .attr('stroke', (d) => {
                if (highlightNames.length > 0) {
                    if (highlightNames.indexOf(d.name) !== -1) {
                        return colourScale(d.name);
                    }
                    d.name = '';
                    return colourScale(d.name);
                }
                return colourScale(d.name);
            })
            .attr('opacity', (d) => {
                if (highlightNames.length > 0) {
                    if (highlightNames.indexOf(d.name) !== -1) {
                        return 1;
                    }
                    return 0.5;
                }
                return 1;
            })
            .attr('d', d => lineData(d.lineData));

        if (markers) {
            parent.selectAll('.markers')
                .data((d) => {
                    if (markers) {
                        return d.lineData;
                    }

                    return undefined;
                })
                .enter()
                .append('circle')
                .classed('markers', true)
                .attr('id', d => `date: ${d.date} value: ${d.value}`)
                .attr('cy', d => yScale(d.date))
                .attr('cx', d => xScale(d.value))
                .attr('r', rem * 0.25)
                .attr('fill', d => colourScale(d.name));
        }
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

    chart.highlightNames = (d) => {
        highlightNames = d;
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

    chart.invertScale = (d) => {
        if (typeof d === 'undefined') return invertScale;
        invertScale = d;
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

export function drawHighlights() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let invertScale = false;

    function highlights(parent) {
        parent.append('rect')
            .attr('class', 'highlights')
            .attr('y', d => yScale(d.begin))
            .attr('height', d => yScale(d.end) - yScale(d.begin))
        // .attr('width', d => xScale(d.end) - xScale(d.begin))
            .attr('x', () => {
                if (invertScale) {
                    return xScale.range()[1];
                }
                return xScale.range()[0];
            })
            .attr('width', () => {
                if (invertScale) {
                    return xScale.range()[0];
                }
                return xScale.range()[1];
            })
            .attr('fill', '#fff1e0');
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
            .attr('y1', d => yScale(d.date))
            .attr('y2', d => yScale(d.date))
            .attr('x1', xScale.range()[1])
            .attr('x2', xScale.range()[0] - 5);

        parent.append('text')
            .attr('class', 'annotation')
        // .attr('text-anchor', 'middle')
            .attr('y', d => yScale(d.date) - (rem / 3))
            .attr('x', xScale.range()[0])
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
