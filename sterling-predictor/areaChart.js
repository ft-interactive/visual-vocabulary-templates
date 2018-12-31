import * as d3 from 'd3';
import gChartcolour from 'g-chartcolour';

let rem = 10;

export function draw() {
    let yScale = d3.scaleLinear();
    let xScale = d3.scaleTime();
    let highlightNames = [];
    let interpolation = d3.curveLinear;
    let seriesNames = [];
    let yAxisAlign = 'right';
    const includeAnnotations = d => (d.annotate !== '' && d.annotate !== undefined); // eslint-disable-line
    let annotate = false; // eslint-disable-line
    let colourScale = d3.scaleOrdinal()
        .domain(seriesNames);

    function chart(parent) {
        const area = d3.area()
            .x(d => xScale(d.date))
            .y0(d => yScale(d.low))
            .y1(d => yScale(d.high));

        const upperLine = d3.line()
        .defined(d => d)
        .curve(interpolation)
        .x(d => xScale(d.date))
        .y(d => yScale(d.high));

        const lowerLine = d3.line()
        .defined(d => d)
        .curve(interpolation)
        .x(d => xScale(d.date))
        .y(d => yScale(d.low));

        parent.append('path')
            .attr('id', d => d.name)
            .attr('d', d => area(d.areaData))
            .attr('fill', d => colourScale(d.name))
            .attr('opacity', (d) => {
                if (highlightNames.length > 0 && d.highlightLine === false || d.status === 'old') {
                    return 0.2;
                } return 0.4;
            })

        parent.append('g')
                .attr('class', 'annotations-holder')
                .append('text')
                .attr('class', 'annotation')
                .attr('class', 'chart-subtitle')
                .attr('x', xScale.range()[1] + (rem/2))
                .attr('y', (d) => {
                    return yScale(
                        ((d.areaData[d.areaData.length - 1].high - d.areaData[d.areaData.length - 1].low)/2) +
                        d.areaData[d.areaData.length - 1].low) + (rem * 0.3)
                    })
                .style('fill', (d) => {
                    if (highlightNames.length > 0 && d.highlightLine === false) {
                        return colourScale.range()[0];
                    }
                    if (highlightNames.length > 0 && d.highlightLine === true) {
                        return colourScale(d.name);
                    }
                    return colourScale(d.name);
                    })
                .text(d => {
                    if(d.status === 'current') {
                        return d.name
                    }
                })

        parent.append('path')
        .attr('stroke', (d) => {
            if (highlightNames.length > 0 && d.highlightLine === false) {
                return colourScale.range()[0];
            }
            if (highlightNames.length > 0 && d.highlightLine === true) {
                return colourScale(d.name);
            } 
            return colourScale(d.name);
        })
        .attr('opacity', (d) => {
            if (highlightNames.length > 0 && d.highlightLine === false || d.status === 'old') {
                return 0.3;
            } return 1;
        })
        .attr('d', d => upperLine(d.areaData));

        parent.append('path')
        .attr('stroke', (d) => {
            if (highlightNames.length > 0 && d.highlightLine === false) {
                return colourScale.range()[0];
            }
            if (highlightNames.length > 0 && d.highlightLine === true) {
                return colourScale(d.name);
            } 
            return colourScale(d.name);
        })
        .attr('opacity', (d) => {
            if (highlightNames.length > 0 && d.highlightLine === false || d.status === 'old') {
                return 0.3;
            } return 1;
        })
        .attr('d', d => lowerLine(d.areaData));

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

    chart.seriesNames = (d) => {
        if (typeof d === 'undefined') return seriesNames;
        seriesNames = d;
        return chart;
    };

    chart.highlightNames = (d) => {
        if (typeof d === 'undefined') return highlightNames;
        highlightNames = d;
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
        } else if (d && d.name && d.name === 'scale') {
            colourScale = d;
        }
        return chart;
    };

    return chart;
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
